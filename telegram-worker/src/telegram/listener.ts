import { NewMessage } from "telegram/events/index.js"
import { getClient } from "./client.js"
import { saveIncomingMessage, saveReplicationLog } from "../services/supabase.js"
import { log } from "../services/logger.js"
import type { IncomingTelegramMessage } from "../types/telegram.js"

interface ReplicationRule { id: string; source_chat_id: string; destination_chat_id: string; active: boolean; mode?: "copy" | "forward" }

async function getActiveRules(sourceChatId: string): Promise<ReplicationRule[]> {
  const { getSupabase } = await import("../services/supabase.js")
  const db = getSupabase()
  if (!db) return []
  const { data, error } = await db.from("replication_rules").select("id,source_chat_id,destination_chat_id,active,mode").eq("source_chat_id", sourceChatId).eq("active", true)
  if (error) { log("error", "Falha ao carregar regras", { message: error.message }); return [] }
  return (data ?? []) as ReplicationRule[]
}

export function startMessageListener() {
  getClient().addEventHandler(async (event: any) => {
    const message = event.message
    const chat = await event.getChat()
    const sourceChatId = String(chat?.id ?? "")
    if (!sourceChatId || !message?.id) return
    const receivedAt = new Date(Number(message.date) * 1000 || Date.now()).toISOString()
    const incoming: IncomingTelegramMessage = { chatId: sourceChatId, messageId: Number(message.id), receivedAt, text: String(message.message ?? ""), type: message.media?.className ?? "text", media: message.media ? { className: message.media.className ?? "media" } : undefined }
    await saveIncomingMessage(incoming)
    for (const rule of await getActiveRules(sourceChatId)) {
      const deduplicationKey = `${rule.id}:${sourceChatId}:${incoming.messageId}`
      const { getSupabase } = await import("../services/supabase.js")
      const db = getSupabase()
      if (!db) continue
      const { data: existing } = await db.from("replication_messages").select("id").eq("deduplication_key", deduplicationKey).maybeSingle()
      if (existing) continue
      try {
        if (rule.mode === "forward") await message.forwardTo(rule.destination_chat_id)
        else if (message.media) await message.forwardTo(rule.destination_chat_id)
        else await getClient().sendMessage(rule.destination_chat_id, { message: incoming.text })
        await db.from("replication_messages").insert({ rule_id: rule.id, source_chat_id: sourceChatId, source_message_id: incoming.messageId, deduplication_key: deduplicationKey, status: "sent", processed_at: new Date().toISOString() })
        await saveReplicationLog({ rule_id: rule.id, source_chat_id: sourceChatId, destination_chat_id: rule.destination_chat_id, source_message_id: incoming.messageId, event: "message_sent", status: "success", created_at: new Date().toISOString() })
      } catch (error) {
        await db.from("replication_messages").insert({ rule_id: rule.id, source_chat_id: sourceChatId, source_message_id: incoming.messageId, deduplication_key: deduplicationKey, status: "error", error: error instanceof Error ? error.message : "Erro desconhecido", processed_at: new Date().toISOString() })
        await saveReplicationLog({ rule_id: rule.id, source_chat_id: sourceChatId, destination_chat_id: rule.destination_chat_id, source_message_id: incoming.messageId, event: "send_error", status: "error", error: error instanceof Error ? error.message : "Erro desconhecido", created_at: new Date().toISOString() })
      }
    }
    log("info", "Mensagem processada", { chatId: sourceChatId, messageId: incoming.messageId })
  }, new NewMessage({}))
  log("info", "Listener de mensagens iniciado")
}

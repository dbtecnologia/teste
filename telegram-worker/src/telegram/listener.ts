import { NewMessage } from "telegram/events/index.js"
import { getClient } from "./client.js"
import { saveIncomingMessage, saveReplicationLog } from "../services/supabase.js"
import { log } from "../services/logger.js"
import type { IncomingTelegramMessage } from "../types/telegram.js"

export function startMessageListener() { const origin = (process.env.ORIGIN_CHAT_TITLE ?? "BLACK BAT.INVEST").toLowerCase(); getClient().addEventHandler(async (event: any) => { const message = event.message; const chat = await event.getChat(); const title = String(chat?.title ?? chat?.username ?? ""); if (title.toLowerCase() !== origin) return; const incoming: IncomingTelegramMessage = { chatId: String(chat.id), messageId: Number(message.id), receivedAt: new Date(Number(message.date) * 1000 || Date.now()).toISOString(), text: String(message.message ?? ""), type: message.media ? message.media.className ?? "media" : "text", media: message.media ? { className: message.media.className ?? "media" } : undefined }; await saveIncomingMessage(incoming); await saveReplicationLog({ event: "message_received", chat_id: incoming.chatId, message_id: incoming.messageId, created_at: incoming.receivedAt }); log("info", "Mensagem recebida", { chatId: incoming.chatId, messageId: incoming.messageId }); }, new NewMessage({})); log("info", "Listener de mensagens iniciado") }

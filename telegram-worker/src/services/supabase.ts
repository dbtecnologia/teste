import { createClient, type SupabaseClient } from "@supabase/supabase-js"
import type { IncomingTelegramMessage, TelegramChat } from "../types/telegram.js"
import { log } from "./logger.js"

let client: SupabaseClient | null = null
export function getSupabase() { if (!client && process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) client = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } }); return client }
async function insert(table: string, payload: Record<string, unknown>) { const db = getSupabase(); if (!db) return; const { error } = await db.from(table).insert(payload); if (error) log("error", `Falha ao gravar ${table}`, { message: error.message }) }
export async function saveTelegramConnection(status: string, session?: string) { await insert("telegram_connections", { status, session, updated_at: new Date().toISOString() }) }
export async function updateTelegramConnectionStatus(status: string) { const db = getSupabase(); if (!db) return; const { error } = await db.from("telegram_connections").update({ status, updated_at: new Date().toISOString() }).eq("status", "connected"); if (error) log("error", "Falha ao atualizar status", { message: error.message }) }
export async function saveIncomingMessage(message: IncomingTelegramMessage) { await insert("incoming_messages", { chat_id: message.chatId, telegram_message_id: message.messageId, received_at: message.receivedAt, text: message.text, type: message.type, media: message.media ?? null }) }
export async function saveReplicationLog(payload: Record<string, unknown>) { await insert("replication_logs", payload) }
export async function saveChat(chat: TelegramChat) { await insert("telegram_chats", chat as unknown as Record<string, unknown>) }

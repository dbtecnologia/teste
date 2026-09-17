import { TelegramClient } from "telegram"
import { StringSession } from "telegram/sessions/index.js"
import { log } from "../services/logger.js"
import { saveTelegramConnection, updateTelegramConnectionStatus } from "../services/supabase.js"
import type { AuthStatus } from "../types/telegram.js"

let client: TelegramClient | null = null
let status: AuthStatus = "disconnected"
const apiId = Number(process.env.TELEGRAM_API_ID)
const apiHash = process.env.TELEGRAM_API_HASH ?? ""
function requireConfig() { if (!apiId || !apiHash) throw new Error("TELEGRAM_API_ID e TELEGRAM_API_HASH são obrigatórios") }
export function getClient() { if (!client) throw new Error("Cliente Telegram não inicializado"); return client }
export function getSessionStatus() { return status }
export async function startTelegramClient() { requireConfig(); status = "connecting"; const session = new StringSession(process.env.TELEGRAM_SESSION ?? ""); client = new TelegramClient(session, apiId, apiHash, { connectionRetries: 5 }); try { await client.connect(); if (await client.checkAuthorization()) { status = "connected"; await updateTelegramConnectionStatus(status); log("info", "Telegram conectado") } else { status = "disconnected"; log("info", "Telegram desconectado") }; return client } catch (error) { status = "disconnected"; client = null; throw error } }
export async function requestLoginCode(phone: string) { if (!client) await startTelegramClient(); status = "awaiting_code"; await client!.sendCode({ apiId, apiHash }, phone); log("info", "Autenticação aguardando código"); return status }
export async function verifyLoginCode(phone: string, code: string, password?: string) { if (!client) throw new Error("Cliente Telegram não inicializado"); try { await client.start({ phoneNumber: phone, phoneCode: async () => code, password: async () => password ?? "", onError: (error) => { throw error } }); status = "connected"; const session = String(client.session.save()); await saveTelegramConnection(status, session); log("info", "Autenticação concluída"); return status } catch (error: any) { if (String(error?.message).includes("PASSWORD")) { status = "awaiting_password"; return status }; throw error } }
export async function verifyTwoFactorPassword(password: string) { if (!client) throw new Error("Cliente Telegram não inicializado"); await client.signInWithPassword({ apiId, apiHash }, { password: async () => password, onError: (error) => { throw error } }); status = "connected"; await saveTelegramConnection(status, String(client.session.save())); log("info", "Autenticação concluída"); return status }
export async function disconnectTelegram() { if (client) await client.disconnect(); client = null; status = "disconnected"; await updateTelegramConnectionStatus(status); log("info", "Telegram desconectado") }

export async function getTelegramAccount() {
  if (!client || status !== "connected") return null
  const me: any = await client.getMe()
  return { phone: me.phone ?? "", name: [me.firstName, me.lastName].filter(Boolean).join(" "), username: me.username }
}

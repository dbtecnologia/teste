import { Api } from "telegram"
import { getClient } from "./client.js"
import { log } from "../services/logger.js"
import { saveChat } from "../services/supabase.js"
import type { TelegramChat, ChatType } from "../types/telegram.js"

export async function getAvailableChats(): Promise<TelegramChat[]> { const dialogs = await getClient().getDialogs({}); const chats: TelegramChat[] = []; for (const dialog of dialogs) { const entity: any = dialog.entity; if (!entity) continue; const type: ChatType = entity.className === "Channel" ? (entity.megagroup ? "group" : "channel") : entity.className === "Chat" ? "group" : "private"; const chat: TelegramChat = { id: String(dialog.id), title: dialog.title ?? "Sem título", username: entity.username, type, canRead: true, canSend: type !== "private" || true }; chats.push(chat); await saveChat(chat); if (chat.title.toLowerCase().includes("black bat.invest".toLowerCase())) log("info", "Chat encontrado", { title: chat.title, id: chat.id }); } return chats }
export async function findOriginChat(title = process.env.ORIGIN_CHAT_TITLE ?? "BLACK BAT.INVEST") { const chats = await getAvailableChats(); return chats.find((chat) => chat.title.toLowerCase() === title.toLowerCase()) }
export function entityKind(entity: any) { return entity instanceof Api.Channel ? "channel" : entity instanceof Api.Chat ? "group" : "private" }

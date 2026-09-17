import type { IncomingTelegramMessage } from "../types/telegram.js"
import { log } from "./logger.js"

export async function processIncomingMessage(message: IncomingTelegramMessage) { log("info", "Mensagem processada", { chatId: message.chatId, messageId: message.messageId }); return { accepted: true, message } }

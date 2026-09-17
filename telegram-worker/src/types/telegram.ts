export type ChatType = "private" | "group" | "channel" | "unknown"

export interface TelegramChat { id: string; title: string; username?: string; type: ChatType; canRead: boolean; canSend: boolean }
export interface IncomingTelegramMessage { chatId: string; messageId: number; receivedAt: string; text: string; type: string; media?: Record<string, unknown> }
export type AuthStatus = "connecting" | "connected" | "disconnected" | "awaiting_code" | "awaiting_password"

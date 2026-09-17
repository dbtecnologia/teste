export type TelegramAuthAction = 'start' | 'confirm-code' | 'confirm-2fa' | 'disconnect' | 'test' | 'chats'

export interface TelegramAuthRequest {
  action: TelegramAuthAction
  phone?: string
  code?: string
  password?: string
}

export interface TelegramAuthResponse {
  status: 'disconnected' | 'connecting' | 'awaiting_code' | 'awaiting_2fa' | 'connected' | 'error'
  message?: string
  account?: { phone: string; name: string; username?: string }
  chats?: Array<{ id: string; name: string; type: string; username?: string; canRead: boolean; canPublish: boolean }>
}

export async function requestTelegramAuth(payload: TelegramAuthRequest): Promise<TelegramAuthResponse> {
  const response = await fetch('/api/telegram/auth', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(data.message || 'Não foi possível comunicar com o worker Telegram.')
  return data as TelegramAuthResponse
}

// A sessão MTProto deve ser mantida por um worker Node.js persistente, nunca por uma função serverless.
export const telegramAuthService = { request: requestTelegramAuth }

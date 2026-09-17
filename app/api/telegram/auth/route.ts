import { NextResponse } from 'next/server'
import type { TelegramAuthRequest } from '@/lib/telegram-auth-service'

const allowedActions = new Set(['start', 'confirm-code', 'confirm-2fa', 'disconnect', 'test', 'chats'])

export async function POST(request: Request) {
  const workerUrl = process.env.TELEGRAM_WORKER_URL
  if (!workerUrl) {
    return NextResponse.json({ status: 'error', message: 'Worker MTProto não configurado. A conexão real precisa de um serviço Node.js persistente.' }, { status: 503 })
  }

  let payload: TelegramAuthRequest
  try { payload = await request.json() } catch { return NextResponse.json({ status: 'error', message: 'Solicitação inválida.' }, { status: 400 }) }
  if (!allowedActions.has(payload.action)) return NextResponse.json({ status: 'error', message: 'Ação não permitida.' }, { status: 400 })

  const response = await fetch(`${workerUrl.replace(/\/$/, '')}/telegram/auth`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Internal-Token': process.env.TELEGRAM_WORKER_TOKEN || '' },
    body: JSON.stringify(payload),
    cache: 'no-store',
  })
  const data = await response.json().catch(() => ({ status: 'error', message: 'Resposta inválida do worker Telegram.' }))
  return NextResponse.json(data, { status: response.status })
}

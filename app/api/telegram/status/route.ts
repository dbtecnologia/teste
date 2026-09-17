import { NextResponse } from 'next/server'
import { getTelegramConnectionLabel, getTelegramRuntimeConfig } from '@/lib/telegram-config'

export async function GET() {
  const config = getTelegramRuntimeConfig()

  return NextResponse.json({
    status: config.configured ? 'ready' : 'disconnected',
    label: getTelegramConnectionLabel(config),
    credentials: {
      apiIdConfigured: config.apiIdConfigured,
      apiHashConfigured: config.apiHashConfigured,
      sessionConfigured: config.sessionConfigured,
    },
  })
}

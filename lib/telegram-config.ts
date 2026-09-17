export interface TelegramRuntimeConfig {
  apiIdConfigured: boolean
  apiHashConfigured: boolean
  sessionConfigured: boolean
  configured: boolean
}

export function getTelegramRuntimeConfig(): TelegramRuntimeConfig {
  const apiIdConfigured = Boolean(process.env.TELEGRAM_API_ID)
  const apiHashConfigured = Boolean(process.env.TELEGRAM_API_HASH)
  const sessionConfigured = Boolean(process.env.TELEGRAM_SESSION)

  return {
    apiIdConfigured,
    apiHashConfigured,
    sessionConfigured,
    configured: apiIdConfigured && apiHashConfigured && sessionConfigured,
  }
}

export function getTelegramConnectionLabel(config: TelegramRuntimeConfig) {
  return config.configured ? 'Pronto para conectar' : 'Telegram não conectado'
}

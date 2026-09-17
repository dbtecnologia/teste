export type ReplicationStatus = 'Ativa' | 'Pausada' | 'Erro' | 'Inativa'
export type ReplicationMode = 'Copiar' | 'Encaminhar'
export type MessageStatus = 'Enviada' | 'Pendente' | 'Erro' | 'Ignorada' | 'Duplicada'
export type LogStatus = 'Sucesso' | 'Erro' | 'Aviso'
export type TelegramContentType = 'Texto' | 'Foto' | 'Vídeo' | 'Documento' | 'Áudio' | 'Voz' | 'GIF' | 'Legenda' | 'Link'
export type ReplicationLogEvent = 'Mensagem detectada' | 'Mensagem processada' | 'Mensagem enviada' | 'Mensagem ignorada' | 'Mensagem duplicada' | 'Erro' | 'Erro de permissão' | 'Erro de API' | 'Erro de envio'

export interface Replication {
  id: string
  name: string
  source: string
  destination: string
  mode: ReplicationMode
  status: ReplicationStatus
  contentTypes?: TelegramContentType[]
  filters?: ReplicationFilter
  transformations?: ReplicationTransformation
  messages: number
  lastRun: string
  createdAt?: string
}

export interface Message {
  id: string
  date: string
  source: string
  destination: string
  type: TelegramContentType
  status: MessageStatus
  content: string
  sourceMessageId?: string
  deduplicationKey?: string
}

export interface ReplicationLog {
  id: string
  date: string
  replication: string
  source: string
  destination: string
  event: ReplicationLogEvent | string
  status: LogStatus
  details: string
  sourceMessageId?: string
}

export interface ReplicationTransformation { prefix?: string; suffix?: string; replaceWords?: string; removeLinks?: boolean; signature?: string }
export interface ReplicationFilter { search?: string; status?: ReplicationStatus | 'Todos' }
export interface User { id: string; name: string; email: string }

// Credenciais nunca devem chegar ao cliente. Esta representação expõe apenas o estado seguro da conexão.
export interface TelegramConnection { connected: boolean; accountName?: string; lastCheckedAt?: string; error?: string }
export interface ProcessedMessage { replicationId: string; sourceChatId: string; sourceMessageId: string; processedAt: string; destinationMessageId?: string }
export interface TelegramService { connect(): Promise<TelegramConnection>; disconnect(): Promise<void> }

export const demoReplications: Replication[] = [
  { id: '1', name: 'Notícias Principais', source: 'Canal Notícias', destination: 'Meu Canal', mode: 'Copiar', status: 'Ativa', messages: 1284, lastRun: 'Hoje, 14:32' },
  { id: '2', name: 'Alertas de mercado', source: 'Mercado Global', destination: 'Equipe Financeira', mode: 'Encaminhar', status: 'Ativa', messages: 842, lastRun: 'Hoje, 14:18' },
  { id: '3', name: 'Conteúdo diário', source: 'Conteúdo Pro', destination: 'Arquivo interno', mode: 'Copiar', status: 'Pausada', messages: 356, lastRun: 'Ontem, 18:05' },
  { id: '4', name: 'Monitoramento', source: 'Radar Tech', destination: 'Equipe Produto', mode: 'Copiar', status: 'Erro', messages: 96, lastRun: 'Ontem, 16:40' },
]
export const demoMessages: Message[] = [
  { id: '1', date: '17/09/2026 14:32', source: 'Canal Notícias', destination: 'Meu Canal', type: 'Texto', status: 'Enviada', content: 'Atualização importante sobre o mercado nesta tarde.' },
  { id: '2', date: '17/09/2026 14:18', source: 'Mercado Global', destination: 'Equipe Financeira', type: 'Documento', status: 'Enviada', content: 'Relatório semanal de indicadores.' },
  { id: '3', date: '17/09/2026 13:57', source: 'Canal Notícias', destination: 'Meu Canal', type: 'Foto', status: 'Pendente', content: 'Imagem anexada à publicação.' },
  { id: '4', date: '17/09/2026 13:41', source: 'Radar Tech', destination: 'Equipe Produto', type: 'Texto', status: 'Erro', content: 'Não foi possível entregar a mensagem.' },
]
export const demoLogs: ReplicationLog[] = [
  { id: '1', date: '17/09/2026 14:32:08', replication: 'Notícias Principais', source: 'Canal Notícias', destination: 'Meu Canal', event: 'Mensagem replicada', status: 'Sucesso', details: 'Mensagem processada com sucesso.' },
  { id: '2', date: '17/09/2026 14:20:12', replication: 'Monitoramento', source: 'Radar Tech', destination: 'Equipe Produto', event: 'Falha na entrega', status: 'Erro', details: 'Conexão Telegram não configurada.' },
  { id: '3', date: '17/09/2026 14:10:44', replication: 'Alertas de mercado', source: 'Mercado Global', destination: 'Equipe Financeira', event: 'Mensagem ignorada', status: 'Aviso', details: 'Mensagem duplicada identificada.' },
]

export const telegramService = { connect: async () => ({ connected: false }), disconnect: async () => undefined }
export const replicationService = { list: async () => demoReplications, save: async (replication: Replication) => replication }
export const messageService = { list: async () => demoMessages }
export const logService = { list: async () => demoLogs }

export const navItems = ['Dashboard', 'Replicações', 'Nova Replicação', 'Mensagens', 'Logs', 'Telegram', 'Configurações'] as const
export type NavItem = typeof navItems[number]

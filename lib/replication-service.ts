import type { Message, Replication, ReplicationTransformation } from '@/types'
import { parseEntry } from './parser-service'

export interface IncomingTelegramMessage {
  sourceChatId: string
  sourceMessageId: string
  receivedAt: string
  text: string
  contentType?: Message['type']
  hasMedia?: boolean
}

export interface ReplicationDecision {
  status: 'ready' | 'duplicate' | 'ignored'
  message: Message
  parsed: ReturnType<typeof parseEntry>
}

export function getDeduplicationKey(replicationId: string, sourceChatId: string, sourceMessageId: string) {
  return `${replicationId}:${sourceChatId}:${sourceMessageId}`
}

export function transformText(text: string, transformation?: ReplicationTransformation) {
  let next = text
  if (transformation?.replaceWords) {
    for (const pair of transformation.replaceWords.split(',').map(item => item.trim()).filter(Boolean)) {
      const [from, to = ''] = pair.split('=>').map(item => item.trim())
      if (from) next = next.replaceAll(from, to)
    }
  }
  return `${transformation?.prefix ?? ''}${next}${transformation?.signature ? `\n\n${transformation.signature}` : ''}${transformation?.suffix ?? ''}`
}

export function prepareReplication(replication: Replication, incoming: IncomingTelegramMessage, alreadyProcessed: boolean): ReplicationDecision {
  const parsed = parseEntry(incoming.text, { hasMedia: incoming.hasMedia })
  const deduplicationKey = getDeduplicationKey(replication.id, incoming.sourceChatId, incoming.sourceMessageId)
  const message: Message = {
    id: deduplicationKey,
    date: incoming.receivedAt,
    source: replication.source,
    destination: replication.destination,
    type: incoming.contentType ?? parsed.contentType,
    status: alreadyProcessed ? 'Duplicada' : 'Pendente',
    content: transformText(incoming.text, replication.transformations),
    sourceMessageId: incoming.sourceMessageId,
    deduplicationKey,
  }
  return { status: alreadyProcessed ? 'duplicate' : 'ready', message, parsed }
}

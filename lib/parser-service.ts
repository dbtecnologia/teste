import type { TelegramContentType } from '@/types'

export interface ParsedEntry {
  time?: string
  type?: string
  strategy?: string
  asset?: string
  note?: string
  level?: string
  result?: string
  links: string[]
  originalText: string
  contentType: TelegramContentType
}

const FIELD_ALIASES: Record<keyof Omit<ParsedEntry, 'links' | 'originalText' | 'contentType'>, string[]> = {
  time: ['horário', 'horario', 'hora', 'time'],
  type: ['tipo', 'type'],
  strategy: ['estratégia', 'estrategia', 'strategy'],
  asset: ['ativo', 'evento', 'asset', 'event'],
  note: ['informação', 'informacao', 'observação', 'observacao', 'nota', 'note'],
  level: ['nível', 'nivel', 'level'],
  result: ['resultado', 'result'],
}

function normalize(value: string) {
  return value.trim().toLocaleLowerCase('pt-BR').normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

function detectContentType(text: string, hasMedia = false): TelegramContentType {
  if (hasMedia) return 'Legenda'
  if (/https?:\/\//i.test(text)) return 'Link'
  return 'Texto'
}

export function parseEntry(text: string, options?: { hasMedia?: boolean; aliases?: Partial<typeof FIELD_ALIASES> }): ParsedEntry {
  const fields = { ...FIELD_ALIASES, ...options?.aliases }
  const result: ParsedEntry = { links: [...text.matchAll(/https?:\/\/[^\s)]+/gi)].map(match => match[0]), originalText: text, contentType: detectContentType(text, options?.hasMedia) }
  for (const line of text.split(/\r?\n/)) {
    const match = line.match(/^\s*(?:[🎯📌✅❌•*-]\s*)?([^:：]+)\s*[:：]\s*(.+?)\s*$/)
    if (!match) continue
    const key = normalize(match[1])
    const value = match[2].trim()
    const field = (Object.keys(fields) as Array<keyof typeof fields>).find(candidate => fields[candidate]?.some(alias => normalize(alias) === key))
    if (field) result[field] = value
  }
  return result
}

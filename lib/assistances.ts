import { randomUUID } from 'node:crypto'

import { orderedStatuses, statusMeta, type AssistanceStatus } from './dude-theme'

export type ViewerRole = 'admin' | 'attendant' | 'courier'
export type PhotoCategory = 'peca' | 'manual'

export interface Store {
  id: string
  name: string
  city: string
  state: string
  active: boolean
}

export interface Actor {
  id: string
  name: string
  role: ViewerRole
}

export interface Photo {
  id: string
  category: PhotoCategory
  name: string
  type: string
  size: number
  url: string
}

export interface AssistanceEvent {
  id: string
  from: AssistanceStatus | null
  to: AssistanceStatus
  at: string
  actor: Actor
  note?: string
}

export interface AssistanceNote {
  id: string
  body: string
  at: string
  actor: Actor
}

export interface Address {
  cep: string
  street: string
  number: string
  noNumber: boolean
  neighborhood: string
  city: string
  state: string
  complement?: string
}

export interface Assistance {
  id: string
  protocol: string
  storeId: string
  storeName: string
  courierId: string
  courierName: string
  clientName: string
  address: Address
  manufacturer: string
  model: string
  damagedPart: string
  defectDescription: string
  partCode?: string
  photos: Photo[]
  status: AssistanceStatus
  createdAt: string
  updatedAt: string
  expectedArrival?: string
  manufacturerOrder?: string
  completionNote?: string
  events: AssistanceEvent[]
  notes: AssistanceNote[]
  publicToken: string
}

export interface CreateAssistanceInput {
  idempotencyKey: string
  storeId: string
  courierId: string
  courierName: string
  clientName: string
  address: Address
  manufacturer: string
  model: string
  damagedPart: string
  defectDescription: string
  partCode?: string
  photos: Photo[]
}

export const stores: Store[] = [
  { id: 'store-centro', name: 'Dudê Móveis · Centro', city: 'São Paulo', state: 'SP', active: true },
  { id: 'store-norte', name: 'Dudê Móveis · Norte', city: 'Campinas', state: 'SP', active: true },
]

export const demoActors: Actor[] = [
  { id: 'admin-marina', name: 'Marina Duarte', role: 'admin' },
  { id: 'attendant-centro', name: 'Rafael Lima', role: 'attendant' },
  { id: 'attendant-norte', name: 'Joana Alves', role: 'attendant' },
  { id: 'courier-ana', name: 'Ana Souza', role: 'courier' },
]

const actor = (id: string): Actor => demoActors.find((item) => item.id === id) ?? demoActors[0]

const photo = (category: PhotoCategory, name: string, url: string): Photo => ({
  id: randomUUID(),
  category,
  name,
  type: 'image/jpeg',
  size: 680_000,
  url,
})

const event = (from: AssistanceStatus | null, to: AssistanceStatus, at: string, actorId: string, note?: string): AssistanceEvent => ({
  id: randomUUID(),
  from,
  to,
  at,
  actor: actor(actorId),
  note,
})

const seed: Assistance[] = [
  {
    id: 'asst-demo-001', protocol: 'DUD-2026-0001', storeId: 'store-centro', storeName: stores[0].name, courierId: 'courier-ana', courierName: 'Ana Souza',
    clientName: 'Camila Ferreira', address: { cep: '01310-100', street: 'Avenida Paulista', number: '1578', noNumber: false, neighborhood: 'Bela Vista', city: 'São Paulo', state: 'SP', complement: 'Apto 84' },
    manufacturer: 'Madesa', model: 'Cômoda Aurora 6 gavetas', damagedPart: 'Frente da gaveta 3', defectDescription: 'A peça chegou com uma quina quebrada e acabamento lascado.', partCode: 'MD-AUR-03',
    photos: [photo('peca', 'quina-quebrada.jpg', '/placeholder.jpg'), photo('manual', 'manual-aurora.jpg', '/placeholder-logo.png')], status: 'PENDENTE', createdAt: '2026-11-10T13:20:00.000Z', updatedAt: '2026-11-10T13:20:00.000Z', events: [event(null, 'PENDENTE', '2026-11-10T13:20:00.000Z', 'courier-ana')], notes: [], publicToken: 'cliente-demo-0001',
  },
  {
    id: 'asst-demo-002', protocol: 'DUD-2026-0002', storeId: 'store-centro', storeName: stores[0].name, courierId: 'courier-ana', courierName: 'Ana Souza',
    clientName: 'Lucas Ribeiro', address: { cep: '04538-133', street: 'Rua Clodomiro Amazonas', number: '115', noNumber: false, neighborhood: 'Itaim Bibi', city: 'São Paulo', state: 'SP' },
    manufacturer: 'Dudê Casa', model: 'Mesa de jantar Nexo', damagedPart: 'Tampo da mesa', defectDescription: 'Risco profundo no tampo, identificado na conferência da entrega.', partCode: 'NX-TAMPO-01',
    photos: [photo('peca', 'risco-tampo.jpg', '/placeholder.jpg'), photo('manual', 'manual-nexo.jpg', '/placeholder-logo.png')], status: 'AGUARDANDO_CHEGADA', createdAt: '2026-11-07T14:10:00.000Z', updatedAt: '2026-11-08T10:30:00.000Z', expectedArrival: '2026-11-18', manufacturerOrder: 'FAB-78421',
    events: [event(null, 'PENDENTE', '2026-11-07T14:10:00.000Z', 'courier-ana'), event('PENDENTE', 'AGUARDANDO_CHEGADA', '2026-11-08T10:30:00.000Z', 'attendant-centro', 'Pedido FAB-78421 registrado.')], notes: [{ id: randomUUID(), body: 'Fabricante confirmou produção da reposição.', at: '2026-11-08T10:33:00.000Z', actor: actor('attendant-centro') }], publicToken: 'cliente-demo-0002',
  },
  {
    id: 'asst-demo-003', protocol: 'DUD-2026-0003', storeId: 'store-norte', storeName: stores[1].name, courierId: 'courier-ana', courierName: 'Ana Souza',
    clientName: 'Fernanda Costa', address: { cep: '13010-111', street: 'Rua Barreto Leme', number: '620', noNumber: false, neighborhood: 'Centro', city: 'Campinas', state: 'SP' },
    manufacturer: 'Dudê Casa', model: 'Armário Loft 2 portas', damagedPart: 'Porta direita', defectDescription: 'A porta não alinha com o corpo do armário.', photos: [photo('peca', 'porta-desalinhada.jpg', '/placeholder.jpg'), photo('manual', 'manual-loft.jpg', '/placeholder-logo.png')], status: 'PECA_RECEBIDA', createdAt: '2026-11-03T09:40:00.000Z', updatedAt: '2026-11-12T16:20:00.000Z', expectedArrival: '2026-11-12', manufacturerOrder: 'FAB-78110',
    events: [event(null, 'PENDENTE', '2026-11-03T09:40:00.000Z', 'courier-ana'), event('PENDENTE', 'AGUARDANDO_CHEGADA', '2026-11-04T11:00:00.000Z', 'attendant-norte'), event('AGUARDANDO_CHEGADA', 'PECA_RECEBIDA', '2026-11-12T16:20:00.000Z', 'attendant-norte')], notes: [], publicToken: 'cliente-demo-0003',
  },
  {
    id: 'asst-demo-004', protocol: 'DUD-2026-0004', storeId: 'store-norte', storeName: stores[1].name, courierId: 'courier-ana', courierName: 'Ana Souza',
    clientName: 'Paulo Mendes', address: { cep: '13025-240', street: 'Rua Maria Monteiro', number: '91', noNumber: false, neighborhood: 'Cambuí', city: 'Campinas', state: 'SP' },
    manufacturer: 'Madesa', model: 'Painel Home Oslo', damagedPart: 'Prateleira inferior', defectDescription: 'Peça substituída e instalada pela equipe.', photos: [photo('peca', 'prateleira.jpg', '/placeholder.jpg'), photo('manual', 'manual-oslo.jpg', '/placeholder-logo.png')], status: 'CONCLUIDA', createdAt: '2026-10-28T12:00:00.000Z', updatedAt: '2026-11-05T15:45:00.000Z', completionNote: 'Peça entregue e montagem conferida com o cliente.',
    events: [event(null, 'PENDENTE', '2026-10-28T12:00:00.000Z', 'courier-ana'), event('PENDENTE', 'AGUARDANDO_CHEGADA', '2026-10-29T09:00:00.000Z', 'attendant-norte'), event('AGUARDANDO_CHEGADA', 'PECA_RECEBIDA', '2026-11-04T10:20:00.000Z', 'attendant-norte'), event('PECA_RECEBIDA', 'CONCLUIDA', '2026-11-05T15:45:00.000Z', 'attendant-norte', 'Peça entregue e montagem conferida com o cliente.')], notes: [], publicToken: 'cliente-demo-0004',
  },
]

interface StoreState { assistances: Assistance[]; idempotency: Map<string, string>; actionKeys: Map<string, string>; revokedTokens: Set<string>; protocolSequence: number }

declare global { var __dudeAssistanceState: StoreState | undefined }

const state = (): StoreState => {
  if (!globalThis.__dudeAssistanceState) globalThis.__dudeAssistanceState = { assistances: seed, idempotency: new Map(), actionKeys: new Map(), revokedTokens: new Set(), protocolSequence: 5 }
  return globalThis.__dudeAssistanceState
}

const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value)) as T
const now = () => new Date().toISOString()

export const getActor = (role: ViewerRole = 'admin', storeId = 'store-centro', courierId = 'courier-ana'): Actor => {
  if (role === 'admin') return actor('admin-marina')
  if (role === 'courier') return actor(courierId)
  return actor(storeId === 'store-norte' ? 'attendant-norte' : 'attendant-centro')
}

export const canAccess = (item: Assistance, viewer: Actor) => viewer.role === 'admin' || (viewer.role === 'courier' ? item.courierId === viewer.id : item.storeId === (viewer.id === 'attendant-norte' ? 'store-norte' : 'store-centro'))

export const listAssistances = (viewer: Actor, filters: { search?: string; status?: string; storeId?: string; manufacturer?: string; from?: string; to?: string } = {}) => {
  const query = filters.search?.trim().toLowerCase()
  return clone(state().assistances.filter((item) => {
    if (!canAccess(item, viewer)) return false
    if (filters.status && filters.status !== 'TODOS' && item.status !== filters.status) return false
    if (filters.storeId && filters.storeId !== 'TODAS' && item.storeId !== filters.storeId) return false
    if (filters.manufacturer && filters.manufacturer !== 'TODOS' && item.manufacturer !== filters.manufacturer) return false
    if (filters.from && item.createdAt.slice(0, 10) < filters.from) return false
    if (filters.to && item.createdAt.slice(0, 10) > filters.to) return false
    return !query || `${item.protocol} ${item.clientName} ${item.model} ${item.manufacturer}`.toLowerCase().includes(query)
  }).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)))
}

export const findAssistance = (id: string, viewer?: Actor) => {
  const item = state().assistances.find((entry) => entry.id === id)
  if (!item || (viewer && !canAccess(item, viewer))) return null
  return clone(item)
}

export const getCustomerAssistance = (token: string) => {
  if (state().revokedTokens.has(token)) return null
  const item = state().assistances.find((entry) => entry.publicToken === token)
  if (!item) return null
  return clone({ protocol: item.protocol, storeName: item.storeName, manufacturer: item.manufacturer, model: item.model, status: item.status, statusLabel: statusMeta[item.status].label, statusDescription: statusMeta[item.status].description, expectedArrival: item.expectedArrival, completedAt: item.status === 'CONCLUIDA' ? item.events[item.events.length - 1]?.at : undefined, events: item.events.map(({ from, to, at }) => ({ from, to, at, label: statusMeta[to].label })) })
}

const invalid = (message: string): never => { throw new Error(message) }

export const validateCreate = (input: Partial<CreateAssistanceInput>) => {
  const required: [keyof CreateAssistanceInput, string][] = [['clientName', 'Informe o nome completo do cliente.'], ['manufacturer', 'Informe o fabricante.'], ['model', 'Informe o modelo do móvel.'], ['damagedPart', 'Informe a peça danificada.'], ['defectDescription', 'Descreva o defeito observado.']]
  for (const [field, message] of required) if (!input[field] || typeof input[field] !== 'string' || !input[field]?.trim()) invalid(message)
  const address = input.address
  if (!address?.cep || !address.street || (!address.number && !address.noNumber) || !address.neighborhood || !address.city || !address.state) invalid('Complete o endereço de entrega: CEP, logradouro, número, bairro, cidade e UF.')
  const photos = input.photos ?? []
  const categories = new Set(photos.map((item) => item.category))
  if (!categories.has('peca')) invalid('Adicione pelo menos uma foto da peça.')
  if (!categories.has('manual')) invalid('Adicione pelo menos uma foto do manual.')
  for (const item of photos) { if (!item.type.startsWith('image/')) invalid('Envie apenas arquivos de imagem.'); if (item.size > 8 * 1024 * 1024) invalid('Cada foto deve ter no máximo 8 MB.') }
}

export const createAssistance = (input: CreateAssistanceInput) => {
  validateCreate(input)
  const current = state()
  const previousId = current.idempotency.get(input.idempotencyKey)
  if (previousId) return clone(current.assistances.find((item) => item.id === previousId))
  const store = stores.find((item) => item.id === input.storeId) ?? stores[0]
  const createdAt = now()
  const protocol = `DUD-${new Date().getFullYear()}-${String(current.protocolSequence++).padStart(4, '0')}`
  const created: Assistance = { id: randomUUID(), protocol, storeId: store.id, storeName: store.name, courierId: input.courierId, courierName: input.courierName, clientName: input.clientName.trim(), address: clone(input.address), manufacturer: input.manufacturer.trim(), model: input.model.trim(), damagedPart: input.damagedPart.trim(), defectDescription: input.defectDescription.trim(), partCode: input.partCode?.trim() || undefined, photos: clone(input.photos), status: 'PENDENTE', createdAt, updatedAt: createdAt, events: [event(null, 'PENDENTE', createdAt, input.courierId)], notes: [], publicToken: randomUUID() }
  current.assistances.push(created)
  current.idempotency.set(input.idempotencyKey, created.id)
  return clone(created)
}

export type AssistanceAction =
  | { action: 'request_part'; actionKey: string; manufacturerOrder?: string; expectedArrival?: string }
  | { action: 'receive_part'; actionKey: string }
  | { action: 'complete'; actionKey: string; completionNote: string }
  | { action: 'add_note'; actionKey: string; note: string }
  | { action: 'rotate_link'; actionKey: string }

export const updateAssistance = (id: string, input: AssistanceAction, viewer: Actor) => {
  const current = state()
  const item = current.assistances.find((entry) => entry.id === id)
  if (!item || !canAccess(item, viewer)) throw new Error('Assistência não encontrada ou sem permissão.')
  const previousAction = current.actionKeys.get(input.actionKey)
  if (previousAction) return clone(item)
  if (!input.actionKey) invalid('A ação precisa de uma chave de idempotência.')
  if (input.action === 'add_note') {
    const body = input.note.trim()
    if (!body) throw new Error('Escreva uma observação antes de salvar.')
    item.notes.unshift({ id: randomUUID(), body, at: now(), actor: viewer })
    item.updatedAt = now()
    current.actionKeys.set(input.actionKey, item.id)
    return clone(item)
  }
  if (input.action === 'rotate_link') {
    current.revokedTokens.add(item.publicToken)
    item.publicToken = randomUUID()
    item.updatedAt = now()
    current.actionKeys.set(input.actionKey, item.id)
    return clone(item)
  }
  const expected: Record<'request_part' | 'receive_part' | 'complete', AssistanceStatus> = { request_part: 'PENDENTE', receive_part: 'AGUARDANDO_CHEGADA', complete: 'PECA_RECEBIDA' }
  const next: Record<'request_part' | 'receive_part' | 'complete', AssistanceStatus> = { request_part: 'AGUARDANDO_CHEGADA', receive_part: 'PECA_RECEBIDA', complete: 'CONCLUIDA' }
  if (item.status !== expected[input.action]) throw new Error(`A assistência já foi atualizada. Status atual: ${statusMeta[item.status].label}.`)
  if (input.action === 'request_part') {
    const order = input.manufacturerOrder?.trim()
    if (!order) throw new Error('Informe o número do pedido ao fabricante.')
    item.manufacturerOrder = order
    item.expectedArrival = input.expectedArrival || undefined
  }
  if (input.action === 'complete') {
    const completionNote = input.completionNote.trim()
    if (completionNote.length < 3) throw new Error('Registre brevemente o resultado antes de concluir.')
    item.completionNote = completionNote
  }
  const changedAt = now()
  const nextStatus = next[input.action]
  item.events.push(event(item.status, nextStatus, changedAt, viewer.id, input.action === 'complete' ? item.completionNote : undefined))
  item.status = nextStatus
  item.updatedAt = changedAt
  current.actionKeys.set(input.actionKey, item.id)
  return clone(item)
}

export const countsFor = (items: Assistance[]) => Object.fromEntries(orderedStatuses.map((status) => [status, items.filter((item) => item.status === status).length])) as Record<AssistanceStatus, number>


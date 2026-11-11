'use client'

import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Building2,
  CalendarDays,
  Camera,
  Check,
  CheckCircle2,
  Clipboard,
  Clock3,
  Copy,
  Eye,
  FileText,
  Filter,
  ImagePlus,
  Info,
  LayoutDashboard,
  Link2,
  Loader2,
  MapPin,
  Menu,
  PackageCheck,
  Pencil,
  Phone,
  Plus,
  RefreshCw,
  RotateCcw,
  Search,
  Send,
  ShieldCheck,
  Store,
  Truck,
  Upload,
  UserRound,
  Users,
  X,
} from 'lucide-react'
import { useCallback, useEffect, useMemo, useState, type FormEvent, type MouseEvent } from 'react'

import { DudeLogo } from './dude-logo'
import { orderedStatuses, statusMeta, type AssistanceStatus } from '@/lib/dude-theme'
import type { Address, Assistance, AssistanceEvent, CustomerProfile, Photo, PhotoCategory, Store as StoreType, ViewerRole } from '@/lib/assistances'

type ViewName = 'adm' | 'entregador' | 'painel' | 'cliente'

type FormState = {
  idempotencyKey: string
  clientName: string
  address: Address
  manufacturer: string
  model: string
  damagedPart: string
  defectDescription: string
  partCode: string
  photos: Photo[]
}

type CustomerData = {
  protocol: string
  storeName: string
  manufacturer: string
  model: string
  status: AssistanceStatus
  statusLabel: string
  statusDescription: string
  expectedArrival?: string
  completedAt?: string
  photos: { id: string; category: PhotoCategory; name: string; url: string }[]
  customerMedia: { id: string; name: string; type: string; size: number; url: string; createdAt: string }[]
  events: { from: AssistanceStatus | null; to: AssistanceStatus; at: string; label: string }[]
}

const emptyForm = (): FormState => ({
  idempotencyKey: '', clientName: '', address: { cep: '', street: '', number: '', noNumber: false, neighborhood: '', city: '', state: '', complement: '' },
  manufacturer: '', model: '', damagedPart: '', defectDescription: '', partCode: '', photos: [],
})

const api = async (path: string, options: RequestInit = {}, role: ViewerRole = 'admin', storeId = 'store-centro') => {
  const response = await fetch(path, { ...options, headers: { 'Content-Type': 'application/json', 'x-demo-role': role, 'x-demo-store': storeId, 'x-demo-courier': 'courier-ana', ...(options.headers || {}) } })
  const body = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(body.message || 'Não foi possível concluir a operação.')
  return body
}

const formatDate = (value?: string, withTime = false) => value ? new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', ...(withTime ? { hour: '2-digit', minute: '2-digit' } : {}) }).format(new Date(value)) : '—'
const formatLongDate = (value?: string) => value ? new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' }).format(new Date(`${value}T12:00:00`)) : '—'
const statusClass = (status: AssistanceStatus) => status === 'PENDENTE' ? 'dude-status-pendente' : status === 'AGUARDANDO_CHEGADA' ? 'dude-status-aguardando' : status === 'PECA_RECEBIDA' ? 'dude-status-recebida' : 'dude-status-concluida'
const statusIcon = (status: AssistanceStatus, size = 16) => status === 'PENDENTE' ? <Clock3 size={size} /> : status === 'AGUARDANDO_CHEGADA' ? <Truck size={size} /> : status === 'PECA_RECEBIDA' ? <PackageCheck size={size} /> : <CheckCircle2 size={size} />

function StatusPill({ status }: { status: AssistanceStatus }) {
  return <span className={`dude-status ${statusClass(status)}`}>{statusIcon(status, 13)} {statusMeta[status].label}</span>
}

function Timeline({ current, events, publicOnly = false }: { current: AssistanceStatus; events: AssistanceEvent[] | CustomerData['events']; publicOnly?: boolean }) {
  const currentIndex = orderedStatuses.indexOf(current)
  return <div className="space-y-0">
    {orderedStatuses.map((status, index) => {
      const item = events.find((entry) => entry.to === status)
      const done = index < currentIndex
      const active = index === currentIndex
      return <div className="relative flex gap-3 pb-6 last:pb-0" key={status}>
        {index < orderedStatuses.length - 1 && <span className={`dude-step-line ${done ? 'bg-[#C9A24A]' : ''}`} style={done ? { background: '#C9A24A' } : undefined} />}
        <div className={`relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 ${done || active ? 'border-[#D40C1A] bg-[#D40C1A] text-white' : 'border-[#BFC3C8] bg-white text-[#747A82]'}`}>
          {done ? <Check size={16} /> : statusIcon(status, 15)}
        </div>
        <div className="min-w-0 pt-0.5">
          <div className="flex flex-wrap items-center gap-2"><strong className={`text-sm ${active ? 'text-[#D40C1A]' : done ? 'text-[#11161F]' : 'text-[#747A82]'}`}>{statusMeta[status].label}</strong>{active && <span className="rounded-full bg-[#F1E2B8] px-2 py-0.5 text-[10px] font-bold text-[#5f4711]">Atual</span>}</div>
          <p className="mt-1 text-xs text-[#747A82]">{statusMeta[status].description}</p>
          {item && <p className="mt-2 text-[11px] font-semibold text-[#11161F]">{formatDate(item.at, true)}{!publicOnly && 'actor' in item && item.actor ? ` · ${item.actor.name}` : ''}</p>}
        </div>
      </div>
    })}
  </div>
}

function Header({ view, setView, role, setRole, onRefresh, loading, customerToken }: { view: ViewName; setView: (view: ViewName) => void; role: ViewerRole; setRole: (role: ViewerRole) => void; onRefresh: () => void; loading: boolean; customerToken?: string }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const go = (next: ViewName) => { setView(next); setMenuOpen(false) }
  return <header className="sticky top-0 z-40 border-b border-[#E7E0D4] bg-[#FAF5EA]/95 backdrop-blur">
    <div className="mx-auto flex max-w-[1320px] items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
      <DudeLogo compact className="h-10 w-auto" />
      <nav className="hidden items-center gap-1 rounded-xl border border-[#E7E0D4] bg-white p-1 md:flex" aria-label="Módulos">
        <a className="dude-button dude-button-quiet min-h-9 px-3 text-xs" href="/adm"><Users size={14} /> Adm</a>
        <a className="dude-button dude-button-quiet min-h-9 px-3 text-xs" href="/entregador"><Camera size={14} /> Entregador</a>
        <a className="dude-button dude-button-quiet min-h-9 px-3 text-xs" href="/cliente"><Eye size={14} /> Cliente</a>
        <a className={`dude-button min-h-9 px-3 text-xs ${view === 'painel' ? 'bg-[#11161F] text-white' : 'dude-button-quiet'}`} href="/painel"><LayoutDashboard size={14} /> Painel geral</a>
      </nav>
      <div className="flex items-center gap-1.5">
        <button className="dude-button dude-button-quiet hidden sm:inline-flex" onClick={onRefresh} aria-label="Atualizar dados">{loading ? <Loader2 className="animate-spin" size={16} /> : <RefreshCw size={16} />}<span className="hidden lg:inline">Atualizar</span></button>
        <button className="dude-button dude-button-quiet md:hidden" onClick={() => setMenuOpen(!menuOpen)} aria-label="Abrir menu">{menuOpen ? <X size={20} /> : <Menu size={20} />}</button>
        <div className="hidden items-center gap-2 border-l border-[#E7E0D4] pl-3 sm:flex"><div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F1E2B8] text-[#7a5b13]"><UserRound size={15} /></div><div className="hidden lg:block"><p className="text-[11px] font-bold">{role === 'admin' ? 'Marina Duarte' : role === 'attendant' ? 'Rafael Lima' : 'Ana Souza'}</p><p className="text-[10px] text-[#747A82]">{role === 'admin' ? 'Administrador geral' : role === 'attendant' ? 'Atendente da loja' : 'Entregadora'}</p></div></div>
      </div>
    </div>
    {menuOpen && <div className="border-t border-[#E7E0D4] bg-white p-3 md:hidden"><a className="dude-button dude-button-quiet w-full justify-start" href="/adm"><Users size={15} /> App do atendimento</a><a className="dude-button dude-button-quiet w-full justify-start" href="/entregador"><Camera size={15} /> App do entregador</a><a className="dude-button dude-button-quiet w-full justify-start" href="/cliente"><Eye size={15} /> App do cliente</a><a className="dude-button dude-button-quiet w-full justify-start" href="/painel"><LayoutDashboard size={15} /> Painel geral</a>{customerToken && <a className="dude-button dude-button-quiet w-full justify-start" href={`/cliente/${customerToken}`}><Link2 size={15} /> Abrir acompanhamento</a>}</div>}
  </header>
}

function EmptyState({ onAction }: { onAction: () => void }) {
  return <div className="dude-card flex flex-col items-center justify-center px-6 py-14 text-center"><div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#F1E2B8] text-[#7a5b13]"><Clipboard size={24} /></div><h3 className="dude-serif text-2xl">Nenhuma assistência encontrada</h3><p className="mt-2 max-w-sm text-sm leading-6 text-[#747A82]">Comece registrando o primeiro chamado com as fotos da peça e do manual.</p><button className="dude-button dude-button-primary mt-6" onClick={onAction}><Plus size={18} /> Nova assistência</button></div>
}

function PhotoSlot({ category, photo, onChange, onRemove }: { category: PhotoCategory; photo?: Photo; onChange: (photo: Photo) => void; onRemove: () => void }) {
  const [error, setError] = useState('')
  const label = category === 'peca' ? 'Foto da peça' : 'Foto do manual'
  const handleFile = (file?: File) => {
    if (!file) return
    if (!file.type.startsWith('image/')) { setError('Escolha uma imagem.'); return }
    if (file.size > 8 * 1024 * 1024) { setError('Máximo de 8 MB.'); return }
    setError('')
    onChange({ id: typeof window !== 'undefined' && window.crypto?.randomUUID ? window.crypto.randomUUID() : `${category}-${Date.now()}`, category, name: file.name, type: file.type, size: file.size, url: URL.createObjectURL(file) })
  }
  return <div className="overflow-hidden rounded-xl border border-[#E7E0D4] bg-white">
    <div className="relative aspect-[1.18] bg-[#F4ECDB]">
      {photo ? <><img src={photo.url} alt={label} className="h-full w-full object-cover" /><button onClick={onRemove} className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-[#D40C1A] shadow" aria-label={`Remover ${label}`}><X size={15} /></button></> : <label className="flex h-full cursor-pointer flex-col items-center justify-center gap-2 text-[#747A82]"><input type="file" accept="image/*" className="sr-only" onChange={(event) => handleFile(event.currentTarget.files?.[0])} /><div className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-[#D40C1A]"><Camera size={20} /></div><span className="text-xs font-bold">Adicionar foto</span><span className="text-[10px]">JPEG, PNG até 8 MB</span></label>}
    </div>
    <div className="flex items-center justify-between border-t border-[#E7E0D4] px-3 py-3"><span className="text-sm font-bold">{label}</span>{photo ? <Check className="text-[#27815b]" size={17} /> : <ImagePlus className="text-[#747A82]" size={17} />}</div>
    {error && <p className="px-3 pb-2 text-[11px] text-[#D40C1A]">{error}</p>}
  </div>
}

function CourierWizard({ storeId, onCreated, onCancel, mode = 'courier' }: { storeId: string; onCreated: (item: Assistance) => void; onCancel: () => void; mode?: 'courier' | 'admin' }) {
  const [step, setStep] = useState(1)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const setField = <K extends keyof FormState>(field: K, value: FormState[K]) => setForm((current) => ({ ...current, [field]: value }))
  const setAddress = (field: keyof Address, value: string | boolean) => setForm((current) => ({ ...current, address: { ...current.address, [field]: value } }))
  const demo = () => setForm({ idempotencyKey: '', clientName: 'Juliana Martins', address: { cep: '01310-100', street: 'Avenida Paulista', number: '1578', noNumber: false, neighborhood: 'Bela Vista', city: 'São Paulo', state: 'SP', complement: 'Apto 84' }, manufacturer: 'Dudê Móveis', model: 'Guarda-roupa Aurora', damagedPart: 'Canto do painel lateral', defectDescription: 'A quina chegou lascada e a peça não encaixa na montagem.', partCode: 'AUR-LAT-02', photos: [{ id: 'demo-peca', category: 'peca', name: 'foto-da-peca.svg', type: 'image/svg+xml', size: 620000, url: '/images/damage-piece.svg' }, { id: 'demo-manual', category: 'manual', name: 'foto-do-manual.svg', type: 'image/svg+xml', size: 580000, url: '/images/manual-aurora.svg' }] })
  const validateStep = (currentStep: number) => {
    setError('')
    if (currentStep === 1) { if (!form.clientName.trim()) return setError('Informe o nome completo do cliente.'); if (!form.address.cep || !form.address.street || (!form.address.number && !form.address.noNumber) || !form.address.neighborhood || !form.address.city || !form.address.state) return setError('Complete o endereço: CEP, logradouro, número, bairro, cidade e UF.') }
    if (currentStep === 2) { if (!form.manufacturer.trim()) return setError('Informe o fabricante.'); if (!form.model.trim()) return setError('Informe o modelo do móvel.'); if (!form.damagedPart.trim()) return setError('Informe a peça danificada.'); if (!form.defectDescription.trim()) return setError('Descreva o defeito observado.') }
    if (currentStep === 3) { if (!form.photos.some((item) => item.category === 'peca')) return setError('Adicione pelo menos uma foto da peça.'); if (!form.photos.some((item) => item.category === 'manual')) return setError('Adicione pelo menos uma foto do manual.') }
    return true
  }
  const next = () => { if (validateStep(step)) setStep((value) => Math.min(3, value + 1)) }
  const submit = async () => {
    if (!validateStep(3)) return
    const idempotencyKey = form.idempotencyKey || (typeof window !== 'undefined' && window.crypto?.randomUUID ? window.crypto.randomUUID() : `draft-${Date.now()}`)
    setForm((current) => ({ ...current, idempotencyKey }))
    setSaving(true); setError('')
    try {
      const body = { ...form, idempotencyKey, storeId, courierId: 'courier-ana', courierName: 'Ana Souza' }
      const result = await api('/api/assistencias', { method: 'POST', body: JSON.stringify(body) }, 'courier', storeId)
      onCreated(result.item)
    } catch (submitError) { setError(submitError instanceof Error ? submitError.message : 'Não foi possível enviar. Os dados foram preservados para uma nova tentativa.') } finally { setSaving(false) }
  }
  return <section className="dude-fade-in mx-auto max-w-2xl">
    <div className="mb-5 flex items-center justify-between"><button className="dude-button dude-button-quiet" onClick={onCancel}><ArrowLeft size={17} /> Voltar</button><button className="text-xs font-bold text-[#D40C1A]" onClick={demo}>Preencher exemplo</button></div>
    <div className="mb-5"><p className="dude-kicker">{mode === 'admin' ? 'Cadastro central' : 'Nova assistência'}</p><h1 className="dude-serif mt-2 text-4xl leading-tight sm:text-5xl">{mode === 'admin' ? 'Cadastre uma entrega.' : 'Registre o que aconteceu.'}</h1><p className="mt-3 text-sm leading-6 text-[#747A82]">Preencha em três etapas. O protocolo será criado depois da revisão.</p></div>
    <div className="mb-6 flex items-center gap-2">{[1, 2, 3].map((item) => <div key={item} className="flex flex-1 items-center gap-2"><div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${item <= step ? 'bg-[#D40C1A] text-white' : 'bg-white text-[#747A82] ring-1 ring-[#E7E0D4]'}`}>{item < step ? <Check size={15} /> : item}</div><div className={`h-1 flex-1 rounded-full ${item < step ? 'bg-[#C9A24A]' : 'bg-[#E7E0D4]'}`} /></div>)}</div>
    <div className="dude-card dude-shadow p-4 sm:p-6">
      <div className="mb-6 rounded-xl bg-[#F8F1E4] p-4"><p className="text-xs font-bold text-[#D40C1A]">{step === 1 ? '1 de 3 · Cliente e endereço' : step === 2 ? '2 de 3 · Produto e defeito' : '3 de 3 · Fotos e revisão'}</p><p className="mt-1 text-xs text-[#747A82]">{step === 1 ? 'Onde a assistência foi identificada?' : step === 2 ? 'Qual móvel e qual peça precisam de atenção?' : 'Identifique claramente as duas categorias de foto.'}</p></div>
      {step === 1 && <div className="space-y-4"><div><label className="dude-label">Nome completo do cliente *</label><input className="dude-input" value={form.clientName} onChange={(event) => setField('clientName', event.target.value)} placeholder="Ex.: Juliana Martins" /></div><div className="grid gap-4 sm:grid-cols-[1fr_2fr]"><div><label className="dude-label">CEP *</label><input className="dude-input" value={form.address.cep} onChange={(event) => setAddress('cep', event.target.value)} placeholder="00000-000" /></div><div><label className="dude-label">Logradouro *</label><input className="dude-input" value={form.address.street} onChange={(event) => setAddress('street', event.target.value)} placeholder="Rua, avenida..." /></div></div><div className="grid gap-4 sm:grid-cols-[1fr_1fr_1fr]"><div><label className="dude-label">Número *</label><input className="dude-input disabled:bg-[#f5f0e7]" disabled={form.address.noNumber} value={form.address.number} onChange={(event) => setAddress('number', event.target.value)} placeholder="123" /><label className="mt-2 flex items-center gap-2 text-[11px] text-[#747A82]"><input type="checkbox" checked={form.address.noNumber} onChange={(event) => setAddress('noNumber', event.target.checked)} /> Sem número</label></div><div><label className="dude-label">Bairro *</label><input className="dude-input" value={form.address.neighborhood} onChange={(event) => setAddress('neighborhood', event.target.value)} placeholder="Bairro" /></div><div><label className="dude-label">UF *</label><input className="dude-input uppercase" maxLength={2} value={form.address.state} onChange={(event) => setAddress('state', event.target.value.toUpperCase())} placeholder="SP" /></div></div><div className="grid gap-4 sm:grid-cols-2"><div><label className="dude-label">Cidade *</label><input className="dude-input" value={form.address.city} onChange={(event) => setAddress('city', event.target.value)} placeholder="Cidade" /></div><div><label className="dude-label">Complemento</label><input className="dude-input" value={form.address.complement} onChange={(event) => setAddress('complement', event.target.value)} placeholder="Apto, bloco..." /></div></div></div>}
      {step === 2 && <div className="space-y-4"><div className="grid gap-4 sm:grid-cols-2"><div><label className="dude-label">Fabricante *</label><input className="dude-input" value={form.manufacturer} onChange={(event) => setField('manufacturer', event.target.value)} placeholder="Pode ser informado manualmente" /></div><div><label className="dude-label">Modelo *</label><input className="dude-input" value={form.model} onChange={(event) => setField('model', event.target.value)} placeholder="Nome ou referência" /></div></div><div><label className="dude-label">Peça danificada *</label><input className="dude-input" value={form.damagedPart} onChange={(event) => setField('damagedPart', event.target.value)} placeholder="Ex.: porta direita" /></div><div><label className="dude-label">Descrição do defeito *</label><textarea className="dude-input min-h-28 resize-y" value={form.defectDescription} onChange={(event) => setField('defectDescription', event.target.value)} placeholder="Descreva o que foi encontrado na entrega..." /></div><div><label className="dude-label">Código da peça no manual</label><input className="dude-input" value={form.partCode} onChange={(event) => setField('partCode', event.target.value)} placeholder="Opcional" /></div></div>}
      {step === 3 && <div className="space-y-5"><div className="grid gap-3 sm:grid-cols-2"><PhotoSlot category="peca" photo={form.photos.find((item) => item.category === 'peca')} onChange={(photo) => setField('photos', [...form.photos.filter((item) => item.category !== 'peca'), photo])} onRemove={() => setField('photos', form.photos.filter((item) => item.category !== 'peca'))} /><PhotoSlot category="manual" photo={form.photos.find((item) => item.category === 'manual')} onChange={(photo) => setField('photos', [...form.photos.filter((item) => item.category !== 'manual'), photo])} onRemove={() => setField('photos', form.photos.filter((item) => item.category !== 'manual'))} /></div><div className="rounded-xl border border-[#E7E0D4] bg-[#fffdf9] p-4"><div className="flex items-center gap-2"><FileText size={17} className="text-[#D40C1A]" /><p className="text-sm font-bold">Resumo para revisão</p></div><dl className="mt-3 grid gap-2 text-xs sm:grid-cols-2"><div><dt className="text-[#747A82]">Cliente</dt><dd className="font-semibold">{form.clientName || 'Ainda não informado'}</dd></div><div><dt className="text-[#747A82]">Endereço</dt><dd className="font-semibold">{form.address.street ? `${form.address.street}, ${form.address.number || 's/n'} · ${form.address.city}/${form.address.state}` : 'Ainda não informado'}</dd></div><div><dt className="text-[#747A82]">Produto</dt><dd className="font-semibold">{form.model || 'Ainda não informado'}</dd></div><div><dt className="text-[#747A82]">Fotos</dt><dd className="font-semibold">{form.photos.length} de 2 categorias</dd></div></dl></div></div>}
      {error && <div className="mt-5 flex items-start gap-2 rounded-xl border border-[#efb3b7] bg-[#fff3f3] p-3 text-xs text-[#AC0712]"><AlertCircle className="mt-0.5 shrink-0" size={16} /><span>{error}</span></div>}
      <div className="mt-6 flex justify-between gap-3 border-t border-[#E7E0D4] pt-5"><button className="dude-button dude-button-secondary" onClick={() => step === 1 ? onCancel() : setStep((value) => value - 1)}>{step === 1 ? 'Cancelar' : <><ArrowLeft size={15} /> Voltar</>}</button>{step < 3 ? <button className="dude-button dude-button-primary" onClick={next}>Continuar <ArrowRight size={16} /></button> : <button className="dude-button dude-button-primary" disabled={saving} onClick={submit}>{saving ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />} {saving ? 'Enviando...' : 'Enviar solicitação'}</button>}</div>
    </div>
  </section>
}

function CourierHome({ items, onNew, onSelect }: { items: Assistance[]; onNew: () => void; onSelect: (id: string) => void }) {
  return <div className="mx-auto max-w-xl"><div className="mb-7"><p className="dude-kicker">Aplicativo do entregador</p><h1 className="dude-serif mt-2 text-4xl leading-tight sm:text-5xl">Minhas assistências</h1><p className="mt-3 text-sm leading-6 text-[#747A82]">Registre um problema durante a entrega e acompanhe cada próximo passo.</p></div><button className="dude-button dude-button-primary mb-7 min-h-14 w-full justify-center rounded-xl text-base" onClick={onNew}><Plus size={21} /> Nova assistência</button><div className="mb-3 flex items-center justify-between"><h2 className="text-sm font-bold">Chamados recentes</h2><span className="text-xs text-[#747A82]">{items.length} no total</span></div>{items.length === 0 ? <EmptyState onAction={onNew} /> : <div className="space-y-3">{items.map((item) => <button key={item.id} className="dude-card dude-shadow block w-full p-4 text-left transition hover:-translate-y-0.5 hover:border-[#C9A24A] sm:p-5" onClick={() => onSelect(item.id)}><div className="flex items-start justify-between gap-3"><div><p className="text-sm font-bold">Protocolo #{item.protocol.replace('DUD-', '')}</p><p className="mt-1 text-xs text-[#747A82]">{formatDate(item.createdAt, true)} · {item.storeName.replace('Dudê Móveis · ', '')}</p></div><StatusPill status={item.status} /></div><div className="mt-4 flex items-center gap-3"><img src={item.photos[0]?.url || '/placeholder.jpg'} alt="" className="h-20 w-20 rounded-xl object-cover" /><div className="min-w-0 flex-1"><p className="text-base font-bold">{item.model}</p><p className="mt-1 truncate text-xs text-[#747A82]">{item.clientName} · {item.damagedPart}</p></div><ArrowRight className="shrink-0 text-[#D40C1A]" size={20} /></div></button>)}</div>}</div>
}

function AssistanceDetails({ item, onBack, admin = false, onUpdate, onPreview }: { item: Assistance; onBack: () => void; admin?: boolean; onUpdate?: (item: Assistance) => void; onPreview?: (photo: Photo) => void }) {
  const [action, setAction] = useState<'request_part' | 'receive_part' | 'complete' | null>(null)
  const [order, setOrder] = useState(item.manufacturerOrder || '')
  const [arrival, setArrival] = useState(item.expectedArrival || '')
  const [completion, setCompletion] = useState(item.completionNote || '')
  const [note, setNote] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [copied, setCopied] = useState(false)
  const runAction = async (payload: Record<string, unknown>) => { setSaving(true); setError(''); try { const result = await api(`/api/assistencias/${item.id}`, { method: 'PATCH', body: JSON.stringify({ ...payload, actionKey: `${payload.action}-${item.id}-${Date.now()}` }) }, admin ? 'admin' : 'courier', item.storeId); onUpdate?.(result.item); setAction(null) } catch (actionError) { setError(actionError instanceof Error ? actionError.message : 'Não foi possível salvar.') } finally { setSaving(false) } }
  const copyLink = async () => { const link = `${window.location.origin}/cliente/${item.publicToken}`; await navigator.clipboard?.writeText(link); setCopied(true); setTimeout(() => setCopied(false), 1800) }
  return <div className="dude-fade-in mx-auto max-w-3xl"><button className="dude-button dude-button-quiet mb-5" onClick={onBack}><ArrowLeft size={17} /> {admin ? 'Voltar para a fila' : 'Minhas assistências'}</button><div className="mb-5 flex flex-wrap items-start justify-between gap-4"><div><p className="dude-kicker">Detalhes do protocolo</p><h1 className="dude-serif mt-2 text-3xl sm:text-4xl">#{item.protocol.replace('DUD-', '')}</h1><p className="mt-2 text-sm text-[#747A82]">Aberto em {formatDate(item.createdAt, true)} · {item.storeName}</p></div><StatusPill status={item.status} /></div><div className="grid gap-5 lg:grid-cols-[1.15fr_.85fr]"><div className="space-y-5"><section className="dude-card p-5"><div className="flex items-start justify-between gap-3"><div><p className="dude-kicker">Cliente e entrega</p><h2 className="mt-2 text-lg font-bold">{item.clientName}</h2></div><MapPin className="text-[#D40C1A]" size={19} /></div><p className="mt-3 text-sm leading-6 text-[#4e535b]">{item.address.street}, {item.address.number || 's/n'}{item.address.complement ? ` · ${item.address.complement}` : ''}<br />{item.address.neighborhood} · {item.address.city}/{item.address.state} · {item.address.cep}</p></section><section className="dude-card p-5"><p className="dude-kicker">Produto e defeito</p><h2 className="mt-2 text-xl font-bold">{item.model}</h2><p className="mt-1 text-sm text-[#747A82]">{item.manufacturer} · {item.damagedPart}</p><p className="mt-4 rounded-xl bg-[#F8F1E4] p-3 text-sm leading-6 text-[#4e535b]">{item.defectDescription}</p>{item.partCode && <p className="mt-3 text-xs text-[#747A82]">Código no manual: <strong className="text-[#11161F]">{item.partCode}</strong></p>}</section><section className="dude-card p-5"><div className="flex items-center justify-between"><div><p className="dude-kicker">Fotos enviadas</p><p className="mt-1 text-xs text-[#747A82]">Acesso restrito à equipe autorizada.</p></div><ShieldCheck className="text-[#C9A24A]" size={19} /></div><div className="mt-4 grid grid-cols-2 gap-3">{item.photos.map((photo) => <button key={photo.id} className="group relative overflow-hidden rounded-xl border border-[#E7E0D4] text-left" onClick={() => onPreview?.(photo)}><img src={photo.url} alt={photo.category === 'peca' ? 'Foto da peça' : 'Foto do manual'} className="aspect-[1.25] w-full object-cover transition group-hover:scale-105" /><span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-3 pb-2 pt-7 text-xs font-bold text-white">{photo.category === 'peca' ? 'Foto da peça' : 'Foto do manual'} <Eye className="ml-1 inline" size={13} /></span></button>)}</div></section></div><aside className="space-y-5"><section className="dude-card p-5"><div className="flex items-center justify-between"><div><p className="dude-kicker">Linha do tempo</p><p className="mt-1 text-xs text-[#747A82]">Datas das etapas registradas</p></div><Clock3 className="text-[#D40C1A]" size={19} /></div><div className="mt-5"><Timeline current={item.status} events={item.events} /></div></section>{admin && <><section className="dude-card p-5"><p className="dude-kicker">Acesso do cliente</p><p className="mt-2 text-sm leading-5 text-[#747A82]">Compartilhe um link individual. O protocolo sozinho não libera o acesso.</p><button className="dude-button dude-button-secondary mt-4 w-full" onClick={copyLink}>{copied ? <Check size={16} /> : <Copy size={16} />} {copied ? 'Link copiado' : 'Copiar link do cliente'}</button><button className="dude-button dude-button-quiet mt-2 w-full" onClick={() => runAction({ action: 'rotate_link' })}><RotateCcw size={15} /> Substituir e revogar link</button></section><section className="dude-card p-5"><p className="dude-kicker">Ação da etapa</p>{item.status === 'CONCLUIDA' ? <div className="mt-3 flex items-start gap-2 rounded-xl bg-[#e9edf2] p-3 text-sm text-[#566171]"><CheckCircle2 className="mt-0.5" size={17} /><span>Atendimento concluído em {formatDate(item.updatedAt, true)}.</span></div> : <><p className="mt-2 text-sm leading-6 text-[#4e535b]">{statusMeta[item.status].description}</p><button className="dude-button dude-button-primary mt-4 w-full" onClick={() => setAction(item.status === 'PENDENTE' ? 'request_part' : item.status === 'AGUARDANDO_CHEGADA' ? 'receive_part' : 'complete')}>{item.status === 'PENDENTE' ? <Send size={16} /> : item.status === 'AGUARDANDO_CHEGADA' ? <PackageCheck size={16} /> : <Check size={16} />} {statusMeta[item.status].action}</button></>}</section>{action && <section className="dude-card border-[#D40C1A] p-5"><p className="dude-kicker">Confirmar atualização</p>{action === 'request_part' && <div className="mt-4 space-y-3"><div><label className="dude-label">Número do pedido ao fabricante *</label><input className="dude-input" value={order} onChange={(event) => setOrder(event.target.value)} placeholder="Ex.: FAB-78421" /></div><div><label className="dude-label">Previsão de chegada</label><input className="dude-input" type="date" value={arrival} onChange={(event) => setArrival(event.target.value)} /></div></div>}{action === 'receive_part' && <p className="mt-3 text-sm leading-6 text-[#4e535b]">Confirme que a peça chegou fisicamente à loja. O chamado continuará aberto até a entrega ou o reparo.</p>}{action === 'complete' && <div className="mt-4"><label className="dude-label">Resultado da entrega ou reparo *</label><textarea className="dude-input min-h-24" value={completion} onChange={(event) => setCompletion(event.target.value)} placeholder="Ex.: Peça entregue e montagem conferida com o cliente." /></div>}{error && <p className="mt-3 text-xs text-[#D40C1A]">{error}</p>}<div className="mt-4 flex gap-2"><button className="dude-button dude-button-secondary flex-1" onClick={() => setAction(null)}>Cancelar</button><button className="dude-button dude-button-primary flex-1" disabled={saving} onClick={() => runAction(action === 'request_part' ? { action, manufacturerOrder: order, expectedArrival: arrival } : action === 'complete' ? { action, completionNote: completion } : { action })}>{saving ? <Loader2 className="animate-spin" size={15} /> : <Check size={15} />} Salvar</button></div></section>}<section className="dude-card p-5"><p className="dude-kicker">Observações internas</p><p className="mt-2 text-xs leading-5 text-[#747A82]">Visíveis somente para a equipe autorizada.</p><div className="mt-3 flex gap-2"><input className="dude-input" value={note} onChange={(event) => setNote(event.target.value)} placeholder="Adicionar observação" /><button className="dude-button dude-button-primary px-3" disabled={!note.trim()} onClick={() => { runAction({ action: 'add_note', note }); setNote('') }} aria-label="Salvar observação"><Plus size={16} /></button></div>{item.notes.length > 0 && <div className="mt-4 space-y-3 border-t border-[#E7E0D4] pt-4">{item.notes.map((entry) => <div key={entry.id}><p className="text-xs leading-5 text-[#4e535b]">{entry.body}</p><p className="mt-1 text-[10px] text-[#9a9da1]">{entry.actor.name} · {formatDate(entry.at, true)}</p></div>)}</div>}</section></>}</aside></div></div>
}

function AdminPanel({ items, allItems, stores, role, storeId, setStoreId, setRole, onSelect, onRefresh }: { items: Assistance[]; allItems: Assistance[]; stores: StoreType[]; role: ViewerRole; storeId: string; setStoreId: (id: string) => void; setRole: (role: ViewerRole) => void; onSelect: (id: string) => void; onRefresh: () => void }) {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('TODOS')
  const [manufacturer, setManufacturer] = useState('TODOS')
  const filtered = useMemo(() => items.filter((item) => { const query = search.toLowerCase(); return (!query || `${item.protocol} ${item.clientName} ${item.model}`.toLowerCase().includes(query)) && (status === 'TODOS' || item.status === status) && (manufacturer === 'TODOS' || item.manufacturer === manufacturer) }), [items, search, status, manufacturer])
  const counts = Object.fromEntries(orderedStatuses.map((entry) => [entry, allItems.filter((item) => item.status === entry).length])) as Record<AssistanceStatus, number>
  const manufacturers = Array.from(new Set(allItems.map((item) => item.manufacturer)))
  return <div className="space-y-6"><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="dude-kicker">Painel administrativo</p><h1 className="dude-serif mt-2 text-4xl leading-tight sm:text-5xl">Fila de assistências</h1><p className="mt-3 text-sm text-[#747A82]">Acompanhe chamados, pedidos ao fabricante e próximos passos.</p></div><div className="flex flex-wrap gap-2"><select className="dude-input min-w-44 py-2.5 text-xs" value={role} onChange={(event) => setRole(event.target.value as ViewerRole)}><option value="admin">Administrador geral</option><option value="attendant">Atendente da loja</option></select><button className="dude-button dude-button-secondary" onClick={onRefresh}><RefreshCw size={15} /> Atualizar fila</button></div></div><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{orderedStatuses.map((entry) => <button key={entry} className={`dude-card p-4 text-left transition hover:-translate-y-0.5 ${status === entry ? 'border-[#D40C1A] ring-2 ring-[#D40C1A]/10' : ''}`} onClick={() => setStatus(status === entry ? 'TODOS' : entry)}><div className="flex items-center justify-between"><span className="text-xs font-bold text-[#747A82]">{statusMeta[entry].label}</span><span className={`dude-status ${statusClass(entry)} p-1.5`}>{statusIcon(entry, 13)}</span></div><p className="mt-3 text-3xl font-bold">{counts[entry] || 0}</p><p className="mt-1 text-[11px] text-[#747A82]">{statusMeta[entry].description}</p></button>)}</div><section className="dude-card overflow-hidden"><div className="flex flex-col gap-3 border-b border-[#E7E0D4] p-4 lg:flex-row lg:items-center"><div className="flex flex-1 items-center gap-2 rounded-lg border border-[#E7E0D4] bg-[#FAF5EA] px-3"><Search size={16} className="text-[#D40C1A]" /><input className="w-full bg-transparent py-3 text-sm outline-none" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar por protocolo, cliente ou móvel" /></div><div className="flex flex-wrap gap-2"><select className="dude-input min-w-36 py-2.5 text-xs" value={storeId} onChange={(event) => setStoreId(event.target.value)} disabled={role !== 'admin'}><option value="TODAS">Todas as lojas</option>{stores.map((store) => <option key={store.id} value={store.id}>{store.name.replace('Dudê Móveis · ', '')}</option>)}</select><select className="dude-input min-w-36 py-2.5 text-xs" value={manufacturer} onChange={(event) => setManufacturer(event.target.value)}><option value="TODOS">Fabricantes</option>{manufacturers.map((item) => <option key={item}>{item}</option>)}</select><button className="dude-button dude-button-quiet" onClick={() => { setSearch(''); setStatus('TODOS'); setManufacturer('TODOS') }}><Filter size={15} /> Limpar</button></div></div>{filtered.length === 0 ? <div className="p-10 text-center text-sm text-[#747A82]">Nenhum chamado corresponde aos filtros.</div> : <div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left"><thead className="bg-[#FAF5EA] text-[10px] uppercase tracking-[.1em] text-[#747A82]"><tr><th className="px-5 py-3 font-bold">Protocolo</th><th className="px-5 py-3 font-bold">Cliente / móvel</th><th className="px-5 py-3 font-bold">Loja</th><th className="px-5 py-3 font-bold">Fabricante</th><th className="px-5 py-3 font-bold">Situação</th><th className="px-5 py-3 font-bold">Data</th><th /></tr></thead><tbody className="divide-y divide-[#E7E0D4]">{filtered.map((item) => <tr key={item.id} className="dude-table-row cursor-pointer" onClick={() => onSelect(item.id)}><td className="px-5 py-4 text-sm font-bold">#{item.protocol.replace('DUD-', '')}</td><td className="px-5 py-4"><p className="text-sm font-bold">{item.clientName}</p><p className="mt-1 text-xs text-[#747A82]">{item.model}</p></td><td className="px-5 py-4 text-xs text-[#4e535b]">{item.storeName.replace('Dudê Móveis · ', '')}</td><td className="px-5 py-4 text-xs text-[#4e535b]">{item.manufacturer}</td><td className="px-5 py-4"><StatusPill status={item.status} /></td><td className="px-5 py-4 text-xs text-[#747A82]">{formatDate(item.updatedAt)}</td><td className="px-5 py-4"><ArrowRight className="text-[#D40C1A]" size={17} /></td></tr>)}</tbody></table></div>}</section><p className="flex items-center gap-2 text-xs text-[#747A82]"><Info size={14} /> {role === 'admin' ? 'Administrador geral · visualização das duas lojas' : 'Atendente da loja · dados limitados à unidade vinculada'}</p></div>
}

function CustomerDirectory({ customers, onRefresh, onNewDelivery }: { customers: CustomerProfile[]; onRefresh: () => void; onNewDelivery: () => void }) {
  const [draft, setDraft] = useState<CustomerProfile | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const edit = (customer: CustomerProfile) => { setDraft({ ...customer, address: { ...customer.address } }); setError('') }
  const setAddress = (field: keyof Address, value: string | boolean) => setDraft((current) => current ? { ...current, address: { ...current.address, [field]: value } } : current)
  const save = async () => {
    if (!draft) return
    setSaving(true); setError('')
    try {
      await api(`/api/clientes/${draft.id}`, { method: 'PATCH', body: JSON.stringify(draft) })
      setDraft(null); onRefresh()
    } catch (issue) { setError(issue instanceof Error ? issue.message : 'Não foi possível atualizar o cliente.') } finally { setSaving(false) }
  }
  return <section className="dude-card overflow-hidden"><div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E7E0D4] p-5"><div><p className="dude-kicker">Base central</p><h2 className="dude-serif mt-1 text-2xl">Clientes cadastrados</h2><p className="mt-1 text-sm text-[#747A82]">O painel geral concentra cadastro, telefone e endereço para o próximo atendimento.</p></div><div className="flex gap-2"><button className="dude-button dude-button-secondary" onClick={onRefresh}><RefreshCw size={15} /> Atualizar</button><button className="dude-button dude-button-primary" onClick={onNewDelivery}><Plus size={16} /> Cadastrar entrega</button></div></div>{customers.length === 0 ? <div className="p-8 text-center text-sm text-[#747A82]">Ainda não há clientes cadastrados pelo app do cliente.</div> : <div className="overflow-x-auto"><table className="w-full min-w-[720px] text-left"><thead className="bg-[#FAF5EA] text-[10px] uppercase tracking-[.1em] text-[#747A82]"><tr><th className="px-5 py-3 font-bold">Cliente</th><th className="px-5 py-3 font-bold">Telefone</th><th className="px-5 py-3 font-bold">Endereço</th><th className="px-5 py-3 font-bold">Cadastro</th><th /></tr></thead><tbody className="divide-y divide-[#E7E0D4]">{customers.map((customer) => <tr key={customer.id} className="dude-table-row"><td className="px-5 py-4"><p className="text-sm font-bold">{customer.name}</p><p className="mt-1 text-xs text-[#747A82]">Cadastro individual</p></td><td className="px-5 py-4 text-sm text-[#4e535b]">{customer.phone}</td><td className="px-5 py-4 text-xs leading-5 text-[#4e535b]">{customer.address.street}, {customer.address.number || 's/n'} · {customer.address.neighborhood}<br />{customer.address.city}/{customer.address.state} · {customer.address.cep}</td><td className="px-5 py-4 text-xs text-[#747A82]">{formatDate(customer.createdAt)}</td><td className="px-5 py-4 text-right"><button className="dude-button dude-button-quiet" onClick={() => edit(customer)}><Pencil size={14} /> Editar</button></td></tr>)}</tbody></table></div>}{draft && <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#11161F]/70 p-4" role="presentation" onClick={() => setDraft(null)}><div className="dude-card max-h-[90vh] w-full max-w-2xl overflow-auto p-5 sm:p-7" role="dialog" aria-modal="true" aria-labelledby="edit-customer-title" onClick={(event) => event.stopPropagation()}><div className="flex items-start justify-between gap-4"><div><p className="dude-kicker">Painel geral</p><h2 id="edit-customer-title" className="dude-serif mt-1 text-3xl">Editar cliente</h2></div><button className="dude-button dude-button-quiet px-2" onClick={() => setDraft(null)} aria-label="Fechar edição"><X size={18} /></button></div><div className="mt-6 space-y-4"><div className="grid gap-4 sm:grid-cols-2"><div><label className="dude-label">Nome completo *</label><input className="dude-input" value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} /></div><div><label className="dude-label">Telefone *</label><input className="dude-input" value={draft.phone} onChange={(event) => setDraft({ ...draft, phone: event.target.value })} /></div></div><div className="border-t border-[#E7E0D4] pt-4"><p className="mb-4 flex items-center gap-2 text-sm font-bold"><MapPin size={16} className="text-[#D40C1A]" /> Endereço de entrega</p><div className="space-y-4"><div className="grid gap-4 sm:grid-cols-[1fr_2fr]"><div><label className="dude-label">CEP *</label><input className="dude-input" value={draft.address.cep} onChange={(event) => setAddress('cep', event.target.value)} /></div><div><label className="dude-label">Logradouro *</label><input className="dude-input" value={draft.address.street} onChange={(event) => setAddress('street', event.target.value)} /></div></div><div className="grid gap-4 sm:grid-cols-3"><div><label className="dude-label">Número *</label><input className="dude-input" disabled={draft.address.noNumber} value={draft.address.number} onChange={(event) => setAddress('number', event.target.value)} /><label className="mt-2 flex items-center gap-2 text-[11px] text-[#747A82]"><input type="checkbox" checked={draft.address.noNumber} onChange={(event) => setAddress('noNumber', event.target.checked)} /> Sem número</label></div><div><label className="dude-label">Bairro *</label><input className="dude-input" value={draft.address.neighborhood} onChange={(event) => setAddress('neighborhood', event.target.value)} /></div><div><label className="dude-label">UF *</label><input maxLength={2} className="dude-input uppercase" value={draft.address.state} onChange={(event) => setAddress('state', event.target.value.toUpperCase())} /></div></div><div className="grid gap-4 sm:grid-cols-2"><div><label className="dude-label">Cidade *</label><input className="dude-input" value={draft.address.city} onChange={(event) => setAddress('city', event.target.value)} /></div><div><label className="dude-label">Complemento</label><input className="dude-input" value={draft.address.complement || ''} onChange={(event) => setAddress('complement', event.target.value)} /></div></div></div></div>{error && <p className="rounded-lg bg-[#fff1df] p-3 text-xs font-semibold text-[#9a5d00]">{error}</p>}<div className="flex gap-2 pt-2"><button className="dude-button dude-button-secondary flex-1" onClick={() => setDraft(null)}>Cancelar</button><button className="dude-button dude-button-primary flex-1" disabled={saving} onClick={save}>{saving ? <Loader2 className="animate-spin" size={15} /> : <Check size={15} />} Salvar alterações</button></div></div></div></div>}</section>
}

function CustomerPortal({ token }: { token?: string }) {
  const [data, setData] = useState<CustomerData | null>(null)
  const [loading, setLoading] = useState(Boolean(token))
  const [error, setError] = useState('')
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const load = useCallback(async () => { if (!token) return; setLoading(true); setError(''); try { const result = await api(`/api/public/assistencias/${token}`); setData(result.item) } catch (loadError) { setError(loadError instanceof Error ? loadError.message : 'Link indisponível.') } finally { setLoading(false) } }, [token])
  useEffect(() => { load() }, [load])
  const uploadMedia = (file?: File) => {
    if (!file || !token) return
    if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) { setUploadError('Escolha uma foto ou vídeo.'); return }
    if (file.size > 25 * 1024 * 1024) { setUploadError('O arquivo deve ter no máximo 25 MB.'); return }
    const reader = new FileReader()
    setUploading(true); setUploadError('')
    reader.onload = async () => {
      try {
        const result = await api(`/api/public/assistencias/${token}`, { method: 'POST', body: JSON.stringify({ name: file.name, type: file.type, size: file.size, url: String(reader.result) }) })
        setData(result.item)
      } catch (uploadIssue) { setUploadError(uploadIssue instanceof Error ? uploadIssue.message : 'Não foi possível enviar o arquivo.') } finally { setUploading(false) }
    }
    reader.onerror = () => { setUploadError('Não foi possível ler este arquivo.'); setUploading(false) }
    reader.readAsDataURL(file)
  }
  if (!token) return <div className="dude-card mx-auto max-w-xl p-8 text-center"><Link2 className="mx-auto text-[#D40C1A]" size={28} /><h1 className="dude-serif mt-4 text-3xl">Área do cliente</h1><p className="mt-2 text-sm leading-6 text-[#747A82]">Selecione uma assistência no painel para visualizar o link individual de acompanhamento.</p></div>
  if (loading) return <div className="dude-card mx-auto max-w-xl p-12 text-center"><Loader2 className="mx-auto animate-spin text-[#D40C1A]" size={24} /><p className="mt-3 text-sm text-[#747A82]">Carregando acompanhamento...</p></div>
  if (error || !data) return <div className="dude-card mx-auto max-w-xl p-8 text-center"><AlertCircle className="mx-auto text-[#D40C1A]" size={28} /><h1 className="dude-serif mt-4 text-3xl">Link indisponível</h1><p className="mt-2 text-sm leading-6 text-[#747A82]">{error || 'Entre em contato com a loja para solicitar um novo link.'}</p></div>
  return <div className="mx-auto max-w-xl"><div className="mb-7"><p className="dude-kicker">Acompanhamento do cliente</p><h1 className="dude-serif mt-2 text-4xl leading-tight">Sua assistência, sem dúvida.</h1><p className="mt-3 text-sm leading-6 text-[#747A82]">A Dudê Móveis atualiza este espaço conforme a reposição avança.</p></div><section className="dude-card dude-shadow overflow-hidden"><div className="bg-[#11161F] p-5 text-white"><div className="flex items-start justify-between gap-4"><div><p className="text-xs font-bold text-[#F1E2B8]">Protocolo #{data.protocol.replace('DUD-', '')}</p><h2 className="dude-serif mt-2 text-2xl">{data.model}</h2><p className="mt-1 text-xs text-white/60">{data.manufacturer} · {data.storeName}</p></div><ShieldCheck className="text-[#C9A24A]" size={21} /></div></div><div className="p-5 sm:p-7"><div className="rounded-xl bg-[#F8F1E4] p-4"><p className="text-[11px] font-bold uppercase tracking-[.1em] text-[#747A82]">Situação atual</p><div className="mt-2 flex flex-wrap items-center gap-2"><StatusPill status={data.status} /></div><p className="mt-3 text-sm font-semibold leading-6 text-[#11161F]">{data.statusDescription}</p>{data.expectedArrival && data.status !== 'CONCLUIDA' && <p className="mt-2 flex items-center gap-2 text-xs text-[#747A82]"><CalendarDays size={14} /> Previsão estimada: <strong className="text-[#11161F]">{formatLongDate(data.expectedArrival)}</strong></p>}{data.completedAt && <p className="mt-2 flex items-center gap-2 text-xs text-[#747A82]"><CheckCircle2 size={14} /> Concluída em <strong className="text-[#11161F]">{formatDate(data.completedAt)}</strong></p>}</div><section className="mt-7"><div className="flex items-end justify-between gap-3"><div><p className="dude-kicker">Fotos da assistência</p><p className="mt-1 text-xs text-[#747A82]">Registros do chamado e arquivos enviados por você.</p></div><label className="dude-button dude-button-primary min-h-9 cursor-pointer px-3 text-xs"><Upload size={14} /> {uploading ? 'Enviando...' : 'Enviar foto ou vídeo'}<input type="file" accept="image/*,video/*" className="sr-only" disabled={uploading} onChange={(event) => uploadMedia(event.currentTarget.files?.[0])} /></label></div><div className="mt-4 grid grid-cols-2 gap-3">{data.photos.map((photo) => <div key={photo.id} className="overflow-hidden rounded-xl border border-[#E7E0D4] bg-white"><img src={photo.url} alt={photo.category === 'peca' ? 'Foto da peça' : 'Foto do manual'} className="aspect-[1.2] w-full object-cover" /><p className="px-3 py-2 text-xs font-bold">{photo.category === 'peca' ? 'Foto da peça' : 'Foto do manual'}</p></div>)}{data.customerMedia.map((media) => <div key={media.id} className="overflow-hidden rounded-xl border border-[#E7E0D4] bg-white">{media.type.startsWith('video/') ? <video src={media.url} controls className="aspect-[1.2] w-full object-cover" /> : <img src={media.url} alt={media.name} className="aspect-[1.2] w-full object-cover" />}<p className="px-3 py-2 text-xs font-bold">Enviado por você</p></div>)}</div>{uploadError && <p className="mt-2 text-xs text-[#D40C1A]">{uploadError}</p>}</section><div className="mt-7"><p className="dude-kicker">Linha do tempo</p><div className="mt-5"><Timeline current={data.status} events={data.events} publicOnly /></div></div></div></section><p className="mt-5 text-center text-xs leading-5 text-[#747A82]">Este link mostra somente as informações desta assistência. Para dúvidas, fale com a loja responsável.</p></div>
}

const blankCustomerAddress = (): Address => ({ cep: '', street: '', number: '', noNumber: false, neighborhood: '', city: '', state: '', complement: '' })

export function CustomerRegistration() {
  const [form, setForm] = useState({ name: '', phone: '', address: blankCustomerAddress() })
  const [saved, setSaved] = useState<CustomerProfile | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const setAddress = (field: keyof Address, value: string | boolean) => setForm((current) => ({ ...current, address: { ...current.address, [field]: value } }))
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSaving(true); setError('')
    try {
      const result = await api('/api/clientes', { method: 'POST', body: JSON.stringify(form) })
      setSaved(result.item)
    } catch (issue) { setError(issue instanceof Error ? issue.message : 'Não foi possível salvar seu cadastro.') } finally { setSaving(false) }
  }
  if (saved) return <div className="mx-auto max-w-xl"><div className="mb-8"><p className="dude-kicker">Cadastro do cliente</p><h1 className="dude-serif mt-2 text-4xl leading-tight sm:text-5xl">Cadastro recebido.</h1><p className="mt-3 text-sm leading-6 text-[#747A82]">Seus dados foram registrados para facilitar o atendimento da Dudê Móveis.</p></div><section className="dude-card dude-shadow border-[#C9A24A] p-6 sm:p-8"><div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#E4F2ED] text-[#237251]"><CheckCircle2 size={24} /></div><h2 className="dude-serif mt-5 text-2xl">Tudo certo, {saved.name.split(' ')[0]}.</h2><p className="mt-2 text-sm leading-6 text-[#747A82]">Quando houver uma assistência vinculada ao seu pedido, a loja poderá enviar um link individual para acompanhar o andamento.</p><div className="mt-6 grid gap-3 rounded-xl bg-[#F8F1E4] p-4 text-sm"><p className="flex items-center gap-2"><Phone size={15} className="text-[#D40C1A]" /> {saved.phone}</p><p className="flex items-start gap-2"><MapPin size={15} className="mt-0.5 text-[#D40C1A]" /> {saved.address.street}, {saved.address.number || 's/n'} · {saved.address.city}/{saved.address.state}</p></div><button className="dude-button dude-button-secondary mt-6 w-full" onClick={() => { setSaved(null); setForm({ name: '', phone: '', address: blankCustomerAddress() }) }}>Cadastrar outro cliente</button></section></div>
  return <div className="mx-auto max-w-2xl"><div className="mb-8"><p className="dude-kicker">App do cliente</p><h1 className="dude-serif mt-2 text-4xl leading-tight sm:text-5xl">Seu atendimento começa por aqui.</h1><p className="mt-3 max-w-xl text-sm leading-6 text-[#747A82]">Cadastre seus dados uma vez para a equipe encontrar seu pedido e manter o endereço de entrega correto.</p></div><form className="dude-card dude-shadow p-5 sm:p-7" onSubmit={submit}><div className="mb-6 rounded-xl bg-[#11161F] p-5 text-white"><div className="flex items-start gap-3"><UserRound className="mt-0.5 text-[#F1E2B8]" size={20} /><div><p className="text-sm font-bold">Dados do cliente</p><p className="mt-1 text-xs leading-5 text-white/65">Preencha com os dados usados no seu pedido.</p></div></div></div><div className="space-y-5"><div className="grid gap-4 sm:grid-cols-2"><div><label className="dude-label">Nome completo *</label><input required className="dude-input" value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} placeholder="Ex.: Juliana Martins" /></div><div><label className="dude-label">Telefone *</label><input required type="tel" className="dude-input" value={form.phone} onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))} placeholder="(11) 99999-0000" /></div></div><div className="border-t border-[#E7E0D4] pt-5"><div className="mb-4 flex items-center gap-2"><MapPin size={17} className="text-[#D40C1A]" /><p className="text-sm font-bold">Endereço de entrega</p></div><div className="space-y-4"><div className="grid gap-4 sm:grid-cols-[1fr_2fr]"><div><label className="dude-label">CEP *</label><input required className="dude-input" value={form.address.cep} onChange={(event) => setAddress('cep', event.target.value)} placeholder="00000-000" /></div><div><label className="dude-label">Logradouro *</label><input required className="dude-input" value={form.address.street} onChange={(event) => setAddress('street', event.target.value)} placeholder="Rua, avenida..." /></div></div><div className="grid gap-4 sm:grid-cols-3"><div><label className="dude-label">Número *</label><input required={!form.address.noNumber} disabled={form.address.noNumber} className="dude-input disabled:bg-[#f5f0e7]" value={form.address.number} onChange={(event) => setAddress('number', event.target.value)} placeholder="123" /><label className="mt-2 flex items-center gap-2 text-[11px] text-[#747A82]"><input type="checkbox" checked={form.address.noNumber} onChange={(event) => setAddress('noNumber', event.target.checked)} /> Sem número</label></div><div><label className="dude-label">Bairro *</label><input required className="dude-input" value={form.address.neighborhood} onChange={(event) => setAddress('neighborhood', event.target.value)} placeholder="Bairro" /></div><div><label className="dude-label">UF *</label><input required maxLength={2} className="dude-input uppercase" value={form.address.state} onChange={(event) => setAddress('state', event.target.value.toUpperCase())} placeholder="SP" /></div></div><div className="grid gap-4 sm:grid-cols-2"><div><label className="dude-label">Cidade *</label><input required className="dude-input" value={form.address.city} onChange={(event) => setAddress('city', event.target.value)} placeholder="Cidade" /></div><div><label className="dude-label">Complemento</label><input className="dude-input" value={form.address.complement} onChange={(event) => setAddress('complement', event.target.value)} placeholder="Apto, bloco..." /></div></div></div></div></div>{error && <p className="rounded-lg bg-[#fff1df] p-3 text-xs font-semibold text-[#9a5d00]">{error}</p>}<button className="dude-button dude-button-primary mt-2 w-full" disabled={saving}>{saving ? <Loader2 className="animate-spin" size={16} /> : <Check size={16} />} {saving ? 'Salvando cadastro...' : 'Salvar meu cadastro'}</button><p className="text-center text-[11px] leading-5 text-[#747A82]">Seus dados ficam disponíveis apenas para o atendimento da Dudê Móveis.</p></form></div>
}

function ShareLinkButton({ href }: { href: string }) {
  const [copied, setCopied] = useState(false)
  const copy = async (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    event.stopPropagation()
    const url = `${window.location.origin}${href}`
    try {
      await navigator.clipboard.writeText(url)
    } catch {
      const helper = document.createElement('textarea')
      helper.value = url
      helper.style.position = 'fixed'
      helper.style.opacity = '0'
      document.body.appendChild(helper)
      helper.select()
      document.execCommand('copy')
      helper.remove()
    }
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1800)
  }
  return <button type="button" className="dude-button dude-button-secondary min-h-9 shrink-0 px-3 text-xs" onClick={copy}><Copy size={14} /> {copied ? 'Link copiado' : 'Copiar link'}</button>
}

export function WorkspaceHub() {
  const [origin, setOrigin] = useState('')
  const apps = [
    { href: '/adm', icon: Users, label: 'Atendimento', title: 'App do adm loja', description: 'Receba, filtre e atualize os chamados da sua loja.' },
    { href: '/entregador', icon: Truck, label: 'Operação', title: 'App do entregador', description: 'Registre ocorrências durante a entrega com fotos.' },
    { href: '/cliente', icon: UserRound, label: 'Cliente', title: 'App do cliente', description: 'Cadastre nome, telefone e endereço para o atendimento.' },
    { href: '/painel', icon: LayoutDashboard, label: 'Gestão', title: 'Painel geral', description: 'Tenha a visão completa e edite cadastros e entregas.' },
  ]
  useEffect(() => { setOrigin(window.location.origin) }, [])
  return <div className="min-h-screen bg-[#FAF5EA] text-[#11161F]"><header className="border-b border-[#E7E0D4] bg-[#FAF5EA]"><div className="mx-auto flex max-w-[1180px] items-center justify-between gap-4 px-5 py-5 sm:px-8"><DudeLogo compact className="h-11 w-auto" /><span className="shrink-0 rounded-full bg-[#F1E2B8] px-3 py-1.5 text-center text-[10px] font-bold tracking-[.1em] text-[#5f4711]">CENTRAL DE ASSISTÊNCIA</span></div></header><main className="mx-auto max-w-[1180px] px-5 py-10 sm:px-8 sm:py-16"><div className="max-w-2xl"><p className="dude-kicker">Dudê Móveis</p><h1 className="dude-serif mt-3 text-5xl leading-[.98] sm:text-7xl">Escolha o seu app.</h1><p className="mt-5 max-w-xl text-base leading-7 text-[#747A82]">Cada perfil tem um espaço próprio para trabalhar com clareza, registrar o que importa e acompanhar o próximo passo.</p></div><div className="mt-10 grid gap-4 md:grid-cols-2">{apps.map(({ href, icon: Icon, label, title, description }) => <article key={href} className="dude-card flex min-h-52 flex-col justify-between p-5 transition hover:border-[#C9A24A] hover:shadow-[0_18px_55px_rgba(17,22,31,.08)] sm:p-6"><a href={href} className="group block"><div className="flex items-start justify-between"><span className="rounded-full bg-[#F8F1E4] px-3 py-1 text-[10px] font-bold tracking-[.08em] text-[#747A82]">{label}</span><Icon className="text-[#D40C1A]" size={23} /></div><div><h2 className="dude-serif mt-8 text-2xl">{title}</h2><p className="mt-2 max-w-sm text-sm leading-6 text-[#747A82]">{description}</p><span className="mt-5 inline-flex text-xs font-bold text-[#D40C1A]">Abrir aplicativo <ArrowRight className="ml-1 transition group-hover:translate-x-1" size={15} /></span></div></a><div className="mt-5 flex min-w-0 items-center gap-2 border-t border-[#E7E0D4] pt-4"><span className="min-w-0 flex-1 truncate text-[11px] text-[#747A82]">{origin ? `${origin}${href}` : href}</span><ShareLinkButton href={href} /></div></article>)}</div><section className="mt-8 rounded-2xl border border-[#E7E0D4] bg-white p-5 sm:p-6"><p className="dude-kicker">Links para enviar</p><p className="mt-2 text-sm leading-6 text-[#747A82]">Abra esta página no celular ou computador, copie o link do perfil e envie para cada pessoa. Os quatro apps usam a mesma central de dados.</p></section></main><footer className="dude-wave mt-8"><div className="relative z-10 mx-auto flex h-full max-w-[1180px] flex-col justify-center gap-1 px-5 text-[10px] font-bold uppercase tracking-[.14em] text-white/80 sm:flex-row sm:items-end sm:justify-between sm:px-8"><span>Dudê Móveis</span><span>Quatro espaços, um só atendimento</span></div></footer></div>
}

export default function DudeAssistanceApp({ initialView = 'entregador', customerToken: initialCustomerToken }: { initialView?: ViewName; customerToken?: string }) {
  const [view, setView] = useState<ViewName>(initialView)
  const [role, setRole] = useState<ViewerRole>(initialView === 'painel' ? 'admin' : initialView === 'adm' ? 'attendant' : 'courier')
  const [storeId, setStoreId] = useState(initialView === 'painel' ? 'TODAS' : 'store-centro')
  const [items, setItems] = useState<Assistance[]>([])
  const [allItems, setAllItems] = useState<Assistance[]>([])
  const [stores, setStores] = useState<StoreType[]>([])
  const [customers, setCustomers] = useState<CustomerProfile[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [showWizard, setShowWizard] = useState(false)
  const [loading, setLoading] = useState(true)
  const [preview, setPreview] = useState<Photo | null>(null)
  const [customerToken, setCustomerToken] = useState(initialCustomerToken)
  const load = useCallback(async () => { setLoading(true); try { const result = await api('/api/assistencias', {}, role, storeId === 'TODAS' ? 'store-centro' : storeId); setItems(result.items); setStores(result.stores); setAllItems(result.items); if (role === 'admin') { const customerResult = await api('/api/clientes'); setCustomers(customerResult.items) } if (!customerToken && result.items[0]) setCustomerToken(result.items[0].publicToken) } catch { setItems([]) } finally { setLoading(false) } }, [role, storeId, customerToken])
  useEffect(() => { load() }, [load])
  const selected = selectedId ? items.find((item) => item.id === selectedId) || allItems.find((item) => item.id === selectedId) : null
  const onCreated = (item: Assistance) => { setItems((current) => [item, ...current]); setAllItems((current) => [item, ...current]); setShowWizard(false); setSelectedId(item.id) }
  const selectPanel = (id: string) => { setSelectedId(id); setShowWizard(false) }
  const updateSelected = (updated: Assistance) => { setItems((current) => current.map((item) => item.id === updated.id ? updated : item)); setAllItems((current) => current.map((item) => item.id === updated.id ? updated : item)) }
  const switchView = (next: ViewName) => { setView(next); setSelectedId(null); setShowWizard(false); if (next === 'painel') { setRole('admin'); setStoreId('TODAS') } if (next === 'adm') { setRole('attendant'); setStoreId('store-centro') } if (next === 'entregador') { setRole('courier'); setStoreId('store-centro') } }
  return <div className="min-h-screen bg-[#FAF5EA] text-[#11161F]"><Header view={view} setView={switchView} role={role} setRole={setRole} onRefresh={load} loading={loading} customerToken={customerToken} /><main className="mx-auto max-w-[1320px] px-4 py-7 sm:px-6 sm:py-10 lg:px-8">{view === 'entregador' && (showWizard ? <CourierWizard storeId={storeId === 'TODAS' ? 'store-centro' : storeId} onCreated={onCreated} onCancel={() => setShowWizard(false)} /> : selected ? <AssistanceDetails item={selected} onBack={() => setSelectedId(null)} onPreview={setPreview} /> : <CourierHome items={items} onNew={() => { setShowWizard(true); setSelectedId(null) }} onSelect={selectPanel} />)}{(view === 'adm' || view === 'painel') && (view === 'painel' && showWizard ? <CourierWizard mode="admin" storeId={storeId === 'TODAS' ? 'store-centro' : storeId} onCreated={onCreated} onCancel={() => setShowWizard(false)} /> : selected ? <AssistanceDetails item={selected} admin={view === 'painel'} onBack={() => setSelectedId(null)} onUpdate={updateSelected} onPreview={setPreview} /> : <><AdminPanel items={items} allItems={allItems} stores={stores} role={role} storeId={storeId} setStoreId={(id) => { setStoreId(id); setSelectedId(null) }} setRole={(nextRole) => { setRole(nextRole); setStoreId(nextRole === 'admin' ? 'TODAS' : 'store-centro'); setSelectedId(null) }} onSelect={selectPanel} onRefresh={load} />{view === 'painel' && role === 'admin' && <CustomerDirectory customers={customers} onRefresh={load} onNewDelivery={() => { setShowWizard(true); setSelectedId(null) }} />}</>)}{view === 'cliente' && <CustomerPortal token={customerToken} />}</main><footer className="dude-wave mt-8"><div className="relative z-10 mx-auto flex h-full max-w-[1320px] items-end justify-between px-4 pb-2 text-[10px] font-bold uppercase tracking-[.14em] text-white/80 sm:px-6 lg:px-8"><span>Dudê Móveis</span><span>Central de assistência</span></div></footer>{preview && <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#11161F]/75 p-4" onClick={() => setPreview(null)}><div className="relative max-h-[90vh] max-w-3xl overflow-hidden rounded-2xl bg-white p-2" onClick={(event) => event.stopPropagation()}><button className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#D40C1A] shadow" onClick={() => setPreview(null)} aria-label="Fechar foto"><X size={18} /></button><img src={preview.url} alt={preview.name} className="max-h-[80vh] w-auto rounded-xl object-contain" /></div></div>}</div>
}

export { CustomerPortal }

export const dudeTheme = {
  brand: 'Dudê Móveis',
  colors: {
    red: '#D40C1A',
    ivory: '#FAF5EA',
    white: '#FFFFFF',
    graphite: '#11161F',
    gold: '#C9A24A',
    goldSoft: '#F1E2B8',
    muted: '#747A82',
    line: '#E7E0D4',
  },
} as const

export const statusMeta = {
  PENDENTE: {
    label: 'Pendente',
    description: 'A loja precisa analisar o chamado.',
    action: 'Registrar pedido ao fabricante',
    icon: 'clock',
  },
  AGUARDANDO_CHEGADA: {
    label: 'Aguardando chegada',
    description: 'A loja já solicitou a peça ao fabricante.',
    action: 'Registrar recebimento',
    icon: 'truck',
  },
  PECA_RECEBIDA: {
    label: 'Peça recebida',
    description: 'A peça chegou à loja e aguarda a entrega ou o reparo.',
    action: 'Concluir assistência',
    icon: 'package',
  },
  CONCLUIDA: {
    label: 'Concluída',
    description: 'A assistência foi finalizada pela loja.',
    action: null,
    icon: 'check',
  },
} as const

export type AssistanceStatus = keyof typeof statusMeta

export const orderedStatuses: AssistanceStatus[] = [
  'PENDENTE',
  'AGUARDANDO_CHEGADA',
  'PECA_RECEBIDA',
  'CONCLUIDA',
]


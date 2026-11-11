import { addCustomerMedia, getCustomerAssistance } from '@/lib/assistances'

export const dynamic = 'force-dynamic'

export async function GET(_request: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const item = getCustomerAssistance(token)
  return item ? Response.json({ item }) : Response.json({ message: 'Este link não é válido ou foi revogado. Entre em contato com a loja.' }, { status: 404 })
}

export async function POST(request: Request, { params }: { params: Promise<{ token: string }> }) {
  try {
    const { token } = await params
    const body = await request.json()
    const item = addCustomerMedia(token, { name: String(body.name || 'arquivo do cliente'), type: String(body.type || ''), size: Number(body.size || 0), url: String(body.url || '') })
    return Response.json({ item })
  } catch (error) {
    return Response.json({ message: error instanceof Error ? error.message : 'Não foi possível enviar o arquivo.' }, { status: 400 })
  }
}


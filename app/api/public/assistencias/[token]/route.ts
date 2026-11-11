import { getCustomerAssistance } from '@/lib/assistances'

export const dynamic = 'force-dynamic'

export async function GET(_request: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const item = getCustomerAssistance(token)
  return item ? Response.json({ item }) : Response.json({ message: 'Este link não é válido ou foi revogado. Entre em contato com a loja.' }, { status: 404 })
}


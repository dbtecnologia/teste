import { findAssistance, getActor, updateAssistance, type AssistanceAction, type ViewerRole } from '@/lib/assistances'

export const dynamic = 'force-dynamic'

const viewerFromRequest = (request: Request) => {
  const role = (request.headers.get('x-demo-role') || 'admin') as ViewerRole
  const storeId = request.headers.get('x-demo-store') || 'store-centro'
  const courierId = request.headers.get('x-demo-courier') || 'courier-ana'
  return getActor(['admin', 'attendant', 'courier'].includes(role) ? role : 'admin', storeId, courierId)
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const viewer = viewerFromRequest(request)
  const { id } = await params
  const item = findAssistance(id, viewer)
  return item ? Response.json({ item }) : Response.json({ message: 'Assistência não encontrada.' }, { status: 404 })
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const item = updateAssistance(id, await request.json() as AssistanceAction, viewerFromRequest(request))
    return Response.json({ item })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Não foi possível atualizar a assistência.'
    return Response.json({ message }, { status: message.includes('permissão') ? 403 : 409 })
  }
}


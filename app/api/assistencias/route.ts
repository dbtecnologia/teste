import { createAssistance, getActor, listAssistances, stores, type ViewerRole } from '@/lib/assistances'

export const dynamic = 'force-dynamic'

const viewerFromRequest = (request: Request) => {
  const role = (request.headers.get('x-demo-role') || 'admin') as ViewerRole
  const storeId = request.headers.get('x-demo-store') || 'store-centro'
  const courierId = request.headers.get('x-demo-courier') || 'courier-ana'
  return getActor(['admin', 'attendant', 'courier'].includes(role) ? role : 'admin', storeId, courierId)
}

export async function GET(request: Request) {
  const url = new URL(request.url)
  const items = listAssistances(viewerFromRequest(request), {
    search: url.searchParams.get('search') || undefined,
    status: url.searchParams.get('status') || undefined,
    storeId: url.searchParams.get('storeId') || undefined,
    manufacturer: url.searchParams.get('manufacturer') || undefined,
    from: url.searchParams.get('from') || undefined,
    to: url.searchParams.get('to') || undefined,
  })
  return Response.json({ items, stores })
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const item = createAssistance(body)
    return Response.json({ item }, { status: 201 })
  } catch (error) {
    return Response.json({ message: error instanceof Error ? error.message : 'Não foi possível criar a assistência.' }, { status: 400 })
  }
}


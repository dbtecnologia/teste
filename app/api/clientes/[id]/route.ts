import { NextResponse } from 'next/server'

import { updateCustomer } from '@/lib/assistances'

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const item = updateCustomer(id, { name: body.name, phone: body.phone, address: body.address })
    return NextResponse.json({ item })
  } catch (error) {
    return NextResponse.json({ message: error instanceof Error ? error.message : 'Não foi possível atualizar o cliente.' }, { status: 400 })
  }
}

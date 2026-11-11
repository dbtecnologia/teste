import { NextResponse } from 'next/server'

import { createCustomer, listCustomers } from '@/lib/assistances'

export async function GET() {
  return NextResponse.json({ items: listCustomers() })
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const item = createCustomer({ name: String(body.name || ''), phone: String(body.phone || ''), address: body.address })
    return NextResponse.json({ item }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ message: error instanceof Error ? error.message : 'Não foi possível salvar seu cadastro.' }, { status: 400 })
  }
}

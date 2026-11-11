import DudeAssistanceApp from '@/components/dude-assistance-app'

export const dynamic = 'force-dynamic'

export default async function ClientePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  return <DudeAssistanceApp initialView="cliente" customerToken={token} />
}


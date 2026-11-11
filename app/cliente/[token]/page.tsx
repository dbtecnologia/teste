import { CustomerPortal } from '@/components/dude-assistance-app'
import { DudeLogo } from '@/components/dude-logo'

export const dynamic = 'force-dynamic'

export default async function ClientePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  return <div className="min-h-screen bg-[#FAF5EA] text-[#11161F]">
    <header className="border-b border-[#E7E0D4] bg-[#FAF5EA]">
      <div className="mx-auto flex max-w-xl items-center justify-center px-5 py-4">
        <DudeLogo className="h-10 w-auto" />
      </div>
    </header>
    <main className="mx-auto max-w-xl px-4 py-8 sm:px-6 sm:py-12">
      <CustomerPortal token={token} />
    </main>
    <footer className="dude-wave mt-8"><div className="relative z-10 mx-auto flex h-full max-w-xl items-end justify-center px-4 pb-2 text-[10px] font-bold uppercase tracking-[.14em] text-white/80">Dudê Móveis · Acompanhamento seguro</div></footer>
  </div>
}


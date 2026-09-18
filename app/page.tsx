import StorefrontHome from '@/components/storefront-home'

export default function Page() {
  return <StorefrontHome />
}

export const metadata = {
  title: 'REEF GALLERY — Aquarismo marinho premium',
  description: 'Peixes marinhos, corais, invertebrados e equipamentos premium para o seu aquário de água salgada.',
}

export const dynamic = 'force-static'

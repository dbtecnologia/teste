import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Central de assistência | Dudê Móveis',
  description: 'Acompanhe chamados de assistência da Dudê Móveis.',
  generator: 'Dudê Móveis',
  icons: { icon: '/dude-moveis-logo.svg' },
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#FAF5EA',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return <html lang="pt-BR"><body>{children}</body></html>
}

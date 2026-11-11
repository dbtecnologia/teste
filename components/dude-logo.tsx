import Image from 'next/image'

export function DudeLogo({ compact = false, className = '' }: { compact?: boolean; className?: string }) {
  return (
    <Image
      src="/dude-moveis-logo.svg"
      alt="Dudê Móveis"
      width={compact ? 206 : 278}
      height={48}
      priority
      className={className}
    />
  )
}


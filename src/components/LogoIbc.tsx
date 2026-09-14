'use client'

export default function LogoIbc({
  size = 32,
  className = '',
}: {
  size?: number
  className?: string
}) {
  const box = { width: size, height: size, objectFit: 'contain' as const }

  return (
    <span className={`inline-flex shrink-0 ${className}`} style={{ width: size, height: size }}>
      <img
        src="/logo-ibc.png"
        alt="Igreja Batista Central"
        width={size}
        height={size}
        className="block dark:hidden"
        style={box}
      />
      <img
        src="/logo-ibc-white.png"
        alt=""
        width={size}
        height={size}
        className="hidden dark:block"
        style={box}
      />
    </span>
  )
}

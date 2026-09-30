import { useId } from 'react'

export default function Logo({ size = 36 }: { size?: number }) {
  const id = `fc-logo-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#22A55B" />
          <stop offset="1" stopColor="#0E6B3A" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="16" fill={`url(#${id})`} />
      <path d="M33 10c8 0 13 4 14 10-8 1-13-2-14-10Z" fill="#B9F18C" />
      <path d="M33 10c-1 5 0 9 3 12" stroke="#0E6B3A" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M13 26h38l-4.5 22a4 4 0 0 1-4 3.2H21.5a4 4 0 0 1-4-3.2L13 26Z" fill="#fff" />
      <path d="M24 33v11M32 33v11M40 33v11" stroke="#18914F" strokeWidth="3" strokeLinecap="round" />
    </svg>
  )
}

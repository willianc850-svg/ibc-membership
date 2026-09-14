'use client'

import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

type Props = {
  id?: string
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  autoComplete?: string
  required?: boolean
  className?: string
}

export default function CampoSenha({
  id,
  label,
  value,
  onChange,
  placeholder,
  autoComplete = 'current-password',
  required,
  className = 'w-full border border-gray-300 rounded-lg px-4 py-2.5 pr-12 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500',
}: Props) {
  const [visivel, setVisivel] = useState(false)

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div className="relative">
        <input
          id={id}
          type={visivel ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          required={required}
          className={className}
        />
        <button
          type="button"
          onClick={() => setVisivel((v) => !v)}
          className="absolute right-1 top-1/2 -translate-y-1/2 min-h-11 min-w-11 inline-flex items-center justify-center text-gray-500"
          aria-label={visivel ? 'Ocultar senha' : 'Mostrar senha'}
        >
          {visivel ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
    </div>
  )
}

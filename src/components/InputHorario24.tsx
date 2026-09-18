'use client'

import { useRef, useState } from 'react'
import { paraInputTime } from '@/lib/horario'

function soDigitos(valor: string, max: number) {
  return valor.replace(/\D/g, '').slice(0, max)
}

function emitir(hora: string, minuto: string, onChange: (valor: string) => void) {
  if (hora.length === 2 && minuto.length === 2) onChange(`${hora}:${minuto}`)
  else if (!hora && !minuto) onChange('')
}

export default function InputHorario24({
  value,
  onChange,
  dataCy = 'inputHorario',
}: {
  value: string
  onChange: (valor: string) => void
  /** Nome base do data-cy: gera <base>Hora e <base>Minuto. */
  dataCy?: string
}) {
  const inicial = paraInputTime(value)
  const [hora, setHora] = useState(inicial.slice(0, 2))
  const [minuto, setMinuto] = useState(inicial.length >= 5 ? inicial.slice(3, 5) : '')
  const horaRef = useRef<HTMLInputElement>(null)
  const minRef = useRef<HTMLInputElement>(null)
  const campo = 'w-11 h-10 border border-gray-300 rounded-lg px-0 text-sm text-center text-gray-900 bg-white tabular-nums focus:outline-none focus:ring-2 focus:ring-indigo-500'

  function mudarHora(valor: string) {
    let d = soDigitos(valor, 2)
    if (d.length === 1 && Number(d) >= 3) {
      d = `0${d}`
    }
    if (d.length === 2) {
      d = String(Math.min(23, Number(d))).padStart(2, '0')
      minRef.current?.focus()
      minRef.current?.select()
    }
    setHora(d)
    emitir(d, minuto, onChange)
  }

  function mudarMinuto(valor: string) {
    let d = soDigitos(valor, 2)
    if (d.length === 2) {
      d = String(Math.min(59, Number(d))).padStart(2, '0')
    }
    setMinuto(d)
    emitir(hora, d, onChange)
  }

  return (
    <div className="flex items-center gap-1.5">
      <input
        ref={horaRef}
        type="text"
        inputMode="numeric"
        maxLength={2}
        placeholder="19"
        aria-label="Hora"
        className={campo}
        data-cy={`${dataCy}Hora`}
        value={hora}
        onChange={(e) => mudarHora(e.target.value)}
      />
      <span className="text-gray-400 font-medium select-none">:</span>
      <input
        ref={minRef}
        type="text"
        inputMode="numeric"
        maxLength={2}
        placeholder="00"
        aria-label="Minutos"
        className={campo}
        data-cy={`${dataCy}Minuto`}
        value={minuto}
        onChange={(e) => mudarMinuto(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Backspace' && !minuto) {
            e.preventDefault()
            horaRef.current?.focus()
          }
        }}
      />
    </div>
  )
}

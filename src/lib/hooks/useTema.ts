'use client'

import { useEffect, useState, useSyncExternalStore } from 'react'

const STORAGE_KEY = 'ibc-theme'

function lerTema(): 'dark' | 'light' {
  if (typeof document === 'undefined') return 'light'
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light'
}

function aplicarTema(tema: 'dark' | 'light') {
  const root = document.documentElement
  root.classList.toggle('dark', tema === 'dark')
  root.classList.toggle('light', tema !== 'dark')
  localStorage.setItem(STORAGE_KEY, tema)
}

const listeners = new Set<() => void>()

function emitir() {
  listeners.forEach((fn) => fn())
}

function subscribe(fn: () => void) {
  listeners.add(fn)
  return () => { listeners.delete(fn) }
}

export function useTema() {
  const tema = useSyncExternalStore(
    subscribe,
    lerTema,
    () => 'light' as const,
  )
  const [pronto, setPronto] = useState(false)

  useEffect(() => {
    setPronto(true)
  }, [])

  function alternar() {
    const proximo = lerTema() === 'dark' ? 'light' : 'dark'
    aplicarTema(proximo)
    emitir()
  }

  return { tema, dark: tema === 'dark', pronto, alternar }
}

/** Converte valor do banco (ex: 19:00:00) para o formato do input type="time". */
export function paraInputTime(valor: string | null | undefined) {
  if (!valor) return ''
  const m = valor.match(/(\d{1,2}):(\d{2})/)
  if (!m) return ''
  const h = Math.min(23, Number(m[1])).toString().padStart(2, '0')
  const min = Math.min(59, Number(m[2])).toString().padStart(2, '0')
  return `${h}:${min}`
}

export type TipoLancamento = 'entrada' | 'saida'

export type CategoriaLancamento =
  | 'dizimos'
  | 'ofertas'
  | 'missoes'
  | 'outros'
  | 'gastos_fixos'
  | 'gastos_variaveis'
  | 'outros_gastos'
  | 'ofertas_saida'

export type Lancamento = {
  id: string
  data: string
  descricao: string
  valor: number
  comentario: string | null
  tipo: TipoLancamento
  categoria: CategoriaLancamento
  tag: string | null
  comprovante_path: string | null
  criado_por: string | null
  created_at: string
}

export const TAGS_GASTO = [
  'Administração',
  'Tarifas',
  'Consumíveis',
  'Emergenciais',
  'Eventos',
  'Manutenção predial',
  'Materiais',
  'Mídia e comunicação',
  'Ministérios',
  'Missões',
  'Ofertas e contribuições',
  'Pessoal',
  'Plano cooperativo',
  'Remuneração pastoral',
  'Reserva / investimento',
  'Serviços',
  'Serviços administrativos',
  'Transporte e deslocamento',
] as const

export const BLOCOS_RECEITA: { categoria: CategoriaLancamento; titulo: string }[] = [
  { categoria: 'dizimos', titulo: 'Receita — dízimos' },
  { categoria: 'ofertas', titulo: 'Receita — ofertas' },
  { categoria: 'missoes', titulo: 'Receitas — missões' },
  { categoria: 'outros', titulo: 'Receitas — outros' },
]

export const BLOCOS_GASTO: { categoria: CategoriaLancamento; titulo: string }[] = [
  { categoria: 'gastos_fixos', titulo: 'Gastos fixos' },
  { categoria: 'gastos_variaveis', titulo: 'Gastos variáveis' },
  { categoria: 'outros_gastos', titulo: 'Outros gastos' },
  { categoria: 'ofertas_saida', titulo: 'Ofertas (saída)' },
]

export const BUCKET_COMPROVANTES = 'comprovantes-tesouraria'

export const MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]

export const TRIMESTRES = [
  { id: 1, label: '1º trimestre (Jan–Mar)', meses: [1, 2, 3] },
  { id: 2, label: '2º trimestre (Abr–Jun)', meses: [4, 5, 6] },
  { id: 3, label: '3º trimestre (Jul–Set)', meses: [7, 8, 9] },
  { id: 4, label: '4º trimestre (Out–Dez)', meses: [10, 11, 12] },
]

export function labelRole(role: string) {
  if (role === 'SUPER_ADMIN') return 'Super Admin'
  if (role === 'ADMIN') return 'Admin'
  if (role === 'TESOUREIRO') return 'Tesoureiro'
  return 'Usuário'
}

export function formatarMoeda(valor: number) {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export function formatarDataISO(iso: string) {
  const [y, m, d] = iso.slice(0, 10).split('-')
  if (!y || !m || !d) return iso
  return `${d}/${m}/${y}`
}

export function percentual(valor: number, total: number) {
  if (total <= 0) return 0
  return (valor / total) * 100
}

export function soma(lista: { valor: number }[]) {
  return lista.reduce((acc, item) => acc + Number(item.valor || 0), 0)
}

export function labelCategoria(categoria: CategoriaLancamento) {
  return [...BLOCOS_RECEITA, ...BLOCOS_GASTO].find((b) => b.categoria === categoria)?.titulo ?? categoria
}

export function tipoDaCategoria(categoria: CategoriaLancamento): TipoLancamento {
  return BLOCOS_RECEITA.some((b) => b.categoria === categoria) ? 'entrada' : 'saida'
}

export function inicioFimMes(ano: number, mes: number) {
  const inicio = `${ano}-${String(mes).padStart(2, '0')}-01`
  const ultimo = new Date(ano, mes, 0).getDate()
  const fim = `${ano}-${String(mes).padStart(2, '0')}-${String(ultimo).padStart(2, '0')}`
  return { inicio, fim }
}

export type FichaMembro = {
  nome_completo: string
  foto_url: string
  data_nascimento: string
  genero: string
  estado_civil: string
  naturalidade: string
  escolaridade: string
  profissao: string
  telefone: string
  email: string
  rua: string
  numero: string
  complemento: string
  bairro: string
  cidade: string
  cep: string
  data_casamento: string
  tem_filhos: boolean
  filhos_info: string
  status_membresia: string
  data_admissao: string
  forma_admissao: string
  data_batismo_aguas: string
  ano_batismo_aguas: string
  so_ano_batismo_aguas: boolean
  igreja_procedencia: string
  cursos_teologicos: string
  concluiu_integracao: boolean
  alergias_restricoes: string
  tipo_sanguineo: string
  contato_emergencia_nome: string
  contato_emergencia_telefone: string
  habilidades: string
  tamanho_camiseta: string
  autorizacao_imagem: boolean
  ano_admissao: string
  so_ano_admissao: boolean
}

export const FICHA_INICIAL: FichaMembro = {
  nome_completo: '',
  data_nascimento: '',
  genero: '',
  estado_civil: '',
  naturalidade: '',
  escolaridade: '',
  profissao: '',
  telefone: '',
  email: '',
  rua: '',
  numero: '',
  complemento: '',
  bairro: '',
  cidade: '',
  cep: '',
  data_casamento: '',
  tem_filhos: false,
  filhos_info: '',
  status_membresia: '',
  data_admissao: '',
  forma_admissao: '',
  data_batismo_aguas: '',
  ano_batismo_aguas: '',
  so_ano_batismo_aguas: false,
  igreja_procedencia: '',
  cursos_teologicos: '',
  concluiu_integracao: false,
  alergias_restricoes: '',
  tipo_sanguineo: '',
  contato_emergencia_nome: '',
  contato_emergencia_telefone: '',
  habilidades: '',
  tamanho_camiseta: '',
  autorizacao_imagem: false,
  ano_admissao: '',
  foto_url: '',
  so_ano_admissao: false,
}

const TEXTOS: Array<keyof FichaMembro> = [
  'nome_completo',
  'foto_url',
  'data_nascimento',
  'genero',
  'estado_civil',
  'naturalidade',
  'escolaridade',
  'profissao',
  'telefone',
  'email',
  'rua',
  'numero',
  'complemento',
  'bairro',
  'cidade',
  'cep',
  'data_casamento',
  'filhos_info',
  'data_admissao',
  'forma_admissao',
  'data_batismo_aguas',
  'ano_batismo_aguas',
  'igreja_procedencia',
  'cursos_teologicos',
  'alergias_restricoes',
  'tipo_sanguineo',
  'contato_emergencia_nome',
  'contato_emergencia_telefone',
  'habilidades',
  'tamanho_camiseta',
  'ano_admissao',
]

const BOLEANOS: Array<keyof FichaMembro> = [
  'tem_filhos',
  'so_ano_batismo_aguas',
  'autorizacao_imagem',
  'so_ano_admissao',
]

const LIMITE: Partial<Record<keyof FichaMembro, number>> = {
  nome_completo: 120,
  telefone: 20,
  email: 120,
  contato_emergencia_telefone: 20,
  cursos_teologicos: 2000,
  filhos_info: 2000,
  alergias_restricoes: 2000,
  habilidades: 2000,
}

function texto(valor: unknown, max = 200) {
  return String(valor ?? '').trim().slice(0, max)
}

export function mascaraTelefone(valor: string) {
  return valor
    .replace(/\D/g, '')
    .replace(/^(\d{2})(\d)/g, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2')
    .slice(0, 15)
}

export function anosFicha(quantidade = 50) {
  const atual = new Date().getFullYear()
  return Array.from({ length: quantidade }, (_, i) => String(atual - i))
}

export function sanitizarFichaPublica(raw: unknown): FichaMembro {
  const origem = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>
  const ficha: FichaMembro = { ...FICHA_INICIAL }

  for (const campo of TEXTOS) {
    const max = LIMITE[campo] ?? 200
    ficha[campo] = texto(origem[campo], max) as never
  }
  for (const campo of BOLEANOS) {
    ficha[campo] = Boolean(origem[campo]) as never
  }

  ficha.email = ficha.email.toLowerCase()
  ficha.telefone = mascaraTelefone(ficha.telefone)
  ficha.contato_emergencia_telefone = mascaraTelefone(ficha.contato_emergencia_telefone)
  ficha.status_membresia = ''
  ficha.concluiu_integracao = false
  ficha.foto_url = ''

  if (ficha.so_ano_admissao) ficha.data_admissao = ''
  else ficha.ano_admissao = ''
  if (ficha.so_ano_batismo_aguas) ficha.data_batismo_aguas = ''
  else ficha.ano_batismo_aguas = ''
  if (!ficha.tem_filhos) ficha.filhos_info = ''

  return ficha
}

function vazioParaNulo(valor: string) {
  return valor.trim() ? valor : null
}

function anoOuNulo(valor: string) {
  const n = Number(valor)
  return valor && Number.isFinite(n) ? n : null
}

export function fichaParaInsertMembros(
  ficha: FichaMembro,
  extras: { nome_completo: string; telefone: string | null; email: string | null; foto_url: string | null },
) {
  return {
    nome_completo: extras.nome_completo,
    foto_url: extras.foto_url,
    data_nascimento: vazioParaNulo(ficha.data_nascimento),
    genero: vazioParaNulo(ficha.genero),
    estado_civil: vazioParaNulo(ficha.estado_civil),
    naturalidade: vazioParaNulo(ficha.naturalidade),
    escolaridade: vazioParaNulo(ficha.escolaridade),
    profissao: vazioParaNulo(ficha.profissao),
    telefone: extras.telefone,
    email: extras.email,
    rua: vazioParaNulo(ficha.rua),
    numero: vazioParaNulo(ficha.numero),
    complemento: vazioParaNulo(ficha.complemento),
    bairro: vazioParaNulo(ficha.bairro),
    cidade: vazioParaNulo(ficha.cidade),
    cep: vazioParaNulo(ficha.cep),
    data_casamento: vazioParaNulo(ficha.data_casamento),
    tem_filhos: ficha.tem_filhos,
    filhos_info: ficha.tem_filhos ? vazioParaNulo(ficha.filhos_info) : null,
    status_membresia: 'Congregado',
    data_admissao: ficha.so_ano_admissao ? null : vazioParaNulo(ficha.data_admissao),
    ano_admissao: ficha.so_ano_admissao ? anoOuNulo(ficha.ano_admissao) : null,
    so_ano_admissao: ficha.so_ano_admissao,
    forma_admissao: vazioParaNulo(ficha.forma_admissao),
    data_batismo_aguas: ficha.so_ano_batismo_aguas ? null : vazioParaNulo(ficha.data_batismo_aguas),
    ano_batismo_aguas: ficha.so_ano_batismo_aguas ? anoOuNulo(ficha.ano_batismo_aguas) : null,
    so_ano_batismo_aguas: ficha.so_ano_batismo_aguas,
    igreja_procedencia: vazioParaNulo(ficha.igreja_procedencia),
    cursos_teologicos: vazioParaNulo(ficha.cursos_teologicos),
    concluiu_integracao: false,
    alergias_restricoes: vazioParaNulo(ficha.alergias_restricoes),
    tipo_sanguineo: vazioParaNulo(ficha.tipo_sanguineo),
    contato_emergencia_nome: vazioParaNulo(ficha.contato_emergencia_nome),
    contato_emergencia_telefone: vazioParaNulo(ficha.contato_emergencia_telefone),
    habilidades: vazioParaNulo(ficha.habilidades),
    tamanho_camiseta: vazioParaNulo(ficha.tamanho_camiseta),
    autorizacao_imagem: ficha.autorizacao_imagem,
  }
}

export function formatarDataFicha(data: string | null | undefined) {
  if (!data) return ''
  return new Date(`${data}T12:00:00`).toLocaleDateString('pt-BR')
}

export function textoAdmissao(ficha: Pick<FichaMembro, 'so_ano_admissao' | 'ano_admissao' | 'data_admissao'>) {
  if (ficha.so_ano_admissao && ficha.ano_admissao) return ficha.ano_admissao
  return formatarDataFicha(ficha.data_admissao)
}

export function textoBatismo(ficha: Pick<FichaMembro, 'so_ano_batismo_aguas' | 'ano_batismo_aguas' | 'data_batismo_aguas'>) {
  if (ficha.so_ano_batismo_aguas && ficha.ano_batismo_aguas) return ficha.ano_batismo_aguas
  return formatarDataFicha(ficha.data_batismo_aguas)
}

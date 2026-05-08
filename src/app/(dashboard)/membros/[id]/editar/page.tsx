'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, Save, User, Phone, Heart, Church, Shield } from 'lucide-react'

// Função de máscara movida para fora para melhor performance (não é recriada a cada render)
function mascaraTelefone(valor: string) {
  return valor
    .replace(/\D/g, '')
    .replace(/^(\d{2})(\d)/g, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2')
    .slice(0, 15)
}

const abas = [
  { id: 'pessoal',  label: 'Pessoal',       icone: User   },
  { id: 'contato',  label: 'Contato',       icone: Phone  },
  { id: 'familia',  label: 'Família',       icone: Heart  },
  { id: 'igreja',   label: 'Igreja',        icone: Church },
  { id: 'saude',    label: 'Saúde & Extra', icone: Shield },
]

type Formulario = {
  nome_completo: string
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
  data_batismo_espirito: string
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

const vazio: Formulario = {
  nome_completo: '', data_nascimento: '', genero: '', estado_civil: '',
  naturalidade: '', escolaridade: '', profissao: '',
  telefone: '', email: '', rua: '', numero: '', complemento: '', bairro: '', cidade: '', cep: '',
  data_casamento: '', tem_filhos: false, filhos_info: '',
  status_membresia: 'Visitante', data_admissao: '', forma_admissao: '',
  data_batismo_aguas: '', data_batismo_espirito: '', igreja_procedencia: '',
  cursos_teologicos: '', concluiu_integracao: false,
  alergias_restricoes: '', tipo_sanguineo: '', contato_emergencia_nome: '',
  contato_emergencia_telefone: '', habilidades: '', tamanho_camiseta: '',
  autorizacao_imagem: false, ano_admissao: '', so_ano_admissao: false,
}

const inputClass = "w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
const selectClass = "w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"

function Campo({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {children}
    </div>
  )
}

export default function EditarMembroPage() {
  const params = useParams()
  const id = params.id as string
  const router = useRouter()
  const [abaAtiva, setAbaAtiva] = useState(0)
  const [form, setForm] = useState<Formulario>(vazio)
  const [carregando, setCarregando] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')
  const supabase = createClient()

  useEffect(() => {
    async function carregar() {
      const { data } = await supabase
        .from('membros')
        .select('*')
        .eq('id', id)
        .single()

      if (data) {
        setForm({
          ...data, // Simplifica o carregamento de todos os campos
          status_membresia: data.status_membresia ?? 'Visitante',
          tem_filhos: data.tem_filhos ?? false,
          concluiu_integracao: data.concluiu_integracao ?? false,
          autorizacao_imagem: data.autorizacao_imagem ?? false,
        })
      }
      setCarregando(false)
    }
    carregar()
  }, [id, supabase])

  function set(campo: keyof Formulario, valor: string | boolean) {
    setForm(prev => ({ ...prev, [campo]: valor }))
  }

  async function buscarCep(cep: string) {
    const cepLimpo = cep.replace(/\D/g, '')
    if (cepLimpo.length !== 8) return

    try {
      const res = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`)
      const data = await res.json()
      if (data.erro) return

      set('rua', data.logradouro ?? '')
      set('bairro', data.bairro ?? '')
      set('cidade', data.localidade ?? '')
    } catch {}
  }

  async function salvar() {
    if (!form.nome_completo.trim()) {
      setErro('O nome completo é obrigatório.')
      setAbaAtiva(0)
      return
    }
    setSalvando(true)
    setErro('')

    const payload = Object.fromEntries(
      Object.entries(form).map(([k, v]) => [k, v === '' ? null : v])
    )

    const { error } = await supabase
      .from('membros')
      .update(payload)
      .eq('id', id)

    if (error) {
      setErro('Erro ao salvar. Tente novamente.')
      setSalvando(false)
      return
    }

    router.push(`/membros/${id}`)
  }

  if (carregando) return (
    <div className="flex items-center justify-center py-24 text-gray-400">
      Carregando...
    </div>
  )

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link href={`/membros/${id}`} className="p-2 rounded-lg hover:bg-gray-100 text-gray-600">
          <ChevronLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Editar Membro</h1>
          <p className="text-sm text-gray-500">{form.nome_completo}</p>
        </div>
      </div>

      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-6 overflow-x-auto">
        {abas.map((aba, i) => {
          const Icone = aba.icone
          return (
            <button key={aba.id} onClick={() => setAbaAtiva(i)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-colors flex-1 justify-center
                ${abaAtiva === i ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
              <Icone size={14} />{aba.label}
            </button>
          )
        })}
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        {/* ABA 1 — Pessoal */}
        {abaAtiva === 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <Campo label="Nome completo *">
                <input className={inputClass} value={form.nome_completo}
                  onChange={e => set('nome_completo', e.target.value)} />
              </Campo>
            </div>
            <Campo label="Data de nascimento">
              <input type="date" className={inputClass} value={form.data_nascimento}
                onChange={e => set('data_nascimento', e.target.value)} />
            </Campo>
            <Campo label="Gênero">
              <select className={selectClass} value={form.genero}
                onChange={e => set('genero', e.target.value)}>
                <option value="">Selecione</option>
                <option>Masculino</option><option>Feminino</option><option>Outro</option>
              </select>
            </Campo>
            <Campo label="Estado civil">
              <select className={selectClass} value={form.estado_civil}
                onChange={e => set('estado_civil', e.target.value)}>
                <option value="">Selecione</option>
                <option>Solteiro</option><option>Casado</option>
                <option>Divorciado</option><option>Viúvo</option><option>União Estável</option>
              </select>
            </Campo>
            <Campo label="Naturalidade">
              <input className={inputClass} value={form.naturalidade}
                onChange={e => set('naturalidade', e.target.value)} />
            </Campo>
            <Campo label="Escolaridade">
              <select className={selectClass} value={form.escolaridade}
                onChange={e => set('escolaridade', e.target.value)}>
                <option value="">Selecione</option>
                <option>Ensino Fundamental Incompleto</option>
                <option>Ensino Fundamental Completo</option>
                <option>Ensino Médio Incompleto</option>
                <option>Ensino Médio Completo</option>
                <option>Ensino Superior Incompleto</option>
                <option>Ensino Superior Completo</option>
                <option>Pós-graduação</option>
              </select>
            </Campo>
            <Campo label="Profissão">
              <input className={inputClass} value={form.profissao}
                onChange={e => set('profissao', e.target.value)} />
            </Campo>
          </div>
        )}

        {/* ABA 2 — Contato */}
        {abaAtiva === 1 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Campo label="Telefone / WhatsApp">
              <input
                className={inputClass}
                placeholder="(00) 00000-0000"
                value={form.telefone}
                onChange={e => set('telefone', mascaraTelefone(e.target.value))}
              />
            </Campo>
            <Campo label="E-mail">
              <input type="email" className={inputClass} value={form.email}
                onChange={e => set('email', e.target.value)} />
            </Campo>
            <div className="sm:col-span-2">
              <Campo label="Rua">
                <input className={inputClass} placeholder="Nome da rua"
                  value={form.rua} onChange={e => set('rua', e.target.value)} />
              </Campo>
            </div>
            <Campo label="Número">
              <input className={inputClass} placeholder="Ex: 123"
                value={form.numero} onChange={e => set('numero', e.target.value)} />
            </Campo>
            <Campo label="Complemento">
              <input className={inputClass} placeholder="Apto, Bloco, Casa..."
                value={form.complemento} onChange={e => set('complemento', e.target.value)} />
            </Campo>
            <Campo label="Bairro">
              <input className={inputClass}
                value={form.bairro} onChange={e => set('bairro', e.target.value)} />
            </Campo>
            <Campo label="Cidade">
              <input className={inputClass}
                value={form.cidade} onChange={e => set('cidade', e.target.value)} />
            </Campo>
            <Campo label="CEP">
              <div className="relative">
                <input
                  className={inputClass}
                  placeholder="00000-000"
                  value={form.cep}
                  maxLength={9}
                  onChange={e => {
                    const valor = e.target.value
                      .replace(/\D/g, '')
                      .replace(/(\d{5})(\d)/, '$1-$2')
                      .slice(0, 9)
                    set('cep', valor)
                    if (valor.replace(/\D/g, '').length === 8) buscarCep(valor)
                  }}
                />
                {form.cep.replace(/\D/g, '').length === 8 && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-green-600 font-medium">
                    ✓
                  </span>
                )}
              </div>
            </Campo>
          </div>
        )}

        {/* ABA 3 — Família */}
        {abaAtiva === 2 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Campo label="Data de casamento">
              <input type="date" className={inputClass} value={form.data_casamento}
                onChange={e => set('data_casamento', e.target.value)} />
            </Campo>
            <div />
            <div className="sm:col-span-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={form.tem_filhos}
                  onChange={e => set('tem_filhos', e.target.checked)}
                  className="w-4 h-4 accent-indigo-600" />
                <span className="text-sm font-medium text-gray-700">Possui filhos</span>
              </label>
            </div>
            {form.tem_filhos && (
              <div className="sm:col-span-2">
                <Campo label="Nomes e idades dos filhos">
                  <textarea className={inputClass + ' resize-none'} rows={3}
                    value={form.filhos_info}
                    onChange={e => set('filhos_info', e.target.value)} />
                </Campo>
              </div>
            )}
          </div>
        )}

        {/* ABA 4 — Igreja */}
        {abaAtiva === 3 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Campo label="Status de membresia">
              <select className={selectClass} value={form.status_membresia}
                onChange={e => set('status_membresia', e.target.value)}>
                <option>Visitante</option><option>Congregado</option>
                <option>Membro Ativo</option><option>Afastado</option><option>Transferido</option>
              </select>
            </Campo>
            <div className="sm:col-span-2">
              <Campo label="Data de admissão">
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.so_ano_admissao}
                      onChange={e => set('so_ano_admissao', e.target.checked)}
                      className="w-4 h-4 accent-indigo-600"
                    />
                    <span className="text-xs text-gray-500">Não lembro o dia e mês, somente o ano</span>
                  </label>
                  {form.so_ano_admissao ? (
                    <select className={selectClass} value={form.ano_admissao}
                      onChange={e => set('ano_admissao', e.target.value)}>
                      <option value="">Selecione o ano</option>
                      {Array.from({ length: 50 }, (_, i) => new Date().getFullYear() - i).map(ano => (
                        <option key={ano} value={String(ano)}>{ano}</option>
                      ))}
                    </select>
                  ) : (
                    <input type="date" className={inputClass} value={form.data_admissao}
                      onChange={e => set('data_admissao', e.target.value)} />
                  )}
                </div>
              </Campo>
            </div>
            <Campo label="Forma de admissão">
              <select className={selectClass} value={form.forma_admissao}
                onChange={e => set('forma_admissao', e.target.value)}>
                <option value="">Selecione</option>
                <option>Batismo</option><option>Aclamação</option>
                <option>Carta de Transferência</option>
              </select>
            </Campo>
            <Campo label="Igreja de procedência">
              <input className={inputClass} value={form.igreja_procedencia}
                onChange={e => set('igreja_procedencia', e.target.value)} />
            </Campo>
            <Campo label="Batismo nas águas">
              <input type="date" className={inputClass} value={form.data_batismo_aguas}
                onChange={e => set('data_batismo_aguas', e.target.value)} />
            </Campo>
            <div className="sm:col-span-2">
              <Campo label="Cursos teológicos">
                <textarea className={inputClass + ' resize-none'} rows={2}
                  value={form.cursos_teologicos}
                  onChange={e => set('cursos_teologicos', e.target.value)} />
              </Campo>
            </div>
            <div className="sm:col-span-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={form.concluiu_integracao}
                  onChange={e => set('concluiu_integracao', e.target.checked)}
                  className="w-4 h-4 accent-indigo-600" />
                <span className="text-sm font-medium text-gray-700">
                  Concluiu o curso de integração
                </span>
              </label>
            </div>
          </div>
        )}

        {/* ABA 5 — Saúde & Extra */}
        {abaAtiva === 4 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <Campo label="Alergias ou restrições alimentares">
                <textarea className={inputClass + ' resize-none'} rows={2}
                  value={form.alergias_restricoes}
                  onChange={e => set('alergias_restricoes', e.target.value)} />
              </Campo>
            </div>
            <Campo label="Tipo sanguíneo">
              <select className={selectClass} value={form.tipo_sanguineo}
                onChange={e => set('tipo_sanguineo', e.target.value)}>
                <option value="">Selecione</option>
                <option>A+</option><option>A-</option><option>B+</option><option>B-</option>
                <option>AB+</option><option>AB-</option><option>O+</option><option>O-</option>
                <option>Não sei</option>
              </select>
            </Campo>
            <Campo label="Tamanho de camiseta">
              <select className={selectClass} value={form.tamanho_camiseta}
                onChange={e => set('tamanho_camiseta', e.target.value)}>
                <option value="">Selecione</option>
                <option>PP</option><option>P</option><option>M</option>
                <option>G</option><option>GG</option><option>XGG</option>
              </select>
            </Campo>
            <Campo label="Contato de emergência — nome">
              <input className={inputClass} value={form.contato_emergencia_nome}
                onChange={e => set('contato_emergencia_nome', e.target.value)} />
            </Campo>
            <Campo label="Contato de emergência — telefone">
              <input className={inputClass} 
                placeholder="(00) 00000-0000"
                value={form.contato_emergencia_telefone}
                onChange={e => set('contato_emergencia_telefone', mascaraTelefone(e.target.value))} />
            </Campo>
            <div className="sm:col-span-2">
              <Campo label="Habilidades e talentos">
                <textarea className={inputClass + ' resize-none'} rows={2}
                  value={form.habilidades}
                  onChange={e => set('habilidades', e.target.value)} />
              </Campo>
            </div>
            <div className="sm:col-span-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={form.autorizacao_imagem}
                  onChange={e => set('autorizacao_imagem', e.target.checked)}
                  className="w-4 h-4 accent-indigo-600" />
                <span className="text-sm font-medium text-gray-700">
                  Autoriza uso de imagem (LGPD)
                </span>
              </label>
            </div>
          </div>
        )}
      </div>

      {erro && (
        <div className="mt-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">
          {erro}
        </div>
      )}

      <div className="flex items-center justify-between mt-6">
        <button onClick={() => setAbaAtiva(i => Math.max(0, i - 1))}
          disabled={abaAtiva === 0}
          className="px-4 py-2.5 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 transition-colors">
          ← Anterior
        </button>
        <span className="text-xs text-gray-400">{abaAtiva + 1} de {abas.length}</span>
        {abaAtiva < abas.length - 1 ? (
          <button onClick={() => setAbaAtiva(i => Math.min(abas.length - 1, i + 1))}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium transition-colors cursor-pointer">
            Próximo →
          </button>
        ) : (
          <button onClick={salvar} disabled={salvando}
            className="flex items-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white rounded-xl text-sm font-medium transition-colors">
            <Save size={16} /> {salvando ? 'Salvando...' : 'Salvar alterações'}
          </button>
        )}
      </div>
    </div>
  )
}
'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import UploadFoto from '@/components/UploadFoto'
// ADICIONADO ChevronRight NO IMPORT ABAIXO
import AcessoGuard from '@/components/AcessoGuard'
import { usePermissao } from '@/lib/hooks/usePermissao'
import { ChevronLeft, Save, User, Phone, Heart, Shield, ChevronRight } from 'lucide-react'
import { VincularContaMembro } from '@/components/VincularConta'
import LogoIbc from '@/components/LogoIbc'

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
  { id: 'igreja',   label: 'Igreja',        icone: LogoIbc },
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
  ministerios_interesse: string
  foto_url: string
}

const vazio: Formulario = {
  nome_completo: '', data_nascimento: '', genero: '', estado_civil: '',
  naturalidade: '', escolaridade: '', profissao: '',
  telefone: '', email: '', rua: '', numero: '', complemento: '', bairro: '', cidade: '', cep: '',
  data_casamento: '', tem_filhos: false, filhos_info: '',
  status_membresia: 'Visitante', data_admissao: '', forma_admissao: '',
  data_batismo_aguas: '', ano_batismo_aguas: '', so_ano_batismo_aguas: false, igreja_procedencia: '',
  cursos_teologicos: '', concluiu_integracao: false,
  alergias_restricoes: '', tipo_sanguineo: '', contato_emergencia_nome: '',
  contato_emergencia_telefone: '', habilidades: '', tamanho_camiseta: '',
  autorizacao_imagem: false, ano_admissao: '', foto_url: '', so_ano_admissao: false, ministerios_interesse: '',
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
  const { isAdmin, userId, carregando: carregandoPerm } = usePermissao()
  const [ehDono, setEhDono] = useState(false)
  const [verificandoDono, setVerificandoDono] = useState(true)

  useEffect(() => {
    if (carregandoPerm || isAdmin) return
    let cancelado = false
    async function checarDono() {
      const supabase = createClient()
      const { data } = await supabase
        .from('membros')
        .select('user_id')
        .eq('id', id)
        .single()
      if (cancelado) return
      setEhDono(!!userId && data?.user_id === userId)
      setVerificandoDono(false)
    }
    void checarDono()
    return () => { cancelado = true }
  }, [carregandoPerm, isAdmin, userId, id])

  return (
    <AcessoGuard
      permitido={isAdmin || ehDono}
      carregando={carregandoPerm || (!isAdmin && verificandoDono)}
      mensagem="Você só pode editar o seu próprio cadastro."
    >
      <EditarMembroConteudo />
    </AcessoGuard>
  )
}

function EditarMembroConteudo() {
  const params = useParams()
  const id = params.id as string
  const router = useRouter()
  const [abaAtiva, setAbaAtiva] = useState(0)
  const [form, setForm] = useState<Formulario>(vazio)
  const [carregando, setCarregando] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')
  const [cepStatus, setCepStatus] = useState<'idle' | 'valido' | 'invalido'>('idle')
  const [mensagemCep, setMensagemCep] = useState('')
  const [userIdVinculo, setUserIdVinculo] = useState<string | null>(null)
  const { isAdmin } = usePermissao()
  const supabase = createClient()

  useEffect(() => {
    async function carregar() {
      const { data } = await supabase
        .from('membros')
        .select('*')
        .eq('id', id)
        .single()

      if (data) {
        setUserIdVinculo(data.user_id ?? null)
        setForm({
          ...data,
          complemento:                 data.complemento ?? '',
          rua:                         data.rua ?? '',
          numero:                      data.numero ?? '',
          bairro:                      data.bairro ?? '',
          cidade:                      data.cidade ?? '',
          cep:                         data.cep ?? '',
          telefone:                    data.telefone ?? '',
          foto_url:                    data.foto_url ?? '',
          email:                       data.email ?? '',
          naturalidade:                data.naturalidade ?? '',
          escolaridade:                data.escolaridade ?? '',
          profissao:                   data.profissao ?? '',
          filhos_info:                 data.filhos_info ?? '',
          igreja_procedencia:          data.igreja_procedencia ?? '',
          cursos_teologicos:           data.cursos_teologicos ?? '',
          alergias_restricoes:         data.alergias_restricoes ?? '',
          tipo_sanguineo:              data.tipo_sanguineo ?? '',
          contato_emergencia_nome:     data.contato_emergencia_nome ?? '',
          contato_emergencia_telefone: data.contato_emergencia_telefone ?? '',
          habilidades:                 data.habilidades ?? '',
          tamanho_camiseta:            data.tamanho_camiseta ?? '',
          ministerios_interesse:       data.ministerios_interesse ?? '',
          forma_admissao:              data.forma_admissao ?? '',
          ano_batismo_aguas:           data.ano_batismo_aguas ?? '',
          so_ano_batismo_aguas:        data.so_ano_batismo_aguas ?? false,
          tem_filhos:                  data.tem_filhos ?? false,
          concluiu_integracao:         data.concluiu_integracao ?? false,
          autorizacao_imagem:          data.autorizacao_imagem ?? false,
          so_ano_admissao:             data.so_ano_admissao ?? false,
          status_membresia:            data.status_membresia ?? 'Membro Ativo',
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
  if (cepLimpo.length !== 8) {
    setCepStatus('idle')
    return
  }

  try {
    const res = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`)
    const data = await res.json()
    
    if (data.erro) {
      setCepStatus('invalido')
      setMensagemCep('CEP não encontrado')
      // Limpa os campos de endereço
      set('rua', '')
      set('bairro', '')
      set('cidade', '')
      return
    }

    // CEP válido - preenche os campos
    set('rua', data.logradouro ?? '')
    set('bairro', data.bairro ?? '')
    set('cidade', data.localidade ?? '')
    setCepStatus('valido')
    setMensagemCep('')
  } catch {
    setCepStatus('invalido')
    setMensagemCep('Erro ao buscar CEP')
    set('rua', '')
    set('bairro', '')
    set('cidade', '')
  }
}

  async function salvar() {
    if (!form.nome_completo.trim()) {
      setErro('O nome completo é obrigatório.')
      setAbaAtiva(0)
      return
    }
    setSalvando(true)
    setErro('')

const payload = {
  nome_completo:               form.nome_completo,
  data_nascimento:             form.data_nascimento || null,
  genero:                      form.genero || null,
  estado_civil:                form.estado_civil || null,
  naturalidade:                form.naturalidade || null,
  escolaridade:                form.escolaridade || null,
  profissao:                   form.profissao || null,
  telefone:                    form.telefone || null,
  email:                       form.email || null,
  rua:                         form.rua || null,
  numero:                      form.numero || null,
  complemento:                 form.complemento || null,
  bairro:                      form.bairro || null,
  cidade:                      form.cidade || null,
  cep:                         form.cep || null,
  data_casamento:              form.data_casamento || null,
  tem_filhos:                  form.tem_filhos,
  filhos_info:                 form.filhos_info || null,
  status_membresia:            form.status_membresia,
  data_admissao:               form.so_ano_admissao ? null : (form.data_admissao || null),
  ano_admissao:                form.so_ano_admissao ? (form.ano_admissao || null) : null,
  so_ano_admissao:             form.so_ano_admissao,
  data_batismo_aguas:          form.so_ano_batismo_aguas ? null : (form.data_batismo_aguas || null),
  ano_batismo_aguas:           form.so_ano_batismo_aguas ? (form.ano_batismo_aguas || null) : null,
  so_ano_batismo_aguas:        form.so_ano_batismo_aguas,
  forma_admissao:              form.forma_admissao || null,
  igreja_procedencia:          form.igreja_procedencia || null,
  cursos_teologicos:           form.cursos_teologicos || null,
  concluiu_integracao:         form.concluiu_integracao,
  alergias_restricoes:         form.alergias_restricoes || null,
  tipo_sanguineo:              form.tipo_sanguineo || null,
  contato_emergencia_nome:     form.contato_emergencia_nome || null,
  contato_emergencia_telefone: form.contato_emergencia_telefone || null,
  habilidades:                 form.habilidades || null,
  tamanho_camiseta:            form.tamanho_camiseta || null,
  autorizacao_imagem:          form.autorizacao_imagem,
  ministerios_interesse:       form.ministerios_interesse || null,
}

    const { error } = await supabase
      .from('membros')
      .update(payload)
      .eq('id', id)

    if (error) {
      console.error('Erro ao salvar:', error)
      setErro('Erro ao salvar. Tente novamente.')
      setSalvando(false)
      return
    }

    router.push(`/membros/${id}`)
  }

  if (carregando) return (
    <div data-cy="loadingEditarMembro" className="flex items-center justify-center py-24 text-gray-400">
      Carregando...
    </div>
  )

  return (
    <div data-cy="pageEditarMembro" className="max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link href={`/membros/${id}`} data-cy="btnVoltarPerfil" className="p-2 rounded-lg hover:bg-gray-100 text-gray-600">
          <ChevronLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Editar Membro</h1>
          <p className="text-sm text-gray-500">{form.nome_completo}</p>
        </div>
      </div>

      {isAdmin && (
        <VincularContaMembro membroId={id} userIdAtual={userIdVinculo} />
      )}

      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-6 overflow-x-auto">
        {abas.map((aba, i) => {
          const Icone = aba.icone
          return (
            <button key={aba.id} onClick={() => setAbaAtiva(i)} data-cy={`tabFicha-${aba.id}`}
              className={`flex items-center gap-1.5 px-3 py-2.5 min-h-11 rounded-lg text-xs font-medium whitespace-nowrap transition-colors shrink-0
                ${abaAtiva === i ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
              <Icone size={14} />{aba.label}
            </button>
          )
        })}
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        {/* ABA 1 — Pessoal */}
        {abaAtiva === 0 && (
          <div className="space-y-6">
            <div className="flex justify-center py-2">
              <UploadFoto
                fotoAtual={form.foto_url || null}
                nome={form.nome_completo}
                onUpload={(url) => set('foto_url', url)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <Campo label="Nome completo *">
                  <input data-cy="inputNomeCompleto" className={inputClass} value={form.nome_completo}
                    onChange={e => set('nome_completo', e.target.value)} />
                </Campo>
              </div>
              <Campo label="Data de nascimento">
                <input type="date" data-cy="inputDataNascimento" className={inputClass} value={form.data_nascimento}
                  onChange={e => set('data_nascimento', e.target.value)} />
              </Campo>
              <Campo label="Gênero">
                <select data-cy="selectGenero" className={selectClass} value={form.genero}
                  onChange={e => set('genero', e.target.value)}>
                  <option value="" data-cy="optGeneroSelecione">Selecione</option>
                  <option data-cy="optGeneroMasculino">Masculino</option><option data-cy="optGeneroFeminino">Feminino</option><option data-cy="optGeneroOutro">Outro</option>
                </select>
              </Campo>
              <Campo label="Estado civil">
                <select data-cy="selectEstadoCivil" className={selectClass} value={form.estado_civil}
                  onChange={e => set('estado_civil', e.target.value)}>
                  <option value="" data-cy="optEstadoCivilSelecione">Selecione</option>
                  <option data-cy="optEstadoCivilSolteiro">Solteiro</option><option data-cy="optEstadoCivilCasado">Casado</option>
                  <option data-cy="optEstadoCivilDivorciado">Divorciado</option><option data-cy="optEstadoCivilViuvo">Viúvo</option><option data-cy="optEstadoCivilUniaoEstavel">União Estável</option>
                </select>
              </Campo>
              <Campo label="Naturalidade">
                <input data-cy="inputNaturalidade" className={inputClass} value={form.naturalidade}
                  onChange={e => set('naturalidade', e.target.value)} />
              </Campo>
              <Campo label="Escolaridade">
                <select data-cy="selectEscolaridade" className={selectClass} value={form.escolaridade}
                  onChange={e => set('escolaridade', e.target.value)}>
                  <option value="" data-cy="optEscolaridadeSelecione">Selecione</option>
                  <option data-cy="optEscolaridadeFundamentalIncompleto">Ensino Fundamental Incompleto</option>
                  <option data-cy="optEscolaridadeFundamentalCompleto">Ensino Fundamental Completo</option>
                  <option data-cy="optEscolaridadeMedioIncompleto">Ensino Médio Incompleto</option>
                  <option data-cy="optEscolaridadeMedioCompleto">Ensino Médio Completo</option>
                  <option data-cy="optEscolaridadeSuperiorIncompleto">Ensino Superior Incompleto</option>
                  <option data-cy="optEscolaridadeSuperiorCompleto">Ensino Superior Completo</option>
                  <option data-cy="optEscolaridadePosGraduacao">Pós-graduação</option>
                </select>
              </Campo>
              <Campo label="Profissão">
                <input data-cy="inputProfissao" className={inputClass} value={form.profissao}
                  onChange={e => set('profissao', e.target.value)} />
              </Campo>
            </div>
          </div>
        )}

        {/* ABA 2 — Contato */}
        {abaAtiva === 1 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Campo label="Telefone / WhatsApp">
              <input
                type="tel"
                inputMode="numeric"
                autoComplete="tel"
                data-cy="inputTelefone"
                className={inputClass}
                placeholder="(00) 00000-0000"
                value={form.telefone}
                onChange={e => set('telefone', mascaraTelefone(e.target.value))}
              />
            </Campo>
            <Campo label="E-mail">
              <input type="email" data-cy="inputEmail" className={inputClass} value={form.email}
                onChange={e => set('email', e.target.value)} />
            </Campo>
            <div className="sm:col-span-2">
              <Campo label="Rua">
                <input data-cy="inputRua" className={inputClass} placeholder="Nome da rua"
                  value={form.rua} onChange={e => set('rua', e.target.value)} />
              </Campo>
            </div>
            <Campo label="Número">
              <input data-cy="inputNumero" className={inputClass} placeholder="Ex: 123"
                value={form.numero} onChange={e => set('numero', e.target.value)} />
            </Campo>
            <Campo label="Complemento">
              <input data-cy="inputComplemento" className={inputClass} placeholder="Apto, Bloco, Casa..."
                value={form.complemento} onChange={e => set('complemento', e.target.value)} />
            </Campo>
            <Campo label="Bairro">
              <input data-cy="inputBairro" className={inputClass}
                value={form.bairro} onChange={e => set('bairro', e.target.value)} />
            </Campo>
            <Campo label="Cidade">
              <input data-cy="inputCidade" className={inputClass}
                value={form.cidade} onChange={e => set('cidade', e.target.value)} />
            </Campo>
            <Campo label="CEP">
              <div className="relative">
                <input
                  data-cy="inputCep"
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
                {cepStatus === 'valido' && (
                  <span data-cy="iconeCepValido" className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-green-600 font-medium">
                    ✓
                  </span>
                )}
                {cepStatus === 'invalido' && (
                  <span data-cy="iconeCepInvalido" className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-red-600 font-medium">
                    ✕
                  </span>
                )}
              </div>
              {mensagemCep && (
                <p data-cy="msgCep" className={`text-xs mt-1 ${cepStatus === 'invalido' ? 'text-red-600' : 'text-green-600'}`}>
                  {mensagemCep}
                </p>
              )}
            </Campo>
          </div>
        )}

        {/* ABA 3 — Família */}
        {abaAtiva === 2 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Campo label="Data de casamento">
              <input type="date" data-cy="inputDataCasamento" className={inputClass} value={form.data_casamento}
                onChange={e => set('data_casamento', e.target.value)} />
            </Campo>
            <div />
            <div className="sm:col-span-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={form.tem_filhos}
                  onChange={e => set('tem_filhos', e.target.checked)}
                  data-cy="checkTemFilhos"
                  className="w-5 h-5 shrink-0 accent-indigo-600" />
                <span className="text-sm font-medium text-gray-700">Possui filhos</span>
              </label>
            </div>
            {form.tem_filhos && (
              <div className="sm:col-span-2">
                <Campo label="Nomes e idades dos filhos">
                  <textarea data-cy="textareaFilhosInfo" className={inputClass + ' resize-none'} rows={3}
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
              <select data-cy="selectStatusMembresia" className={selectClass} value={form.status_membresia}
                onChange={e => set('status_membresia', e.target.value)}>
                <option data-cy="optStatusPastor">Pastor</option>
                <option data-cy="optStatusDiretoria">Diretoria</option>
                <option data-cy="optStatusLider">Líder de Ministério</option>
                <option data-cy="optStatusMembroAtivo">Membro Ativo</option>
                <option data-cy="optStatusCongregado">Congregado</option>
                <option data-cy="optStatusAfastado">Afastado</option>
                <option data-cy="optStatusTransferido">Transferido</option>
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
                      data-cy="checkSoAnoAdmissao"
                      className="w-5 h-5 shrink-0 accent-indigo-600"
                    />
                    <span className="text-xs text-gray-500">Não lembro o dia e mês, somente o ano</span>
                  </label>
                  {form.so_ano_admissao ? (
                    <select data-cy="selectAnoAdmissao" className={selectClass} value={form.ano_admissao}
                      onChange={e => set('ano_admissao', e.target.value)}>
                      <option value="" data-cy="optAnoAdmissaoSelecione">Selecione o ano</option>
                      {Array.from({ length: 50 }, (_, i) => new Date().getFullYear() - i).map(ano => (
                        <option key={ano} value={String(ano)} data-cy={`optAnoAdmissao-${ano}`}>{ano}</option>
                      ))}
                    </select>
                  ) : (
                    <input type="date" data-cy="inputDataAdmissao" className={inputClass} value={form.data_admissao}
                      onChange={e => set('data_admissao', e.target.value)} />
                  )}
                </div>
              </Campo>
            </div>
            <Campo label="Forma de admissão">
              <select data-cy="selectFormaAdmissao" className={selectClass} value={form.forma_admissao}
                onChange={e => set('forma_admissao', e.target.value)}>
                <option value="" data-cy="optFormaAdmissaoSelecione">Selecione</option>
                <option data-cy="optFormaAdmissaoBatismo">Batismo</option><option data-cy="optFormaAdmissaoAclamacao">Aclamação</option>
                <option data-cy="optFormaAdmissaoCarta">Carta de Transferência</option>
              </select>
            </Campo>
            <Campo label="Igreja de procedência">
              <input data-cy="inputIgrejaProcedencia" className={inputClass} value={form.igreja_procedencia}
                onChange={e => set('igreja_procedencia', e.target.value)} />
            </Campo>
            <div className="sm:col-span-2">
              <Campo label="Data de batismo nas águas">
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.so_ano_batismo_aguas}
                      onChange={e => set('so_ano_batismo_aguas', e.target.checked)}
                      data-cy="checkSoAnoBatismo"
                      className="w-5 h-5 shrink-0 accent-indigo-600"
                    />
                    <span className="text-xs text-gray-500">Não lembro o dia e mês, somente o ano</span>
                  </label>
                  {form.so_ano_batismo_aguas ? (
                    <select data-cy="selectAnoBatismo" className={selectClass} value={form.ano_batismo_aguas}
                      onChange={e => set('ano_batismo_aguas', e.target.value)}>
                      <option value="" data-cy="optAnoBatismoSelecione">Selecione o ano</option>
                      {Array.from({ length: 50 }, (_, i) => new Date().getFullYear() - i).map(ano => (
                        <option key={ano} value={String(ano)} data-cy={`optAnoBatismo-${ano}`}>{ano}</option>
                      ))}
                    </select>
                  ) : (
                    <input type="date" data-cy="inputDataBatismo" className={inputClass} value={form.data_batismo_aguas}
                      onChange={e => set('data_batismo_aguas', e.target.value)} />
                  )}
                </div>
              </Campo>
            </div>
            <div className="sm:col-span-2">
              <Campo label="Cursos teológicos">
                <textarea data-cy="textareaCursosTeologicos" className={inputClass + ' resize-none'} rows={2}
                  value={form.cursos_teologicos}
                  onChange={e => set('cursos_teologicos', e.target.value)} />
              </Campo>
            </div>
            <div className="sm:col-span-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={form.concluiu_integracao}
                  onChange={e => set('concluiu_integracao', e.target.checked)}
                  data-cy="checkConcluiuIntegracao"
                  className="w-5 h-5 shrink-0 accent-indigo-600" />
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
                <textarea data-cy="textareaAlergias" className={inputClass + ' resize-none'} rows={2}
                  value={form.alergias_restricoes}
                  onChange={e => set('alergias_restricoes', e.target.value)} />
              </Campo>
            </div>
            <Campo label="Tipo sanguíneo">
              <select data-cy="selectTipoSanguineo" className={selectClass} value={form.tipo_sanguineo}
                onChange={e => set('tipo_sanguineo', e.target.value)}>
                <option value="" data-cy="optTipoSanguineoSelecione">Selecione</option>
                <option data-cy="optTipoSanguineoAPos">A+</option><option data-cy="optTipoSanguineoANeg">A-</option><option data-cy="optTipoSanguineoBPos">B+</option><option data-cy="optTipoSanguineoBNeg">B-</option>
                <option data-cy="optTipoSanguineoABPos">AB+</option><option data-cy="optTipoSanguineoABNeg">AB-</option><option data-cy="optTipoSanguineoOPos">O+</option><option data-cy="optTipoSanguineoONeg">O-</option>
                <option data-cy="optTipoSanguineoNaoSei">Não sei</option>
              </select>
            </Campo>
            <Campo label="Tamanho de camiseta">
              <select data-cy="selectTamanhoCamiseta" className={selectClass} value={form.tamanho_camiseta}
                onChange={e => set('tamanho_camiseta', e.target.value)}>
                <option value="" data-cy="optCamisetaSelecione">Selecione</option>
                <option data-cy="optCamisetaPP">PP</option><option data-cy="optCamisetaP">P</option><option data-cy="optCamisetaM">M</option>
                <option data-cy="optCamisetaG">G</option><option data-cy="optCamisetaGG">GG</option><option data-cy="optCamisetaXGG">XGG</option>
              </select>
            </Campo>
            <Campo label="Contato de emergência — nome">
              <input data-cy="inputEmergenciaNome" className={inputClass} value={form.contato_emergencia_nome}
                onChange={e => set('contato_emergencia_nome', e.target.value)} />
            </Campo>
            <Campo label="Contato de emergência — telefone">
              <input
                type="tel"
                inputMode="numeric"
                data-cy="inputEmergenciaTelefone"
                className={inputClass}
                placeholder="(00) 00000-0000"
                value={form.contato_emergencia_telefone}
                onChange={e => set('contato_emergencia_telefone', mascaraTelefone(e.target.value))}
              />
            </Campo>
            <div className="sm:col-span-2">
              <Campo label="Habilidades e talentos">
                <textarea data-cy="textareaHabilidades" className={inputClass + ' resize-none'} rows={2}
                  value={form.habilidades}
                  onChange={e => set('habilidades', e.target.value)} />
              </Campo>
            </div>
            <div className="sm:col-span-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={form.autorizacao_imagem}
                  onChange={e => set('autorizacao_imagem', e.target.checked)}
                  data-cy="checkAutorizacaoImagem"
                  className="w-5 h-5 shrink-0 accent-indigo-600" />
                <span className="text-sm font-medium text-gray-700">
                  Autoriza uso de imagem (LGPD)
                </span>
              </label>
            </div>
          </div>
        )}
      </div>

      {erro && (
        <div data-cy="msgErroEditarMembro" className="mt-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">
          {erro}
        </div>
      )}

      <div className="sticky bottom-16 lg:bottom-0 z-10 mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pt-3 pb-[max(0.5rem,env(safe-area-inset-bottom))] bg-[var(--ibc-page)]">
        <button onClick={() => setAbaAtiva(i => Math.max(0, i - 1))}
          disabled={abaAtiva === 0}
          data-cy="btnAnterior"
          className="flex items-center justify-center min-h-11 px-4 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 transition-colors">
          ← Anterior
        </button>
        <span data-cy="indicadorAba" className="text-xs text-gray-400 text-center">{abaAtiva + 1} de {abas.length}</span>
        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center gap-2">
          {abaAtiva < abas.length - 1 && (
            <button
              onClick={() => setAbaAtiva(i => Math.min(abas.length - 1, i + 1))}
              data-cy="btnProximo"
              className="flex items-center justify-center gap-2 min-h-11 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium transition-colors"
            >
              Próximo <ChevronRight size={16} />
            </button>
          )}
          <button
            onClick={salvar}
            disabled={salvando}
            data-cy="btnSalvarAlteracoes"
            className="flex items-center justify-center gap-2 min-h-11 px-4 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white rounded-xl text-sm font-medium transition-colors"
          >
            <Save size={16} /> {salvando ? 'Salvando...' : 'Salvar alterações'}
          </button>
        </div>
      </div>
    </div>
  )
}
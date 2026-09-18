'use client'

import { useState } from 'react'
import Link from 'next/link'
import LogoIbc from '@/components/LogoIbc'
import BotaoTema from '@/components/BotaoTema'
import FichaMembroCampos from '@/components/FichaMembroCampos'
import { FICHA_INICIAL, type FichaMembro } from '@/lib/ficha-membro'
import { ChevronLeft, ChevronRight, Loader2, User, Phone, Heart, Shield } from 'lucide-react'

const FOTO_MAX_BYTES = 5 * 1024 * 1024
const FOTO_TIPOS_OK = new Set(['image/jpeg', 'image/jpg', 'image/png', 'image/webp'])
const TIMEOUT_MS = 20_000

const abas = [
  { id: 'pessoal', label: 'Pessoal', icone: User },
  { id: 'contato', label: 'Contato', icone: Phone },
  { id: 'familia', label: 'Família', icone: Heart },
  { id: 'igreja', label: 'Igreja', icone: LogoIbc },
  { id: 'saude', label: 'Saúde & Extra', icone: Shield },
]

function ehHeic(arquivo: File) {
  const tipo = arquivo.type.toLowerCase()
  const nome = arquivo.name.toLowerCase()
  return tipo === 'image/heic' || tipo === 'image/heif' || nome.endsWith('.heic') || nome.endsWith('.heif')
}

function validarFoto(arquivo: File): string | null {
  if (ehHeic(arquivo)) {
    return 'O iPhone enviou a foto em HEIC. Escolha JPEG ou PNG (na câmera: Ajustes → Câmera → Formatos → Mais Compatível).'
  }
  if (!FOTO_TIPOS_OK.has(arquivo.type.toLowerCase())) {
    return 'A foto deve ser JPEG, PNG ou WebP.'
  }
  if (arquivo.size > FOTO_MAX_BYTES) {
    return 'A foto deve ter no máximo 5 MB. Tente uma imagem da galeria ou tire de novo com menor qualidade.'
  }
  return null
}

function lerJson(texto: string): { error?: string; ok?: boolean } {
  try {
    return JSON.parse(texto) as { error?: string; ok?: boolean }
  } catch {
    return {}
  }
}

export default function CadastroPublicoPage() {
  const [abaAtiva, setAbaAtiva] = useState(0)
  const [form, setForm] = useState<FichaMembro>(FICHA_INICIAL)
  const [foto, setFoto] = useState<File | null>(null)
  const [enviando, setEnviando] = useState(false)
  const [ok, setOk] = useState(false)
  const [erro, setErro] = useState('')
  const [cepStatus, setCepStatus] = useState<'idle' | 'valido' | 'invalido'>('idle')
  const [mensagemCep, setMensagemCep] = useState('')

  function set(campo: keyof FichaMembro, valor: string | boolean) {
    setForm((prev) => ({ ...prev, [campo]: valor }))
  }

  function escolherFoto(arquivo: File | null) {
    if (!arquivo) {
      setFoto(null)
      return
    }
    const problema = validarFoto(arquivo)
    if (problema) {
      setFoto(null)
      setErro(problema)
      return
    }
    setErro('')
    setFoto(arquivo)
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
        set('rua', '')
        set('bairro', '')
        set('cidade', '')
        return
      }
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

  async function enviar() {
    setErro('')
    if (!form.nome_completo.trim() || form.nome_completo.trim().length < 3) {
      setErro('Informe o nome completo.')
      setAbaAtiva(0)
      return
    }
    if (foto) {
      const problema = validarFoto(foto)
      if (problema) {
        setFoto(null)
        setErro(problema)
        setAbaAtiva(0)
        return
      }
    }

    setEnviando(true)
    const body = new FormData()
    body.set('website', '')
    body.set('nome_completo', form.nome_completo)
    body.set('telefone', form.telefone)
    body.set('email', form.email)
    body.set('dados', JSON.stringify({ ...form, foto_url: '', status_membresia: '', concluiu_integracao: false }))
    if (foto) body.set('foto', foto)

    const abort = new AbortController()
    const timer = window.setTimeout(() => abort.abort(), TIMEOUT_MS)

    try {
      const res = await fetch('/api/cadastro', { method: 'POST', body, signal: abort.signal })
      const data = lerJson(await res.text())
      if (!res.ok) {
        setErro(data.error ?? 'Não foi possível enviar.')
        return
      }
      setOk(true)
    } catch (err) {
      const abortou = err instanceof Error && err.name === 'AbortError'
      setErro(
        abortou
          ? 'A conexão demorou demais. Tente de novo, se possível sem foto ou com uma imagem menor.'
          : 'Não foi possível enviar o cadastro. Verifique a internet e tente novamente.',
      )
    } finally {
      window.clearTimeout(timer)
      setEnviando(false)
    }
  }

  const total = abas.length

  return (
    <div
      data-cy="pageCadastroPublico"
      className="min-h-dvh bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-8"
      style={{
        paddingTop: 'max(2rem, env(safe-area-inset-top))',
        paddingBottom: 'max(6rem, env(safe-area-inset-bottom))',
      }}
    >
      <div className="absolute top-4 right-4">
        <BotaoTema compacto dataCy="btnTemaCadastro" />
      </div>
      <div className="mx-auto w-full max-w-3xl">
        <div className="flex flex-col items-center mb-6">
          <LogoIbc size={64} className="mb-3" />
          <h1 className="text-xl font-bold text-gray-900 text-center">Cadastro de membro</h1>
          <p className="text-sm text-gray-500 text-center mt-1">
            Igreja Batista Central — a diretoria confirma o cadastro antes de entrar na lista.
            Só o nome é obrigatório; o restante você preenche o que souber.
          </p>
        </div>

        {ok ? (
          <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 text-center space-y-4">
            <p data-cy="msgSucessoCadastro" className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
              Cadastro enviado! Aguarde a diretoria aprovar. Se informou e-mail, você receberá o convite para acessar o sistema.
            </p>
            <Link href="/login" data-cy="linkIrParaLogin" className="inline-flex min-h-11 items-center text-sm font-medium text-indigo-600">
              Ir para o login
            </Link>
          </div>
        ) : (
          <>
            <div className="hidden" aria-hidden>
              <input name="website" tabIndex={-1} autoComplete="off" />
            </div>
            <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-4 overflow-x-auto">
              {abas.map((aba, i) => {
                const Icone = aba.icone
                return (
                  <button
                    key={aba.id}
                    type="button"
                    onClick={() => setAbaAtiva(i)}
                    data-cy={`tabFicha-${aba.id}`}
                    className={`flex items-center gap-1.5 px-3 py-2.5 min-h-11 rounded-lg text-xs font-medium whitespace-nowrap transition-colors shrink-0
                      ${abaAtiva === i ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    <Icone size={14} />
                    {aba.label}
                  </button>
                )
              })}
            </div>

            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-5 sm:p-6">
              <FichaMembroCampos
                form={form}
                set={set}
                abaAtiva={abaAtiva}
                cepStatus={cepStatus}
                mensagemCep={mensagemCep}
                onCep={buscarCep}
                fotoSlot={
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Foto (opcional)</label>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={(e) => {
                        const arquivo = e.target.files?.[0] ?? null
                        escolherFoto(arquivo)
                        if (arquivo && validarFoto(arquivo)) e.target.value = ''
                      }}
                      data-cy="fileFotoCadastro"
                      className="w-full text-sm text-gray-600"
                    />
                    <p data-cy="textoFotoCadastro" className="text-xs text-gray-500 mt-1">
                      JPEG, PNG ou WebP até 5 MB.{foto ? ` Selecionada: ${foto.name}` : ''}
                    </p>
                  </div>
                }
              />
            </div>

            {erro && (
              <div data-cy="msgErroCadastro" className="mt-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">{erro}</div>
            )}

            <div className="sticky bottom-0 z-10 mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pt-3 pb-[max(0.5rem,env(safe-area-inset-bottom))] bg-transparent">
              <button
                type="button"
                onClick={() => setAbaAtiva((i) => Math.max(0, i - 1))}
                disabled={abaAtiva === 0}
                data-cy="btnAnterior"
                className="flex items-center justify-center gap-2 min-h-11 px-4 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-40"
              >
                <ChevronLeft size={16} /> Anterior
              </button>
              <span data-cy="indicadorAba" className="text-xs text-gray-500 text-center">{abaAtiva + 1} de {total}</span>
              <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center gap-2">
                {abaAtiva < total - 1 && (
                  <button
                    type="button"
                    onClick={() => setAbaAtiva((i) => Math.min(total - 1, i + 1))}
                    data-cy="btnProximo"
                    className="flex items-center justify-center gap-2 min-h-11 px-4 bg-white border border-indigo-200 text-indigo-700 rounded-xl text-sm font-medium"
                  >
                    Próximo <ChevronRight size={16} />
                  </button>
                )}
                <button
                  type="button"
                  disabled={enviando}
                  onClick={enviar}
                  data-cy="btnEnviarCadastro"
                  className="flex items-center justify-center gap-2 min-h-11 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white rounded-xl text-sm font-medium"
                >
                  {enviando ? <><Loader2 size={16} className="animate-spin" /> Enviando...</> : 'Enviar cadastro'}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

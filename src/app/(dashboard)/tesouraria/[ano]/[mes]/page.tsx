'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { usePermissao } from '@/lib/hooks/usePermissao'
import TesourariaGuard from '@/components/TesourariaGuard'
import ModalConfirmacao from '@/components/ModalConfirmacao'
import {
  BLOCOS_GASTO, BLOCOS_RECEITA, BUCKET_COMPROVANTES, MESES, TAGS_GASTO,
  formatarDataISO, formatarMoeda, percentual, soma, tipoDaCategoria,
  type CategoriaLancamento, type Lancamento,
} from '@/lib/tesouraria'
import { Loader2, Paperclip, Pencil, Plus, Trash2 } from 'lucide-react'

const inputClass = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500'

type FormLancamento = {
  id?: string
  descricao: string
  data: string
  valor: string
  comentario: string
  tag: string
  arquivo: File | null
  comprovante_path: string | null
}

const formVazio = (dataPadrao: string): FormLancamento => ({
  descricao: '',
  data: dataPadrao,
  valor: '',
  comentario: '',
  tag: '',
  arquivo: null,
  comprovante_path: null,
})

export default function TesourariaMesPage() {
  return (
    <TesourariaGuard>
      <FichaMes />
    </TesourariaGuard>
  )
}

function FichaMes() {
  const params = useParams()
  const router = useRouter()
  const ano = Number(params.ano)
  const mes = Number(params.mes)
  const { userId } = usePermissao()
  const supabase = createClient()

  const [lista, setLista] = useState<Lancamento[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')
  const [formCategoria, setFormCategoria] = useState<CategoriaLancamento | null>(null)
  const [form, setForm] = useState<FormLancamento>(formVazio(''))
  const [salvando, setSalvando] = useState(false)
  const [excluindo, setExcluindo] = useState<Lancamento | null>(null)

  const dataPadrao = useMemo(() => {
    if (!ano || !mes) return ''
    return `${ano}-${String(mes).padStart(2, '0')}-01`
  }, [ano, mes])

  useEffect(() => {
    if (!ano || mes < 1 || mes > 12) return
    carregar()
  }, [ano, mes])

  async function carregar() {
    setCarregando(true)
    setErro('')
    const inicio = `${ano}-${String(mes).padStart(2, '0')}-01`
    const fim = `${ano}-${String(mes).padStart(2, '0')}-${String(new Date(ano, mes, 0).getDate()).padStart(2, '0')}`
    const { data, error } = await supabase
      .from('lancamentos_financeiros')
      .select('*')
      .gte('data', inicio)
      .lte('data', fim)
      .order('data')
      .order('created_at')
    if (error) setErro(error.message)
    setLista((data ?? []) as Lancamento[])
    setCarregando(false)
  }

  function abrirNovo(categoria: CategoriaLancamento) {
    setFormCategoria(categoria)
    setForm(formVazio(dataPadrao))
  }

  function abrirEdicao(item: Lancamento) {
    setFormCategoria(item.categoria)
    setForm({
      id: item.id,
      descricao: item.descricao,
      data: item.data.slice(0, 10),
      valor: String(item.valor),
      comentario: item.comentario ?? '',
      tag: item.tag ?? '',
      arquivo: null,
      comprovante_path: item.comprovante_path,
    })
  }

  async function salvar(e: React.FormEvent) {
    e.preventDefault()
    if (!formCategoria) return
    const valor = Number(String(form.valor).replace(',', '.'))
    if (!form.descricao.trim() || !form.data || Number.isNaN(valor) || valor < 0) {
      setErro('Preencha descrição, data e um valor válido.')
      return
    }
    setSalvando(true)
    setErro('')

    let comprovante_path = form.comprovante_path
    if (form.arquivo) {
      const tiposOk = ['application/pdf', 'image/jpeg', 'image/png']
      if (!tiposOk.includes(form.arquivo.type) && !/\.(pdf|jpe?g|png)$/i.test(form.arquivo.name)) {
        setErro('O comprovante deve ser PDF, JPG ou PNG.')
        return
      }
      if (form.arquivo.size > 10 * 1024 * 1024) {
        setErro('O comprovante deve ter no máximo 10MB.')
        return
      }
      const ext = form.arquivo.name.split('.').pop() || 'bin'
      const path = `${userId}/${crypto.randomUUID()}.${ext}`
      const { error: upError } = await supabase.storage
        .from(BUCKET_COMPROVANTES)
        .upload(path, form.arquivo, { upsert: true })
      if (upError) {
        setSalvando(false)
        setErro(upError.message)
        return
      }
      if (form.comprovante_path) {
        await supabase.storage.from(BUCKET_COMPROVANTES).remove([form.comprovante_path])
      }
      comprovante_path = path
    }

    const payload = {
      descricao: form.descricao.trim(),
      data: form.data,
      valor,
      comentario: form.comentario.trim() || null,
      tag: form.tag || null,
      comprovante_path,
      tipo: tipoDaCategoria(formCategoria),
      categoria: formCategoria,
      criado_por: userId,
    }
    const query = form.id
      ? supabase.from('lancamentos_financeiros').update(payload).eq('id', form.id)
      : supabase.from('lancamentos_financeiros').insert(payload)
    const { error } = await query
    setSalvando(false)
    if (error) { setErro(error.message); return }
    setFormCategoria(null)
    carregar()
  }

  async function confirmarExclusao() {
    if (!excluindo) return
    if (excluindo.comprovante_path) {
      await supabase.storage.from(BUCKET_COMPROVANTES).remove([excluindo.comprovante_path])
    }
    const { error } = await supabase.from('lancamentos_financeiros').delete().eq('id', excluindo.id)
    setExcluindo(null)
    if (error) { setErro(error.message); return }
    carregar()
  }

  async function abrirComprovante(path: string) {
    const { data, error } = await supabase.storage
      .from(BUCKET_COMPROVANTES)
      .createSignedUrl(path, 3600)
    if (error || !data?.signedUrl) {
      setErro(error?.message ?? 'Não foi possível abrir o comprovante.')
      return
    }
    window.open(data.signedUrl, '_blank', 'noopener,noreferrer')
  }

  function irMes(delta: number) {
    const d = new Date(ano, mes - 1 + delta, 1)
    router.push(`/tesouraria/${d.getFullYear()}/${d.getMonth() + 1}`)
  }

  const entradas = lista.filter((l) => l.tipo === 'entrada')
  const saidas = lista.filter((l) => l.tipo === 'saida')
  const totalEntradas = soma(entradas)
  const totalSaidas = soma(saidas)

  if (!ano || mes < 1 || mes > 12) {
    return <p className="text-sm text-red-600">Mês inválido.</p>
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{MESES[mes - 1]} {ano}</h1>
          <p className="text-sm text-gray-500">Controle financeiro — Igreja Batista Central de Ipatinga</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => irMes(-1)} className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">Mês anterior</button>
          <button onClick={() => irMes(1)} className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">Próximo mês</button>
          <Link href="/tesouraria" className="px-3 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Resumo anual</Link>
          <Link href="/tesouraria/relatorio" className="px-3 py-2 text-sm border border-gray-300 rounded-lg">Relatório</Link>
        </div>
      </div>

      {erro && <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">{erro}</div>}

      {carregando ? (
        <p className="text-sm text-gray-400 py-8 text-center">Carregando lançamentos...</p>
      ) : (
        <>
          <Secao titulo="Entradas">
            {BLOCOS_RECEITA.map((bloco) => (
              <Bloco
                key={bloco.categoria}
                titulo={bloco.titulo}
                itens={lista.filter((l) => l.categoria === bloco.categoria)}
                ehGasto={false}
                formAberto={formCategoria === bloco.categoria}
                form={form}
                salvando={salvando}
                onNovo={() => abrirNovo(bloco.categoria)}
                onEditar={abrirEdicao}
                onExcluir={setExcluindo}
                onFechar={() => setFormCategoria(null)}
                onChange={setForm}
                onSalvar={salvar}
              />
            ))}
          </Secao>

          <Secao titulo="Saídas">
            {BLOCOS_GASTO.map((bloco) => (
              <Bloco
                key={bloco.categoria}
                titulo={bloco.titulo}
                itens={lista.filter((l) => l.categoria === bloco.categoria)}
                ehGasto
                formAberto={formCategoria === bloco.categoria}
                form={form}
                salvando={salvando}
                onNovo={() => abrirNovo(bloco.categoria)}
                onEditar={abrirEdicao}
                onExcluir={setExcluindo}
                onFechar={() => setFormCategoria(null)}
                onChange={setForm}
                onSalvar={salvar}
                onAbrirComprovante={abrirComprovante}
              />
            ))}
          </Secao>

          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Resultado final ao término do mês</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <CardResumo rotulo="Entradas" valor={totalEntradas} cor="text-emerald-700" />
              <CardResumo rotulo="Saídas" valor={totalSaidas} cor="text-red-700" />
              <CardResumo rotulo="Saldo" valor={totalEntradas - totalSaidas} cor={totalEntradas - totalSaidas >= 0 ? 'text-indigo-700' : 'text-red-700'} />
            </div>
          </div>
        </>
      )}

      <ModalConfirmacao
        aberto={!!excluindo}
        titulo="Excluir lançamento"
        mensagem={`Excluir "${excluindo?.descricao}"?`}
        textoBotaoPrimario="Excluir"
        perigo
        onConfirmar={confirmarExclusao}
        onCancelar={() => setExcluindo(null)}
      />
    </div>
  )
}

function Secao({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-900">{titulo}</h2>
      {children}
    </section>
  )
}

function CardResumo({ rotulo, valor, cor }: { rotulo: string; valor: number; cor: string }) {
  return (
    <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
      <p className="text-xs text-gray-500">{rotulo}</p>
      <p className={`text-lg font-semibold ${cor}`}>{formatarMoeda(valor)}</p>
    </div>
  )
}

function Bloco({
  titulo, itens, ehGasto, formAberto, form, salvando,
  onNovo, onEditar, onExcluir, onFechar, onChange, onSalvar, onAbrirComprovante,
}: {
  titulo: string
  itens: Lancamento[]
  ehGasto: boolean
  formAberto: boolean
  form: FormLancamento
  salvando: boolean
  onNovo: () => void
  onEditar: (item: Lancamento) => void
  onExcluir: (item: Lancamento) => void
  onFechar: () => void
  onChange: (form: FormLancamento) => void
  onSalvar: (e: React.FormEvent) => void
  onAbrirComprovante?: (path: string) => void
}) {
  const total = soma(itens)
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium text-gray-900">{titulo}</h3>
        <button onClick={onNovo} className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-700">
          <Plus size={14} /> Adicionar
        </button>
      </div>

      {formAberto && (
        <form onSubmit={onSalvar} className="bg-gray-50 rounded-xl p-4 mb-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input className={inputClass} placeholder="Descrição" required
            value={form.descricao} onChange={(e) => onChange({ ...form, descricao: e.target.value })} />
          <input className={inputClass} type="date" required
            value={form.data} onChange={(e) => onChange({ ...form, data: e.target.value })} />
          <input className={inputClass} placeholder="Valor" required
            value={form.valor} onChange={(e) => onChange({ ...form, valor: e.target.value })} />
          <input className={inputClass} placeholder="Comentário (opcional)"
            value={form.comentario} onChange={(e) => onChange({ ...form, comentario: e.target.value })} />
          {ehGasto && (
            <>
              <select className={inputClass} value={form.tag}
                onChange={(e) => onChange({ ...form, tag: e.target.value })}>
                <option value="">Tag (opcional)</option>
                {TAGS_GASTO.map((tag) => <option key={tag} value={tag}>{tag}</option>)}
              </select>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Comprovante (PDF, JPG ou PNG)</label>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                  className="block w-full text-sm text-gray-600"
                  onChange={(e) => onChange({ ...form, arquivo: e.target.files?.[0] ?? null })}
                />
                {form.comprovante_path && !form.arquivo && (
                  <p className="text-xs text-gray-400 mt-1">Já existe um comprovante anexado.</p>
                )}
              </div>
            </>
          )}
          <div className="flex gap-2 sm:col-span-2">
            <button type="submit" disabled={salvando}
              className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg disabled:opacity-60">
              {salvando ? <Loader2 size={14} className="animate-spin" /> : form.id ? 'Salvar' : 'Adicionar'}
            </button>
            <button type="button" onClick={onFechar} className="px-4 py-2 border border-gray-300 text-sm rounded-lg">
              Cancelar
            </button>
          </div>
        </form>
      )}

      {itens.length === 0 ? (
        <p className="text-sm text-gray-400">Nenhum lançamento neste bloco.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-500 border-b border-gray-100">
                <th className="py-2 pr-3 font-medium">Descrição</th>
                <th className="py-2 pr-3 font-medium">Data</th>
                <th className="py-2 pr-3 font-medium">Valor</th>
                <th className="py-2 pr-3 font-medium">%</th>
                {ehGasto && <th className="py-2 pr-3 font-medium">Tag</th>}
                {ehGasto && <th className="py-2 pr-3 font-medium">Comprovante</th>}
                <th className="py-2 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {itens.map((item) => (
                <tr key={item.id} className="border-b border-gray-50">
                  <td className="py-2 pr-3">
                    <p className="text-gray-900">{item.descricao}</p>
                    {item.comentario && <p className="text-xs text-gray-400">{item.comentario}</p>}
                  </td>
                  <td className="py-2 pr-3 text-gray-600 whitespace-nowrap">{formatarDataISO(item.data)}</td>
                  <td className="py-2 pr-3 text-gray-900 whitespace-nowrap">{formatarMoeda(Number(item.valor))}</td>
                  <td className="py-2 pr-3 text-gray-500">{percentual(Number(item.valor), total).toFixed(0)}%</td>
                  {ehGasto && <td className="py-2 pr-3 text-gray-500">{item.tag || '—'}</td>}
                  {ehGasto && (
                    <td className="py-2 pr-3">
                      {item.comprovante_path ? (
                        <button type="button" onClick={() => onAbrirComprovante?.(item.comprovante_path!)}
                          className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-700">
                          <Paperclip size={14} /> Ver
                        </button>
                      ) : <span className="text-gray-300">—</span>}
                    </td>
                  )}
                  <td className="py-2 text-right whitespace-nowrap">
                    <button onClick={() => onEditar(item)} className="p-1.5 text-gray-400 hover:text-indigo-600"><Pencil size={14} /></button>
                    <button onClick={() => onExcluir(item)} className="p-1.5 text-gray-400 hover:text-red-600"><Trash2 size={14} /></button>
                  </td>
                </tr>
              ))}
              <tr>
                <td className="pt-3 font-medium text-gray-900">Total</td>
                <td></td>
                <td className="pt-3 font-medium text-gray-900">{formatarMoeda(total)}</td>
                <td className="pt-3 text-gray-500">100%</td>
                {ehGasto && <td></td>}
                {ehGasto && <td></td>}
                <td></td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import AcessoGuard from '@/components/AcessoGuard'
import { usePermissao } from '@/lib/hooks/usePermissao'
import ModalConfirmacao from '@/components/ModalConfirmacao'
import {
  BUCKET_DOCUMENTOS,
  TIPOS_DOCUMENTO,
  labelTipoDocumento,
  type Documento,
  type TipoDocumento,
} from '@/lib/documentos'
import { FileText, Plus, Trash2, ExternalLink, Loader2 } from 'lucide-react'

export default function DocumentosPage() {
  const { podeDocumentos, carregando } = usePermissao()
  return (
    <AcessoGuard
      permitido={podeDocumentos}
      carregando={carregando}
      mensagem="Os documentos são visíveis apenas para Super Admin e Admin."
    >
      <DocumentosConteudo />
    </AcessoGuard>
  )
}

function DocumentosConteudo() {
  const supabase = createClient()
  const { userId } = usePermissao()
  const [lista, setLista] = useState<Documento[]>([])
  const [carregando, setCarregando] = useState(true)
  const [mostrarForm, setMostrarForm] = useState(false)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')
  const [excluindo, setExcluindo] = useState<Documento | null>(null)
  const [excluindoLoading, setExcluindoLoading] = useState(false)
  const [form, setForm] = useState({
    titulo: '',
    tipo: 'ata' as TipoDocumento,
    arquivo: null as File | null,
  })

  async function carregar() {
    const { data, error } = await supabase
      .from('documentos')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) setErro(error.message)
    setLista((data ?? []) as Documento[])
    setCarregando(false)
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void carregar()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function salvar() {
    if (!form.titulo.trim() || !form.arquivo) {
      setErro('Informe o título e anexe um arquivo.')
      return
    }
    const tiposOk = ['application/pdf', 'image/jpeg', 'image/png']
    if (!tiposOk.includes(form.arquivo.type) && !/\.(pdf|jpe?g|png)$/i.test(form.arquivo.name)) {
      setErro('O arquivo deve ser PDF, JPG ou PNG.')
      return
    }
    if (form.arquivo.size > 10 * 1024 * 1024) {
      setErro('O arquivo deve ter no máximo 10MB.')
      return
    }
    setSalvando(true)
    setErro('')
    const ext = form.arquivo.name.split('.').pop() || 'bin'
    const path = `${userId}/${crypto.randomUUID()}.${ext}`
    const { error: upError } = await supabase.storage
      .from(BUCKET_DOCUMENTOS)
      .upload(path, form.arquivo, { upsert: true })
    if (upError) {
      setSalvando(false)
      setErro(upError.message)
      return
    }
    const { error } = await supabase.from('documentos').insert({
      titulo: form.titulo.trim(),
      tipo: form.tipo,
      storage_path: path,
      criado_por: userId,
    })
    setSalvando(false)
    if (error) {
      await supabase.storage.from(BUCKET_DOCUMENTOS).remove([path])
      setErro(error.message)
      return
    }
    setForm({ titulo: '', tipo: 'ata', arquivo: null })
    setMostrarForm(false)
    carregar()
  }

  async function abrir(path: string) {
    const { data, error } = await supabase.storage
      .from(BUCKET_DOCUMENTOS)
      .createSignedUrl(path, 3600)
    if (error || !data?.signedUrl) {
      setErro(error?.message ?? 'Não foi possível abrir o documento.')
      return
    }
    window.open(data.signedUrl, '_blank', 'noopener,noreferrer')
  }

  async function confirmarExclusao() {
    if (!excluindo) return
    setExcluindoLoading(true)
    await supabase.storage.from(BUCKET_DOCUMENTOS).remove([excluindo.storage_path])
    const { error } = await supabase.from('documentos').delete().eq('id', excluindo.id)
    setExcluindoLoading(false)
    setExcluindo(null)
    if (error) {
      setErro(error.message)
      return
    }
    carregar()
  }

  function formatarData(iso: string) {
    return new Date(iso).toLocaleDateString('pt-BR')
  }

  return (
    <div data-cy="pageDocumentos" className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <FileText className="text-indigo-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Documentos</h1>
            <p className="text-sm text-gray-500">ATAs, estatuto, ofícios e outros arquivos da igreja</p>
          </div>
        </div>
        {!mostrarForm && (
          <button
            onClick={() => { setMostrarForm(true); setErro('') }}
            data-cy="btnNovoDocumento"
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors"
          >
            <Plus size={16} /> Novo documento
          </button>
        )}
      </div>

      {erro && (
        <div data-cy="msgErroDocumentos" className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-2.5">
          {erro}
        </div>
      )}

      {mostrarForm && (
        <div data-cy="formDocumento" className="bg-white border border-gray-200 rounded-2xl p-5 space-y-4">
          <h2 className="font-semibold text-gray-900">Anexar documento</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Título *</label>
              <input
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm"
                placeholder="Ex: ATA da assembleia de março"
                value={form.titulo}
                onChange={(e) => setForm((p) => ({ ...p, titulo: e.target.value }))}
                data-cy="inputTituloDocumento"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
              <select
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm"
                value={form.tipo}
                onChange={(e) => setForm((p) => ({ ...p, tipo: e.target.value as TipoDocumento }))}
                data-cy="selectTipoDocumento"
              >
                {TIPOS_DOCUMENTO.map((t) => (
                  <option key={t.valor} value={t.valor} data-cy={`optTipoDocumento-${t.valor}`}>{t.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Arquivo (PDF, JPG ou PNG, até 10MB) *</label>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                className="block w-full text-sm text-gray-600"
                data-cy="fileDocumento"
                onChange={(e) => setForm((p) => ({ ...p, arquivo: e.target.files?.[0] ?? null }))}
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={salvar}
              disabled={salvando}
              data-cy="btnSalvarDocumento"
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg"
            >
              {salvando && <Loader2 size={14} className="animate-spin" />}
              {salvando ? 'Enviando...' : 'Salvar'}
            </button>
            <button
              onClick={() => { setMostrarForm(false); setForm({ titulo: '', tipo: 'ata', arquivo: null }) }}
              data-cy="btnCancelarDocumento"
              className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        {carregando ? (
          <div data-cy="loadingDocumentos" className="py-16 text-center text-gray-400 text-sm">Carregando...</div>
        ) : lista.length === 0 ? (
          <div data-cy="vazioDocumentos" className="flex flex-col items-center justify-center py-16 text-gray-400">
            <FileText size={40} className="mb-3 opacity-30" />
            <p className="font-medium">Nenhum documento anexado</p>
          </div>
        ) : (
          <table data-cy="listaDocumentos" className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Documento</th>
                <th className="text-left text-xs font-medium text-gray-500 px-4 py-3 hidden sm:table-cell">Tipo</th>
                <th className="text-left text-xs font-medium text-gray-500 px-4 py-3 hidden md:table-cell">Data</th>
                <th className="text-right text-xs font-medium text-gray-500 px-4 py-3">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {lista.map((doc) => (
                <tr key={doc.id} data-cy={`documentoItem-${doc.id}`} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{doc.titulo}</td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700">
                      {labelTipoDocumento(doc.tipo)}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell text-sm text-gray-500">
                    {formatarData(doc.created_at)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => abrir(doc.storage_path)}
                        data-cy={`btnAbrirDocumento-${doc.id}`}
                        className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                      >
                        <ExternalLink size={14} /> Abrir
                      </button>
                      <button
                        onClick={() => setExcluindo(doc)}
                        data-cy={`btnExcluirDocumento-${doc.id}`}
                        className="inline-flex items-center gap-1 text-xs text-red-600 hover:text-red-800 font-medium"
                      >
                        <Trash2 size={14} /> Excluir
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <ModalConfirmacao
        aberto={!!excluindo}
        titulo="Excluir documento"
        mensagem={`Excluir "${excluindo?.titulo}"? Esta ação não pode ser desfeita.`}
        textoBotaoPrimario="Excluir"
        carregando={excluindoLoading}
        perigo
        onConfirmar={confirmarExclusao}
        onCancelar={() => setExcluindo(null)}
      />
    </div>
  )
}

'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Camera, Loader2, X } from 'lucide-react'

type Props = {
  fotoAtual: string | null
  nome: string
  onUpload: (url: string) => void
}

export default function UploadFoto({ fotoAtual, nome, onUpload }: Props) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(fotoAtual)
  const inputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  function iniciais(n: string) {
    return n.split(' ').slice(0, 2).map(p => p[0]).join('').toUpperCase()
  }

  async function handleArquivo(e: React.ChangeEvent<HTMLInputElement>) {
    const arquivo = e.target.files?.[0]
    if (!arquivo) return

    // Validações
    if (!arquivo.type.startsWith('image/')) {
      alert('Selecione apenas arquivos de imagem.')
      return
    }
    if (arquivo.size > 5 * 1024 * 1024) {
      alert('A imagem deve ter no máximo 5MB.')
      return
    }

    setUploading(true)

    // Preview local enquanto faz upload
    const reader = new FileReader()
    reader.onload = (ev) => setPreview(ev.target?.result as string)
    reader.readAsDataURL(arquivo)

    // Nome único para o arquivo
    const ext = arquivo.name.split('.').pop()
    const nomeArquivo = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

    const { error } = await supabase.storage
      .from('fotos-membros')
      .upload(nomeArquivo, arquivo, { upsert: true })

    if (error) {
      alert('Erro ao fazer upload. Tente novamente.')
      setPreview(fotoAtual)
      setUploading(false)
      return
    }

    // Pegar URL pública
    const { data } = supabase.storage
      .from('fotos-membros')
      .getPublicUrl(nomeArquivo)

    onUpload(data.publicUrl)
    setUploading(false)
  }

  async function removerFoto() {
    setPreview(null)
    onUpload('')
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Avatar / Preview */}
      <div className="relative">
        {preview ? (
          <img
            src={preview}
            alt={nome}
            className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md"
          />
        ) : (
          <div className="w-24 h-24 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-2xl font-bold border-4 border-white shadow-md">
            {nome ? iniciais(nome) : '?'}
          </div>
        )}

        {/* Botão de remover foto */}
        {preview && !uploading && (
          <button
            type="button"
            onClick={removerFoto}
            className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
          >
            <X size={12} />
          </button>
        )}

        {/* Overlay de loading */}
        {uploading && (
          <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center">
            <Loader2 size={24} className="text-white animate-spin" />
          </div>
        )}
      </div>

      {/* Botão de upload */}
      <div>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleArquivo}
          className="hidden"
          id="upload-foto"
          disabled={uploading}
        />
        <label
          htmlFor="upload-foto"
          className={`flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 cursor-pointer hover:bg-gray-50 transition-colors ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <Camera size={14} />
          {uploading ? 'Enviando...' : preview ? 'Trocar foto' : 'Adicionar foto'}
        </label>
        <p className="text-xs text-gray-400 text-center mt-1">JPG, PNG ou WebP · Máx. 5MB</p>
      </div>
    </div>
  )
}
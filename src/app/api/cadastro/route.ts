import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sanitizarFichaPublica } from '@/lib/ficha-membro'

function limpar(valor: unknown, max = 200) {
  return String(valor ?? '').trim().slice(0, max)
}

function mensagemInsert(error: { code?: string; message?: string }) {
  const texto = (error.message ?? '').toLowerCase()
  const tabelaAusente =
    error.code === '42P01' ||
    error.code === 'PGRST205' ||
    texto.includes('schema cache') ||
    (texto.includes('cadastros_pendentes') && (texto.includes('does not exist') || texto.includes('não existe') || texto.includes('could not find')))

  if (tabelaAusente) {
    return 'Atualize o banco: rode o SQL em docs/migrations-cadastro-qr.sql.'
  }

  const colunaDados =
    texto.includes('dados') &&
    (texto.includes('column') || texto.includes('schema cache') || texto.includes('could not find'))
  if (colunaDados) {
    return 'Atualize o banco: rode o SQL em docs/migrations-cadastro-qr.sql.'
  }

  return error.message || 'Não foi possível enviar o cadastro.'
}

function lerDados(form: FormData) {
  const bruto = form.get('dados')
  if (typeof bruto !== 'string' || !bruto.trim()) return {}
  try {
    return JSON.parse(bruto) as unknown
  } catch {
    return {}
  }
}

export async function POST(req: Request) {
  try {
    const form = await req.formData()
    if (limpar(form.get('website'))) {
      return NextResponse.json({ ok: true })
    }

    const ficha = sanitizarFichaPublica(lerDados(form))
    const nome = limpar(form.get('nome_completo') || ficha.nome_completo, 120)
    const telefone = limpar(form.get('telefone') || ficha.telefone, 20)
    const email = limpar(form.get('email') || ficha.email, 120).toLowerCase()
    ficha.nome_completo = nome
    ficha.telefone = telefone
    ficha.email = email

    if (!nome || nome.length < 3) {
      return NextResponse.json({ error: 'Informe o nome completo.' }, { status: 400 })
    }

    const admin = createAdminClient()
    let foto_url: string | null = null
    const foto = form.get('foto')

    if (foto instanceof File && foto.size > 0) {
      if (!foto.type.startsWith('image/') || foto.size > 5 * 1024 * 1024) {
        return NextResponse.json({ error: 'A foto deve ser uma imagem de até 5MB.' }, { status: 400 })
      }
      const ext = (foto.name.split('.').pop() || 'jpg').toLowerCase()
      const path = `pendentes/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const buffer = Buffer.from(await foto.arrayBuffer())
      const { error: upError } = await admin.storage
        .from('fotos-membros')
        .upload(path, buffer, { contentType: foto.type, upsert: false })
      if (!upError) {
        foto_url = admin.storage.from('fotos-membros').getPublicUrl(path).data.publicUrl
      }
    }

    const { error } = await admin.from('cadastros_pendentes').insert({
      nome_completo: nome,
      telefone: telefone || null,
      email: email || null,
      foto_url,
      dados: ficha,
    })

    if (error) {
      return NextResponse.json({ error: mensagemInsert(error) }, { status: 400 })
    }

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Não foi possível enviar o cadastro.' }, { status: 500 })
  }
}

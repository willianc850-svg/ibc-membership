import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

function limpar(valor: unknown, max = 200) {
  return String(valor ?? '').trim().slice(0, max)
}

export async function POST(req: Request) {
  try {
    const form = await req.formData()
    if (limpar(form.get('website'))) {
      return NextResponse.json({ ok: true })
    }

    const nome = limpar(form.get('nome_completo'), 120)
    const telefone = limpar(form.get('telefone'), 20)
    const email = limpar(form.get('email'), 120).toLowerCase()

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
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Não foi possível enviar o cadastro.' }, { status: 500 })
  }
}

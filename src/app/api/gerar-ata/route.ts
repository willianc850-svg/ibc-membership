import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { prompt } = body

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt obrigatório' }, { status: 400 })
    }

    const apiKey = process.env.GEMINI_API_KEY
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens: 2000 },
      }),
    })

    const data = await response.json()
    console.log('Resposta Gemini:', JSON.stringify(data))

    if (data.error) {
      return NextResponse.json({ error: data.error.message }, { status: 500 })
    }

    const texto = data.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
    return NextResponse.json({ texto })

  } catch (error) {
    console.error('Erro ao gerar ATA:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

export async function POST(request: NextRequest) {
  try {
    console.log('🔊 Received Text-to-Speech request')

    const body = await request.json()
    const { text } = body

    if (!text) {
      return NextResponse.json(
        { error: 'No text provided' },
        { status: 400 }
      )
    }

    console.log('📝 Text to convert:', text.substring(0, 50) + '...')

    // Check API key
    if (!process.env.OPENAI_API_KEY) {
      console.error('❌ OpenAI API key not configured')
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      )
    }

    // Initialize OpenAI
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })

    // Call TTS API
    console.log('🚀 Sending to OpenAI TTS...')
    const mp3 = await openai.audio.speech.create({
      model: 'tts-1', // Use 'tts-1-hd' for higher quality
      voice: 'alloy', // Options: alloy, echo, fable, onyx, nova, shimmer
      input: text,
    })

    console.log('✅ Audio generated successfully')

    // Convert to buffer
    const buffer = Buffer.from(await mp3.arrayBuffer())

    // Return audio stream
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': buffer.length.toString(),
      },
    })
  } catch (error: any) {
    console.error('❌ Text-to-Speech error:', error)
    console.error('❌ Error details:', error?.message)
    
    return NextResponse.json(
      { 
        error: 'Failed to generate speech',
        details: error?.message || 'Unknown error',
      },
      { status: 500 }
    )
  }
}


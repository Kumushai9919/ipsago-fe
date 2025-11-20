import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

export async function POST(request: NextRequest) {
  try {
    console.log('🎤 Received Speech-to-Text request')

    // Check API key
    if (!process.env.OPENAI_API_KEY) {
      console.error('❌ OpenAI API key not configured')
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      )
    }

    // Get audio blob from form data
    const formData = await request.formData()
    const audioFile = formData.get('audio') as File
    
    if (!audioFile) {
      return NextResponse.json(
        { error: 'No audio file provided' },
        { status: 400 }
      )
    }

    console.log('📁 Audio file received:', audioFile.name, audioFile.size, 'bytes')

    // Initialize OpenAI
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })

    // Call Whisper API for transcription
    console.log('🚀 Sending to Whisper API...')
    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: 'whisper-1',
      language: 'ko', // Korean language (change to 'en' for English or remove for auto-detect)
    })

    console.log('✅ Transcription successful:', transcription.text)

    return NextResponse.json({
      text: transcription.text,
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error('❌ Speech-to-Text error:', error)
    console.error('❌ Error details:', error?.message)
    
    return NextResponse.json(
      { 
        error: 'Failed to transcribe audio',
        details: error?.message || 'Unknown error',
      },
      { status: 500 }
    )
  }
}


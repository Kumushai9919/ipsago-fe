/**
 * Audio Recording Utility
 * Handles browser MediaRecorder API for voice input
 */

export class AudioRecorder {
  private mediaRecorder: MediaRecorder | null = null
  private audioChunks: Blob[] = []
  private stream: MediaStream | null = null

  /**
   * Start recording audio from microphone
   */
  async startRecording(): Promise<void> {
    try {
      console.log('🎤 Requesting microphone access...')
      
      // Request microphone permission
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        }
      })

      console.log('✅ Microphone access granted')

      // Create MediaRecorder
      this.mediaRecorder = new MediaRecorder(this.stream, {
        mimeType: 'audio/webm;codecs=opus' // Widely supported format
      })

      this.audioChunks = []

      // Collect audio data
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data)
        }
      }

      // Start recording
      this.mediaRecorder.start()
      console.log('🎙️ Recording started')
    } catch (error) {
      console.error('❌ Failed to start recording:', error)
      throw new Error('Failed to access microphone. Please grant permission.')
    }
  }

  /**
   * Stop recording and return audio blob
   */
  async stopRecording(): Promise<Blob> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        reject(new Error('No active recording'))
        return
      }

      this.mediaRecorder.onstop = () => {
        console.log('🛑 Recording stopped')
        
        // Create audio blob
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' })
        console.log('📦 Audio blob created:', audioBlob.size, 'bytes')
        
        // Cleanup
        this.cleanup()
        
        resolve(audioBlob)
      }

      this.mediaRecorder.stop()
    })
  }

  /**
   * Cleanup resources
   */
  private cleanup(): void {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop())
      this.stream = null
    }
    this.mediaRecorder = null
    this.audioChunks = []
  }

  /**
   * Check if recording is active
   */
  isRecording(): boolean {
    return this.mediaRecorder?.state === 'recording'
  }
}

/**
 * Send audio blob to Speech-to-Text API
 */
export async function transcribeAudio(audioBlob: Blob): Promise<string> {
  try {
    console.log('📤 Sending audio to STT API...')
    
    // Create form data
    const formData = new FormData()
    formData.append('audio', audioBlob, 'recording.webm')

    // Call STT API
    const response = await fetch('/api/stt', {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.details || 'Failed to transcribe audio')
    }

    const data = await response.json()
    console.log('✅ Transcription received:', data.text)
    
    return data.text
  } catch (error) {
    console.error('❌ Transcription error:', error)
    throw error
  }
}

/**
 * Play audio from Text-to-Speech API
 */
export async function playTextToSpeech(text: string): Promise<void> {
  try {
    console.log('🔊 Requesting TTS for:', text.substring(0, 50) + '...')
    
    // Call TTS API
    const response = await fetch('/api/tts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.details || 'Failed to generate speech')
    }

    // Get audio blob
    const audioBlob = await response.blob()
    console.log('✅ Audio received:', audioBlob.size, 'bytes')

    // Create audio URL and play
    const audioUrl = URL.createObjectURL(audioBlob)
    const audio = new Audio(audioUrl)
    
    // Play audio
    await audio.play()
    console.log('🎵 Playing audio...')

    // Cleanup after playing
    audio.onended = () => {
      URL.revokeObjectURL(audioUrl)
      console.log('✅ Audio playback complete')
    }
  } catch (error) {
    console.error('❌ TTS playback error:', error)
    throw error
  }
}


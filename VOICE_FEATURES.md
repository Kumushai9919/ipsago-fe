# 🎤 Voice Features Documentation

## Overview

Your AI Interview Prep application now supports full voice functionality with Speech-to-Text (STT) and Text-to-Speech (TTS) powered by OpenAI.

## 🎯 Features

### 1. Voice Input (Speech → Text)
- **Mic Button**: Click to start/stop recording your voice
- **Auto-transcription**: Audio is automatically converted to text using OpenAI Whisper
- **Smart Integration**: Transcribed text is sent directly to the chat as a user message

### 2. Voice Output (Text → Speech)
- **Speaker Toggle**: Enable/disable AI voice responses
- **Auto-playback**: When enabled, AI responses are automatically spoken
- **Natural Voices**: Uses OpenAI TTS with the "alloy" voice (configurable)

## 📁 New Files Added

```
/app/api/stt/route.ts           # Speech-to-Text API endpoint
/app/api/tts/route.ts           # Text-to-Speech API endpoint
/lib/recordAudio.ts             # Audio recording utilities
```

## 🔧 Updated Files

```
/components/interview-interface.tsx   # Main chat UI with voice controls
```

## 🎮 How to Use

### Voice Input
1. Click the **microphone button** in the chat input area
2. Speak your response
3. Click the microphone button again to stop
4. The audio will be transcribed and sent automatically

### Voice Output
1. Click the **"Voice OFF"** button to enable voice output
2. It will change to **"Voice ON"**
3. All AI responses will now be spoken automatically
4. Click again to disable voice output

## 🔑 Environment Variables

Make sure your `.env.local` file contains:

```bash
OPENAI_API_KEY=sk-...
```

## 🛠️ Technical Details

### Speech-to-Text (STT)
- **Model**: OpenAI Whisper (`whisper-1`)
- **Language**: Korean (`ko`) - configurable in `/app/api/stt/route.ts`
- **Format**: WebM audio with Opus codec
- **API**: POST `/api/stt` with FormData containing audio blob

### Text-to-Speech (TTS)
- **Model**: OpenAI TTS (`tts-1`)
- **Voice**: Alloy - configurable in `/app/api/tts/route.ts`
- **Available Voices**: alloy, echo, fable, onyx, nova, shimmer
- **Format**: MP3
- **API**: POST `/api/tts` with JSON `{ text: string }`

### Audio Recording
- **API**: Browser MediaRecorder API
- **Features**: Echo cancellation, noise suppression, auto gain control
- **Class**: `AudioRecorder` in `/lib/recordAudio.ts`

## 🎨 UI Components

### Mic Button
- **Idle State**: Gray outline with mic icon
- **Recording State**: Red with mic-off icon and pulsing indicator
- **Disabled**: During AI response generation

### Speaker Toggle
- **OFF**: Gray outline with volume-x icon
- **ON**: Primary color with volume icon
- **Label**: Shows "Voice ON" or "Voice OFF"

## 🔄 Flow Diagrams

### Voice Input Flow
```
User clicks Mic → Browser requests permission → Recording starts
→ User clicks Mic again → Recording stops → Audio sent to /api/stt
→ Transcription received → Text sent to chat API → AI responds
```

### Voice Output Flow
```
AI generates text response → Check if speaker enabled
→ If YES: Send text to /api/tts → Receive audio MP3
→ Create audio element → Play automatically
```

## 🐛 Troubleshooting

### Microphone Not Working
- **Issue**: Browser doesn't request microphone permission
- **Solution**: Check browser permissions in site settings
- **Chrome**: Click lock icon → Site settings → Microphone → Allow

### Transcription Fails
- **Issue**: "Failed to transcribe audio" error
- **Solution**: 
  - Check OPENAI_API_KEY is set correctly
  - Ensure audio is at least 1 second long
  - Check network connection

### Voice Output Not Playing
- **Issue**: No audio plays when speaker is enabled
- **Solution**:
  - Check browser audio permissions
  - Ensure device volume is not muted
  - Check browser console for errors

### API Rate Limits
- **Issue**: 429 error from OpenAI
- **Solution**: 
  - Wait a few seconds between requests
  - Consider upgrading OpenAI plan for higher limits

## 🎯 Customization Options

### Change TTS Voice
In `/app/api/tts/route.ts`, line 35:
```typescript
voice: 'alloy', // Change to: echo, fable, onyx, nova, shimmer
```

### Change TTS Quality
In `/app/api/tts/route.ts`, line 34:
```typescript
model: 'tts-1', // Change to 'tts-1-hd' for higher quality
```

### Change STT Language
In `/app/api/stt/route.ts`, line 40:
```typescript
language: 'ko', // Change to 'en' for English, or remove for auto-detect
```

### Adjust Audio Settings
In `/lib/recordAudio.ts`, lines 18-22:
```typescript
audio: {
  echoCancellation: true,    // Remove echo
  noiseSuppression: true,    // Reduce background noise
  autoGainControl: true,     // Normalize volume
}
```

## 📊 Cost Estimates

### OpenAI Pricing (as of 2024)
- **Whisper (STT)**: $0.006 per minute
- **TTS Standard**: $0.015 per 1K characters
- **TTS HD**: $0.030 per 1K characters

### Example Usage
- 5-minute interview with voice input: ~$0.03
- 10 AI responses with voice output (avg 100 chars): ~$0.015
- **Total**: ~$0.045 per interview session

## 🚀 Next Steps

### Potential Enhancements
1. **Voice Selection**: Let users choose different TTS voices
2. **Language Detection**: Auto-detect user's language
3. **Audio Visualization**: Show waveform during recording
4. **Playback Controls**: Pause/resume AI voice output
5. **Offline Mode**: Use Web Speech API as fallback
6. **Recording Timer**: Show recording duration
7. **Volume Control**: Adjust TTS volume

### Example Implementation (Voice Selection)
```typescript
// Add state for voice selection
const [selectedVoice, setSelectedVoice] = useState<'alloy' | 'echo' | 'nova'>('alloy')

// Update TTS API call
await fetch('/api/tts', {
  method: 'POST',
  body: JSON.stringify({ text, voice: selectedVoice })
})
```

## 📝 Notes

- Voice features work in all modern browsers (Chrome, Firefox, Safari, Edge)
- HTTPS is required for microphone access (or localhost for development)
- Audio recording quality depends on user's microphone
- TTS playback is automatic and non-blocking
- Both features can be used independently or together

## 🎓 Best Practices

1. **User Feedback**: Always show visual indicators (recording dot, loading spinner)
2. **Error Handling**: Provide clear error messages to users
3. **Progressive Enhancement**: Text input still works if voice features fail
4. **Accessibility**: Voice features enhance but don't replace text input
5. **Testing**: Test with different microphones and speakers
6. **Privacy**: Inform users that audio is sent to OpenAI for processing

---

**Enjoy your voice-enabled interview practice! 🎤✨**


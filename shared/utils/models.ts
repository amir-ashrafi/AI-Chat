export const MODELS = [
  {
    label: 'Claude Haiku 4.5',
    value: 'anthropic/claude-haiku-4.5',
    icon: 'i-simple-icons-anthropic'
  },
  {
    label: 'Groq — Llama 3.3 70B',
    value: 'groq/llama-3.3-70b-versatile',
    icon: 'i-simple-icons-groq'
  },
  {
    label: 'Gemini 3 Flash',
    value: 'google/gemini-3-flash',
    icon: 'i-simple-icons-google'
  },
  {
    label: 'GPT-5 Nano',
    value: 'openai/gpt-5-nano',
    icon: 'i-simple-icons-openai'
  },
  {
    label: 'Qwen 2.5 1.5B (Local)',
    value: 'ollama/qwen2.5:1.5b',
    icon: 'i-simple-icons-alibabacloud'
  },
  {
    label: 'Gemma 2 2B (Local)',
    value: 'ollama/gemma2:2b',
    icon: 'i-simple-icons-google'
  }
]

// Streaming speech-to-text model used for dictation, served through the AI Gateway
export const TRANSCRIPTION_MODEL = 'openai/gpt-realtime-whisper'

// Audio configuration constants
export const VOICE_THRESHOLD = 28
export const REQUIRED_VOICE_SAMPLES = 3
export const MAX_SILENT_FRAMES = 200 // About 0.17 seconds

export const ANALYZER_CONFIG = {
  minDecibels: -90,
  maxDecibels: -10,
  smoothingTimeConstant: 0.1, // Very responsive
  fftSize: 512
}

export const AUDIO_STREAM_CONFIG = {
  audio: {
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true
  }
}

export const API_BASE_URL = 'https://api.acessibilidade.tec.br'
export const API_KEY = '0s43GUYwLLYtcsJudJZAxypxwAnlQKu5wxAffVOu0Vrkb1XSZJFGc7cAzXt0IJkF'

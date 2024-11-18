'use client'
import { useState, useEffect, useRef } from 'react'
import { AudioRecorder } from '../utils/audioRecorder'
import { AudioAnalyzer } from '../utils/audioAnalyzer'
import { ApiService } from '../utils/apiService'
import { VOICE_THRESHOLD, MAX_SILENT_FRAMES } from '../utils/audioConfig'

const API_BASE_URL = 'https://api.acessibilidade.tec.br'
const API_KEY = '0s43GUYwLLYtcsJudJZAxypxwAnlQKu5wxAffVOu0Vrkb1XSZJFGc7cAzXt0IJkF' // Replace with your actual API key

export default function ChatBubble() {
  const [isThinking, setIsThinking] = useState(false)
  const [message, setMessage] = useState('Esperando fala...')
  const [transcription, setTranscription] = useState('')
  const [dots, setDots] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [isRecordingVoice, setIsRecordingVoice] = useState(false)
  const [isPlayingAudio, setIsPlayingAudio] = useState(false)
  const [sessionId, setSessionId] = useState(null)
  const [audioError, setAudioError] = useState(null)
  const audioRef = useRef(null)
  const [isLongText, setIsLongText] = useState(false)
  const thinkingAudioRef = useRef(null)
  const audioRecorderRef = useRef(null)
  const audioAnalyzerRef = useRef(null)
  const apiServiceRef = useRef(new ApiService(API_BASE_URL, API_KEY))

  // Initialize audio recorder and analyzer once
  useEffect(() => {
    audioRecorderRef.current = new AudioRecorder()
    audioAnalyzerRef.current = new AudioAnalyzer()
  }, [])

  // Initialize audio elements once
  useEffect(() => {
    audioRef.current = new Audio()
    thinkingAudioRef.current = new Audio('/music.mp3')
    thinkingAudioRef.current.loop = true
    thinkingAudioRef.current.volume = 0.2
  }, [])

  // Handle dots animation
  useEffect(() => {
    if (!isThinking) return

    const dotsInterval = setInterval(() => {
      setDots(prev => {
        if (prev === '...') return ''
        return prev + '.'
      })
    }, 500)

    return () => clearInterval(dotsInterval)
  }, [isThinking])

  // Initialize API session
  useEffect(() => {
    const initSession = async () => {
      try {
        await apiServiceRef.current.initializeSession()
        setSessionId(apiServiceRef.current.sessionId)
      } catch (error) {
        console.error('Error initializing session:', error)
        setMessage('Erro ao criar sessão')
      }
    }
    initSession()
  }, [])

  const playAudioResponse = async (audioUrl) => {
    try {
      setAudioError(null);

      stopAudioResponse();

      audioRef.current.onended = () => {
        setIsPlayingAudio(false);
        startVoiceDetection();
      };

      audioRef.current.onerror = () => {
        setAudioError('Erro ao reproduzir áudio');
        setIsPlayingAudio(false);
        startVoiceDetection();
      };

      audioRef.current.oncanplaythrough = async () => {
        setIsPlayingAudio(true);
        await audioRef.current.play();
      };

      if (audioUrl) {
        audioRef.current.src = audioUrl;
        audioRef.current.load();
      } else {
        throw new Error('Invalid audio URL');
      }
    } catch (error) {
      setAudioError('Erro ao configurar áudio');
      setIsPlayingAudio(false);
      startVoiceDetection();
    }
  };

  const stopAudioResponse = () => {
    if (audioRef.current) {
      // Remove all event listeners
      audioRef.current.onended = null
      audioRef.current.onerror = null
      audioRef.current.oncanplaythrough = null

      // Stop and cleanup audio
      audioRef.current.pause()
      audioRef.current.currentTime = 0
      setIsPlayingAudio(false)
    }

    if (thinkingAudioRef.current) {
      thinkingAudioRef.current.onended = null
      thinkingAudioRef.current.onerror = null
      thinkingAudioRef.current.pause()
      thinkingAudioRef.current.currentTime = 0
    }
  }

  const playThinkingMusic = () => {
    if (thinkingAudioRef.current) {
      thinkingAudioRef.current.play().catch(error => {
        console.error('Error playing thinking music:', error)
      })
    }
  }

  const stopThinkingMusic = () => {
    if (thinkingAudioRef.current) {
      thinkingAudioRef.current.pause()
      thinkingAudioRef.current.currentTime = 0
    }
  }

  const handleAudioUpload = async audioBlob => {
    setMessage('Processando...')
    playThinkingMusic()

    try {
      const formData = new FormData()
      formData.append('spaceId', '4')
      formData.append('sessionId', String(sessionId))
      formData.append('audioFile', audioBlob, 'audio.wav')

      const response = await fetch(`${API_BASE_URL}/conversation/message`, {
        method: 'POST',
        headers: {
          Authorization: API_KEY
        },
        body: formData
      })

      if (!response.ok) {
        throw new Error('Failed to upload audio')
      }

      const data = await response.json()
      stopThinkingMusic()
      setIsThinking(false)
      setIsProcessing(false)
      setTranscription(data.transcription)
      setMessage('Esperando fala...')
      startVoiceDetection()
      playAudioResponse(data.audioUrl);

    } catch (error) {
      console.error('Error uploading audio:', error)
      stopThinkingMusic()
      setIsThinking(false)
      setIsProcessing(false)
      setMessage('Desculpa, não consegui entender')
      startVoiceDetection()
    }
  }

  const startVoiceDetection = async () => {
    if (isProcessing) return

    try {
      if (!audioAnalyzerRef.current.isInitialized) {
        const initialized = await audioAnalyzerRef.current.initialize()
        if (!initialized) {
          throw new Error('Failed to initialize audio analyzer')
        }
      }

      setIsListening(true)
      setMessage('Esperando fala...')
      setIsRecordingVoice(false)

      let consecutiveSilentFrames = 0
      let isRecording = false

      const checkAudioLevel = () => {
        if (isProcessing) return

        const audioLevel = audioAnalyzerRef.current.getAudioLevel()

        if (audioLevel > VOICE_THRESHOLD) {
          consecutiveSilentFrames = 0

          // If AI is talking, stop it immediately when user speaks
          if (isPlayingAudio) {
            stopAudioResponse()
          }

          if (!isRecording) {
            audioRecorderRef.current.startRecording()
            isRecording = true
            setIsRecordingVoice(true)
            setMessage('Ouvindo...')
            audioRef.current.pause()
          }
        } else {
          consecutiveSilentFrames++
          if (isRecording && consecutiveSilentFrames > MAX_SILENT_FRAMES) {
            isRecording = false
            setIsRecordingVoice(false)
            setMessage('Processando...')
            setIsProcessing(true) // Set processing state to true

            audioRecorderRef.current
              .stopRecording()
              .then(audioBlob => {
                if (audioBlob && audioBlob.size > 0) {
                  return handleAudioUpload(audioBlob) // Return the promise
                } else {
                  setIsProcessing(false) // Reset processing state
                  setMessage('Esperando fala...')
                  startVoiceDetection()
                }
              })
              .catch(error => {
                console.error('Error stopping recording:', error)
                setIsProcessing(false) // Reset processing state
                setMessage('Desculpa, não consegui entender')
                startVoiceDetection()
              })

            return
          }
        }
        requestAnimationFrame(checkAudioLevel)
      }

      checkAudioLevel()
    } catch (error) {
      console.error('Failed to start voice detection:', error)
      setIsListening(false)
      setIsRecordingVoice(false)
      setMessage('Erro ao acessar microfone')
      // Retry after a delay
      setTimeout(startVoiceDetection, 1000)
    }
  }

  // Start voice detection on component mount
  useEffect(() => {
    if (sessionId) {
      startVoiceDetection()
    }

    return () => {
      // Cleanup audio analyzer
      if (audioAnalyzerRef.current) {
        audioAnalyzerRef.current.cleanup()
      }

      // Stop recording if active
      if (audioRecorderRef.current && audioRecorderRef.current.isRecording) {
        audioRecorderRef.current.stopRecording()
      }

      setIsListening(false)
      setIsProcessing(false)
    }
  }, [sessionId])

  return (
    <div
      className={`
        min-h-screen flex flex-col items-center justify-center relative
        transition-all duration-700 ease-in-out
        ${
          isRecordingVoice
            ? 'bg-gradient-to-br from-violet-50 to-fuchsia-50'
            : 'bg-white'
        }
      `}
    >
      {/* Voice Activity Indicator */}
      <div className="absolute top-8 right-8">
        <div
          className={`
            w-4 h-4 rounded-full 
            ${
              isListening && !isProcessing && !isRecordingVoice
                ? 'bg-green-500 animate-pulse'
                : isRecordingVoice
                ? 'bg-red-500 animate-pulse'
                : isProcessing
                ? 'bg-yellow-500 animate-pulse'
                : 'bg-gray-300'
            }
          `}
        />
      </div>

      {/* Main Circle */}
      <div
        className={`
          relative
          rounded-full 
          bg-gradient-to-br from-violet-600 to-violet-900
          shadow-[0_8px_30px_rgb(0,0,0,0.12)]
          flex items-center justify-center
          transition-all duration-700 ease-in-out
          ${isThinking ? 'animate-pulse' : 'animate-float'}
          ${
            isRecordingVoice
              ? 'shadow-[0_0_50px_rgba(139,92,246,0.3)]'
              : ''
          }
          ${
            isLongText
              ? 'w-32 h-32 md:w-40 md:h-40 mb-4 scale-95'
              : 'w-48 h-48 md:w-80 md:h-80 mb-8'
          }
          select-none
        `}
      >
        {/* Voice Wave Animation */}
        {isListening && !isProcessing && !isRecordingVoice && (
          <div className="absolute inset-0">
            <div className="absolute inset-0 animate-ping-slow opacity-75 rounded-full border-4 border-violet-300" />
            <div className="absolute inset-0 animate-ping-slower opacity-50 rounded-full border-4 border-violet-200" />
          </div>
        )}
      </div>

      {/* Status Message */}
      <div
        className={`
          flex justify-center items-center text-2xl tracking-wide mb-4
          transition-all duration-700 ease-in-out
          ${isLongText ? 'w-[80%] max-w-2xl' : 'w-80'}
        `}
      >
        <div className="relative flex justify-center items-center">
          <span
            className={`
              font-medium text-center
              bg-gradient-to-r from-violet-600 to-violet-900 bg-clip-text
              transition-all duration-300
              ${
                isThinking || isRecordingVoice
                  ? 'animate-pulse-text opacity-50'
                  : 'text-transparent'
              }
              ${isLongText ? 'text-xl leading-relaxed' : 'text-2xl'}
            `}
          >
            {message}
          </span>
          {(isThinking || isRecordingVoice) && (
            <span className="bg-gradient-to-r from-violet-600 to-violet-900 bg-clip-text animate-pulse-text opacity-50">
              {dots}
            </span>
          )}
        </div>
      </div>

      {/* Transcription Display */}
      {transcription && (
        <div className="w-[80%] max-w-2xl mt-8 p-6 rounded-lg bg-white/80 backdrop-blur-sm shadow-lg">
          <p className="text-lg text-gray-700 leading-relaxed">
            {transcription}
          </p>
        </div>
      )}
    </div>
  )
}
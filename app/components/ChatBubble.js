'use client'
import { useState, useEffect, useRef } from 'react'
import { AudioRecorder } from '../utils/audioRecorder'
import { AudioAnalyzer } from '../utils/audioAnalyzer'
import { ApiService } from '../utils/apiService'
import { VOICE_THRESHOLD, MAX_SILENT_FRAMES } from '../utils/audioConfig'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

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
  const apiServiceRef = useRef(new ApiService())
  const [isAutoMode, setIsAutoMode] = useState(true)

  // Initialize audio recorder and analyzer once
  useEffect(() => {
    audioRecorderRef.current = new AudioRecorder()
    audioAnalyzerRef.current = new AudioAnalyzer()
    
    return () => {
      cleanupAudio()
    }
  }, [])

  // Cleanup function for audio resources
  const cleanupAudio = () => {
    if (audioAnalyzerRef.current) {
      audioAnalyzerRef.current.cleanup()
      audioAnalyzerRef.current.stopAnalyzing()
    }
    
    if (audioRecorderRef.current && audioRecorderRef.current.isRecording) {
      audioRecorderRef.current.stopRecording()
    }

    // Don't reset messages if processing
    if (!isProcessing) {
      setIsListening(false)
      setIsRecordingVoice(false)
    }
  }

  // Handle mode switching
  const toggleMode = () => {
    cleanupAudio()
    
    setIsAutoMode(prev => {
      const newMode = !prev
      if (newMode) {
        // Initialize auto mode
        if (!isProcessing) {
          initializeAutoMode()
        }
      } else {
        // When switching to manual, ensure analyzer is fully cleaned up
        if (audioAnalyzerRef.current) {
          audioAnalyzerRef.current.cleanup()
        }
        if (!isProcessing) {
          setMessage('Clique para gravar')
        }
      }
      return newMode
    })
  }

  // Initialize auto mode
  const initializeAutoMode = async () => {
    try {
      // First request microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      stream.getTracks().forEach(track => track.stop()) // Stop initial stream
      
      // Then initialize analyzer
      const initialized = await audioAnalyzerRef.current.initialize()
      if (!initialized) {
        throw new Error('Failed to initialize analyzer')
      }
      
      audioAnalyzerRef.current.startAnalyzing() // Start analyzing explicitly
      startVoiceDetection()
    } catch (error) {
      console.error('Failed to initialize auto mode:', error)
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        setMessage('Permissão do microfone negada')
      } else {
        setMessage('Erro ao inicializar modo automático')
      }
      setIsAutoMode(false)
    }
  }

  // Auto mode voice detection
  const startVoiceDetection = async () => {
    if (!isAutoMode || isProcessing) return

    try {
      if (!audioAnalyzerRef.current.isInitialized) {
        const initialized = await audioAnalyzerRef.current.initialize()
        if (!initialized) {
          throw new Error('Failed to initialize analyzer')
        }
      }

      audioAnalyzerRef.current.startAnalyzing()
      setIsListening(true)
      setMessage('Esperando fala...')

      let consecutiveSilentFrames = 0
      let isRecording = false

      const checkAudioLevel = () => {
        if (!isAutoMode || isProcessing) return

        const audioLevel = audioAnalyzerRef.current.getAudioLevel()

        if (audioLevel > VOICE_THRESHOLD) {
          handleVoiceDetected(isRecording)
          consecutiveSilentFrames = 0
          isRecording = true
        } else {
          consecutiveSilentFrames++
          if (isRecording && consecutiveSilentFrames > MAX_SILENT_FRAMES) {
            handleSilenceDetected()
            isRecording = false
            return
          }
        }

        if (isAutoMode) {
          requestAnimationFrame(checkAudioLevel)
        }
      }

      checkAudioLevel()
    } catch (error) {
      console.error('Voice detection error:', error)
      setMessage('Erro ao detectar voz')
      setIsAutoMode(false)
    }
  }

  // Handle voice detected in auto mode
  const handleVoiceDetected = (isRecording) => {
    if (!isRecording) {
      // Stop any playing audio before starting recording
      stopAudioResponse()
      setTranscription('')
      audioRecorderRef.current.startRecording()
      setIsRecordingVoice(true)
      setMessage('Ouvindo...')
    }
  }

  // Handle silence detected in auto mode
  const handleSilenceDetected = async () => {
    setIsRecordingVoice(false)
    setMessage('Processando...')
    setIsProcessing(true)

    try {
      const audioBlob = await audioRecorderRef.current.stopRecording()
      if (audioBlob?.size > 0) {
        await handleAudioUpload(audioBlob)
      } else {
        resetRecordingState()
      }
    } catch (error) {
      console.error('Error handling silence:', error)
      resetRecordingState()
    }
  }

  // Handle manual recording
  const handleManualRecording = async () => {
    if (isProcessing) return

    try {
      if (!isRecordingVoice) {
        // Stop any playing audio before starting recording
        stopAudioResponse()
        setTranscription('')
        await audioRecorderRef.current.startRecording()
        setIsRecordingVoice(true)
        setMessage('Gravando...')
      } else {
        // Stop recording and process
        setIsRecordingVoice(false)
        setMessage('Processando...')
        setIsProcessing(true)
        
        const audioBlob = await audioRecorderRef.current.stopRecording()
        if (audioBlob?.size > 0) {
          await handleAudioUpload(audioBlob)
        } else {
          setIsProcessing(false)
          setMessage('Clique para gravar')
        }
      }
    } catch (error) {
      console.error('Error in manual recording:', error)
      setIsProcessing(false)
      setIsRecordingVoice(false)
      setMessage('Clique para gravar')
    }
  }

  // Reset recording state
  const resetRecordingState = () => {
    setIsProcessing(false)
    setIsRecordingVoice(false)
    setMessage('Esperando fala...')
    if (isAutoMode) {
      startVoiceDetection()
    }
  }

  // Handle audio upload and response
  const handleAudioUpload = async (audioBlob) => {
    setMessage('Processando...')
    playThinkingMusic()

    try {
      // Create proper audio blob with correct type
      const properAudioBlob = new Blob([audioBlob], { type: 'audio/webm' })
      
      const formData = new FormData()
      formData.append('spaceId', '4')
      formData.append('sessionId', String(sessionId))
      formData.append('audioFile', properAudioBlob, 'audio.webm') // Change extension to webm

      const response = await fetch(`${API_BASE_URL}/conversation/message`, {
        method: 'POST',
        headers: { 
          'Authorization': "0s43GUYwLLYtcsJudJZAxypxwAnlQKu5wxAffVOu0Vrkb1XSZJFGc7cAzXt0IJkF",
          // Remove content-type header to let browser set it with boundary
        },
        body: formData
      })

      if (!response.ok) {
        console.error('Upload failed with status:', response.status)
        throw new Error('Upload failed')
      }

      const data = await response.json()
      handleSuccessfulUpload(data)
    } catch (error) {
      console.error('Upload error:', error)
      handleFailedUpload()
    }
  }

  const handleSuccessfulUpload = (data) => {
    stopThinkingMusic()
    setIsThinking(false)
    setIsProcessing(false)
    setTranscription(data.transcription)
    
    // Set correct message based on current mode
    setMessage(isAutoMode ? 'Esperando fala...' : 'Clique para gravar')
    
    if (isAutoMode) {
      startVoiceDetection()
    }
    
    playAudioResponse(data.audioUrl)
  }

  const handleFailedUpload = () => {
    stopThinkingMusic()
    setIsThinking(false)
    setIsProcessing(false)
    setMessage('Desculpa, não consegui entender')
    
    // After error message, set appropriate mode message after a delay
    setTimeout(() => {
      setMessage(isAutoMode ? 'Esperando fala...' : 'Clique para gravar')
    }, 2000)
    
    if (isAutoMode) {
      startVoiceDetection()
    }
  }

  // Initialize session when component mounts
  useEffect(() => {
    if (sessionId && isAutoMode) {
      initializeAutoMode()
    }
  }, [sessionId, isAutoMode])

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

  // Initialize audio elements once
  useEffect(() => {
    audioRef.current = new Audio()
    thinkingAudioRef.current = new Audio('/music.mp3')
    thinkingAudioRef.current.loop = true
    thinkingAudioRef.current.volume = 0.2

    return () => {
      // Cleanup on unmount
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.src = ''
      }
      if (thinkingAudioRef.current) {
        thinkingAudioRef.current.pause()
        thinkingAudioRef.current.src = ''
      }
    }
  }, [])

  return (
    <div
      className={`
        min-h-screen flex flex-col items-center justify-center relative
        transition-all duration-700 ease-in-out
        ${isRecordingVoice ? 'bg-gradient-to-br from-violet-50 to-fuchsia-50' : 'bg-white'}
        ${!isAutoMode && !isProcessing ? 'cursor-pointer' : ''}
      `}
      onClick={() => !isAutoMode && !isProcessing && handleManualRecording()}
    >
      {/* Mode Toggle */}
      <div 
        className="absolute top-8 left-8 flex items-center gap-2"
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={toggleMode}
          disabled={isProcessing || isRecordingVoice}
          className={`
            px-4 py-2 rounded-full text-sm font-medium
            transition-all duration-300
            ${isAutoMode 
              ? 'bg-violet-600 text-white' 
              : 'bg-gray-200 text-gray-700'}
            ${(isProcessing || isRecordingVoice) 
              ? 'opacity-50 cursor-not-allowed' 
              : 'hover:opacity-90'}
          `}
        >
          Auto
        </button>
        <button
          onClick={toggleMode}
          disabled={isProcessing || isRecordingVoice}
          className={`
            px-4 py-2 rounded-full text-sm font-medium
            transition-all duration-300
            ${!isAutoMode 
              ? 'bg-violet-600 text-white' 
              : 'bg-gray-200 text-gray-700'}
            ${(isProcessing || isRecordingVoice) 
              ? 'opacity-50 cursor-not-allowed' 
              : 'hover:opacity-90'}
          `}
        >
          Manual
        </button>
      </div>

      {/* Voice Activity Indicator */}
      <div 
        className="absolute top-8 right-8"
        onClick={e => e.stopPropagation()}
      >
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
          ${isRecordingVoice ? 'shadow-[0_0_50px_rgba(139,92,246,0.3)]' : ''}
          ${(message.length > 50 || (transcription && transcription.split(' ').length > 50)) 
            ? 'w-32 h-32 md:w-40 md:h-40 mb-4 scale-95' 
            : 'w-48 h-48 md:w-80 md:h-80 mb-8'}
          ${!isAutoMode && !isProcessing && !isRecordingVoice ? 'hover:scale-105' : ''}
          select-none
        `}
      >
        {/* Remove the text from circle */}
      </div>

      {/* Status Message */}
      <div
        className={`
          flex justify-center items-center text-2xl tracking-wide mb-4
          transition-all duration-700 ease-in-out
          ${(message.length > 50 || (transcription && transcription.split(' ').length > 50)) 
            ? 'w-[80%] max-w-2xl' 
            : 'w-80'}
        `}
      >
        <div className="relative flex justify-center items-center">
          <span
            className={`
              font-medium text-center
              bg-gradient-to-r from-violet-600 to-violet-900 bg-clip-text
              transition-all duration-300
              ${isThinking || isRecordingVoice ? 'animate-pulse-text opacity-50' : 'text-transparent'}
              ${(message.length > 50 || (transcription && transcription.split(' ').length > 50)) 
                ? 'text-xl leading-relaxed' 
                : 'text-2xl'}
            `}
          >
            {!isAutoMode && !isRecordingVoice && !isProcessing ? 'Clique para gravar' : message}
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
        <div className="w-[80%] max-w-2xl mt-8">
          <p className="text-lg leading-relaxed font-medium text-center bg-gradient-to-r from-violet-600 to-violet-900 bg-clip-text text-transparent">
            {transcription}
          </p>
        </div>
      )}
    </div>
  )
}
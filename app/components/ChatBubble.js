'use client'
import { useState, useEffect, useRef } from 'react'

const API_BASE_URL = 'https://api.acessibilidade.tec.br'
const API_KEY = '0s43GUYwLLYtcsJudJZAxypxwAnlQKu5wxAffVOu0Vrkb1XSZJFGc7cAzXt0IJkF'

export default function ChatBubble() {
  const [isThinking, setIsThinking] = useState(false)
  const [message, setMessage] = useState("Clique para começar a gravar")
  const [dots, setDots] = useState("")
  const [isRecording, setIsRecording] = useState(false)
  const mediaRecorderRef = useRef(null)
  const audioChunksRef = useRef([])
  const [sessionId, setSessionId] = useState(null)
  const audioRef = useRef(null)
  const [isLongText, setIsLongText] = useState(false)

  // Get initial session
  useEffect(() => {
    const getSession = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/conversation/session`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Authorization': API_KEY
          }
        })
        
        if (!response.ok) {
          throw new Error('Failed to get session')
        }
        
        const data = await response.json()
        console.log('Session created:', data)
        setSessionId(data.sessionId)
      } catch (error) {
        console.error('Error getting session:', error)
        setMessage("Erro ao iniciar sessão. Recarregue a página.")
      }
    }
    getSession()
  }, [])

  // Handle dots animation
  useEffect(() => {
    if (!isThinking) return

    const dotsInterval = setInterval(() => {
      setDots(prev => {
        if (prev === "...") return ""
        return prev + "."
      })
    }, 500)

    return () => clearInterval(dotsInterval)
  }, [isThinking])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaRecorderRef.current = new MediaRecorder(stream)
      audioChunksRef.current = []

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data)
      }

      // Request data every 250ms to ensure we get the audio chunks
      mediaRecorderRef.current.start(250)
      setIsRecording(true)
      setMessage("Ouvindo...")
    } catch (error) {
      console.error('Error starting recording:', error)
      setMessage("Erro ao acessar microfone")
    }
  }

  const stopRecording = async () => {
    if (!mediaRecorderRef.current) return null

    return new Promise((resolve) => {
      mediaRecorderRef.current.onstop = async () => {
        if (audioChunksRef.current.length === 0) {
          console.error('No audio data recorded')
          resolve(null)
          return
        }
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' })
        resolve(audioBlob)
      }
      mediaRecorderRef.current.stop()
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop())
    })
  }

  const playAudioResponse = async (audioUrl) => {
    try {
      if (!audioRef.current) {
        audioRef.current = new window.Audio()
      }
      
      // Stop any currently playing audio
      audioRef.current.pause()
      audioRef.current.src = ''

      // Create and play new audio
      audioRef.current.src = audioUrl
      await audioRef.current.play()
    } catch (error) {
      console.error('Error playing audio:', error)
    }
  }

  const handleAudioUpload = async (audioBlob) => {
    if (!sessionId) {
      setMessage("Erro: Sessão não iniciada")
      return
    }

    setIsThinking(true)
    setMessage("Pensando")
    
    try {
      const formData = new FormData()
      formData.append('spaceId', '4')
      formData.append('sessionId', String(sessionId))
      formData.append('audioFile', audioBlob, 'audio.wav')

      const response = await fetch(`${API_BASE_URL}/conversation/message`, {
        method: 'POST',
        headers: {
          'Authorization': API_KEY
        },
        body: formData
      })

      if (!response.ok) {
        throw new Error('Failed to upload audio')
      }

      const data = await response.json()
      setIsThinking(false)
      setMessage(data.transcription)

      // Play the audio response if available
      if (data.audioUrl) {
        await playAudioResponse(data.audioUrl)
      }
    } catch (error) {
      console.error('Error uploading audio:', error)
      setIsThinking(false)
      setMessage("Erro ao processar áudio. Tente novamente.")
    }
  }

  // Cleanup audio on component unmount
  useEffect(() => {
    // Initialize audio on client side
    audioRef.current = new window.Audio()
    
    // Cleanup on unmount
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.src = ''
      }
    }
  }, [])

  const handleClick = async (e) => {
    e.preventDefault()
    
    if (!isRecording) {
      // Start recording
      startRecording()
    } else {
      // Stop recording
      if (!mediaRecorderRef.current) return
      
      setIsRecording(false)
      mediaRecorderRef.current.stop()
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop())
      
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' })
      await handleAudioUpload(audioBlob)
    }
  }

  // Update isLongText whenever message changes
  useEffect(() => {
    setIsLongText(message.length > 50)
  }, [message])

  return (
    <div className={`
      min-h-screen flex flex-col items-center justify-center relative
      transition-all duration-700 ease-in-out
      ${isRecording 
        ? 'bg-gradient-to-br from-violet-50 to-fuchsia-50' 
        : 'bg-white'
      }
    `}>
      <div 
        className={`
          rounded-full 
          bg-gradient-to-br from-violet-600 to-violet-900
          shadow-[0_8px_30px_rgb(0,0,0,0.12)]
          flex items-center justify-center
          transition-all duration-700 ease-in-out
          ${isThinking ? 'animate-pulse' : 'animate-float'}
          ${isRecording ? 'shadow-[0_0_50px_rgba(139,92,246,0.3)]' : ''}
          ${isLongText 
            ? 'w-40 h-40 mb-4 scale-95' 
            : 'w-80 h-80 mb-8'
          }
          cursor-pointer
          select-none
        `}
        onClick={handleClick}
      />
      <div className={`
        flex justify-center items-center text-2xl tracking-wide
        transition-all duration-700 ease-in-out
        ${isLongText ? 'w-[80%] max-w-2xl' : 'w-80'}
      `}>
        <div className="relative flex justify-center items-center">
          <span className={`
            font-medium text-center
            bg-gradient-to-r from-violet-600 to-violet-900 bg-clip-text
            transition-all duration-300
            ${isThinking || isRecording
              ? 'animate-pulse-text opacity-50' 
              : 'text-transparent'
            }
            ${isLongText ? 'text-xl leading-relaxed' : 'text-2xl'}
          `}>
            {message}
          </span>
          {(isThinking || isRecording) && (
            <span className="bg-gradient-to-r from-violet-600 to-violet-900 bg-clip-text animate-pulse-text opacity-50">
              {dots}
            </span>
          )}
        </div>
      </div>
    </div>
  )
} 
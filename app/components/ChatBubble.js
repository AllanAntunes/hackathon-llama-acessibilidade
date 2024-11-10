'use client'
import { useState, useEffect, useRef } from 'react'

const API_BASE_URL = 'http://api.acessibilidade.tec.br'
const API_KEY = '0s43GUYwLLYtcsJudJZAxypxwAnlQKu5wxAffVOu0Vrkb1XSZJFGc7cAzXt0IJkF'

export default function ChatBubble() {
  const [isThinking, setIsThinking] = useState(false)
  const [message, setMessage] = useState("Pressione e segure para falar")
  const [dots, setDots] = useState("")
  const [isRecording, setIsRecording] = useState(false)
  const mediaRecorderRef = useRef(null)
  const audioChunksRef = useRef([])
  const [sessionId, setSessionId] = useState(null)
  const audioRef = useRef(new Audio())

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
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorderRef.current.start()
      setIsRecording(true)
      setMessage("Ouvindo...")
    } catch (error) {
      console.error('Error starting recording:', error)
    }
  }

  const stopRecording = async () => {
    if (!mediaRecorderRef.current) return

    return new Promise(resolve => {
      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' })
        resolve(audioBlob)
      }
      mediaRecorderRef.current.stop()
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop())
    })
  }

  const playAudioResponse = async (audioUrl) => {
    try {
      // Stop any currently playing audio
      audioRef.current.pause()
      audioRef.current.src = ''

      // Create and play new audio
      audioRef.current = new Audio(audioUrl)
      await audioRef.current.play()
    } catch (error) {
      console.error('Error playing audio:', error)
    }
  }

  const handleAudioUpload = async (audioBlob) => {
    setIsThinking(true)
    setMessage("Pensando")
    
    try {
      const formData = new FormData()
      formData.append('sessionId', '4')
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
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.src = ''
      }
    }
  }, [])

  const handleTouchStart = async (e) => {
    e.preventDefault()
    await startRecording()
  }

  const handleTouchEnd = async (e) => {
    e.preventDefault()
    setIsRecording(false)
    const audioBlob = await stopRecording()
    await handleAudioUpload(audioBlob)
  }

  return (
    <div className={`
      min-h-screen flex flex-col items-center justify-center
      transition-all duration-700 ease-in-out
      ${isRecording 
        ? 'bg-gradient-to-br from-violet-50 to-fuchsia-50' 
        : 'bg-white'
      }
    `}>
      <div 
        className={`
          w-80 h-80 rounded-full 
          bg-gradient-to-br from-violet-600 to-violet-900
          shadow-[0_8px_30px_rgb(0,0,0,0.12)]
          flex items-center justify-center
          transition-all duration-500 ease-in-out
          ${isThinking ? 'animate-pulse' : 'animate-float'}
          ${isRecording ? 'scale-95 shadow-[0_0_50px_rgba(139,92,246,0.3)]' : ''}
          mb-8
          cursor-pointer
          select-none
        `}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleTouchStart}
        onMouseUp={handleTouchEnd}
        onMouseLeave={handleTouchEnd}
      />
      <div className="w-80 flex justify-center items-center text-2xl tracking-wide">
        <div className="relative flex justify-center items-center">
          <span className={`
            font-medium text-center
            bg-gradient-to-r from-violet-600 to-violet-900 bg-clip-text
            ${isThinking || isRecording
              ? 'animate-pulse-text opacity-50' 
              : 'text-transparent'
            }
            transition-opacity duration-300
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
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL
const AUTH_KEY = process.env.NEXT_PUBLIC_AUTH_KEY

export class ApiService {
  constructor() {
    this.sessionId = null
  }

  async initializeSession() {
    try {
      const response = await fetch(`${API_BASE_URL}/conversation/session`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Authorization': "0s43GUYwLLYtcsJudJZAxypxwAnlQKu5wxAffVOu0Vrkb1XSZJFGc7cAzXt0IJkF"
        }
      })
      
      if (!response.ok) {
        throw new Error('Failed to get session')
      }
      
      const data = await response.json()
      this.sessionId = data.sessionId
      return data.sessionId
    } catch (error) {
      throw error
    }
  }

  async sendAudioMessage(audioBlob) {
    if (!this.sessionId || !audioBlob) {
      throw new Error('Session ID or audio data missing')
    }

    const formData = new FormData()
    formData.append('spaceId', '4')
    formData.append('sessionId', this.sessionId)
    formData.append('audioFile', audioBlob, 'audio.webm')

    try {
      const response = await fetch(`${API_BASE_URL}/conversation/message`, {
        method: 'POST',
        headers: {
          'Authorization': "0s43GUYwLLYtcsJudJZAxypxwAnlQKu5wxAffVOu0Vrkb1XSZJFGc7cAzXt0IJkF",
        },
        body: formData
      })

      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`)
      }

      const data = await response.json()
      
      if (data.sessionId) {
        this.sessionId = data.sessionId
      }

      return data
    } catch (error) {
      throw error
    }
  }
}

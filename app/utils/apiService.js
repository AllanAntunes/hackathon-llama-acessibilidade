import { API_BASE_URL, API_KEY } from './audioConfig'

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
          'Authorization': API_KEY
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
          'Authorization': API_KEY,
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

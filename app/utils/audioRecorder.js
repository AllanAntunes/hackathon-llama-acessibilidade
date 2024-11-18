export class AudioRecorder {
  constructor() {
    this.mediaRecorder = null
    this.audioChunks = []
    this.isRecording = false
  }

  async startRecording() {
    try {
      if (this.isRecording) {
        await this.stopRecording()
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      this.audioChunks = []
      
      this.mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      })

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data)
        }
      }

      this.mediaRecorder.onstop = () => {
        stream.getTracks().forEach(track => track.stop())
      }

      this.mediaRecorder.start(100)
      this.isRecording = true
      return true
    } catch (error) {
      this.isRecording = false
      return false
    }
  }

  async stopRecording() {
    return new Promise((resolve) => {
      if (!this.mediaRecorder || !this.isRecording) {
        this.isRecording = false
        resolve(null)
        return
      }
      
      // Set up the onstop handler before stopping
      this.mediaRecorder.onstop = () => {
        this.isRecording = false

        if (this.audioChunks.length === 0) {
          resolve(null)
          return
        }

        const audioBlob = new Blob(this.audioChunks, { 
          type: 'audio/webm;codecs=opus' 
        })
        
        // Clear the chunks array
        this.audioChunks = []
        
        // Stop all tracks
        if (this.mediaRecorder.stream) {
          this.mediaRecorder.stream.getTracks().forEach(track => track.stop())
        }
        
        resolve(audioBlob)
      }

      // Actually stop the recording
      try {
        this.mediaRecorder.stop()
      } catch (error) {
        this.isRecording = false
        resolve(null)
      }
    })
  }

  isCurrentlyRecording() {
    return this.isRecording
  }
}

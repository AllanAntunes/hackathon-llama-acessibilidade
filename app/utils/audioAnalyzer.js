// utils/audioAnalyzer.js
import { ANALYZER_CONFIG, AUDIO_STREAM_CONFIG } from './audioConfig'

export class AudioAnalyzer {
  constructor() {
    this.audioContext = null
    this.analyzer = null
    this.mediaStream = null
    this.source = null
    this.isInitialized = false
    this.dataArray = null
    this.bufferLength = 0
    this.lastAverages = []
    this.averageWindow = 5
    this.lastNonZeroTime = Date.now()
    this.isActive = false
  }

  async initialize() {
    try {
      if (this.isInitialized) {
        return true
      }

      this.audioContext = new (window.AudioContext || window.webkitAudioContext)()
      this.analyzer = this.audioContext.createAnalyser()
      Object.assign(this.analyzer, ANALYZER_CONFIG)

      this.mediaStream = await navigator.mediaDevices.getUserMedia(AUDIO_STREAM_CONFIG)
      this.source = this.audioContext.createMediaStreamSource(this.mediaStream)
      this.source.connect(this.analyzer)

      this.bufferLength = this.analyzer.frequencyBinCount
      this.dataArray = new Uint8Array(this.bufferLength)
      this.lastAverages = []
      this.lastNonZeroTime = Date.now()

      this.isInitialized = true
      return true
    } catch (error) {
      console.error('AudioAnalyzer initialize error:', error)
      this.cleanup()
      return false
    }
  }

  startAnalyzing() {
    this.isActive = true
  }

  stopAnalyzing() {
    this.isActive = false
  }

  getAudioLevel() {
    if (!this.isInitialized || !this.analyzer || !this.isActive) {
      return 0
    }

    this.analyzer.getByteFrequencyData(this.dataArray)

    // Check if we're getting any non-zero values
    const hasNonZero = this.dataArray.some(value => value > 0)
    const currentTime = Date.now()

    // Calculate the current average
    const currentAverage =
      this.dataArray.reduce((acc, value) => acc + value, 0) / this.bufferLength

    // Add to moving average window
    this.lastAverages.push(currentAverage)
    if (this.lastAverages.length > this.averageWindow) {
      this.lastAverages.shift()
    }

    // Use moving average to smooth out fluctuations
    const movingAverage =
      this.lastAverages.reduce((acc, val) => acc + val, 0) /
      this.lastAverages.length

    // Update last non-zero time if we detect any signal
    if (hasNonZero && movingAverage > 0.5) {
      this.lastNonZeroTime = currentTime
    }

    // Check if we haven't received any real signal for more than 0.5 seconds
    const timeSinceLastSignal = currentTime - this.lastNonZeroTime

    // If we haven't received any real signal for more than 0.5 seconds,
    // treat it as complete silence
    if (timeSinceLastSignal > 500) {
      return 0
    }
    return movingAverage
  }

  cleanup() {
    try {
      this.isActive = false
      
      if (this.source) {
        this.source.disconnect()
        this.source = null
      }

      if (this.mediaStream) {
        this.mediaStream.getTracks().forEach(track => track.stop())
        this.mediaStream = null
      }

      if (this.audioContext) {
        this.audioContext.close()
        this.audioContext = null
      }

      this.analyzer = null
      this.dataArray = null
      this.lastAverages = []
      this.lastNonZeroTime = Date.now()
      this.isInitialized = false
    } catch (error) {
      console.error('Error during AudioAnalyzer cleanup:', error)
    }
  }
}
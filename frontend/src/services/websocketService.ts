import { appConfig } from '../config/appConfig'
import type { RealtimeUpdateMessage } from '../types/realtime'
import { mockEquipment, mockPersonnel, mockWorkpieces } from '../mocks/realtimeMock'

type MessageHandler = (message: RealtimeUpdateMessage) => void

export class RealtimeWebSocket {
  private socket: WebSocket | null = null
  private handler: MessageHandler
  private reconnectAttempts = 0
  private heartbeatTimer?: number

  constructor(handler: MessageHandler) {
    this.handler = handler
    if (appConfig.useMock || !appConfig.wsUrl) {
      this.startMockStream()
    } else {
      this.connect()
    }
  }

  private connect() {
    this.socket = new WebSocket(appConfig.wsUrl)
    this.socket.onopen = () => {
      this.reconnectAttempts = 0
      this.startHeartbeat()
    }
    this.socket.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data) as RealtimeUpdateMessage
        this.handler(payload)
      } catch (error) {
        console.error('Failed to parse realtime payload', error)
      }
    }
    this.socket.onclose = () => {
      this.stopHeartbeat()
      this.scheduleReconnect()
    }
    this.socket.onerror = () => {
      this.socket?.close()
    }
  }

  private scheduleReconnect() {
    const delay = Math.min(8000, 1000 * 2 ** this.reconnectAttempts)
    this.reconnectAttempts += 1
    window.setTimeout(() => this.connect(), delay)
  }

  private startHeartbeat() {
    this.stopHeartbeat()
    this.heartbeatTimer = window.setInterval(() => {
      if (this.socket && this.socket.readyState === WebSocket.OPEN) {
        this.socket.send(JSON.stringify({ type: 'ping' }))
      }
    }, 30000)
  }

  private stopHeartbeat() {
    if (this.heartbeatTimer) {
      window.clearInterval(this.heartbeatTimer)
      this.heartbeatTimer = undefined
    }
  }

  private startMockStream() {
    window.setInterval(() => {
      const randomEquipment = mockEquipment[Math.floor(Math.random() * mockEquipment.length)]
      const randomWorkpiece = mockWorkpieces[Math.floor(Math.random() * mockWorkpieces.length)]
      const randomPersonnel = mockPersonnel[Math.floor(Math.random() * mockPersonnel.length)]
      const payload: RealtimeUpdateMessage = {
        type: 'entityUpdate',
        timestamp: new Date().toISOString(),
        entities: [randomEquipment, randomWorkpiece, randomPersonnel],
      }
      this.handler(payload)
    }, 3000)
  }

  close() {
    this.stopHeartbeat()
    this.socket?.close()
  }
}


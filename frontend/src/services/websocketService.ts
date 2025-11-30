import { appConfig } from '../config/appConfig'
import type { RealtimeUpdateMessage } from '../types/realtime'

type MessageHandler = (message: RealtimeUpdateMessage) => void

export class RealtimeWebSocket {
  private socket: WebSocket | null = null
  private handler: MessageHandler
  private reconnectAttempts = 0
  private heartbeatTimer?: number
  private _reconnectTimeoutId?: number

  constructor(handler: MessageHandler) {
    this.handler = handler
    console.log('[WebSocket] 初始化，wsUrl:', appConfig.wsUrl)
    this.connect()
  }

  private connect() {
    // 确保WebSocket URL正确
    let wsUrl = appConfig.wsUrl || ''
    
    // 如果URL路径不正确，自动修复
    if (wsUrl) {
      // 修复路径：/realtime/ws -> /api/v1/realtime/ws
      if (wsUrl.includes('/realtime/ws') && !wsUrl.includes('/api/v1/realtime/ws')) {
        wsUrl = wsUrl.replace('/realtime/ws', '/api/v1/realtime/ws')
        console.warn('[WebSocket] URL路径已修复:', wsUrl)
      }
      // 修复主机名：backend -> localhost
      if (wsUrl.includes('backend:8000')) {
        wsUrl = wsUrl.replace('backend:8000', 'localhost:8000')
        console.warn('[WebSocket] 主机名已修复:', wsUrl)
      }
    } else {
      // 如果没有URL，使用默认值
      wsUrl = 'ws://localhost:8000/api/v1/realtime/ws'
      console.warn('[WebSocket] 使用默认URL:', wsUrl)
    }
    
    console.log('[WebSocket] 连接URL:', wsUrl)
    
    try {
      this.socket = new WebSocket(wsUrl)
      this.socket.onopen = () => {
        console.log('[WebSocket] 连接成功')
        this.reconnectAttempts = 0
        this.startHeartbeat()
      }
      this.socket.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data) as RealtimeUpdateMessage
          this.handler(payload)
        } catch (error) {
          console.error('[WebSocket] Failed to parse realtime payload', error)
        }
      }
      this.socket.onclose = (event) => {
        console.log('[WebSocket] 连接关闭', { code: event.code, reason: event.reason })
        this.stopHeartbeat()
        if (event.code !== 1000) {
          // 非正常关闭，尝试重连
          this.scheduleReconnect()
        }
      }
      this.socket.onerror = (error) => {
        console.error('[WebSocket] 连接错误:', error)
        this.socket?.close()
      }
    } catch (error) {
      console.error('[WebSocket] 创建WebSocket连接失败:', error)
      this.scheduleReconnect()
    }
  }

  private scheduleReconnect() {
    // 限制最大重连次数，避免无限重连
    if (this.reconnectAttempts >= 10) {
      console.error('[WebSocket] 重连次数过多，停止重连。请检查后端服务是否正常运行。')
      return
    }
    const delay = Math.min(8000, 1000 * 2 ** this.reconnectAttempts)
    this.reconnectAttempts += 1
    console.log(`[WebSocket] ${delay}ms后尝试重连 (第${this.reconnectAttempts}次)`)
    const timeoutId = window.setTimeout(() => this.connect(), delay)
    // 存储timeout ID以便清理
    this._reconnectTimeoutId = timeoutId
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

  close() {
    this.stopHeartbeat()
    // 清理重连定时器
    if (this._reconnectTimeoutId) {
      window.clearTimeout(this._reconnectTimeoutId)
      this._reconnectTimeoutId = undefined
    }
    // 重置重连次数
    this.reconnectAttempts = 0
    this.socket?.close()
    this.socket = null
  }
}


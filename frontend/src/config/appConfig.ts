function getDefaultApiBase() {
  try {
    if (typeof window !== 'undefined' && window.location?.origin) {
      const url = new URL(window.location.origin)
      url.port = '8000'
      url.pathname = ''
      return url.toString().replace(/\/$/, '')
    }
  } catch {
    // ignore
  }
  return 'http://localhost:8000'
}

function normalizeUrl(raw: string | undefined, fallback = '', fallbackOrigin = 'http://localhost') {
  const input = raw || fallback
  if (!input) return ''
  try {
    const base = typeof window !== 'undefined' && window.location?.origin ? window.location.origin : fallbackOrigin
    const url = new URL(input, base)
    // 在浏览器访问容器暴露的端口时，使用当前页面主机替换 docker 服务名，避免 DNS 解析失败。
    if (typeof window !== 'undefined') {
      const pageHost = window.location?.hostname
      // 替换容器内部服务名为localhost
      if (url.hostname === 'backend' && pageHost) {
        url.hostname = pageHost
      }
      // 如果是WebSocket URL且路径不正确，修复路径
      if ((url.protocol === 'ws:' || url.protocol === 'wss:') && url.pathname === '/realtime/ws') {
        url.pathname = '/api/v1/realtime/ws'
      }
    }
    return url.toString().replace(/\/$/, '')
  } catch {
    return input
  }
}

const DEFAULT_API_BASE = getDefaultApiBase()

// 构建默认WebSocket URL
function getDefaultWsUrl(): string {
  try {
    const apiUrl = new URL(DEFAULT_API_BASE)
    return `ws://${apiUrl.hostname}:${apiUrl.port || '8000'}/api/v1/realtime/ws`
  } catch {
    return 'ws://localhost:8000/api/v1/realtime/ws'
  }
}

export const appConfig = {
  apiBaseUrl: normalizeUrl(import.meta.env.VITE_API_BASE_URL, DEFAULT_API_BASE),
  wsUrl: normalizeUrl(import.meta.env.VITE_WS_URL, getDefaultWsUrl()),
}

export const KPI_REFRESH_INTERVAL = 60_000 // 1 min


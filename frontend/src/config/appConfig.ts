export const appConfig = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? '',
  useMock: (import.meta.env.VITE_USE_MOCK ?? 'true') === 'true',
  wsUrl: import.meta.env.VITE_WS_URL ?? '',
}

export const KPI_REFRESH_INTERVAL = 60_000 // 1 min


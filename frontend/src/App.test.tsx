import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { vi } from 'vitest'
import App from './App'

vi.mock('./components/map/MapContainer', () => ({
  MapContainer: () => <div data-testid="map-placeholder">MapMock</div>,
}))

function renderWithProviders() {
  const queryClient = new QueryClient()
  return render(
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>,
  )
}

describe('App', () => {
  it('renders map headline', () => {
    renderWithProviders()
    expect(screen.getAllByText(/数字孪生地图/i).length).toBeGreaterThan(0)
  })
})


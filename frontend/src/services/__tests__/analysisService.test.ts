import { describe, it, expect, vi, beforeEach } from 'vitest'
import { apiClient } from '../apiClient'
import {
  fetchBottlenecks,
  fetchQualityIssues,
  fetchEfficiencyIssues,
  fetchSpaghettiPaths,
} from '../analysisService'

vi.mock('../apiClient', () => ({
  apiClient: {
    get: vi.fn(),
  },
}))

describe('analysisService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should fetch bottlenecks', async () => {
    const mockData = [
      {
        id: 'test-1',
        name: 'Station 1',
        processGroup: 'Welding',
        location: { type: 'Point', coordinates: [100, 200] },
        wipCount: 8,
        avgProcessTime: 120.0,
        standardCT: 100.0,
        threshold: 7,
        queueLength: 8,
      },
    ]
    vi.mocked(apiClient.get).mockResolvedValue({
      data: { success: true, data: mockData },
    })

    const result = await fetchBottlenecks()
    expect(result).toEqual(mockData)
    expect(apiClient.get).toHaveBeenCalledWith('/api/v1/analysis/bottlenecks')
  })

  it('should fetch quality issues', async () => {
    const mockData = [
      {
        id: 'test-1',
        name: 'Equipment 1',
        location: { type: 'Point', coordinates: [100, 200] },
        status: 'Running',
        recentDefectRate24h: 3.5,
        qualityThreshold: 3.0,
        oee: 85.0,
      },
    ]
    vi.mocked(apiClient.get).mockResolvedValue({
      data: { success: true, data: mockData },
    })

    const result = await fetchQualityIssues()
    expect(result).toEqual(mockData)
    expect(apiClient.get).toHaveBeenCalledWith('/api/v1/analysis/quality-issues')
  })

  it('should fetch efficiency issues', async () => {
    const mockData = [
      {
        id: 'test-1',
        name: 'Station 1',
        processGroup: 'Welding',
        location: { type: 'Point', coordinates: [100, 200] },
        actualOEE: 70.0,
        targetOEE: 85.0,
        oeeBreakdown: {
          availability: 0.8,
          performance: 0.85,
          quality: 0.95,
        },
      },
    ]
    vi.mocked(apiClient.get).mockResolvedValue({
      data: { success: true, data: mockData },
    })

    const result = await fetchEfficiencyIssues()
    expect(result).toEqual(mockData)
    expect(apiClient.get).toHaveBeenCalledWith('/api/v1/analysis/efficiency-issues')
  })

  it('should fetch spaghetti paths', async () => {
    const mockData = {
      paths: [
        {
          id: 'path-1',
          workpieceId: 'workpiece-1',
          path: [
            { timestamp: '2024-11-18T06:00:00Z', coordinates: [100, 200] },
            { timestamp: '2024-11-18T06:20:00Z', coordinates: [150, 250] },
          ],
          frequency: 10,
        },
      ],
      totalPaths: 1,
      maxFrequency: 10,
      pathSegments: {},
    }
    vi.mocked(apiClient.get).mockResolvedValue({
      data: { success: true, data: mockData },
    })

    const result = await fetchSpaghettiPaths(24)
    expect(result).toEqual(mockData)
    expect(apiClient.get).toHaveBeenCalledWith('/api/v1/analysis/spaghetti-paths?hours=24')
  })
})



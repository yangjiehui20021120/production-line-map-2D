import { useEffect, useRef } from 'react'
import * as echarts from 'echarts'
import type { SpaghettiPath } from '../../services/analysisService'

type EChartsOption = Record<string, any>

interface SpaghettiDiagramProps {
  paths: SpaghettiPath[]
  maxFrequency: number
  mapWidth: number
  mapHeight: number
}

export function SpaghettiDiagram({ paths, maxFrequency, mapWidth, mapHeight }: SpaghettiDiagramProps) {
  const chartRef = useRef<HTMLDivElement>(null)
  const chartInstanceRef = useRef<echarts.ECharts | null>(null)

  useEffect(() => {
    if (!chartRef.current) return

    const chart = echarts.init(chartRef.current)
    chartInstanceRef.current = chart

    const option: EChartsOption = {
      backgroundColor: 'transparent',
      grid: {
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
      },
      xAxis: {
        type: 'value',
        min: 0,
        max: mapWidth,
        show: false,
      },
      yAxis: {
        type: 'value',
        min: 0,
        max: mapHeight,
        show: false,
        inverse: true,
      },
      series: paths.map((path) => {
        const coords = path.path.map((p) => p.coordinates)

        const frequency = path.frequency
        const normalizedFrequency = maxFrequency > 0 ? frequency / maxFrequency : 0
        const opacity = 0.3 + normalizedFrequency * 0.7
        const lineWidth = 1 + normalizedFrequency * 3

        const color = getPathColor(normalizedFrequency)

        return {
          type: 'line',
          data: coords,
          lineStyle: {
            color,
            width: lineWidth,
            opacity,
          },
          symbol: 'none',
          smooth: true,
          animation: false,
          emphasis: {
            lineStyle: {
              width: lineWidth + 2,
              opacity: 1,
            },
          },
        }
      }),
    }

    chart.setOption(option)

    return () => {
      chart.dispose()
    }
  }, [paths, maxFrequency, mapWidth, mapHeight])

  return (
    <div
      ref={chartRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 1000,
      }}
    />
  )
}

function getPathColor(frequency: number): string {
  if (frequency >= 0.8) return '#ea5455'
  if (frequency >= 0.6) return '#ffb200'
  if (frequency >= 0.4) return '#0ea5e9'
  if (frequency >= 0.2) return '#5c7cfa'
  return '#a855f7'
}


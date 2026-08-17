import {
  Legend,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'
import { formatScore } from '../../lib/format'
import { ChartLegend, ChartTip, useChartTokens } from './ChartBits'

export interface RadarAxisDef {
  id: string
  name: string
}

/**
 * Dynamic life radar: one axis per category, values 0–10. Supports an
 * optional "day" layer (solid filled polygon) over the "average" layer
 * (secondary outline) so a day can be read against normal performance.
 */
export function LifeRadar({
  axes,
  day,
  average,
  dayLabel,
  height = 320,
}: {
  axes: RadarAxisDef[]
  day: Record<string, number> | null
  average: Record<string, number> | null
  dayLabel: string
  height?: number
}) {
  const t = useChartTokens()
  const many = axes.length > 8
  const data = axes.map((a) => ({
    name: a.name,
    day: day ? day[a.id] ?? null : null,
    avg: average ? average[a.id] ?? null : null,
  }))
  const hasDay = day !== null && data.some((d) => d.day !== null)
  const hasAvg = average !== null && data.every((d) => d.avg !== null)
  const layerCount = (hasDay ? 1 : 0) + (hasAvg ? 1 : 0)

  const renderTick = (props: {
    payload: { value: string }
    x: number
    y: number
    textAnchor: string
  }) => {
    const { payload, x, y, textAnchor } = props
    const max = many ? 10 : 14
    const name =
      payload.value.length > max ? `${payload.value.slice(0, max - 1)}…` : payload.value
    return (
      <text
        x={x}
        y={y}
        textAnchor={textAnchor as 'start' | 'middle' | 'end'}
        fill={t.secondary}
        fontSize={many ? 10 : 11.5}
        dy={4}
      >
        {name}
      </text>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RadarChart data={data} cx="50%" cy="50%" outerRadius={many ? '62%' : '70%'}>
        <PolarGrid stroke={t.grid} />
        <PolarAngleAxis dataKey="name" tick={renderTick} />
        <PolarRadiusAxis
          domain={[0, 10]}
          tickCount={3}
          tick={{ fontSize: 10, fill: t.muted }}
          axisLine={false}
        />
        {hasAvg && (
          <Radar
            name="Average"
            dataKey="avg"
            stroke={t.muted}
            strokeWidth={2}
            fill="none"
            fillOpacity={0}
            dot={{ r: 2.5, fill: t.muted, strokeWidth: 0 }}
            isAnimationActive={false}
          />
        )}
        {hasDay && (
          <Radar
            name={dayLabel}
            dataKey="day"
            stroke={t.accent}
            strokeWidth={2}
            fill={t.accent}
            fillOpacity={0.14}
            dot={{ r: 3, fill: t.accent, strokeWidth: 2, stroke: t.surface }}
            isAnimationActive={false}
          />
        )}
        {layerCount >= 2 && <Legend content={<ChartLegend />} />}
        <Tooltip content={<ChartTip valueFormatter={(v) => `${formatScore(v)} / 10`} />} />
      </RadarChart>
    </ResponsiveContainer>
  )
}

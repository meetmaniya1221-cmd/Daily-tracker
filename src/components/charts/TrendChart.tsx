import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { formatMedium } from '../../lib/date'
import { formatScore } from '../../lib/format'
import { ChartLegend, ChartTip, useChartTokens } from './ChartBits'

export interface TrendSeries {
  key: string
  name: string
  color: string
}

export interface TrendPoint {
  date: string
  [seriesKey: string]: string | number | null
}

export function TrendChart({
  data,
  series,
  xTickFormatter,
  height = 300,
}: {
  data: TrendPoint[]
  series: TrendSeries[]
  xTickFormatter: (key: string) => string
  height?: number
}) {
  const t = useChartTokens()
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: -14 }}>
        <CartesianGrid stroke={t.grid} strokeWidth={1} vertical={false} />
        <XAxis
          dataKey="date"
          tickFormatter={xTickFormatter}
          tick={{ fontSize: 11, fill: t.muted }}
          axisLine={{ stroke: t.baseline }}
          tickLine={false}
          minTickGap={28}
        />
        <YAxis
          domain={[0, 10]}
          ticks={[0, 2, 4, 6, 8, 10]}
          tick={{ fontSize: 11, fill: t.muted }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          content={
            <ChartTip
              labelFormatter={formatMedium}
              valueFormatter={(v) => formatScore(v)}
            />
          }
        />
        {series.length > 1 && <Legend content={<ChartLegend />} />}
        {series.map((s) => (
          <Line
            key={s.key}
            type="monotone"
            dataKey={s.key}
            name={s.name}
            stroke={s.color}
            strokeWidth={2}
            strokeLinecap="round"
            dot={false}
            activeDot={{ r: 4, strokeWidth: 2, stroke: t.surface }}
            connectNulls
            isAnimationActive={false}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  )
}

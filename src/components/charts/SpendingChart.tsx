import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { formatMedium, formatShort } from '../../lib/date'
import { formatINR, formatINRCompact } from '../../lib/format'
import { ChartTip, chartAnimation, useChartTokens } from './ChartBits'

export interface SpendingPoint {
  date: string
  amount: number | null
}

/** Daily spending bars — single series, single hue, ≤24px bars, rounded caps. */
export function SpendingChart({
  data,
  height = 280,
}: {
  data: SpendingPoint[]
  height?: number
}) {
  const t = useChartTokens()
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: 4 }} barCategoryGap="22%">
        <CartesianGrid stroke={t.grid} strokeWidth={1} vertical={false} />
        <XAxis
          dataKey="date"
          tickFormatter={formatShort}
          tick={{ fontSize: 11, fill: t.muted }}
          axisLine={{ stroke: t.baseline }}
          tickLine={false}
          minTickGap={28}
        />
        <YAxis
          tickFormatter={formatINRCompact}
          tick={{ fontSize: 11, fill: t.muted }}
          axisLine={false}
          tickLine={false}
          width={52}
        />
        <Tooltip
          cursor={{ fill: t.accentSoft }}
          content={
            <ChartTip
              labelFormatter={formatMedium}
              valueFormatter={(v) => formatINR(v)}
            />
          }
        />
        <Bar
          dataKey="amount"
          name="Spent"
          fill={t.accent}
          maxBarSize={24}
          radius={[4, 4, 0, 0]}
          {...chartAnimation()}
        />
      </BarChart>
    </ResponsiveContainer>
  )
}

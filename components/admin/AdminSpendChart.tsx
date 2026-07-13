'use client'

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { formatCost } from '@/lib/utils'

interface Props {
  data: {
    travel: number
    stay: number
    food: number
    activities: number
    misc: number
  }
}

const COLORS = ['#4A7A9B', '#C9972C', '#6B8F71', '#9B3A2A', '#8A9E96']

export function AdminSpendChart({ data }: Props) {
  const chartData = [
    { name: 'Travel', value: data.travel },
    { name: 'Stay', value: data.stay },
    { name: 'Food', value: data.food },
    { name: 'Activities', value: data.activities },
    { name: 'Misc', value: data.misc },
  ].filter(d => d.value > 0)

  const total = chartData.reduce((s, d) => s + d.value, 0)

  if (total === 0) {
    return (
      <div className="flex items-center justify-center h-40 text-cream-dim text-sm">
        No cost data yet. Add trips with cost breakdowns to see the chart.
      </div>
    )
  }

  return (
    <div>
      <ResponsiveContainer width="100%" height={180}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={80}
            paddingAngle={3}
            dataKey="value"
          >
            {chartData.map((_, index) => (
              <Cell key={index} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
            contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px', color: '#FFF' }}
            formatter={(value: any) => [`₹${(value as number).toLocaleString()}`, 'Spent']}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="grid grid-cols-2 gap-2 mt-2">
        {chartData.map((d, i) => (
          <div key={d.name} className="flex items-center gap-2 text-xs text-cream-muted">
            <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
            <span>{d.name}</span>
            <span className="font-data text-cream-dim ml-auto">{formatCost(d.value)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

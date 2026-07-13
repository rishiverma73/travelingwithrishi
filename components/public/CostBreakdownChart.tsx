'use client'

import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from 'recharts'
import { formatCost } from '@/lib/utils'

interface CostBreakdown {
  travel: number
  stay: number
  food: number
  activities: number
  misc: number
}

const COLORS: Record<keyof CostBreakdown, string> = {
  travel: '#4A7A9B',
  stay: '#C9972C',
  food: '#6B8F71',
  activities: '#9B3A2A',
  misc: '#8A9E96',
}

export function CostBreakdownChart({
  breakdown,
  total,
  currency,
}: {
  breakdown: CostBreakdown
  total: number
  currency: string
}) {
  const data = (Object.entries(breakdown) as [keyof CostBreakdown, number][])
    .filter(([, v]) => v > 0)
    .map(([key, value]) => ({
      name: key.charAt(0).toUpperCase() + key.slice(1),
      value,
      pct: Math.round((value / total) * 100),
      color: COLORS[key],
    }))

  if (data.length === 0) {
    return (
      <div className="text-center py-8 text-[#9B8A70] text-sm">
        No itemized breakdown available.
      </div>
    )
  }

  return (
    <div>
      <ResponsiveContainer width="100%" height={160}>
        <BarChart data={data} layout="vertical" margin={{ left: 0, right: 40 }}>
          <XAxis type="number" hide />
          <YAxis type="category" dataKey="name" tick={{ fill: '#6B5B40', fontSize: 12 }} width={80} />
          <Tooltip
            formatter={(value: any) => [formatCost(value as number, currency), 'Cost']}
            contentStyle={{
              background: '#F5ECD7',
              border: '1px solid rgba(201,151,44,0.3)',
              borderRadius: 8,
              color: '#2A1F0E',
            }}
          />
          <Bar dataKey="value" radius={[0, 6, 6, 0]}>
            {data.map((d, i) => (
              <Cell key={i} fill={d.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <div className="grid grid-cols-2 gap-2 mt-4">
        {data.map(d => (
          <div key={d.name} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} />
              <span className="text-xs text-[#6B5B40]">{d.name}</span>
            </div>
            <div className="text-right">
              <span className="font-data text-xs text-[#2A1F0E] font-semibold">
                {formatCost(d.value, currency)}
              </span>
              <span className="text-xs text-[#9B8A70] ml-1">({d.pct}%)</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

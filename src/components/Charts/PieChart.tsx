import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';

interface ChartData {
  name: string;
  value: number;
}

interface PieChartComponentProps {
  data: ChartData[];
  title?: string;
  maxSlices?: number; // show top N, group rest as "Other"
  minPercentForOwnSlice?: number; // values below are grouped into Other
}

const COLORS = ['#1976d2', '#dc004e', '#2e7d32', '#ed6c02', '#d32f2f', '#0288d1'];

export const PieChartComponent: React.FC<PieChartComponentProps> = ({ data, title, maxSlices = 10, minPercentForOwnSlice = 2 }) => {
  // Defensive: empty data
  const safeData = Array.isArray(data) ? data.filter(d => d && typeof d.value === 'number') : [];
  const total = safeData.reduce((acc, d) => acc + (d.value || 0), 0);
  // Compute percentages and sort desc
  const withPct = safeData
    .map(d => ({ ...d, percentage: total > 0 ? (d.value / total) * 100 : 0 }))
    .sort((a, b) => b.value - a.value);

  // Group small slices into Other and limit max slices
  const major = withPct.filter(d => d.percentage >= minPercentForOwnSlice);
  const minor = withPct.filter(d => d.percentage < minPercentForOwnSlice);
  let prepared = major;
  if (minor.length > 0) {
    const otherSum = minor.reduce((acc, d) => acc + d.value, 0);
    const otherPct = total > 0 ? (otherSum / total) * 100 : 0;
    if (otherSum > 0) prepared = [...major, { name: 'Other', value: otherSum, percentage: otherPct } as any];
  }
  if (prepared.length > maxSlices) {
    const top = prepared.slice(0, maxSlices - 1);
    const rest = prepared.slice(maxSlices - 1);
    const restSum = rest.reduce((acc, d: any) => acc + d.value, 0);
    const restPct = total > 0 ? (restSum / total) * 100 : 0;
    prepared = [...top, { name: 'Other', value: restSum, percentage: restPct } as any];
  }

  // Truncate long labels for legend
  const truncate = (s: string, n = 16) => (s && s.length > n ? s.slice(0, n - 1) + '…' : s);

  return (
    <ResponsiveContainer width="100%" height={320}>
      <PieChart margin={{ top: 8, right: 16, bottom: 8, left: 16 }}>
        <Pie
          data={prepared as any}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={false}
          outerRadius={100}
          dataKey="value"
          nameKey="name"
          isAnimationActive={false}
        >
          {(prepared as any).map((entry: any, index: number) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(v: any, _n: any, p: any) => [`${Number(v).toLocaleString('en-IN')}`, `${p?.payload?.name} (${(p?.payload?.percentage ?? (total ? (p.value / total) * 100 : 0)).toFixed(1)}%)`]} />
        <Legend layout="vertical" align="right" verticalAlign="middle" wrapperStyle={{ maxWidth: 220 }} formatter={(value: any, entry: any) => `${truncate(value)} (${(entry?.payload?.percentage ?? 0).toFixed(1)}%)`} />
      </PieChart>
    </ResponsiveContainer>
  );
};

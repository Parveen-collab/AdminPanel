import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useTheme } from '@mui/material';

interface ChartData {
  name: string;
  [key: string]: any;
}

interface BarChartComponentProps {
  data: ChartData[];
  title?: string;
  dataKey?: string;
  valueKey?: string;
}

export const BarChartComponent: React.FC<BarChartComponentProps> = ({ 
  data, 
  title, 
  dataKey = 'name',
  valueKey = 'count'
}) => {
  const theme = useTheme();
  const hasMultipleKeys = data.length > 0 && Object.keys(data[0]).filter(k => k !== dataKey && typeof data[0][k] === 'number').length > 1;
  
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
        <XAxis dataKey={dataKey} stroke={theme.palette.text.secondary} />
        <YAxis stroke={theme.palette.text.secondary} />
        <Tooltip
          contentStyle={{ backgroundColor: theme.palette.background.paper, border: `1px solid ${theme.palette.divider}` }}
          itemStyle={{ color: theme.palette.text.primary }}
        />
        <Legend />
        {hasMultipleKeys ? (
          <>
            <Bar dataKey="new" stackId="a" fill={theme.palette.primary.main} name="New Customers" />
            <Bar dataKey="repeat" stackId="a" fill={theme.palette.secondary.main} name="Repeat Customers" />
          </>
        ) : (
          <Bar dataKey={valueKey} fill={theme.palette.primary.main} />
        )}
      </BarChart>
    </ResponsiveContainer>
  );
};
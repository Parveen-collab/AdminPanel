import React from 'react';
import {
  LineChart,
  Line,
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
  users?: number;
  value?: number;
  used?: number;
  generated?: number;
  growth?: number;
  [key: string]: any;
}

interface LineChartComponentProps {
  data: ChartData[];
  title?: string;
  dataKey?: string;
  secondData?: ChartData[];
  secondDataKey?: string;
  firstLabel?: string;
  secondLabel?: string;
}

export const LineChartComponent: React.FC<LineChartComponentProps> = ({ 
  data, 
  title,
  dataKey = "users",
  secondData,
  secondDataKey,
  firstLabel,
  secondLabel
}) => {
  const theme = useTheme();
  const primary = theme.palette.primary.main;
  const secondary = theme.palette.secondary.main;
  const grid = theme.palette.divider;
  const axis = theme.palette.text.secondary;

  // Use data as-is since it should already have both series
  const mergedData = data;

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={mergedData}>
        <CartesianGrid strokeDasharray="3 3" stroke={grid} />
        <XAxis dataKey="name" stroke={axis} />
        <YAxis stroke={axis} />
        <Tooltip
          contentStyle={{ backgroundColor: theme.palette.background.paper, border: `1px solid ${grid}` }}
          itemStyle={{ color: theme.palette.text.primary }}
        />
        <Legend />
        <Line
          type="monotone"
          dataKey={dataKey}
          stroke={primary}
          strokeWidth={2}
          dot={{ fill: primary, strokeWidth: 2, r: 4 }}
          activeDot={{ r: 6 }}
          name={firstLabel || "Data"}
        />
        {secondData && secondDataKey && (
          <Line
            type="monotone"
            dataKey={secondDataKey}
            stroke={secondary}
            strokeWidth={2}
            dot={{ fill: secondary, strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6 }}
            name={secondLabel || "Second Data"}
          />
        )}
      </LineChart>
    </ResponsiveContainer>
  );
};


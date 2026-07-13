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
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { EconomicIndicators } from '../../../../shared/types';

interface EconomicChartProps {
  data: EconomicIndicators[];
  type: 'line' | 'bar' | 'pie';
}

const COLORS = ['#8b0000', '#dc2626', '#f87171', '#fca5a5', '#fecaca'];

export const EconomicChart: React.FC<EconomicChartProps> = ({ data, type }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        Нет данных для отображения
      </div>
    );
  }

  const lineData = data.map((item, index) => ({
    name: `Период ${index + 1}`,
    gdp: item.gdp / 1000000,
    unemploymentRate: item.unemploymentRate * 100,
    profitRate: item.profitRate * 100,
    inflationRate: item.inflationRate * 100,
    surplusValueRate: item.surplusValueRate * 100,
  }));

  const barData = data.map((item, index) => ({
    name: `Период ${index + 1}`,
    concentration: item.concentrationIndex * 100,
    crisisRisk: item.crisisCycle.severity * 100,
  }));

  const pieData = [
    { name: 'Прибыль', value: data[data.length - 1].profitRate * 100 },
    { name: 'Прибавочная стоимость', value: data[data.length - 1].surplusValueRate * 100 },
    { name: 'Инфляция', value: data[data.length - 1].inflationRate * 100 },
    { name: 'Безработица', value: data[data.length - 1].unemploymentRate * 100 },
    { name: 'Концентрация', value: data[data.length - 1].concentrationIndex * 100 },
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900 mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {typeof entry.value === 'number' ? `${entry.value.toFixed(1)}%` : entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  switch (type) {
    case 'line':
      return (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={lineData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line type="monotone" dataKey="gdp" stroke="#8b0000" name="ВВП (M$)" />
            <Line type="monotone" dataKey="profitRate" stroke="#dc2626" name="Норма прибыли (%)" />
            <Line type="monotone" dataKey="unemploymentRate" stroke="#f87171" name="Безработица (%)" />
            <Line type="monotone" dataKey="inflationRate" stroke="#fca5a5" name="Инфляция (%)" />
          </LineChart>
        </ResponsiveContainer>
      );

    case 'bar':
      return (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={barData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar dataKey="concentration" fill="#8b0000" name="Концентрация (%)" />
            <Bar dataKey="crisisRisk" fill="#dc2626" name="Риск кризиса (%)" />
          </BarChart>
        </ResponsiveContainer>
      );

    case 'pie':
      return (
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {pieData.map((_entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      );

    default:
      return null;
  }
};

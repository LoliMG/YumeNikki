import React from 'react';
import Card from 'react-bootstrap/Card';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import { TrendingUp } from 'lucide-react';
import CustomChartTooltip from './ChartTooltip';

const EvolutionAreaChart = ({ data = [] }) => {
  const formattedData = (data || []).map(item => ({
    name: item.month,
    sueños: Number(item.count) || 0
  }));

  const hasData = formattedData.some(d => d.sueños > 0);

  return (
    <Card className="bg-surface border-subtle shadow-sm rounded-4 overflow-hidden h-100">
      <Card.Header className="bg-surface-2 bg-opacity-40 border-bottom border-subtle py-3 px-4 d-flex align-items-center justify-content-between">
        <div className="d-flex align-items-center gap-2">
          <TrendingUp size={18} className="text-warning" />
          <h2 className="h5 font-serif text-light m-0">Evolución de Sueños en el Tiempo</h2>
        </div>
        <span className="badge bg-secondary text-light small">Mensual</span>
      </Card.Header>
      <Card.Body className="p-3 p-md-4">
        {!hasData ? (
          <div className="text-center py-5 text-muted small fst-italic">
            No hay registros suficientes en este período para generar la curva de evolución.
          </div>
        ) : (
          <div style={{ width: '100%', height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={formattedData} margin={{ top: 15, right: 20, left: -20, bottom: 5 }}>
                <defs>
                  <linearGradient id="dreamAreaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a78bfa" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="#a78bfa" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.07)" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  stroke="#a39dc9" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={{ stroke: 'rgba(255, 255, 255, 0.1)' }}
                />
                <YAxis 
                  stroke="#a39dc9" 
                  fontSize={12} 
                  allowDecimals={false} 
                  tickLine={false} 
                  axisLine={{ stroke: 'rgba(255, 255, 255, 0.1)' }}
                />
                <Tooltip 
                  content={<CustomChartTooltip />} 
                  cursor={{ stroke: 'rgba(167, 139, 250, 0.25)', strokeWidth: 1, strokeDasharray: '4 4' }}
                />
                <Area
                  type="monotone"
                  dataKey="sueños"
                  name="Sueños registrados"
                  stroke="#a78bfa"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#dreamAreaGradient)"
                  activeDot={{ r: 6, fill: '#e8c987', stroke: '#fff', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default EvolutionAreaChart;

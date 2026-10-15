import React from 'react';
import Card from 'react-bootstrap/Card';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid
} from 'recharts';
import { Droplet } from 'lucide-react';
import CustomChartTooltip from './ChartTooltip';

const MenstrualComparisonChart = ({ menstrualStats }) => {
  if (!menstrualStats || !menstrualStats.tracked) return null;

  const duringTags = menstrualStats.tagsDuringMenstruation || [];
  const outsideTags = menstrualStats.tagsOutsideMenstruation || [];

  // Combinar etiquetas únicas
  const allTagNames = Array.from(new Set([
    ...duringTags.map(t => t.tag_name),
    ...outsideTags.map(t => t.tag_name)
  ])).slice(0, 6);

  const chartData = allTagNames.map(tagName => {
    const during = duringTags.find(t => t.tag_name === tagName);
    const outside = outsideTags.find(t => t.tag_name === tagName);
    const initials = during?.tag_initials || outside?.tag_initials || tagName.slice(0, 2).toUpperCase();

    return {
      name: initials,
      fullName: tagName,
      'En Menstruación': during ? during.percentage : 0,
      'Resto del Ciclo': outside ? outside.percentage : 0
    };
  });

  const hasData = chartData.length > 0;

  return (
    <Card className="bg-surface border-subtle shadow-sm rounded-4 overflow-hidden">
      <Card.Header className="bg-surface-2 bg-opacity-40 border-bottom border-subtle py-3 px-4 d-flex align-items-center justify-content-between">
        <div className="d-flex align-items-center gap-2">
          <Droplet size={18} className="text-danger" fill="currentColor" />
          <h2 className="h5 font-serif text-light m-0">Correlación del Ciclo Menstrual & Tipos de Sueño</h2>
        </div>
        <div className="d-flex align-items-center gap-2">
          <span className="badge bg-danger bg-opacity-20 border border-danger border-opacity-25 small">
            {menstrualStats.menstrualDreamsCount || 0} sueños durante el periodo ({menstrualStats.menstrualRatio || 0}%)
          </span>
        </div>
      </Card.Header>
      <Card.Body className="p-3 p-md-4">
        {!hasData ? (
          <div className="text-center py-5 text-muted small fst-italic">
            No hay suficientes datos comparativos registrados en este período.
          </div>
        ) : (
          <div>
            <p className="text-muted small mb-3">
              Porcentaje relativo de cada tipo de sueño experimentado durante los días de menstruación frente a las demás fases del ciclo biológico.
            </p>
            <div style={{ width: '100%', height: 280 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 15, right: 20, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.07)" vertical={false} />
                  <XAxis
                    dataKey="name"
                    stroke="#a39dc9"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: 'rgba(255, 255, 255, 0.1)' }}
                  />
                  <YAxis
                    stroke="#a39dc9"
                    fontSize={11}
                    unit="%"
                    tickLine={false}
                    axisLine={{ stroke: 'rgba(255, 255, 255, 0.1)' }}
                  />
                  <Tooltip
                    content={<CustomChartTooltip formatter={(val) => `${val}%`} />}
                    cursor={{ fill: 'rgba(167, 139, 250, 0.08)', radius: 6 }}
                  />
                  <Legend
                    wrapperStyle={{ paddingTop: 10 }}
                    formatter={(val) => <span className="text-light small">{val}</span>}
                  />
                  <Bar
                    dataKey="En Menstruación"
                    fill="#b54d5e"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="Resto del Ciclo"
                    fill="#a78bfa"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default MenstrualComparisonChart;

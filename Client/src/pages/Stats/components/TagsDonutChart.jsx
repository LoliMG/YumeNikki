import React, { useState } from 'react';
import Card from 'react-bootstrap/Card';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip
} from 'recharts';
import { Tag as TagIcon } from 'lucide-react';
import TagBadge from '../../../components/TagBadge/TagBadge';
import CustomChartTooltip from './ChartTooltip';

const TagsDonutChart = ({ tagsStats = [] }) => {
  const [activeIndex, setActiveIndex] = useState(null);

  const totalDreams = tagsStats.reduce((acc, t) => acc + (Number(t.count) || 0), 0);

  const chartData = (tagsStats || []).map(t => {
    const rawName = t.tag_name || t.name || 'Sin etiqueta';
    const initials = t.tag_initials || t.initials || (rawName === 'Sin etiqueta' ? 'SE' : rawName.slice(0, 2).toUpperCase());
    return {
      name: initials,
      fullName: rawName,
      value: Number(t.count) || 0,
      color: t.tag_color || t.color || '#a78bfa',
      initials
    };
  });

  const hasData = chartData.some(d => d.value > 0);

  return (
    <Card className="bg-surface border-subtle shadow-sm rounded-4 overflow-hidden h-100">
      <Card.Header className="bg-surface-2 bg-opacity-40 border-bottom border-subtle py-3 px-4 d-flex align-items-center justify-content-between">
        <div className="d-flex align-items-center gap-2">
          <TagIcon size={18} className="text-warning" />
          <h2 className="h5 font-serif text-light m-0">Distribución por Tipos de Sueño</h2>
        </div>
        <span className="badge bg-secondary text-light small">{totalDreams} total</span>
      </Card.Header>
      <Card.Body className="p-3 p-md-4">
        {!hasData ? (
          <div className="text-center py-5 text-muted small fst-italic">
            No hay sueños con etiquetas registradas en este período.
          </div>
        ) : (
          <div className="row align-items-center g-3">
            {/* Gráfica Donut */}
            <div className="col-12 col-sm-6 d-flex justify-content-center">
              <div style={{ width: '100%', height: 230, position: 'relative' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Tooltip 
                      content={<CustomChartTooltip formatter={(val) => `${val} (${totalDreams > 0 ? Math.round((val / totalDreams) * 100) : 0}%)`} />} 
                    />
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={88}
                      paddingAngle={3}
                      dataKey="value"
                      onMouseEnter={(_, index) => setActiveIndex(index)}
                      onMouseLeave={() => setActiveIndex(null)}
                    >
                      {chartData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.color}
                          stroke="#181434"
                          strokeWidth={2}
                          style={{
                            cursor: 'pointer',
                            outline: 'none'
                          }}
                        />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                {/* Indicador central del donut */}
                <div 
                  className="position-absolute top-50 start-50 translate-middle text-center pointer-events-none"
                  style={{ pointerEvents: 'none' }}
                >
                  <span className="text-muted" style={{ fontSize: '0.7rem' }}>TOTAL</span>
                  <div className="h4 fw-bold text-light m-0 font-sans">{totalDreams}</div>
                </div>
              </div>
            </div>

            {/* Desglose lateral con etiquetas en siglas */}
            <div className="col-12 col-sm-6">
              <div className="d-flex flex-column gap-2" style={{ maxHeight: 230, overflowY: 'auto', overflowX: 'hidden' }}>
                {chartData.map((item, index) => {
                  const percent = totalDreams > 0 ? Math.round((item.value / totalDreams) * 100) : 0;
                  const isActive = activeIndex === index;
                  return (
                    <div
                      key={item.fullName + index}
                      className={`donut-tag-item d-flex align-items-center justify-content-between small ${isActive ? 'is-active' : ''}`}
                      onMouseEnter={() => setActiveIndex(index)}
                      onMouseLeave={() => setActiveIndex(null)}
                      style={{ cursor: 'pointer' }}
                    >
                      {/* Etiqueta únicamente con sus siglas */}
                      <div className="d-flex align-items-center gap-2">
                        <TagBadge
                          tag={{
                            name: item.fullName,
                            initials: item.initials,
                            color: item.color
                          }}
                          size="sm"
                        />
                      </div>

                      <div className="d-flex align-items-center gap-2 flex-shrink-0 ms-2">
                        <span className="text-muted small">{item.value}</span>
                        <span className="badge bg-black bg-opacity-25 border border-subtle text-warning font-sans" style={{ fontSize: '0.72rem' }}>
                          {percent}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default TagsDonutChart;

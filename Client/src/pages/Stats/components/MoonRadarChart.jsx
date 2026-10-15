import React, { useState, useMemo } from 'react';
import Card from 'react-bootstrap/Card';
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Tooltip
} from 'recharts';
import { Moon, Sparkles } from 'lucide-react';
import CustomChartTooltip from './ChartTooltip';
import UIDropdown from '../../../components/UI/UIDropdown/UIDropdown';

const MOON_PHASES = [
  { key: 'nueva', name: 'Luna Nueva', shortName: 'Nueva', emoji: '🌑' },
  { key: 'creciente', name: 'Luna Creciente', shortName: 'Creciente', emoji: '🌒' },
  { key: 'cuarto creciente', name: 'Cuarto Creciente', shortName: 'Cuarto Crec.', emoji: '🌓' },
  { key: 'gibosa creciente', name: 'Gibosa Creciente', shortName: 'Gibosa Crec.', emoji: '🌔' },
  { key: 'llena', name: 'Luna Llena', shortName: 'Llena', emoji: '🌕' },
  { key: 'gibosa menguante', name: 'Gibosa Menguante', shortName: 'Gibosa Meng.', emoji: '🌖' },
  { key: 'cuarto menguante', name: 'Cuarto Menguante', shortName: 'Cuarto Meng.', emoji: '🌗' },
  { key: 'menguante', name: 'Luna Menguante', shortName: 'Menguante', emoji: '🌘' }
];

function matchPhaseKey(rawName) {
  if (!rawName) return null;
  const n = String(rawName).toLowerCase().trim();
  if (n.includes('cuarto creciente')) return 'cuarto creciente';
  if (n.includes('gibosa creciente')) return 'gibosa creciente';
  if (n.includes('cuarto menguante')) return 'cuarto menguante';
  if (n.includes('gibosa menguante')) return 'gibosa menguante';
  if (n.includes('nueva')) return 'nueva';
  if (n.includes('llena')) return 'llena';
  if (n.includes('creciente')) return 'creciente';
  if (n.includes('menguante')) return 'menguante';
  return null;
}

const MoonRadarChart = ({ moonStats = [], tagsStats = [] }) => {
  const [selectedFilter, setSelectedFilter] = useState('ALL'); // 'ALL' o nombre de etiqueta

  // Extraer lista de etiquetas disponibles a partir de moonStats y tagsStats
  const availableTags = useMemo(() => {
    const map = new Map();

    // Primero de tagsStats si vienen con color
    for (const t of tagsStats) {
      if (t.tag_name) {
        map.set(t.tag_name, {
          name: t.tag_name,
          color: t.tag_color || '#a78bfa',
          count: Number(t.count) || 0
        });
      }
    }

    // Agregar o actualizar con moonStats
    for (const item of moonStats) {
      const name = item.tag_name || 'Sin etiqueta';
      if (!map.has(name)) {
        map.set(name, {
          name,
          color: item.tag_color || '#a78bfa',
          count: 0
        });
      }
      map.get(name).count += Number(item.count) || 0;
    }

    return Array.from(map.values()).sort((a, b) => b.count - a.count);
  }, [moonStats, tagsStats]);

  const isAll = selectedFilter === 'ALL';
  const currentTag = !isAll ? availableTags.find(t => t.name === selectedFilter) || null : null;

  // Calcular conteo por cada una de las 8 fases lunares
  const { radarData, totalDreamsInView, peakPhase } = useMemo(() => {
    // Inicializar mapa de fases
    const counts = {};
    for (const p of MOON_PHASES) {
      counts[p.key] = 0;
    }

    const targetTagName = !isAll && currentTag ? currentTag.name : null;

    for (const item of moonStats) {
      const phaseKey = matchPhaseKey(item.moon_phase_name);
      if (!phaseKey) continue;

      if (targetTagName) {
        if (item.tag_name === targetTagName) {
          counts[phaseKey] += Number(item.count) || 0;
        }
      } else {
        // Modo 'ALL': sumar todos los tipos
        counts[phaseKey] += Number(item.count) || 0;
      }
    }

    let sum = 0;
    let maxCount = -1;
    let peak = null;

    const data = MOON_PHASES.map(phase => {
      const cnt = counts[phase.key] || 0;
      sum += cnt;
      if (cnt > maxCount) {
        maxCount = cnt;
        peak = { ...phase, count: cnt };
      }
      return {
        fase: `${phase.emoji} ${phase.shortName}`,
        fullName: phase.name,
        emoji: phase.emoji,
        key: phase.key,
        sueños: cnt
      };
    });

    return {
      radarData: data,
      totalDreamsInView: sum,
      peakPhase: maxCount > 0 ? peak : null
    };
  }, [moonStats, isAll, currentTag]);

  // Total acumulado de todos los sueños en las estadísticas
  const allDreamsCount = useMemo(() => {
    return moonStats.reduce((acc, curr) => acc + (Number(curr.count) || 0), 0);
  }, [moonStats]);

  // Opciones estilizadas para el UIDropdown acorde al diseño del proyecto
  const dropdownOptions = useMemo(() => {
    return [
      {
        value: 'ALL',
        label: 'Todos los sueños',
        icon: '🌕',
        subtitle: allDreamsCount > 0 ? `(${allDreamsCount} en total)` : undefined
      },
      ...availableTags.map(tag => ({
        value: tag.name,
        label: tag.name,
        color: tag.color || '#a78bfa',
        subtitle: `(${tag.count} ${tag.count === 1 ? 'sueño' : 'sueños'})`
      }))
    ];
  }, [availableTags, allDreamsCount]);

  const hasData = totalDreamsInView > 0;
  const activeColor = !isAll && currentTag?.color ? currentTag.color : '#e8c987';

  return (
    <Card className="bg-surface border-subtle shadow-sm rounded-4 h-100" style={{ overflow: 'visible' }}>
      {/* Cabecera con selector desplegable estilizado UIDropdown */}
      <Card.Header className="bg-surface-2 bg-opacity-40 border-bottom border-subtle py-3 px-3 px-md-4 rounded-top-4 d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
        <div className="d-flex align-items-center gap-2">
          <Moon size={20} className="text-warning flex-shrink-0" />
          <div>
            <h2 className="h5 font-serif text-light m-0">Radar Lunar: Frecuencia Onírica</h2>
            <span className="text-muted small" style={{ fontSize: '0.8rem' }}>
              {isAll
                ? 'Distribución de todos los sueños según las 8 fases de la Luna'
                : `Patrón lunar exclusivo para sueños de tipo: ${currentTag?.name}`}
            </span>
          </div>
        </div>

        {/* Desplegable estilizado adaptado a la página */}
        <div style={{ minWidth: 230 }}>
          <UIDropdown
            id="moon-radar-filter-dropdown"
            options={dropdownOptions}
            value={selectedFilter}
            onChange={(val) => setSelectedFilter(val)}
            placeholder="Filtrar por etiqueta..."
            size="sm"
            ariaLabel="Filtrar radar lunar por tipo de sueño"
          />
        </div>
      </Card.Header>

      <Card.Body className="p-3 p-md-4 d-flex flex-column gap-3">

        {!hasData ? (
          <div className="text-center py-5 text-muted small fst-italic">
            <Moon size={36} className="d-block mx-auto mb-2 opacity-50" />
            <p className="mb-0">
              {!isAll
                ? `No se han registrado sueños de tipo «${currentTag?.name}» con fase lunar calculada en este período.`
                : 'No se han registrado sueños con fase lunar calculada en este período.'}
            </p>
          </div>
        ) : (
          <div className="row g-4 align-items-center">
            {/* Gráfico Radar */}
            <div className="col-12 col-lg-7">
              <div style={{ width: '100%', height: 320 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="72%" data={radarData}>
                    <PolarGrid stroke="rgba(255, 255, 255, 0.12)" />
                    <PolarAngleAxis 
                      dataKey="fase" 
                      stroke="#c4b5fd" 
                      fontSize={11}
                      tickLine={false}
                    />
                    <PolarRadiusAxis 
                      stroke="rgba(255, 255, 255, 0.15)" 
                      fontSize={10} 
                      allowDecimals={false}
                    />
                    <Tooltip content={<CustomChartTooltip />} />
                    <Radar
                      name={!isAll ? (currentTag?.name || 'Tipo') : 'Total de sueños'}
                      dataKey="sueños"
                      stroke={activeColor}
                      strokeWidth={2.5}
                      fill={activeColor}
                      fillOpacity={0.35}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Panel de desglose y hallazgos por fase */}
            <div className="col-12 col-lg-5">
              <div className="d-flex flex-column gap-3">
                {/* Tarjeta de Insight Destacado */}
                {peakPhase && (
                  <div className="p-3 rounded-3 bg-surface-2 bg-opacity-70 border border-subtle">
                    <div className="d-flex align-items-center gap-2 mb-1">
                      <Sparkles size={16} className="text-warning" />
                      <span className="small text-warning fw-semibold text-uppercase tracking-wider">
                        Fase Predominante
                      </span>
                    </div>
                    <div className="d-flex align-items-center justify-content-between gap-2 mt-2">
                      <div className="d-flex align-items-center gap-2">
                        <span className="h4 m-0">{peakPhase.emoji}</span>
                        <div>
                          <div className="fw-bold text-light">{peakPhase.name}</div>
                          <div className="text-muted small" style={{ fontSize: '0.78rem' }}>
                            {!isAll
                              ? `Mayor concentración de sueños «${currentTag?.name}»`
                              : 'Fase con mayor actividad onírica general'}
                          </div>
                        </div>
                      </div>
                      <div className="text-end">
                        <span className="h4 fw-bold text-warning mb-0">{peakPhase.count}</span>
                        <div className="text-muted small" style={{ fontSize: '0.75rem' }}>
                          {totalDreamsInView > 0 
                            ? `${Math.round((peakPhase.count / totalDreamsInView) * 100)}% del total`
                            : ''}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Lista compacta de las 8 fases */}
                <div className="d-flex flex-column gap-1 bg-black bg-opacity-25 p-3 rounded-3 border border-subtle">
                  <div className="d-flex justify-content-between align-items-center mb-1 text-muted small" style={{ fontSize: '0.75rem' }}>
                    <span>Fase Lunar</span>
                    <span>Sueños</span>
                  </div>
                  {radarData.map(item => {
                    const percent = totalDreamsInView > 0 ? (item.sueños / totalDreamsInView) * 100 : 0;
                    return (
                      <div key={item.key} className="d-flex flex-column gap-1 py-1">
                        <div className="d-flex align-items-center justify-content-between small">
                          <span className="d-flex align-items-center gap-2 text-light">
                            <span>{item.emoji}</span>
                            <span>{item.fullName}</span>
                          </span>
                          <span className="fw-semibold text-light">
                            {item.sueños} <span className="text-muted font-monospace" style={{ fontSize: '0.72rem' }}>({Math.round(percent)}%)</span>
                          </span>
                        </div>
                        <div className="progress" style={{ height: '4px', backgroundColor: 'rgba(255,255,255,0.08)' }}>
                          <div
                            className="progress-bar"
                            role="progressbar"
                            style={{
                              width: `${percent}%`,
                              backgroundColor: activeColor
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default MoonRadarChart;

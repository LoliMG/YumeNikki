import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from 'react-bootstrap/Card';
import {
  RotateCcw,
  Flame,
  Tag as TagIcon,
  Calendar,
  BookOpen,
  Sparkles,
  BarChart3,
  Search
} from 'lucide-react';
import UIButton from '../../components/UI/UIButton/UIButton';
import { UIFormGroup, UIFormLabel, UIFormControl } from '../../components/UI/UIForm/UIForm';
import Loader from '../../components/UI/Loader/Loader';
import { AuthContext } from '../../contexts/AuthContext';
import api from '../../helpers/api';

import EvolutionAreaChart from './components/EvolutionAreaChart';
import TagsDonutChart from './components/TagsDonutChart';
import MoonRadarChart from './components/MoonRadarChart';
import MenstrualComparisonChart from './components/MenstrualComparisonChart';
import './Stats.css';

const Stats = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });

  // Estados para búsqueda de frecuencia de símbolos del glosario
  const [searchSymbol, setSearchSymbol] = useState('');
  const [symbolQueryResult, setSymbolQueryResult] = useState(null);
  const [symbolQueryLoading, setSymbolQueryLoading] = useState(false);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (dateRange.startDate) params.append('startDate', dateRange.startDate);
      if (dateRange.endDate) params.append('endDate', dateRange.endDate);

      const res = await api.get(`/stats?${params.toString()}`);
      setStats(res);
    } catch (err) {
      console.error('Error al cargar estadísticas:', err);
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const querySymbolFrequency = useCallback(async (symbolToQuery) => {
    const target = (symbolToQuery !== undefined ? symbolToQuery : searchSymbol).trim();
    if (!target) return;
    setSymbolQueryLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('symbol', target);
      if (dateRange.startDate) params.append('startDate', dateRange.startDate);
      if (dateRange.endDate) params.append('endDate', dateRange.endDate);

      const res = await api.get(`/stats/symbol-frequency?${params.toString()}`);
      setSymbolQueryResult(res);
    } catch (err) {
      console.error('Error al consultar frecuencia de símbolo:', err);
    } finally {
      setSymbolQueryLoading(false);
    }
  }, [searchSymbol, dateRange]);

  const handleSymbolSubmit = (e) => {
    e.preventDefault();
    querySymbolFrequency();
  };

  const handleSelectBadgeSymbol = (symbol) => {
    setSearchSymbol(symbol);
    querySymbolFrequency(symbol);
  };

  const totalDreamsCount = stats?.tagsStats?.reduce((acc, t) => acc + (Number(t.count) || 0), 0) || 0;
  const isMale = user?.gender === 'male' || user?.gender === 'hombre';
  const showMenstrualStats = !isMale && Boolean(user?.track_cycle);

  return (
    <div className="container-xl py-4 pb-5 stats-page" style={{ maxWidth: 1100 }}>
      {/* Cabecera de la página */}
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div className="d-flex align-items-center gap-3">
          <div className="stats-header-icon-box bg-warning bg-opacity-10 text-warning p-2 rounded-3 border border-warning border-opacity-25">
            <BarChart3 size={24} />
          </div>
          <div>
            <h1 className="h3 font-serif fw-bold text-light mb-1">
              Estadísticas & Analítica Onírica
            </h1>
            <p className="text-muted small mb-0">
              Evolución temporal, patrones lunares, distribución por tipos y correlaciones biológicas
            </p>
          </div>
        </div>
      </div>

      {/* Selector de Rango de Fechas */}
      <Card className="bg-surface border-subtle shadow-sm rounded-4 overflow-hidden mb-4">
        <Card.Body className="p-3 p-md-4">
          <div className="row g-3 align-items-end">
            <div className="col-12 col-sm-5">
              <UIFormGroup className="mb-0">
                <UIFormLabel htmlFor="stats-page-start">Desde fecha</UIFormLabel>
                <UIFormControl
                  id="stats-page-start"
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                />
              </UIFormGroup>
            </div>
            <div className="col-12 col-sm-5">
              <UIFormGroup className="mb-0">
                <UIFormLabel htmlFor="stats-page-end">Hasta fecha</UIFormLabel>
                <UIFormControl
                  id="stats-page-end"
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                />
              </UIFormGroup>
            </div>
            <div className="col-12 col-sm-2">
              <UIButton
                variant="secondary"
                size="sm"
                className="w-100 d-flex align-items-center justify-content-center gap-1 py-2"
                onClick={() => setDateRange({ startDate: '', endDate: '' })}
                title="Limpiar rango de fechas"
              >
                <RotateCcw size={15} />
                <span>Restablecer</span>
              </UIButton>
            </div>
          </div>
        </Card.Body>
      </Card>

      {loading && !stats ? (
        <Loader message="Calculando analíticas y patrones cósmicos..." />
      ) : !stats ? (
        <div className="text-center py-5 text-muted">
          No se pudieron cargar las estadísticas.
        </div>
      ) : (
        <div className="d-flex flex-column gap-4">
          {/* 1. Tarjetas resumen de métricas clave (KPIs) */}
          <div className="row g-3">
            <div className="col-6 col-md-3">
              <div className="summary-item p-3 rounded-3 bg-surface border border-subtle d-flex align-items-center gap-3 h-100">
                <div className="summary-icon-box text-warning bg-warning bg-opacity-10 flex-shrink-0">
                  <Flame size={24} />
                </div>
                <div className="overflow-hidden">
                  <div className="text-muted small text-truncate">Racha actual</div>
                  <div className="h3 fw-bold text-light mb-0 font-sans">
                    {stats.streak?.currentStreak || stats.streak?.current || 0} {stats.streak?.currentStreak === 1 ? 'día' : 'días'}
                  </div>
                </div>
              </div>
            </div>

            <div className="col-6 col-md-3">
              <div className="summary-item p-3 rounded-3 bg-surface border border-subtle d-flex align-items-center gap-3 h-100">
                <div className="summary-icon-box text-primary bg-primary bg-opacity-10 flex-shrink-0">
                  <TagIcon size={24} />
                </div>
                <div className="overflow-hidden">
                  <div className="text-muted small text-truncate">Etiquetas distintas</div>
                  <div className="h3 fw-bold text-light mb-0 font-sans">{stats.tagsStats?.length || 0}</div>
                </div>
              </div>
            </div>

            <div className="col-6 col-md-3">
              <div className="summary-item p-3 rounded-3 bg-surface border border-subtle d-flex align-items-center gap-3 h-100">
                <div className="summary-icon-box text-success bg-success bg-opacity-10 flex-shrink-0">
                  <Calendar size={24} />
                </div>
                <div className="overflow-hidden">
                  <div className="text-muted small text-truncate">Racha máxima</div>
                  <div className="h3 fw-bold text-light mb-0 font-sans">
                    {stats.streak?.maxStreak || stats.streak?.max || 0} {stats.streak?.maxStreak === 1 ? 'día' : 'días'}
                  </div>
                </div>
              </div>
            </div>

            <div className="col-6 col-md-3">
              <div className="summary-item p-3 rounded-3 bg-surface border border-subtle d-flex align-items-center gap-3 h-100">
                <div className="summary-icon-box text-info bg-info bg-opacity-10 flex-shrink-0">
                  <BookOpen size={24} />
                </div>
                <div className="overflow-hidden">
                  <div className="text-muted small text-truncate">Total sueños</div>
                  <div className="h3 fw-bold text-light mb-0 font-sans">
                    {totalDreamsCount}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Fila: Evolución temporal (Área spline) + Distribución de tipos (Donut) */}
          <div className="row g-4">
            <div className="col-12 col-lg-7">
              <EvolutionAreaChart data={stats.evolution} />
            </div>
            <div className="col-12 col-lg-5">
              <TagsDonutChart tagsStats={stats.tagsStats} />
            </div>
          </div>

          {/* 3. Fila: Radar Lunar y Patrón de Fases */}
          <div className="row g-4">
            <div className="col-12">
              <MoonRadarChart 
                moonStats={stats.crosses?.moonCross || []} 
                tagsStats={stats.tagsStats || []}
              />
            </div>
          </div>

          {/* 4. Fila: Correlación con el Ciclo Menstrual (Solo visible si no es hombre y tiene seguimiento activo) */}
          {showMenstrualStats && stats.menstrualStats && stats.menstrualStats.tracked && (
            <MenstrualComparisonChart menstrualStats={stats.menstrualStats} />
          )}

          {/* 5. Fila: Top 10 Símbolos Más Frecuentes y Buscador de Frecuencia (Solo si el usuario ha registrado símbolos en su glosario) */}
          {Boolean(stats.hasGlossarySymbols && stats.frequentSymbols && stats.frequentSymbols.length > 0) && (
            <Card className="bg-surface border-subtle shadow-sm rounded-4 overflow-hidden">
              <Card.Header className="bg-surface-2 bg-opacity-40 border-bottom border-subtle py-3 px-4 d-flex align-items-center justify-content-between gap-2">
                <div className="d-flex align-items-center gap-2">
                  <Sparkles size={18} className="text-warning" />
                  <h2 className="h5 font-serif text-light m-0">Top 10 Símbolos Más Frecuentes</h2>
                </div>
                <UIButton
                  variant="outline-secondary"
                  size="sm"
                  onClick={() => navigate('/dreams/glossary')}
                  className="d-flex align-items-center gap-1"
                  title="Ir al Glosario de Símbolos"
                >
                  <BookOpen size={14} />
                  <span>Ver Glosario</span>
                </UIButton>
              </Card.Header>
              <Card.Body className="p-3 p-md-4">
                <p className="text-muted small mb-3">
                  Los símbolos registrados en tu glosario personal que más se repiten en tus relatos y simbolismos de sueños.
                  Haz clic en cualquiera para seleccionarlo o consulta la frecuencia de cualquier símbolo en el recuadro inferior.
                </p>

                {/* Top 10 símbolos del glosario */}
                <div className="d-flex flex-wrap gap-2 mb-4">
                  {stats.frequentSymbols.slice(0, 10).map((item, idx) => {
                    const isSelected = symbolQueryResult?.symbol?.toLowerCase() === item.symbol.toLowerCase();
                    return (
                      <button
                        key={item.symbol}
                        type="button"
                        onClick={() => handleSelectBadgeSymbol(item.symbol)}
                        className={`badge bg-surface-2 border py-2 px-3 d-flex align-items-center gap-2 shadow-sm text-decoration-none stats-word-badge ${
                          isSelected ? 'is-selected' : 'border-subtle text-light'
                        }`}
                        style={{ 
                          fontSize: idx < 3 ? '0.94rem' : '0.86rem'
                        }}
                        title={`Haz clic para consultar «${item.symbol}»${item.archetype ? ` (${item.archetype})` : ''}`}
                      >
                        <span className="fw-medium">{item.symbol}</span>
                        {item.archetype && (
                          <span className="text-muted small fw-normal" style={{ fontSize: '0.72rem' }}>
                            ({item.archetype})
                          </span>
                        )}
                        <span className="text-warning fw-normal">×{item.count}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Buscador de frecuencia de símbolos */}
                <form onSubmit={handleSymbolSubmit} className="pt-3 border-top border-subtle">
                  <label htmlFor="symbol-search-input" className="form-label text-light fw-medium small mb-2 d-flex align-items-center gap-2">
                    <Search size={15} className="text-warning" />
                    <span>Consultar frecuencia de un símbolo o arquetipo</span>
                  </label>
                  <div className="input-group input-group-sm" style={{ maxWidth: 520 }}>
                    <input
                      id="symbol-search-input"
                      type="text"
                      className="form-control bg-surface-2 text-light border-subtle"
                      placeholder="Escribe el nombre del símbolo (ej. agua, llave, laberinto)..."
                      value={searchSymbol}
                      onChange={(e) => setSearchSymbol(e.target.value)}
                    />
                    <button
                      type="submit"
                      className="btn btn-warning text-dark fw-medium d-flex align-items-center gap-1"
                      disabled={symbolQueryLoading || !searchSymbol.trim()}
                    >
                      {symbolQueryLoading ? 'Buscando...' : 'Consultar'}
                    </button>
                    {searchSymbol && (
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() => { setSearchSymbol(''); setSymbolQueryResult(null); }}
                        title="Limpiar búsqueda"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </form>

                {/* Resultado del conteo */}
                {symbolQueryResult && (
                  <div className="mt-3 p-3 rounded-3 bg-surface-2 border border-subtle d-flex flex-wrap align-items-center justify-content-between gap-3 animate-fade-in">
                    <div>
                      {symbolQueryResult.count > 0 ? (
                        <div>
                          <span className="text-muted small">Frecuencia del símbolo </span>
                          <span className="text-warning fw-bold font-serif fs-6">«{symbolQueryResult.symbol}»</span>:
                          <div className="text-light mt-1">
                            Ha aparecido <span className="text-warning fw-bold">{symbolQueryResult.count}</span> {symbolQueryResult.count === 1 ? 'vez' : 'veces'}{' '}
                            en <span className="text-info fw-bold">{symbolQueryResult.dreamCount}</span> {symbolQueryResult.dreamCount === 1 ? 'sueño' : 'sueños'}.
                          </div>
                        </div>
                      ) : (
                        <div>
                          <span className="text-muted small">Frecuencia del símbolo </span>
                          <span className="text-warning fw-bold font-serif fs-6">«{symbolQueryResult.symbol}»</span>:
                          <div className="text-muted mt-1">
                            No se ha encontrado ninguna coincidencia en tus registros de sueños (0 veces).
                          </div>
                        </div>
                      )}
                    </div>

                    {symbolQueryResult.count > 0 && (
                      <UIButton
                        variant="outline-secondary"
                        size="sm"
                        onClick={() => navigate(`/dreams?search=${encodeURIComponent(symbolQueryResult.symbol)}`)}
                        className="d-flex align-items-center gap-1"
                      >
                        <BookOpen size={14} />
                        <span>Ver sueños con este símbolo</span>
                      </UIButton>
                    )}
                  </div>
                )}
              </Card.Body>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default Stats;

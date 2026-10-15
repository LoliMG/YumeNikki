import React, { useState, useEffect, useContext, useCallback } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import TodayCard from './components/TodayCard/TodayCard';
import MonthSummaryCard from './components/MonthSummaryCard/MonthSummaryCard';
import CalendarView from './components/CalendarView/CalendarView';
import DayPanel from './components/DayPanel/DayPanel';
import Loader from '../../components/UI/Loader/Loader';
import api from '../../helpers/api';
import './Home.css';

const Home = () => {
  const { user } = useContext(AuthContext);
  const timezone = user?.timezone || 'Europe/Madrid';

  // Obtener fecha actual en la zona horaria del usuario en formato YYYY-MM-DD
  const getTodayDateStr = () => {
    try {
      return new Intl.DateTimeFormat('en-CA', { timeZone: timezone }).format(new Date());
    } catch {
      return new Date().toLocaleDateString('en-CA');
    }
  };

  const [selectedDate, setSelectedDate] = useState(getTodayDateStr);
  const [dreams, setDreams] = useState([]);
  const [dayNotesSummary, setDayNotesSummary] = useState([]);
  const [bleedingDates, setBleedingDates] = useState([]);
  const [monthSummary, setMonthSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [summaryLoading, setSummaryLoading] = useState(true);

  // Cargar lista de sueños
  const fetchDreams = useCallback(async () => {
    try {
      const res = await api.get('/dreams');
      if (res.dreams) {
        setDreams(res.dreams);
      }
    } catch (err) {
      console.error('Error al cargar sueños:', err);
    }
  }, []);

  // Cargar resumen de notas de día para mostrar indicadores en el calendario (ventana de 3 meses alrededor de la fecha base)
  const fetchDayNotesSummary = useCallback(async (baseDateObj) => {
    try {
      const base = baseDateObj instanceof Date ? baseDateObj : new Date();
      const year = base.getFullYear();
      const month = base.getMonth();
      const start = new Date(year, month - 2, 1).toLocaleDateString('en-CA');
      const end = new Date(year, month + 3, 0).toLocaleDateString('en-CA');
      const res = await api.get(`/day-notes?startDate=${start}&endDate=${end}`);
      if (res.summary) {
        setDayNotesSummary(res.summary);
      }
    } catch (err) {
      console.error('Error al cargar resumen de notas:', err);
    }
  }, []);

  // Cargar fechas con menstruación / sangrado si el usuario tiene seguimiento de ciclo
  const fetchBleedingDates = useCallback(async (baseDateObj) => {
    if (!user?.track_cycle || user?.gender === 'male' || user?.gender === 'hombre') {
      setBleedingDates([]);
      return;
    }
    try {
      const base = baseDateObj instanceof Date ? baseDateObj : new Date();
      const year = base.getFullYear();
      const month = base.getMonth();
      const start = new Date(year, month - 2, 1).toISOString().split('T')[0];
      const end = new Date(year, month + 3, 0).toISOString().split('T')[0];
      const res = await api.get(`/cycle/bleeding-days?startDate=${start}&endDate=${end}`);
      if (res?.bleedingDates) {
        setBleedingDates(res.bleedingDates);
      }
    } catch (err) {
      console.error('Error al cargar fechas de sangrado:', err);
    }
  }, [user?.track_cycle, user?.gender]);

  // Manejar cambio de mes desde el calendario
  const handleMonthChange = useCallback((newDate) => {
    fetchDayNotesSummary(newDate);
    fetchBleedingDates(newDate);
  }, [fetchDayNotesSummary, fetchBleedingDates]);

  // Cargar resumen del mes
  const fetchMonthSummary = useCallback(async () => {
    setSummaryLoading(true);
    try {
      const res = await api.get('/stats/month-summary');
      if (res.summary) {
        setMonthSummary(res.summary);
      }
    } catch (err) {
      console.error('Error al cargar métricas del mes:', err);
    } finally {
      setSummaryLoading(false);
    }
  }, []);

  // Carga inicial al montar el componente (no se vuelve a ejecutar al cambiar de día)
  useEffect(() => {
    let isMounted = true;
    const loadInitialData = async () => {
      setLoading(true);
      await Promise.all([fetchDreams(), fetchDayNotesSummary(), fetchBleedingDates(), fetchMonthSummary()]);
      if (isMounted) setLoading(false);
    };

    loadInitialData();
    return () => { isMounted = false; };
  }, [fetchDreams, fetchDayNotesSummary, fetchBleedingDates, fetchMonthSummary]);

  const handleDayNotesChange = () => {
    fetchDayNotesSummary();
    fetchBleedingDates();
  };

  if (loading) {
    return <Loader message="Cargando tu diario de sueños..." />;
  }

  return (
    <div className="home-dashboard py-3">
      {/* Fila superior: Hoy y Resumen mensual */}
      <div className="row g-4 mb-4">
        <div className="col-12 col-lg-7">
          <TodayCard timezone={timezone} />
        </div>
        <div className="col-12 col-lg-5">
          <MonthSummaryCard summary={monthSummary} loading={summaryLoading} />
        </div>
      </div>

      {/* Fila principal: Calendario mensual/semanal y Panel lateral de la fecha */}
      <div className="row g-4">
        <div className="col-12 col-lg-7">
          <CalendarView
            dreams={dreams}
            dayNotesSummary={dayNotesSummary}
            bleedingDates={bleedingDates}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            onMonthChange={handleMonthChange}
            timezone={timezone}
          />
        </div>
        <div className="col-12 col-lg-5">
          <DayPanel
            selectedDate={selectedDate}
            dreams={dreams}
            timezone={timezone}
            isBleeding={bleedingDates.includes(selectedDate)}
            trackCycle={Boolean(user?.track_cycle)}
            onBleedingToggle={fetchBleedingDates}
            onDayNotesChange={handleDayNotesChange}
          />
        </div>
      </div>
    </div>
  );
};

export default Home;

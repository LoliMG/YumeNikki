/**
 * Servicio con los algoritmos dinámicos de cálculo de ciclo menstrual
 * Basado 100% en fechas reales registradas (sin cifras preestablecidas fijas)
 */

export const calculateCycleMetrics = (periods = []) => {
  if (!periods || periods.length === 0) {
    return {
      totalPeriodsLogged: 0,
      avgBleedingDays: null,
      avgCycleDays: null,
      cycleDaysHistory: [],
      bleedingDaysHistory: [],
      lastPeriod: null
    };
  }

  // Ordenar cronológicamente por start_date
  const sorted = [...periods].sort((a, b) => new Date(a.start_date) - new Date(b.start_date));

  const bleedingDaysHistory = [];
  const cycleDaysHistory = [];

  for (let i = 0; i < sorted.length; i++) {
    const current = sorted[i];

    // 1. Calcular duración de sangrado si tiene end_date
    if (current.end_date) {
      const start = new Date(current.start_date);
      const end = new Date(current.end_date);
      const diffDays = Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1;
      if (diffDays >= 1 && diffDays <= 20) {
        bleedingDaysHistory.push({
          periodId: current.id,
          startDate: current.start_date,
          endDate: current.end_date,
          days: diffDays
        });
      }
    }

    // 2. Calcular duración del ciclo entre este inicio y el siguiente inicio
    if (i + 1 < sorted.length) {
      const next = sorted[i + 1];
      const startCurrent = new Date(current.start_date);
      const startNext = new Date(next.start_date);
      const diffCycle = Math.round((startNext - startCurrent) / (1000 * 60 * 60 * 24));
      // Filtrar ciclos fisiológicamente plausibles (ej. entre 15 y 60 días)
      if (diffCycle >= 15 && diffCycle <= 60) {
        cycleDaysHistory.push({
          fromPeriodId: current.id,
          fromDate: current.start_date,
          toDate: next.start_date,
          days: diffCycle
        });
      }
    }
  }

  // Medias dinámicas aritméticas
  const avgBleedingDays = bleedingDaysHistory.length > 0
    ? Number((bleedingDaysHistory.reduce((acc, curr) => acc + curr.days, 0) / bleedingDaysHistory.length).toFixed(1))
    : null;

  const avgCycleDays = cycleDaysHistory.length > 0
    ? Number((cycleDaysHistory.reduce((acc, curr) => acc + curr.days, 0) / cycleDaysHistory.length).toFixed(1))
    : null;

  const lastPeriod = sorted[sorted.length - 1];

  return {
    totalPeriodsLogged: sorted.length,
    avgBleedingDays,
    avgCycleDays,
    cycleDaysHistory,
    bleedingDaysHistory,
    lastPeriod
  };
};

export const isDateInPeriodList = (dateStr, periods = []) => {
  const target = typeof dateStr === 'string' ? dateStr.split('T')[0] : new Date(dateStr).toISOString().split('T')[0];
  return periods.some(p => {
    const start = typeof p.start_date === 'string' ? p.start_date.split('T')[0] : new Date(p.start_date).toISOString().split('T')[0];
    if (p.end_date) {
      const end = typeof p.end_date === 'string' ? p.end_date.split('T')[0] : new Date(p.end_date).toISOString().split('T')[0];
      return target >= start && target <= end;
    }
    return target === start;
  });
};

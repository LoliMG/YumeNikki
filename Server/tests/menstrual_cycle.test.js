import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { calculateCycleMetrics, isDateInPeriodList } from '../modules/menstrual/menstrual.service.js';

describe('Cálculos Dinámicos del Ciclo Menstrual', () => {
  it('Retorna métricas nulas cuando no hay periodos registrados (sin valores prefijados)', () => {
    const res = calculateCycleMetrics([]);
    assert.equal(res.totalPeriodsLogged, 0);
    assert.equal(res.avgBleedingDays, null);
    assert.equal(res.avgCycleDays, null);
    assert.equal(res.cycleDaysHistory.length, 0);
  });

  it('Calcula la duración del sangrado a partir de fecha de inicio y último día de sangrado', () => {
    const periods = [
      { id: 1, start_date: '2026-01-01', end_date: '2026-01-05' } // 5 días de sangrado (1, 2, 3, 4, 5)
    ];
    const res = calculateCycleMetrics(periods);
    assert.equal(res.totalPeriodsLogged, 1);
    assert.equal(res.avgBleedingDays, 5);
    assert.equal(res.avgCycleDays, null); // Solo un periodo, aún no hay distancia entre ciclos
  });

  it('Calcula la duración del ciclo dinámicamente entre inicios consecutivos', () => {
    const periods = [
      { id: 1, start_date: '2026-01-01', end_date: '2026-01-05' }, // 5 días sangrado
      { id: 2, start_date: '2026-01-30', end_date: '2026-02-02' }, // 4 días sangrado; ciclo 29 días (1 Ene -> 30 Ene)
      { id: 3, start_date: '2026-02-27', end_date: '2026-03-03' }  // 5 días sangrado; ciclo 28 días (30 Ene -> 27 Feb)
    ];
    const res = calculateCycleMetrics(periods);
    assert.equal(res.totalPeriodsLogged, 3);
    // Media sangrado: (5 + 4 + 5) / 3 = 4.7
    assert.equal(res.avgBleedingDays, 4.7);
    // Media ciclo: (29 + 28) / 2 = 28.5
    assert.equal(res.avgCycleDays, 28.5);
    assert.equal(res.cycleDaysHistory.length, 2);
  });

  it('Verifica pertenencia de fechas a periodos registrados', () => {
    const periods = [
      { id: 1, start_date: '2026-01-01', end_date: '2026-01-04' }
    ];
    assert.equal(isDateInPeriodList('2026-01-01', periods), true);
    assert.equal(isDateInPeriodList('2026-01-03', periods), true);
    assert.equal(isDateInPeriodList('2026-01-04', periods), true);
    assert.equal(isDateInPeriodList('2026-01-05', periods), false);
    assert.equal(isDateInPeriodList('2025-12-31', periods), false);
  });
});

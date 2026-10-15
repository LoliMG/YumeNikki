import * as menstrualDal from './menstrual.dal.js';
import * as menstrualService from './menstrual.service.js';
import * as dayNoteDal from '../dayNote/dayNote.dal.js';

export const getCycleInfo = async (req, res, next) => {
  try {
    const periods = await menstrualDal.findPeriodsByUserId(req.user_id);
    const metrics = menstrualService.calculateCycleMetrics(periods);

    return res.json({
      periods,
      metrics
    });
  } catch (error) {
    next(error);
  }
};

export const logPeriod = async (req, res, next) => {
  try {
    const { start_date, end_date } = req.body;

    if (!start_date) {
      return res.status(400).json({ message: 'La fecha de inicio de la menstruación es obligatoria.' });
    }

    if (end_date && new Date(end_date) < new Date(start_date)) {
      return res.status(400).json({ message: 'La fecha de fin no puede ser anterior a la fecha de inicio.' });
    }

    const period = await menstrualDal.createPeriod(req.user_id, start_date, end_date || null);
    
    // Devolver lista actualizada y métricas dinámicas
    const periods = await menstrualDal.findPeriodsByUserId(req.user_id);
    const metrics = menstrualService.calculateCycleMetrics(periods);

    return res.status(201).json({
      message: 'Periodo registrado correctamente.',
      period,
      periods,
      metrics
    });
  } catch (error) {
    next(error);
  }
};

export const updatePeriod = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { start_date, end_date } = req.body;

    if (start_date && end_date && new Date(end_date) < new Date(start_date)) {
      return res.status(400).json({ message: 'La fecha de fin no puede ser anterior a la fecha de inicio.' });
    }

    const updated = await menstrualDal.updatePeriod(req.user_id, Number(id), {
      startDate: start_date,
      endDate: end_date
    });

    if (!updated) {
      return res.status(404).json({ message: 'Periodo no encontrado.' });
    }

    const periods = await menstrualDal.findPeriodsByUserId(req.user_id);
    const metrics = menstrualService.calculateCycleMetrics(periods);

    return res.json({
      message: 'Periodo actualizado correctamente.',
      period: updated,
      periods,
      metrics
    });
  } catch (error) {
    next(error);
  }
};

export const deletePeriod = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await menstrualDal.deletePeriod(req.user_id, Number(id));

    if (!deleted) {
      return res.status(404).json({ message: 'Periodo no encontrado.' });
    }

    const periods = await menstrualDal.findPeriodsByUserId(req.user_id);
    const metrics = menstrualService.calculateCycleMetrics(periods);

    return res.json({
      message: 'Periodo eliminado correctamente.',
      periods,
      metrics
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Devuelve todas las fechas con sangrado en un rango (para el calendario mensual)
 */
export const getBleedingDaysForRange = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'Se requieren startDate y endDate.' });
    }

    // 1. Periodos que se solapan con el rango
    const periods = await menstrualDal.getPeriodsBetweenDates(req.user_id, startDate, endDate);

    // 2. Notas del día con is_bleeding = true
    const dayNotes = await dayNoteDal.getDayNotesSummaryForRange(req.user_id, startDate, endDate);
    const bleedingNotesDates = dayNotes.filter(n => n.has_bleeding).map(n => {
      const d = n.note_date;
      return typeof d === 'string' ? d.split('T')[0] : new Date(d).toISOString().split('T')[0];
    });

    // Expandir fechas de periodos
    const bleedingDatesSet = new Set(bleedingNotesDates);

    periods.forEach(p => {
      const start = new Date(p.start_date);
      const end = p.end_date ? new Date(p.end_date) : start;
      const curr = new Date(start);

      while (curr <= end) {
        bleedingDatesSet.add(curr.toISOString().split('T')[0]);
        curr.setDate(curr.getDate() + 1);
      }
    });

    return res.json({
      bleedingDates: Array.from(bleedingDatesSet).sort()
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Toggle rápido de sangrado para una fecha (usado en DayPanel)
 */
export const toggleBleedingDate = async (req, res, next) => {
  try {
    const { date, isBleeding } = req.body;
    if (!date) {
      return res.status(400).json({ message: 'La fecha es obligatoria.' });
    }

    // Buscar si ya existe una nota de día para esa fecha
    const existingNotes = await dayNoteDal.getDayNotesByDate(req.user_id, date);
    
    if (existingNotes.length > 0) {
      const note = existingNotes[0];
      const newBleeding = typeof isBleeding === 'boolean' ? isBleeding : !note.is_bleeding;
      await dayNoteDal.updateDayNote({
        id: note.id,
        userId: req.user_id,
        isBleeding: newBleeding
      });
    } else {
      // Crear una nota de día marcando is_bleeding
      await dayNoteDal.createDayNote({
        userId: req.user_id,
        noteDate: date,
        content: '',
        isBleeding: typeof isBleeding === 'boolean' ? isBleeding : true
      });
    }

    return res.json({
      message: 'Estado de sangrado actualizado.',
      date,
      isBleeding: Boolean(isBleeding)
    });
  } catch (error) {
    next(error);
  }
};

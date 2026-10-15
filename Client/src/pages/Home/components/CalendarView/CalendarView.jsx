import React, { useState, useMemo, useEffect } from 'react';
import Card from 'react-bootstrap/Card';
import UIButton from '../../../../components/UI/UIButton/UIButton';
import UIModal from '../../../../components/UI/UIModal/UIModal';
import { UIFormGroup, UIFormLabel, UIFormControl } from '../../../../components/UI/UIForm/UIForm';
import { calculateMoonForDate } from '../../../../helpers/moonHelper';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, FileText, Droplet, Check } from 'lucide-react';
import './CalendarView.css';

const WEEKDAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const CalendarView = ({
  dreams = [],
  dayNotesSummary = [],
  bleedingDates = [],
  selectedDate,
  onSelectDate,
  onMonthChange,
  timezone = 'Europe/Madrid'
}) => {
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [showDatePickerModal, setShowDatePickerModal] = useState(false);

  const getTodayStr = () => {
    try {
      return new Intl.DateTimeFormat('en-CA', { timeZone: timezone }).format(new Date());
    } catch {
      return new Date().toLocaleDateString('en-CA');
    }
  };

  const [targetDateInput, setTargetDateInput] = useState(() => selectedDate || getTodayStr());

  // Sincronizar currentDate si selectedDate cambia desde un componente padre
  useEffect(() => {
    if (!selectedDate) return;
    try {
      const [year, month, day] = selectedDate.split('-').map(Number);
      if (year && month) {
        setCurrentDate(prev => {
          if (prev.getFullYear() !== year || prev.getMonth() !== (month - 1)) {
            return new Date(year, month - 1, day || 1);
          }
          return prev;
        });
      }
    } catch (_) {}
  }, [selectedDate]);

  // Mapear sueños por fecha: { 'YYYY-MM-DD': [ { tag_color, tag_name }, ... ] }
  const dreamsByDate = useMemo(() => {
    const map = {};
    for (const d of dreams) {
      const dateKey = typeof d.dream_date === 'string' ? d.dream_date.split('T')[0] : d.dream_date;
      if (!map[dateKey]) map[dateKey] = [];
      map[dateKey].push({
        id: d.id,
        color: d.tag_color || '#a78bfa',
        name: d.tag_name || 'Sin etiqueta'
      });
    }
    return map;
  }, [dreams]);

  // Conjunto de fechas que tienen notas del día
  const notesDatesSet = useMemo(() => {
    const set = new Set();
    for (const item of dayNotesSummary) {
      const dateKey = typeof item.note_date === 'string' ? item.note_date.split('T')[0] : item.note_date;
      set.add(dateKey);
    }
    return set;
  }, [dayNotesSummary]);

  // Conjunto de fechas con menstruación / sangrado
  const bleedingDatesSet = useMemo(() => {
    return new Set(bleedingDates || []);
  }, [bleedingDates]);

  // Navegación mensual
  const goToPrevious = () => {
    setCurrentDate(prev => {
      const d = new Date(prev);
      d.setMonth(d.getMonth() - 1);
      if (onMonthChange) onMonthChange(d);
      return d;
    });
  };

  const goToNext = () => {
    setCurrentDate(prev => {
      const d = new Date(prev);
      d.setMonth(d.getMonth() + 1);
      if (onMonthChange) onMonthChange(d);
      return d;
    });
  };

  const goToToday = () => {
    const now = new Date();
    setCurrentDate(now);
    const dateStr = getTodayStr();
    onSelectDate(dateStr);
    if (onMonthChange) onMonthChange(now);
  };

  // Cálculo de los días de la cuadrícula mensual
  const calendarDays = useMemo(() => {
    const days = [];
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    // En JavaScript, domingo = 0. En España la semana empieza el lunes = 1
    let startOffset = firstDayOfMonth.getDay() - 1;
    if (startOffset === -1) startOffset = 6;

    // Días del mes anterior para rellenar
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startOffset - 1; i >= 0; i--) {
      const d = new Date(year, month - 1, prevMonthLastDay - i);
      days.push({ date: d, isCurrentMonth: false });
    }

    // Días del mes actual
    for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
      days.push({ date: new Date(year, month, i), isCurrentMonth: true });
    }

    // Días del siguiente mes para completar filas de 7
    const totalRemainder = (7 - (days.length % 7)) % 7;
    for (let i = 1; i <= totalRemainder; i++) {
      days.push({ date: new Date(year, month + 1, i), isCurrentMonth: false });
    }

    const todayStr = (() => {
      try {
        return new Intl.DateTimeFormat('en-CA', { timeZone: timezone }).format(new Date());
      } catch {
        return new Date().toLocaleDateString('en-CA');
      }
    })();

    return days.map(item => {
      const d = item.date;
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      let moon = null;
      try {
        moon = calculateMoonForDate(dateStr, timezone);
      } catch (_) {}

      return {
        date: d,
        dateStr,
        dayNumber: d.getDate(),
        isCurrentMonth: item.isCurrentMonth,
        isToday: todayStr === dateStr,
        isSelected: selectedDate === dateStr,
        moon,
        dreamDots: dreamsByDate[dateStr] || [],
        hasNotes: notesDatesSet.has(dateStr),
        isBleeding: bleedingDatesSet.has(dateStr)
      };
    });
  }, [currentDate, dreamsByDate, notesDatesSet, bleedingDatesSet, selectedDate, timezone]);

  // Título del encabezado (Mes y Año)
  const headerTitle = useMemo(() => {
    const formatter = new Intl.DateTimeFormat('es-ES', { month: 'long', year: 'numeric' });
    const str = formatter.format(currentDate);
    return str.charAt(0).toUpperCase() + str.slice(1);
  }, [currentDate]);

  // Lista de años disponibles para salto rápido (desde 20 años atrás hasta +2 años)
  const currentYearNum = new Date().getFullYear();
  const yearOptions = useMemo(() => {
    const years = [];
    for (let y = currentYearNum + 2; y >= currentYearNum - 25; y--) {
      years.push(y);
    }
    return years;
  }, [currentYearNum]);

  // Mes y Año derivados del input del modal
  const [modalYear, modalMonth] = useMemo(() => {
    if (!targetDateInput) {
      const now = new Date();
      return [now.getFullYear(), now.getMonth() + 1];
    }
    const [y, m] = targetDateInput.split('-').map(Number);
    return [y || currentYearNum, m || 1];
  }, [targetDateInput, currentYearNum]);

  const handleMonthSelectChange = (e) => {
    const newMonth = Number(e.target.value);
    const [currY, , currD] = (targetDateInput || getTodayStr()).split('-').map(Number);
    const maxDays = new Date(currY, newMonth, 0).getDate();
    const clampedDay = Math.min(currD || 1, maxDays);
    const newDateStr = `${currY}-${String(newMonth).padStart(2, '0')}-${String(clampedDay).padStart(2, '0')}`;
    setTargetDateInput(newDateStr);
  };

  const handleYearSelectChange = (e) => {
    const newYear = Number(e.target.value);
    const [, currM, currD] = (targetDateInput || getTodayStr()).split('-').map(Number);
    const maxDays = new Date(newYear, currM || 1, 0).getDate();
    const clampedDay = Math.min(currD || 1, maxDays);
    const newDateStr = `${newYear}-${String(currM || 1).padStart(2, '0')}-${String(clampedDay).padStart(2, '0')}`;
    setTargetDateInput(newDateStr);
  };

  const handleQuickJump = (yearOffset) => {
    const now = new Date();
    const targetY = now.getFullYear() + yearOffset;
    const targetM = now.getMonth() + 1;
    const targetD = now.getDate();
    const maxDays = new Date(targetY, targetM, 0).getDate();
    const clampedDay = Math.min(targetD, maxDays);
    const newDateStr = `${targetY}-${String(targetM).padStart(2, '0')}-${String(clampedDay).padStart(2, '0')}`;
    setTargetDateInput(newDateStr);
  };

  const handleApplyDate = (e) => {
    if (e) e.preventDefault();
    if (!targetDateInput) return;
    const [year, month, day] = targetDateInput.split('-').map(Number);
    if (!year || !month || !day) return;

    const newDate = new Date(year, month - 1, day);
    setCurrentDate(newDate);
    onSelectDate(targetDateInput);
    if (onMonthChange) onMonthChange(newDate);
    setShowDatePickerModal(false);
  };

  const handleModalGoToToday = () => {
    goToToday();
    setShowDatePickerModal(false);
  };

  return (
    <Card className="calendar-card shadow-sm border border-subtle rounded-4 h-100 mb-0 bg-surface">
      <Card.Body className="p-3 p-md-4">
        {/* Barra superior de controles del calendario */}
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-4">
          <div className="d-flex align-items-center gap-2">
            <button
              type="button"
              className="calendar-header-title-btn"
              onClick={() => {
                setTargetDateInput(selectedDate || getTodayStr());
                setShowDatePickerModal(true);
              }}
              title="Haz clic para seleccionar otra fecha o saltar a otro año"
            >
              <h3 className="font-serif text-light h4 mb-0 fw-bold">{headerTitle}</h3>
            </button>
            <UIButton
              variant="outline-light"
              size="sm"
              onClick={goToToday}
              className="ms-1 px-2 py-1 small"
              title="Volver a la fecha de hoy"
            >
              Hoy
            </UIButton>
          </div>

          <div className="d-flex align-items-center gap-2">
            {/* Botón para seleccionar fecha libremente */}
            <UIButton
              variant="secondary"
              size="sm"
              onClick={() => {
                setTargetDateInput(selectedDate || getTodayStr());
                setShowDatePickerModal(true);
              }}
              className="d-flex align-items-center gap-1 px-2 py-1 small"
              title="Buscar o ir a una fecha libremente (cualquier año o mes)"
            >
              <CalendarIcon size={15} />
              <span>Ir a fecha...</span>
            </UIButton>

            {/* Flechas de navegación */}
            <div className="d-flex align-items-center gap-1">
              <UIButton
                variant="secondary"
                size="sm"
                onClick={goToPrevious}
                aria-label="Mes anterior"
                className="p-1"
                title="Mes anterior"
              >
                <ChevronLeft size={18} />
              </UIButton>
              <UIButton
                variant="secondary"
                size="sm"
                onClick={goToNext}
                aria-label="Mes siguiente"
                className="p-1"
                title="Mes siguiente"
              >
                <ChevronRight size={18} />
              </UIButton>
            </div>
          </div>
        </div>

        {/* Encabezados de días de la semana */}
        <div className="calendar-grid-header mb-2">
          {WEEKDAYS.map((day, idx) => (
            <div key={idx} className="calendar-weekday-title">
              {day}
            </div>
          ))}
        </div>

        {/* Cuadrícula de días */}
        <div className="calendar-grid">
          {calendarDays.map((dayItem, idx) => (
            <div
              key={idx}
              className={`calendar-day-cell ${
                !dayItem.isCurrentMonth ? 'calendar-day-outside' : ''
              } ${dayItem.isToday ? 'calendar-day-today' : ''} ${
                dayItem.isSelected ? 'calendar-day-selected' : ''
              }`}
              onClick={() => onSelectDate(dayItem.dateStr)}
              role="button"
              tabIndex={0}
              aria-label={`Día ${dayItem.dayNumber}, ${dayItem.dreamDots.length} sueños registados`}
            >
              <div className="d-flex align-items-center justify-content-between w-100">
                <span className="calendar-day-number">{dayItem.dayNumber}</span>
                <div className="d-flex align-items-center gap-1">
                  {dayItem.isBleeding && (
                    <span
                      className="calendar-day-bleeding text-danger"
                      title="Menstruación / Sangrado"
                      aria-label="Menstruación"
                      style={{ display: 'inline-flex', alignItems: 'center' }}
                    >
                      <Droplet size={11} fill="currentColor" />
                    </span>
                  )}
                  {dayItem.moon && (
                    <span className="calendar-day-moon" aria-hidden="true" title={dayItem.moon.phaseName}>
                      {dayItem.moon.phaseEmoji}
                    </span>
                  )}
                </div>
              </div>

              {/* Indicadores: puntos de colores de sueños y notas del día */}
              <div className="calendar-day-indicators mt-auto d-flex align-items-center justify-content-between w-100">
                <div className="calendar-dream-dots d-flex gap-1 flex-wrap">
                  {dayItem.dreamDots.slice(0, 4).map((dot, dIdx) => (
                    <span
                      key={dIdx}
                      className="calendar-color-dot"
                      style={{ backgroundColor: dot.color }}
                      title={dot.name}
                    />
                  ))}
                  {dayItem.dreamDots.length > 4 && (
                    <span className="calendar-color-dot-more">+{dayItem.dreamDots.length - 4}</span>
                  )}
                </div>

                {dayItem.hasNotes && (
                  <span className="calendar-note-indicator text-warning" title="Tiene notas del día">
                    <FileText size={11} aria-hidden="true" />
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Modal para seleccionar fecha libremente */}
        <UIModal
          show={showDatePickerModal}
          onHide={() => setShowDatePickerModal(false)}
          title="Seleccionar Fecha"
          size="md"
          footer={
            <div className="d-flex justify-content-between align-items-center w-100">
              <UIButton
                variant="outline-light"
                size="sm"
                onClick={handleModalGoToToday}
                className="d-flex align-items-center gap-1"
              >
                <span>Volver a hoy</span>
              </UIButton>
              <div className="d-flex gap-2">
                <UIButton
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowDatePickerModal(false)}
                >
                  Cancelar
                </UIButton>
                <UIButton
                  variant="primary"
                  size="sm"
                  onClick={handleApplyDate}
                  className="d-flex align-items-center gap-1"
                >
                  <Check size={16} />
                  <span>Ir a esta fecha</span>
                </UIButton>
              </div>
            </div>
          }
        >
          <form onSubmit={handleApplyDate}>
            <p className="text-muted small mb-3">
              Selecciona directamente cualquier día, mes o año para consultar o registrar sueños y notas de fechas pasadas.
            </p>

            {/* Selector de fecha estándar nativo */}
            <UIFormGroup className="mb-3">
              <UIFormLabel htmlFor="calendar-direct-date">
                Fecha exacta (Día / Mes / Año)
              </UIFormLabel>
              <UIFormControl
                id="calendar-direct-date"
                type="date"
                value={targetDateInput}
                onChange={(e) => setTargetDateInput(e.target.value)}
                autoFocus
              />
            </UIFormGroup>

            {/* Selectores rápidos desplegables de Año y Mes */}
            <div className="row g-2 mb-3">
              <div className="col-7">
                <UIFormLabel className="small text-muted mb-1">Mes</UIFormLabel>
                <select
                  className="form-select form-select-sm bg-dark text-light border-secondary"
                  value={modalMonth}
                  onChange={handleMonthSelectChange}
                >
                  {MONTH_NAMES.map((mName, mIdx) => (
                    <option key={mIdx} value={mIdx + 1}>
                      {mName}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-5">
                <UIFormLabel className="small text-muted mb-1">Año</UIFormLabel>
                <select
                  className="form-select form-select-sm bg-dark text-light border-secondary"
                  value={modalYear}
                  onChange={handleYearSelectChange}
                >
                  {yearOptions.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Accesos rápidos a saltos de años */}
            <div className="pt-2 border-top border-secondary border-opacity-50">
              <span className="small text-muted d-block mb-2">Saltos rápidos en el tiempo:</span>
              <div className="d-flex flex-wrap gap-2">
                <UIButton
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="py-1 px-2 small"
                  onClick={() => handleQuickJump(0)}
                >
                  Hoy
                </UIButton>
                <UIButton
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="py-1 px-2 small"
                  onClick={() => handleQuickJump(-1)}
                >
                  -1 año ({currentYearNum - 1})
                </UIButton>
                <UIButton
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="py-1 px-2 small"
                  onClick={() => handleQuickJump(-2)}
                >
                  -2 años ({currentYearNum - 2})
                </UIButton>
                <UIButton
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="py-1 px-2 small"
                  onClick={() => handleQuickJump(-3)}
                >
                  -3 años ({currentYearNum - 3})
                </UIButton>
                <UIButton
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="py-1 px-2 small"
                  onClick={() => handleQuickJump(-5)}
                >
                  -5 años ({currentYearNum - 5})
                </UIButton>
              </div>
            </div>
          </form>
        </UIModal>
      </Card.Body>
    </Card>
  );
};

export default CalendarView;

import React, { useMemo } from 'react';
import Card from 'react-bootstrap/Card';
import { calculateMoonForDate } from '../../../../helpers/moonHelper';
import UITooltip from '../../../../components/UI/UITooltip/UITooltip';
import { Sparkles } from 'lucide-react';
import './TodayCard.css';

const TodayCard = ({ timezone = 'Europe/Madrid' }) => {
  const todayInfo = useMemo(() => {
    const now = new Date();
    // Obtener la fecha en formato YYYY-MM-DD en la zona horaria del usuario
    const dateStr = new Intl.DateTimeFormat('en-CA', { timeZone: timezone }).format(now);

    // Formatear texto en español: "Martes, 13 de octubre de 2026"
    const formatter = new Intl.DateTimeFormat('es-ES', {
      timeZone: timezone,
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    const formattedDate = formatter.format(now);
    const capitalizedDate = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);

    const moon = calculateMoonForDate(dateStr, timezone);

    return {
      dateStr,
      capitalizedDate,
      moon
    };
  }, [timezone]);

  return (
    <Card className="today-card shadow-sm border border-subtle rounded-4 h-100 mb-0">
      <Card.Body className="p-4 d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
        <div>
          <div className="d-inline-flex align-items-center gap-1 px-2 py-1 rounded-pill bg-warning bg-opacity-10 text-warning small fw-bold mb-2">
            <Sparkles size={13} aria-hidden="true" />
            <span>Esta noche</span>
          </div>
          <h2 className="font-serif fw-bold text-light mb-1 h3">
            {todayInfo.capitalizedDate}
          </h2>
          <p className="text-muted small mb-0">
            Influencia celeste para los sueños de esta velada
          </p>
        </div>

        <div className="d-flex align-items-center gap-3 bg-surface-2 p-3 rounded-3 border border-subtle">
          <UITooltip text={`Fase lunar: ${todayInfo.moon.phaseName}`}>
            <div className="text-center px-2" tabIndex={0} aria-label={`Fase lunar: ${todayInfo.moon.phaseName}`}>
              <div className="today-moon-emoji" aria-hidden="true">{todayInfo.moon.phaseEmoji}</div>
              <div className="small text-light fw-semibold mt-1">{todayInfo.moon.phaseName}</div>
            </div>
          </UITooltip>

          <div className="vr bg-border my-1"></div>

          <UITooltip text={`Signo lunar: ${todayInfo.moon.zodiacSign}`}>
            <div className="text-center px-2" tabIndex={0} aria-label={`Signo lunar: ${todayInfo.moon.zodiacSign}`}>
              <div className="today-zodiac-symbol" aria-hidden="true">{todayInfo.moon.zodiacSymbol}</div>
              <div className="small text-warning fw-semibold mt-1">{todayInfo.moon.zodiacSign}</div>
            </div>
          </UITooltip>
        </div>
      </Card.Body>
    </Card>
  );
};

export default TodayCard;

import React from 'react';
import UITooltip from '../UI/UITooltip/UITooltip';
import './MoonBadge.css';

/**
 * Muestra la fase lunar y el signo del zodíaco tropical con tooltip explicativo
 */
const MoonBadge = ({
  phaseName = 'Luna nueva',
  phaseEmoji = '🌑',
  zodiacSign = 'Aries',
  zodiacSymbol = '♈︎',
  size = 'md',
  showText = false,
  className = ''
}) => {
  const tooltipText = `${phaseName} en ${zodiacSign}`;

  const content = (
    <span
      className={`moon-badge moon-badge-${size} ${className}`}
      tabIndex={0}
      aria-label={tooltipText}
    >
      <span className="moon-phase-icon" aria-hidden="true">{phaseEmoji}</span>
      <span className="moon-zodiac-icon" aria-hidden="true">{zodiacSymbol}</span>
      {showText && (
        <span className="moon-badge-text ms-1">
          {phaseName} · {zodiacSign}
        </span>
      )}
    </span>
  );

  if (showText) {
    return content;
  }

  return (
    <UITooltip text={tooltipText}>
      {content}
    </UITooltip>
  );
};

export default MoonBadge;

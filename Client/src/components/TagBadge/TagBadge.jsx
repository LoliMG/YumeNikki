import React from 'react';
import UITooltip from '../UI/UITooltip/UITooltip';
import './TagBadge.css';

/**
 * Muestra las iniciales de la etiqueta con su color identificativo
 * y una etiqueta flotante con el nombre completo al pasar el cursor o hacer foco.
 */
const TagBadge = ({
  tag,
  size = 'md',
  className = '',
  onClick,
  active = false
}) => {
  if (!tag) return null;

  const tooltipText = tag.is_archived
    ? `${tag.name} (${tag.initials}) - Archivada`
    : `${tag.name} (${tag.initials})`;

  const badgeContent = (
    <span
      className={`tag-badge tag-badge-${size} ${active ? 'tag-badge-active' : ''} ${className}`}
      style={{
        '--tag-color': tag.color || '#a78bfa'
      }}
      tabIndex={0}
      role={onClick ? 'button' : 'note'}
      onClick={onClick}
      aria-label={`Etiqueta: ${tag.name}`}
      title={tooltipText}
    >
      <span className="tag-badge-initials">{tag.initials || '—'}</span>
    </span>
  );

  return (
    <UITooltip text={tooltipText}>
      {badgeContent}
    </UITooltip>
  );
};

export default TagBadge;

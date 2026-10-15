import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock } from 'lucide-react';
import TagBadge from '../../../../components/TagBadge/TagBadge';
import MoonBadge from '../../../../components/MoonBadge/MoonBadge';
import { getImageUrl } from '../../../../helpers/api';

const DreamCard = ({ dream }) => {
  const navigate = useNavigate();

  const tagObj = dream.tag_name ? {
    name: dream.tag_name,
    initials: dream.tag_initials,
    color: dream.tag_color
  } : null;

  const displayTime = dream.dream_time ? dream.dream_time.substring(0, 5) : '08:00';

  return (
    <div
      className="dream-list-item-card"
      role="button"
      tabIndex={0}
      onClick={() => navigate(`/dreams/${dream.id}`)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          navigate(`/dreams/${dream.id}`);
        }
      }}
    >
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-2 mb-2">
        {/* Metadatos: hora, etiquetas, luna */}
        <div className="d-flex align-items-center gap-2 flex-wrap">
          <span className="small text-muted fw-semibold d-flex align-items-center gap-1">
            <Clock size={13} aria-hidden="true" />
            {displayTime}
          </span>
          {tagObj && <TagBadge tag={tagObj} size="sm" />}
        </div>

        <MoonBadge
          phaseName={dream.moon_phase_name}
          phaseEmoji={dream.moon_phase_emoji}
          zodiacSign={dream.moon_zodiac_sign}
          zodiacSymbol={dream.moon_zodiac_symbol}
          showText={true}
          size="sm"
        />
      </div>

      <div className="d-flex align-items-start justify-content-between gap-3">
        <div className="flex-grow-1">
          <h3 className="h5 font-serif fw-bold text-warning mb-1">
            {dream.title || 'Sueño sin título'}
          </h3>
          {dream.content && (
            <p className="small text-muted mb-0 lh-base">
              {dream.content.length > 200
                ? `${dream.content.substring(0, 200)}...`
                : dream.content}
            </p>
          )}
        </div>

        {dream.images && dream.images.length > 0 && (
          <div className="dream-item-thumbnail-box flex-shrink-0">
            <img
              src={getImageUrl(dream.images[0].file_path)}
              alt="Miniatura del sueño"
              className="dream-item-thumbnail"
            />
            {dream.images.length > 1 && (
              <span className="dream-item-images-count">
                +{dream.images.length - 1}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DreamCard;

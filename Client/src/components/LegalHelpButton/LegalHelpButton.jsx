import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { HelpCircle } from 'lucide-react';
import './LegalHelpButton.css';

const LegalHelpButton = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showTooltip, setShowTooltip] = useState(false);

  // Ocultar si ya estamos dentro de la página legal
  if (location.pathname.startsWith('/legal')) {
    return null;
  }

  const handleClick = () => {
    navigate('/legal');
  };

  return (
    <div className="legal-help-floating-container">
      <button
        type="button"
        className="legal-help-floating-btn"
        onClick={handleClick}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        aria-label="Centro Legal, Privacidad y Términos"
        title="Centro Legal, Privacidad y Términos"
      >
        <HelpCircle size={22} className="legal-help-icon" />
      </button>

      {showTooltip && (
        <div className="legal-help-floating-tooltip" role="tooltip">
          Centro Legal y Privacidad
        </div>
      )}
    </div>
  );
};

export default LegalHelpButton;

import React from 'react';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';

/**
 * Envoltorio para tooltip flotante accesible sobre react-bootstrap
 */
const UITooltip = ({
  text,
  children,
  placement = 'top',
  delay = { show: 150, hide: 100 },
  id
}) => {
  if (!text) return children;

  const tooltipId = id || `tooltip-${Math.random().toString(36).substring(2, 9)}`;

  const renderTooltip = (props) => (
    <Tooltip id={tooltipId} {...props}>
      {text}
    </Tooltip>
  );

  return (
    <OverlayTrigger
      placement={placement}
      delay={delay}
      overlay={renderTooltip}
    >
      {children}
    </OverlayTrigger>
  );
};

export default UITooltip;

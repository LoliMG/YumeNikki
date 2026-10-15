import React from 'react';
import Button from 'react-bootstrap/Button';

/**
 * Envoltorio de botón estándar sobre react-bootstrap
 */
const UIButton = ({
  variant = 'primary',
  size,
  className = '',
  disabled = false,
  type = 'button',
  onClick,
  children,
  'aria-label': ariaLabel,
  title,
  ...props
}) => {
  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      disabled={disabled}
      type={type}
      onClick={onClick}
      aria-label={ariaLabel}
      title={title}
      {...props}
    >
      {children}
    </Button>
  );
};

export default UIButton;

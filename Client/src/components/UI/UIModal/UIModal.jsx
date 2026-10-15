import React from 'react';
import Modal from 'react-bootstrap/Modal';

/**
 * Envoltorio universal de modal sobre react-bootstrap
 */
export const UIModal = ({
  show,
  isOpen,
  onHide,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  centered = true,
  backdrop = true,
  className = '',
  ...props
}) => {
  const isVisible = show !== undefined ? Boolean(show) : Boolean(isOpen);
  const handleClose = onHide || onClose;

  return (
    <Modal
      show={isVisible}
      onHide={handleClose}
      size={size}
      centered={centered}
      backdrop={backdrop}
      className={className}
      {...props}
    >
      {title && (
        <Modal.Header closeButton>
          <Modal.Title as="h5" className="font-serif">{title}</Modal.Title>
        </Modal.Header>
      )}
      <Modal.Body>{children}</Modal.Body>
      {footer && <Modal.Footer>{footer}</Modal.Footer>}
    </Modal>
  );
};

export default UIModal;

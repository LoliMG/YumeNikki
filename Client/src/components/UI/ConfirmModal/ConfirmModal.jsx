import React from 'react';
import UIModal from '../UIModal/UIModal';
import UIButton from '../UIButton/UIButton';

const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirmar acción',
  message,
  confirmText = 'Aceptar',
  cancelText = 'Cancelar',
  variant = 'primary'
}) => {
  return (
    <UIModal
      show={isOpen}
      onHide={onClose}
      title={title}
      footer={
        <div className="d-flex justify-content-end gap-2 w-100">
          <UIButton variant="secondary" onClick={onClose}>
            {cancelText}
          </UIButton>
          <UIButton variant={variant} onClick={onConfirm}>
            {confirmText}
          </UIButton>
        </div>
      }
    >
      <p className="mb-0 text-muted">{message}</p>
    </UIModal>
  );
};

export default ConfirmModal;

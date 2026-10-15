import React from 'react';
import UIModal from '../UIModal/UIModal';
import UIButton from '../UIButton/UIButton';
import { AlertTriangle } from 'lucide-react';

const DeleteModal = ({
  isOpen,
  onClose,
  onDelete,
  onConfirm,
  title = 'Eliminar elemento',
  message = 'Esta acción no se puede deshacer. ¿Deseas continuar?',
  deleteText = 'Eliminar',
  confirmText,
  cancelText = 'Cancelar',
  isLoading = false
}) => {
  const handleConfirm = onConfirm || onDelete;
  const buttonLabel = confirmText || deleteText;

  return (
    <UIModal
      show={isOpen}
      onHide={onClose}
      title={title}
      footer={
        <div className="d-flex justify-content-end gap-2 w-100">
          <UIButton variant="secondary" onClick={onClose} disabled={isLoading}>
            {cancelText}
          </UIButton>
          <UIButton variant="danger" onClick={handleConfirm} disabled={isLoading}>
            {isLoading ? 'Eliminando...' : buttonLabel}
          </UIButton>
        </div>
      }
    >
      <div className="d-flex align-items-center gap-3">
        <div className="p-3 rounded-circle bg-danger bg-opacity-10 text-danger flex-shrink-0">
          <AlertTriangle size={24} />
        </div>
        <div>
          <p className="mb-0 text-light">{message}</p>
        </div>
      </div>
    </UIModal>
  );
};

export default DeleteModal;

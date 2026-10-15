import React, { useState, useEffect } from 'react';
import Card from 'react-bootstrap/Card';
import Badge from 'react-bootstrap/Badge';
import Alert from 'react-bootstrap/Alert';
import { 
  User, 
  Camera, 
  Trash2, 
  PenLine, 
  X, 
  Calendar, 
  Globe, 
  Mail 
} from 'lucide-react';
import UIButton from '../../../components/UI/UIButton/UIButton';
import UIModal from '../../../components/UI/UIModal/UIModal';
import { UIFormGroup, UIFormLabel, UIFormControl } from '../../../components/UI/UIForm/UIForm';
import UIDropdown from '../../../components/UI/UIDropdown/UIDropdown';
import { getImageUrl } from '../../../helpers/api';

const GENDER_OPTIONS = [
  { value: 'female', label: 'Mujer' },
  { value: 'male', label: 'Hombre' },
  { value: 'other', label: 'Otro' }
];

const ProfileHeader = ({
  user,
  avatarLoading,
  avatarInputRef,
  onAvatarUpload,
  onRequestDeleteAvatar,
  onSaveProfile,
  profileSaving
}) => {
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [tempUsername, setTempUsername] = useState(user?.username || '');
  const [tempGender, setTempGender] = useState(user?.gender || 'other');
  const [editError, setEditError] = useState('');

  // Sincronizar estado local al cambiar el usuario
  useEffect(() => {
    if (user) {
      setTempUsername(user.username || '');
      setTempGender(user.gender || 'other');
    }
  }, [user]);

  const formattedDate = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      })
    : 'Recientemente';

  const genderLabel = {
    female: 'Mujer',
    male: 'Hombre',
    other: 'Otro'
  }[user?.gender] || 'No especificado';

  const handleAvatarClick = () => {
    if (user?.avatar_url) {
      setShowOptionsModal(true);
    } else {
      avatarInputRef.current?.click();
    }
  };

  const handleChooseNewImage = () => {
    setShowOptionsModal(false);
    avatarInputRef.current?.click();
  };

  const handleConfirmDelete = () => {
    setShowOptionsModal(false);
    onRequestDeleteAvatar();
  };

  const handleStartEditing = () => {
    setTempUsername(user?.username || '');
    setTempGender(user?.gender || 'other');
    setEditError('');
    setIsEditing(true);
  };

  const handleCancelEditing = () => {
    setTempUsername(user?.username || '');
    setTempGender(user?.gender || 'other');
    setEditError('');
    setIsEditing(false);
  };

  const handleSaveSubmit = async (e) => {
    e.preventDefault();
    if (!tempUsername || tempUsername.trim().length < 3) {
      setEditError('El nombre de usuario debe tener al menos 3 caracteres.');
      return;
    }
    setEditError('');

    if (onSaveProfile) {
      const success = await onSaveProfile({
        username: tempUsername.trim(),
        gender: tempGender,
        successMessage: 'Perfil de usuario actualizado con éxito.'
      });
      if (success) {
        setIsEditing(false);
      }
    }
  };

  return (
    <>
      <Card className="bg-surface border-subtle mb-4 shadow-sm rounded-4" style={{ overflow: 'visible' }}>
        <Card.Body className="p-4 d-flex flex-column flex-md-row align-items-center align-items-md-start gap-4">
          {/* Avatar interactivo */}
          <div
            className="profile-avatar-wrapper flex-shrink-0"
            onClick={handleAvatarClick}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleAvatarClick();
              }
            }}
            aria-label="Gestionar foto de perfil"
            title="Haz clic para cambiar o eliminar tu foto de perfil"
          >
            {user?.avatar_url ? (
              <img src={getImageUrl(user.avatar_url)} alt={user.username} className="profile-avatar-img" />
            ) : (
              <div className="profile-avatar-placeholder">
                <User size={44} />
              </div>
            )}

            {/* Capa sutil en hover */}
            <div className="profile-avatar-overlay">
              <Camera size={20} className="mb-1" />
              <span>Editar</span>
            </div>

            <input
              type="file"
              ref={avatarInputRef}
              onChange={onAvatarUpload}
              accept="image/*"
              className="d-none"
            />
          </div>

          {/* Información y formulario de edición directa */}
          <div className="w-100 flex-grow-1">
            {editError && (
              <Alert variant="danger" dismissible onClose={() => setEditError('')} className="mb-3 py-2 small">
                {editError}
              </Alert>
            )}

            {isEditing ? (
              /* MODO EDICIÓN EN LA PROPIA TARJETA */
              <form onSubmit={handleSaveSubmit} className="d-flex flex-column gap-3">
                <div className="row g-3">
                  {/* Nombre de usuario */}
                  <div className="col-12 col-sm-6">
                    <UIFormGroup className="mb-0">
                      <UIFormLabel htmlFor="header-edit-username">Nombre de usuario</UIFormLabel>
                      <UIFormControl
                        id="header-edit-username"
                        value={tempUsername}
                        onChange={(e) => setTempUsername(e.target.value)}
                        placeholder="Nombre de usuario"
                        required
                        minLength={3}
                        autoFocus
                      />
                    </UIFormGroup>
                  </div>

                  {/* Género con UIDropdown */}
                  <div className="col-12 col-sm-6">
                    <UIFormGroup className="mb-0">
                      <UIFormLabel>Género</UIFormLabel>
                      <UIDropdown
                        options={GENDER_OPTIONS}
                        value={tempGender}
                        onChange={(val) => setTempGender(val)}
                        placeholder="Selecciona género"
                      />
                    </UIFormGroup>
                  </div>
                </div>

                {/* Botones de acción */}
                <div className="d-flex justify-content-end gap-2 pt-2 border-top border-secondary border-opacity-25">
                  <UIButton
                    variant="secondary"
                    size="sm"
                    type="button"
                    onClick={handleCancelEditing}
                    disabled={profileSaving}
                  >
                    Cancelar
                  </UIButton>
                  <UIButton
                    variant="primary"
                    size="sm"
                    type="submit"
                    disabled={profileSaving}
                  >
                    {profileSaving ? 'Guardando...' : 'Guardar Cambios'}
                  </UIButton>
                </div>
              </form>
            ) : (
              /* MODO VISUALIZACIÓN LIMPIA */
              <div>
                <div className="d-flex flex-column flex-sm-row justify-content-between align-items-center align-items-sm-start gap-2 mb-2">
                  <div className="text-center text-sm-start">
                    <div className="d-flex flex-wrap align-items-center justify-content-center justify-content-sm-start gap-2">
                      <h1 className="h2 font-serif fw-bold text-light m-0">{user?.username}</h1>
                      <Badge bg="secondary" className="bg-opacity-50 text-warning border border-warning border-opacity-25 px-2 py-1">
                        {genderLabel}
                      </Badge>
                    </div>
                    <p className="small text-muted m-0 mt-1 d-flex align-items-center justify-content-center justify-content-sm-start gap-1">
                      <Mail size={13} />
                      <span>{user?.email}</span>
                    </p>
                  </div>

                  <UIButton
                    variant="secondary"
                    size="sm"
                    onClick={handleStartEditing}
                    className="d-flex align-items-center gap-1 mt-2 mt-sm-0 flex-shrink-0"
                    title="Editar nombre y género"
                  >
                    <PenLine size={14} />
                    <span>Editar perfil</span>
                  </UIButton>
                </div>

                {/* Metadatos adicionales de identidad */}
                <div className="d-flex flex-wrap align-items-center justify-content-center justify-content-sm-start gap-3 mt-3 pt-2 border-top border-secondary border-opacity-25 text-muted small">
                  <span className="d-flex align-items-center gap-1">
                    <Calendar size={13} className="text-warning" />
                    <span>Miembro desde {formattedDate}</span>
                  </span>
                  <span className="d-flex align-items-center gap-1">
                    <Globe size={13} className="text-info" />
                    <span>Zona: {user?.timezone || 'Europe/Madrid'}</span>
                  </span>
                </div>
              </div>
            )}
          </div>
        </Card.Body>
      </Card>

      {/* Modal de opciones de foto de perfil al hacer clic en el avatar */}
      <UIModal
        show={showOptionsModal}
        onHide={() => setShowOptionsModal(false)}
        title="Foto de Perfil"
        footer={
          <UIButton variant="secondary" size="sm" onClick={() => setShowOptionsModal(false)}>
            Cancelar
          </UIButton>
        }
      >
        <div className="d-flex flex-column align-items-center text-center p-2">
          {/* Vista previa de la foto actual */}
          <div className="mb-3 position-relative" style={{ width: 104, height: 104 }}>
            <img
              src={getImageUrl(user?.avatar_url)}
              alt={user?.username}
              className="w-100 h-100 rounded-circle object-fit-cover border border-warning"
              style={{ boxShadow: '0 0 16px rgba(232, 201, 135, 0.35)' }}
            />
          </div>

          <p className="text-light small mb-4" style={{ maxWidth: 320 }}>
            ¿Qué deseas hacer con tu foto de perfil actual?
          </p>

          <div className="d-flex flex-column flex-sm-row gap-2 w-100 justify-content-center">
            <UIButton
              variant="primary"
              onClick={handleChooseNewImage}
              disabled={avatarLoading}
              className="d-flex align-items-center justify-content-center gap-2 px-3"
            >
              <Camera size={16} />
              <span>Cambiar imagen</span>
            </UIButton>

            <UIButton
              variant="danger"
              onClick={handleConfirmDelete}
              disabled={avatarLoading}
              className="d-flex align-items-center justify-content-center gap-2 px-3"
            >
              <Trash2 size={16} />
              <span>Eliminar imagen</span>
            </UIButton>
          </div>
        </div>
      </UIModal>
    </>
  );
};

export default ProfileHeader;

import React, { useState, useEffect } from 'react';
import Card from 'react-bootstrap/Card';
import Alert from 'react-bootstrap/Alert';
import { 
  SlidersHorizontal,
  Trash2, 
  AlertTriangle, 
  KeyRound,
  Mail,
  Check,
  BarChart3,
  ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import UIButton from '../../../components/UI/UIButton/UIButton';
import { UIFormGroup, UIFormLabel, UIFormControl } from '../../../components/UI/UIForm/UIForm';
import UIDropdown from '../../../components/UI/UIDropdown/UIDropdown';
import DeleteModal from '../../../components/UI/DeleteModal/DeleteModal';
import api from '../../../helpers/api';

const TIMEZONE_OPTIONS = [
  'Europe/Madrid',
  'Atlantic/Canary',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'America/New_York',
  'America/Mexico_City',
  'America/Bogota',
  'America/Buenos_Aires',
  'America/Santiago',
  'America/Lima',
  'America/Los_Angeles',
  'Asia/Tokyo',
  'UTC'
];

const ProfileSettingsSection = ({
  email,
  setEmail,
  timezone,
  setTimezone,
  trackCycle,
  setTrackCycle,
  isMale,
  profileSaving,
  onSavePreferences,
  onUpdateEmail,
  onAccountDeleted
}) => {
  const navigate = useNavigate();

  // Estado local para preferencias del sistema
  const [localTimezone, setLocalTimezone] = useState(timezone || 'Europe/Madrid');
  const [localTrackCycle, setLocalTrackCycle] = useState(Boolean(trackCycle));

  // Estado local para correo electrónico
  const [localEmail, setLocalEmail] = useState(email || '');
  const [emailSaving, setEmailSaving] = useState(false);

  // Estado para cambio de contraseña
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState({ text: '', type: 'success' });

  // Estado para eliminación de cuenta
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);
  const [deleteAccountLoading, setDeleteAccountLoading] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  // Sincronizar props con estado local
  useEffect(() => {
    setLocalTimezone(timezone || 'Europe/Madrid');
  }, [timezone]);

  useEffect(() => {
    setLocalTrackCycle(Boolean(trackCycle));
  }, [trackCycle]);

  useEffect(() => {
    setLocalEmail(email || '');
  }, [email]);

  // Guardar preferencias del sistema (Zona horaria + ciclo)
  const handlePreferencesSubmit = async (e) => {
    e.preventDefault();
    if (onSavePreferences) {
      await onSavePreferences({
        timezone: localTimezone,
        trackCycle: isMale ? false : localTrackCycle
      });
    }
  };

  // Guardar nuevo correo electrónico
  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    if (!localEmail || !localEmail.includes('@')) {
      return;
    }
    setEmailSaving(true);
    try {
      if (onUpdateEmail) {
        await onUpdateEmail(localEmail.trim());
      }
    } finally {
      setEmailSaving(false);
    }
  };

  // Enviar formulario de cambio de contraseña
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordMsg({ text: '', type: 'success' });

    if (newPassword.length < 6) {
      setPasswordMsg({ text: 'La nueva contraseña debe tener al menos 6 caracteres.', type: 'danger' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordMsg({ text: 'Las nuevas contraseñas no coinciden.', type: 'danger' });
      return;
    }

    setPasswordSaving(true);
    try {
      await api.put('/user/password', {
        current_password: currentPassword,
        new_password: newPassword
      });
      setPasswordMsg({ text: 'Contraseña actualizada con éxito.', type: 'success' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPasswordMsg({
        text: err.response?.data?.message || err.message || 'Error al cambiar la contraseña.',
        type: 'danger'
      });
    } finally {
      setPasswordSaving(false);
    }
  };

  // Eliminar cuenta permanentemente
  const handleConfirmDeleteAccount = async () => {
    setDeleteAccountLoading(true);
    setDeleteError('');
    try {
      await api.delete('/user/account');
      setShowDeleteAccountModal(false);
      if (onAccountDeleted) {
        onAccountDeleted();
      }
    } catch (err) {
      setDeleteError(err.response?.data?.message || err.message || 'Error al eliminar la cuenta.');
      setDeleteAccountLoading(false);
    }
  };

  return (
    <div className="d-flex flex-column gap-4">
      {/* 1. Preferencias del Sistema y Medianoche */}
      <Card className="bg-surface border-subtle shadow-sm rounded-4" style={{ overflow: 'visible' }}>
        <Card.Header className="bg-surface-2 bg-opacity-40 border-bottom border-subtle py-3 px-4 d-flex align-items-center gap-2 rounded-top-4">
          <SlidersHorizontal size={18} className="text-warning" />
          <h2 className="h5 font-serif text-light m-0">Preferencias del Sistema & Medianoche</h2>
        </Card.Header>
        <Card.Body className="p-3 p-md-4">
          <form onSubmit={handlePreferencesSubmit}>
            <div className="row g-3">
              {/* Zona horaria con UIDropdown */}
              <div className="col-12 col-md-6">
                <UIFormGroup className="mb-0">
                  <UIFormLabel>Zona horaria</UIFormLabel>
                  <UIDropdown
                    options={TIMEZONE_OPTIONS.map(tz => ({ value: tz, label: tz }))}
                    value={localTimezone}
                    onChange={(val) => setLocalTimezone(val)}
                    placeholder="Selecciona zona horaria"
                  />
                  <small className="text-muted d-block mt-1">
                    Calcula la fase lunar y signo astrológico exactos a las 03:00 de tu noche.
                  </small>
                </UIFormGroup>
              </div>

              {/* Seguimiento del ciclo menstrual */}
              <div className="col-12 col-md-6">
                <div className={`p-3 rounded-3 border h-100 ${isMale ? 'bg-black bg-opacity-10 border-secondary border-opacity-25' : 'bg-surface-2 border-subtle'}`}>
                  <div className="form-check form-switch mb-1">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      role="switch"
                      id="profile-track-cycle"
                      checked={Boolean(localTrackCycle) && !isMale}
                      disabled={isMale}
                      onChange={(e) => setLocalTrackCycle(e.target.checked)}
                    />
                    <label className={`form-check-label fw-medium ${isMale ? 'text-muted' : 'text-light'}`} htmlFor="profile-track-cycle">
                      Seguimiento del ciclo menstrual
                    </label>
                  </div>
                  {isMale ? (
                    <p className="text-warning small m-0 fst-italic">
                      Desactivado para el género seleccionado (Hombre).
                    </p>
                  ) : (
                    <small className="text-muted d-block">
                      Habilita el registro de periodos, iconos en el calendario y analíticas oníricas.
                    </small>
                  )}
                </div>
              </div>
            </div>

            <div className="d-flex justify-content-end mt-4">
              <UIButton variant="primary" type="submit" disabled={profileSaving}>
                {profileSaving ? 'Guardando...' : 'Guardar Preferencias'}
              </UIButton>
            </div>
          </form>
        </Card.Body>
      </Card>

      {/* 2. Seguridad y Acceso a la Cuenta */}
      <Card className="bg-surface border-subtle shadow-sm rounded-4">
        <Card.Header className="bg-surface-2 bg-opacity-40 border-bottom border-subtle py-3 px-4 d-flex align-items-center gap-2 rounded-top-4">
          <KeyRound size={18} className="text-warning" />
          <h2 className="h5 font-serif text-light m-0">Seguridad & Credenciales de Acceso</h2>
        </Card.Header>
        <Card.Body className="p-3 p-md-4">
          {passwordMsg.text && (
            <Alert
              variant={passwordMsg.type}
              dismissible
              onClose={() => setPasswordMsg({ text: '', type: 'success' })}
              className="mb-3"
            >
              {passwordMsg.text}
            </Alert>
          )}

          {/* Formulario de actualización de correo electrónico */}
          <form onSubmit={handleEmailSubmit} className="mb-4">
            <UIFormGroup className="mb-0">
              <UIFormLabel htmlFor="settings-email">Correo electrónico de la cuenta</UIFormLabel>
              <div className="d-flex flex-column flex-sm-row gap-2">
                <UIFormControl
                  id="settings-email"
                  type="email"
                  value={localEmail}
                  onChange={(e) => setLocalEmail(e.target.value)}
                  required
                  placeholder="tu_correo@ejemplo.com"
                />
                <UIButton
                  variant="secondary"
                  type="submit"
                  disabled={emailSaving || profileSaving || localEmail === email}
                  className="text-nowrap d-flex align-items-center justify-content-center gap-1"
                >
                  <Mail size={15} />
                  <span>{emailSaving ? 'Guardando...' : 'Actualizar Correo'}</span>
                </UIButton>
              </div>
              <small className="text-muted d-block mt-1">
                Utilizado para inicio de sesión y comunicaciones del sistema.
              </small>
            </UIFormGroup>
          </form>

          <hr className="border-secondary border-opacity-25 my-4" />

          {/* Formulario de cambio de contraseña */}
          <div>
            <h3 className="h6 font-serif text-light mb-3">Cambiar Contraseña</h3>
            <form onSubmit={handlePasswordSubmit}>
              <div className="row g-3">
                <div className="col-12 col-md-4">
                  <UIFormGroup className="mb-0">
                    <UIFormLabel htmlFor="current-password">Contraseña actual</UIFormLabel>
                    <UIFormControl
                      id="current-password"
                      type="password"
                      placeholder="••••••••"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      required
                    />
                  </UIFormGroup>
                </div>

                <div className="col-12 col-md-4">
                  <UIFormGroup className="mb-0">
                    <UIFormLabel htmlFor="new-password">Nueva contraseña</UIFormLabel>
                    <UIFormControl
                      id="new-password"
                      type="password"
                      placeholder="Mínimo 6 caracteres"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                    />
                  </UIFormGroup>
                </div>

                <div className="col-12 col-md-4">
                  <UIFormGroup className="mb-0">
                    <UIFormLabel htmlFor="confirm-password">Confirmar nueva contraseña</UIFormLabel>
                    <UIFormControl
                      id="confirm-password"
                      type="password"
                      placeholder="Repite la contraseña"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </UIFormGroup>
                </div>
              </div>

              <div className="d-flex justify-content-end mt-4">
                <UIButton variant="secondary" type="submit" disabled={passwordSaving}>
                  {passwordSaving ? 'Actualizando...' : 'Actualizar Contraseña'}
                </UIButton>
              </div>
            </form>
          </div>
        </Card.Body>
      </Card>

      {/* 3. Acceso rápido a Estadísticas Oníricas */}
      <Card className="bg-surface border-subtle shadow-sm rounded-4 p-3 p-md-4">
        <div className="d-flex align-items-center gap-3">
          <div className="p-3 rounded-circle bg-warning bg-opacity-10 text-warning flex-shrink-0">
            <BarChart3 size={24} />
          </div>
          <div className="flex-grow-1">
            <h3 className="h6 font-serif text-light m-0">Tus Estadísticas Oníricas</h3>
            <p className="text-muted small m-0 mb-2">
              Consulta el desglose de fases lunares, lucidez y signos del zodíaco en tus sueños.
            </p>
            <UIButton
              variant="secondary"
              size="sm"
              onClick={() => navigate('/stats')}
              className="d-inline-flex align-items-center gap-1"
            >
              <span>Ver estadísticas</span>
              <ArrowRight size={14} />
            </UIButton>
          </div>
        </div>
      </Card>

      {/* 4. Zona de Peligro: Eliminar Cuenta */}
      <Card className="border border-danger border-opacity-50 bg-danger bg-opacity-10 shadow-sm rounded-4 overflow-hidden">
        <Card.Header className="bg-danger bg-opacity-20 border-bottom border-danger border-opacity-25 py-3 px-4 d-flex align-items-center gap-2">
          <AlertTriangle size={18} className="text-danger" />
          <h2 className="h5 font-serif text-danger m-0">Zona de Peligro</h2>
        </Card.Header>
        <Card.Body className="p-3 p-md-4">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
            <div>
              <h3 className="h6 text-light fw-bold m-0 mb-1">Eliminar cuenta permanentemente</h3>
              <p className="text-muted small m-0">
                Esta acción es irreversible. Se eliminarán permanentemente todos tus sueños registrados, notas, etiquetas y datos del ciclo.
              </p>
            </div>
            <UIButton
              variant="danger"
              onClick={() => setShowDeleteAccountModal(true)}
              className="d-flex align-items-center gap-2 text-nowrap"
            >
              <Trash2 size={16} />
              <span>Eliminar mi cuenta</span>
            </UIButton>
          </div>
          {deleteError && (
            <Alert variant="danger" className="mt-3 mb-0 small" dismissible onClose={() => setDeleteError('')}>
              {deleteError}
            </Alert>
          )}
        </Card.Body>
      </Card>

      {/* Modal de confirmación para eliminar cuenta */}
      <DeleteModal
        isOpen={showDeleteAccountModal}
        onClose={() => setShowDeleteAccountModal(false)}
        onConfirm={handleConfirmDeleteAccount}
        title="¿Estás completamente seguro de eliminar tu cuenta?"
        message="Esta acción no se puede deshacer. Se borrarán definitivamente todas tus memorias nocturnas, relatos, notas, etiquetas y registros asociados."
        isLoading={deleteAccountLoading}
      />
    </div>
  );
};

export default ProfileSettingsSection;

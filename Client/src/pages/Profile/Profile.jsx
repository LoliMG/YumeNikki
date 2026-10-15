import React, { useState, useEffect, useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import Alert from 'react-bootstrap/Alert';
import { 
  User, 
  ShieldCheck, 
  Droplet 
} from 'lucide-react';
import { AuthContext } from '../../contexts/AuthContext';
import DeleteModal from '../../components/UI/DeleteModal/DeleteModal';
import api from '../../helpers/api';

import ProfileHeader from './components/ProfileHeader';
import ProfileSettingsSection from './components/ProfileSettingsSection';
import CycleManagerSection from './components/CycleManagerSection';
import './Profile.css';

const Profile = () => {
  const navigate = useNavigate();
  const { user, logout, updateUser } = useContext(AuthContext);

  const [activeTab, setActiveTab] = useState('settings'); // 'settings' | 'menstrual'
  const [msg, setMsg] = useState({ text: '', type: 'success' });

  // Estado del perfil
  const [username, setUsername] = useState(user?.username || '');
  const [email, setEmail] = useState(user?.email || '');
  const [timezone, setTimezone] = useState(user?.timezone || 'Europe/Madrid');
  const [gender, setGender] = useState(user?.gender || 'other');
  const [trackCycle, setTrackCycle] = useState(Boolean(user?.track_cycle));
  const [profileSaving, setProfileSaving] = useState(false);

  // Avatar
  const avatarInputRef = useRef(null);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [showDeleteAvatarModal, setShowDeleteAvatarModal] = useState(false);

  // Sincronizar perfil cuando el usuario cambie en el contexto
  useEffect(() => {
    if (user) {
      setUsername(user.username || '');
      setEmail(user.email || '');
      setTimezone(user.timezone || 'Europe/Madrid');
      setGender(user.gender || 'other');
      const isMale = user.gender === 'male';
      setTrackCycle(isMale ? false : Boolean(user.track_cycle));
    }
  }, [user]);

  // Si el usuario cambia su género a hombre, cambiar la pestaña activa si estaba en menstrual
  useEffect(() => {
    if (gender === 'male' && activeTab === 'menstrual') {
      setActiveTab('settings');
    }
  }, [gender, activeTab]);

  // Guardar cambios de perfil / ajustes
  const handleSaveProfileData = async (fieldsToUpdate = {}) => {
    setProfileSaving(true);
    setMsg({ text: '', type: 'success' });

    const newGender = fieldsToUpdate.gender !== undefined ? fieldsToUpdate.gender : gender;
    const isNowMale = newGender === 'male';
    const finalTrackCycle = isNowMale
      ? false
      : (fieldsToUpdate.track_cycle !== undefined
          ? fieldsToUpdate.track_cycle
          : (fieldsToUpdate.trackCycle !== undefined ? fieldsToUpdate.trackCycle : trackCycle));

    const payload = {
      username: fieldsToUpdate.username !== undefined ? fieldsToUpdate.username : username,
      email: fieldsToUpdate.email !== undefined ? fieldsToUpdate.email : email,
      timezone: fieldsToUpdate.timezone !== undefined ? fieldsToUpdate.timezone : timezone,
      gender: newGender,
      track_cycle: finalTrackCycle
    };

    try {
      const res = await api.put('/user/profile', payload);
      if (res.user) {
        if (updateUser) {
          updateUser(res.user);
        }
        if (fieldsToUpdate.username !== undefined) setUsername(fieldsToUpdate.username);
        if (fieldsToUpdate.email !== undefined) setEmail(fieldsToUpdate.email);
        if (fieldsToUpdate.timezone !== undefined) setTimezone(fieldsToUpdate.timezone);
        if (fieldsToUpdate.gender !== undefined) setGender(fieldsToUpdate.gender);
        if (fieldsToUpdate.track_cycle !== undefined || fieldsToUpdate.trackCycle !== undefined || isNowMale) {
          setTrackCycle(finalTrackCycle);
        }
        setMsg({ 
          text: fieldsToUpdate.successMessage || 'Cambios guardados con éxito.', 
          type: 'success' 
        });
        return true;
      }
      return false;
    } catch (err) {
      setMsg({ 
        text: err.response?.data?.message || err.message || 'Error al actualizar perfil.', 
        type: 'danger' 
      });
      return false;
    } finally {
      setProfileSaving(false);
    }
  };

  // Subir nuevo avatar
  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setMsg({ text: 'El archivo seleccionado debe ser una imagen.', type: 'danger' });
      return;
    }

    setAvatarLoading(true);
    setMsg({ text: '', type: 'success' });

    try {
      const formData = new FormData();
      formData.append('avatar', file);
      const res = await api.postFormData('/user/avatar', formData);
      if (res.user) {
        if (updateUser) updateUser(res.user);
        setMsg({ text: 'Avatar actualizado con éxito.', type: 'success' });
      }
    } catch (err) {
      setMsg({ text: err.message || 'Error al subir el avatar.', type: 'danger' });
    } finally {
      setAvatarLoading(false);
      if (avatarInputRef.current) avatarInputRef.current.value = '';
    }
  };

  // Eliminar avatar
  const handleDeleteAvatar = async () => {
    setAvatarLoading(true);
    try {
      await api.delete('/user/avatar');
      setShowDeleteAvatarModal(false);
      if (updateUser) updateUser({ avatar_url: null });
      setMsg({ text: 'Avatar eliminado.', type: 'success' });
    } catch (err) {
      setMsg({ text: err.message || 'Error al eliminar avatar.', type: 'danger' });
    } finally {
      setAvatarLoading(false);
    }
  };

  // Cuenta eliminada con éxito
  const handleAccountDeleted = async () => {
    if (logout) {
      await logout();
    }
    navigate('/login');
  };

  const isMale = gender === 'male';

  return (
    <div className="container-md profile-page py-3" style={{ maxWidth: 960 }}>
      {/* Cabecera del perfil de usuario con edición directa */}
      <ProfileHeader
        user={user}
        avatarLoading={avatarLoading}
        avatarInputRef={avatarInputRef}
        onAvatarUpload={handleAvatarUpload}
        onRequestDeleteAvatar={() => setShowDeleteAvatarModal(true)}
        onSaveProfile={handleSaveProfileData}
        profileSaving={profileSaving}
      />

      {msg.text && (
        <Alert
          variant={msg.type}
          dismissible
          onClose={() => setMsg({ text: '', type: 'success' })}
          className="mb-4"
        >
          {msg.text}
        </Alert>
      )}

      {/* Pestañas: Ajustes y Seguridad, Ciclo Menstrual */}
      <Tabs
        activeKey={activeTab}
        onSelect={(k) => setActiveTab(k)}
        className="profile-tabs mb-4 border-secondary"
      >
        {/* PESTAÑA 1: AJUSTES Y SEGURIDAD */}
        <Tab
          eventKey="settings"
          title={
            <span className="d-flex align-items-center gap-2">
              <ShieldCheck size={16} />
              <span>Ajustes y Seguridad</span>
            </span>
          }
        >
          <ProfileSettingsSection
            email={email}
            setEmail={setEmail}
            timezone={timezone}
            setTimezone={setTimezone}
            trackCycle={trackCycle}
            setTrackCycle={setTrackCycle}
            isMale={isMale}
            profileSaving={profileSaving}
            onSavePreferences={({ timezone: tz, trackCycle: tc }) =>
              handleSaveProfileData({
                timezone: tz,
                track_cycle: tc,
                successMessage: 'Preferencias del sistema guardadas con éxito.'
              })
            }
            onUpdateEmail={(newEmail) =>
              handleSaveProfileData({
                email: newEmail,
                successMessage: 'Correo electrónico actualizado con éxito.'
              })
            }
            onAccountDeleted={handleAccountDeleted}
          />
        </Tab>

        {/* PESTAÑA 3: REGISTRO DEL CICLO MENSTRUAL (Oculto / desactivado si es hombre) */}
        {!isMale && (
          <Tab
            eventKey="menstrual"
            title={
              <span className="d-flex align-items-center gap-2">
                <Droplet size={16} className="text-danger" />
                <span>Registro del ciclo menstrual</span>
              </span>
            }
          >
            {trackCycle ? (
              <CycleManagerSection />
            ) : (
              <div className="card bg-surface border-subtle rounded-4 p-4 text-center">
                <div className="py-4">
                  <div className="p-3 d-inline-flex rounded-circle bg-danger bg-opacity-10 text-danger mb-3">
                    <Droplet size={36} />
                  </div>
                  <h3 className="h5 font-serif text-light mb-2">Seguimiento del Ciclo Menstrual Inactivo</h3>
                  <p className="text-muted small mx-auto mb-4" style={{ maxWidth: 520 }}>
                    Para llevar el registro de tus días de menstruación y analizar cómo influyen en tus sueños y fases lunares, activa el seguimiento en tus ajustes.
                  </p>
                  <button
                    className="btn btn-primary"
                    onClick={() => {
                      setTrackCycle(true);
                      setActiveTab('settings');
                    }}
                  >
                    Activar en Ajustes y Privacidad
                  </button>
                </div>
              </div>
            )}
          </Tab>
        )}
      </Tabs>

      {/* Modal eliminar avatar */}
      <DeleteModal
        isOpen={showDeleteAvatarModal}
        onClose={() => setShowDeleteAvatarModal(false)}
        onConfirm={handleDeleteAvatar}
        title="¿Eliminar foto de perfil?"
        message="Tu avatar se eliminará de forma permanente del servidor."
        isLoading={avatarLoading}
      />
    </div>
  );
};

export default Profile;

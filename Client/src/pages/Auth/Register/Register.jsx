import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../../contexts/AuthContext';
import { UIFormGroup, UIFormLabel, UIFormControl } from '../../../components/UI/UIForm/UIForm';
import UIButton from '../../../components/UI/UIButton/UIButton';
import Alert from 'react-bootstrap/Alert';
import Card from 'react-bootstrap/Card';
import { Sparkles, Eye, EyeOff } from 'lucide-react';

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.');
      return;
    }

    setLoading(true);
    const res = await register(username, email, password);
    setLoading(false);

    if (res.success) {
      navigate('/');
    } else {
      setError(res.message);
    }
  };

  return (
    <Card className="shadow-lg border-0 bg-surface">
      <Card.Body className="p-4 p-md-5">
        <div className="text-center mb-4">
          <h2 className="font-serif fw-bold text-light mb-1">Crear tu Diario</h2>
          <p className="text-muted small">Comienza a registrar y comprender cada noche</p>
        </div>

        {error && (
          <Alert variant="danger" className="py-2 px-3 small border-0">
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <UIFormGroup className="mb-3">
            <UIFormLabel htmlFor="reg-username">Nombre de usuario</UIFormLabel>
            <UIFormControl
              id="reg-username"
              type="text"
              required
              placeholder="madotsuki"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
            />
          </UIFormGroup>

          <UIFormGroup className="mb-3">
            <UIFormLabel htmlFor="reg-email">Correo electrónico</UIFormLabel>
            <UIFormControl
              id="reg-email"
              type="email"
              required
              placeholder="tu@correo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </UIFormGroup>

          <UIFormGroup className="mb-4">
            <UIFormLabel htmlFor="reg-password">Contraseña (mínimo 8 caracteres)</UIFormLabel>
            <div className="input-group">
              <UIFormControl
                id="reg-password"
                type={showPassword ? 'text' : 'password'}
                required
                minLength={8}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
              />
              <button
                type="button"
                className="btn btn-outline-secondary d-flex align-items-center justify-content-center"
                onClick={() => setShowPassword(prev => !prev)}
                aria-label={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                title={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </UIFormGroup>

          <UIButton
            type="submit"
            variant="warning"
            className="w-100 py-2 d-flex align-items-center justify-content-center gap-2 fw-bold text-dark"
            disabled={loading}
          >
            <Sparkles size={18} aria-hidden="true" />
            <span>{loading ? 'Creando cuenta...' : 'Comenzar Diario'}</span>
          </UIButton>

          <div className="text-center mt-4">
            <span className="text-muted small">¿Ya tienes cuenta? </span>
            <Link to="/login" className="text-warning text-decoration-none fw-semibold small">
              Inicia sesión aquí
            </Link>
          </div>
        </form>
      </Card.Body>
    </Card>
  );
};

export default Register;

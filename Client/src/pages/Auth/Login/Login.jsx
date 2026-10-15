import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../../contexts/AuthContext';
import { UIFormGroup, UIFormLabel, UIFormControl } from '../../../components/UI/UIForm/UIForm';
import UIButton from '../../../components/UI/UIButton/UIButton';
import Alert from 'react-bootstrap/Alert';
import Card from 'react-bootstrap/Card';
import { LogIn, Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = await login(identifier, password);
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
          <h2 className="font-serif fw-bold text-light mb-1">Entrar al Diario</h2>
          <p className="text-muted small">Escribe tu usuario o correo para abrir tus sueños</p>
        </div>

        {error && (
          <Alert variant="danger" className="py-2 px-3 small border-0">
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <UIFormGroup className="mb-3">
            <UIFormLabel htmlFor="login-identifier">Usuario o Correo electrónico</UIFormLabel>
            <UIFormControl
              id="login-identifier"
              type="text"
              required
              placeholder="tu_usuario o tu@correo.com"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              autoComplete="username"
            />
          </UIFormGroup>

          <UIFormGroup className="mb-4">
            <UIFormLabel htmlFor="login-password">Contraseña</UIFormLabel>
            <div className="input-group">
              <UIFormControl
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
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
            variant="primary"
            className="w-100 py-2 d-flex align-items-center justify-content-center gap-2"
            disabled={loading}
          >
            <LogIn size={18} aria-hidden="true" />
            <span>{loading ? 'Accediendo...' : 'Iniciar Sesión'}</span>
          </UIButton>

          <div className="text-center mt-4">
            <span className="text-muted small">¿Aún no tienes cuenta? </span>
            <Link to="/register" className="text-warning text-decoration-none fw-semibold small">
              Regístrate aquí
            </Link>
          </div>
        </form>
      </Card.Body>
    </Card>
  );
};

export default Login;

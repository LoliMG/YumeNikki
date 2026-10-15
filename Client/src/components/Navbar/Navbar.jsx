import React, { useContext, useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import Logo from '../Logo/Logo';
import UIButton from '../UI/UIButton/UIButton';
import UITooltip from '../UI/UITooltip/UITooltip';
import { BookOpen, User, Plus, Moon, LogOut, Sparkles, BarChart3 } from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [createMenuOpen, setCreateMenuOpen] = useState(false);
  const createMenuRef = useRef(null);

  // Cerrar desplegable de creación rápida al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (createMenuRef.current && !createMenuRef.current.contains(e.target)) {
        setCreateMenuOpen(false);
      }
    };
    if (createMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [createMenuOpen]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="yume-navbar-wrapper sticky-top">
      <div className="container-xl d-flex align-items-center justify-content-between h-100 px-3 px-md-4">
        {/* Logo que lleva a Home */}
        <Link to="/" className="text-decoration-none" aria-label="Ir a la página de inicio">
          <Logo size="md" />
        </Link>

        {/* Acciones de navegación */}
        <nav className="d-flex align-items-center gap-2 gap-md-3" aria-label="Navegación principal">
          {user ? (
            <>
              {/* Enlace: Sueños */}
              <NavLink
                to="/dreams"
                className={({ isActive }) =>
                  `yume-nav-link d-flex align-items-center gap-2 ${isActive ? 'active' : ''}`
                }
              >
                <BookOpen size={18} aria-hidden="true" />
                <span className="d-none d-md-inline">Sueños</span>
              </NavLink>

              {/* Enlace: Estadísticas */}
              <NavLink
                to="/stats"
                className={({ isActive }) =>
                  `yume-nav-link d-flex align-items-center gap-2 ${isActive ? 'active' : ''}`
                }
              >
                <BarChart3 size={18} aria-hidden="true" />
                <span className="d-none d-md-inline">Estadísticas</span>
              </NavLink>

              {/* Enlace: Mi perfil */}
              <NavLink
                to="/profile"
                className={({ isActive }) =>
                  `yume-nav-link d-flex align-items-center gap-2 ${isActive ? 'active' : ''}`
                }
              >
                <User size={18} aria-hidden="true" />
                <span className="d-none d-md-inline">Mi perfil</span>
              </NavLink>

              {/* Botón "+" desplegable de creación rápida */}
              <div className="position-relative" ref={createMenuRef}>
                <UIButton
                  variant="warning"
                  onClick={() => setCreateMenuOpen(prev => !prev)}
                  className="btn-register-dream d-flex align-items-center justify-content-center p-0 rounded-circle"
                  aria-label="Crear nuevo registro"
                  title="Crear registro"
                  style={{ width: 38, height: 38, minWidth: 38, minHeight: 38 }}
                >
                  <Plus size={20} strokeWidth={2.5} aria-hidden="true" />
                </UIButton>

                {createMenuOpen && (
                  <div className="navbar-create-dropdown shadow-lg rounded-3 position-absolute end-0 mt-2 p-1 border">
                    <button
                      type="button"
                      className="navbar-create-item d-flex align-items-center gap-2 w-100 px-3 py-2 text-start rounded-2"
                      onClick={() => {
                        setCreateMenuOpen(false);
                        navigate('/dreams/new');
                      }}
                    >
                      <Moon size={16} className="text-warning flex-shrink-0" />
                      <span className="small text-light fw-medium">Nuevo sueño</span>
                    </button>

                    <button
                      type="button"
                      className="navbar-create-item d-flex align-items-center gap-2 w-100 px-3 py-2 text-start rounded-2"
                      onClick={() => {
                        setCreateMenuOpen(false);
                        navigate('/dreams/synchronicities/new');
                      }}
                    >
                      <Sparkles size={16} className="flex-shrink-0" style={{ color: '#a78bfa' }} />
                      <span className="small text-light fw-medium">Nueva sincronía</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Icono de cerrar sesión con Tooltip accesible */}
              <UITooltip text="Cerrar sesión">
                <button
                  type="button"
                  className="btn-nav-icon ms-1"
                  onClick={handleLogout}
                  aria-label="Cerrar sesión"
                >
                  <LogOut size={18} aria-hidden="true" />
                </button>
              </UITooltip>
            </>
          ) : (
            <div className="d-flex align-items-center gap-2">
              <Link to="/login" className="yume-nav-link">
                Iniciar sesión
              </Link>
              <UIButton
                variant="primary"
                onClick={() => navigate('/register')}
                className="py-1 px-3"
              >
                Registrarse
              </UIButton>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;

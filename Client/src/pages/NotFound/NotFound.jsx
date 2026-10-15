import React from 'react';
import { useNavigate } from 'react-router-dom';
import UIButton from '../../components/UI/UIButton/UIButton';
import { Compass } from 'lucide-react';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="d-flex flex-column align-items-center justify-content-center min-vh-100 text-center p-4">
      <div className="mb-3 p-3 rounded-circle bg-warning bg-opacity-10 text-warning">
        <Compass size={48} />
      </div>
      <h1 className="display-1 font-serif fw-bold text-warning mb-0">404</h1>
      <h2 className="h4 font-serif text-light mb-2">Página no encontrada</h2>
      <p className="text-muted small mb-4">La ruta a la que intentas acceder no existe en este plano onírico.</p>
      <UIButton variant="primary" onClick={() => navigate('/')}>
        Volver al inicio
      </UIButton>
    </div>
  );
};

export default NotFound;

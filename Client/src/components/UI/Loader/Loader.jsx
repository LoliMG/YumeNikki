import React from 'react';
import Spinner from 'react-bootstrap/Spinner';

const Loader = ({ message = 'Cargando...' }) => {
  return (
    <div className="d-flex flex-column align-items-center justify-content-center py-5 w-100 gap-3" style={{ minHeight: 200 }}>
      <Spinner animation="border" variant="warning" role="status" style={{ width: '2.5rem', height: '2.5rem' }}>
        <span className="visually-hidden">Cargando...</span>
      </Spinner>
      {message && <p className="text-muted small mb-0">{message}</p>}
    </div>
  );
};

export default Loader;

import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import Logo from '../components/Logo/Logo';

const AuthLayout = () => {
  return (
    <div className="min-vh-100 d-flex flex-column align-items-center justify-content-center p-3 position-relative">
      <div className="position-relative z-1 w-100" style={{ maxWidth: '440px' }}>
        <div className="text-center mb-4">
          <Link to="/" className="text-decoration-none">
            <Logo size="lg" />
          </Link>
        </div>
        <Outlet />
      </div>
    </div>
  );
};

export default AuthLayout;

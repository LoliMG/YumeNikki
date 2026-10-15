import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import Loader from '../components/UI/Loader/Loader';

const PrivateRoute = () => {
  const { user, isAuthLoading } = useContext(AuthContext);

  if (isAuthLoading) {
    return <Loader message="Verificando sesión..." />;
  }

  return user ? <Outlet /> : <Navigate to="/login" replace />;
};

export default PrivateRoute;

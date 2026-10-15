import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AuthLayout from '../layouts/AuthLayout';
import AppLayout from '../layouts/AppLayout';
import PrivateRoute from './PrivateRoute';
import PublicRoute from './PublicRoute';
import Loader from '../components/UI/Loader/Loader';
import ErrorBoundary from '../components/UI/ErrorBoundary/ErrorBoundary';

const Home = lazy(() => import('../pages/Home/Home'));
const Login = lazy(() => import('../pages/Auth/Login/Login'));
const Register = lazy(() => import('../pages/Auth/Register/Register'));
const DreamList = lazy(() => import('../pages/Dreams/DreamList/DreamList'));
const DreamForm = lazy(() => import('../pages/Dreams/DreamForm/DreamForm'));
const DreamDetail = lazy(() => import('../pages/Dreams/DreamDetail/DreamDetail'));
const Profile = lazy(() => import('../pages/Profile/Profile'));
const Stats = lazy(() => import('../pages/Stats/Stats'));
const SynchronicitiesPage = lazy(() => import('../pages/Dreams/Synchronicities/SynchronicitiesPage'));
const SynchronicityFormPage = lazy(() => import('../pages/Dreams/Synchronicities/SynchronicityFormPage'));
const GlossaryPage = lazy(() => import('../pages/Dreams/Glossary/GlossaryPage'));
const LegalPage = lazy(() => import('../pages/Legal/LegalPage'));
const NotFound = lazy(() => import('../pages/NotFound/NotFound'));
import LegalHelpButton from '../components/LegalHelpButton/LegalHelpButton';

const AppRoutes = () => {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <ErrorBoundary>
        <Suspense fallback={<Loader message="Cargando..." />}>
          <Routes>
            {/* Rutas de autenticación pública */}
            <Route element={<PublicRoute />}>
              <Route element={<AuthLayout />}>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
              </Route>
            </Route>

            {/* Rutas legales públicas accesibles en todo momento */}
            <Route path="/legal" element={<LegalPage />} />
            <Route path="/legal/:section" element={<LegalPage />} />

            {/* Rutas privadas de la aplicación */}
            <Route element={<PrivateRoute />}>
              <Route element={<AppLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/dreams" element={<DreamList />} />
                <Route path="/dreams/synchronicities" element={<SynchronicitiesPage />} />
                <Route path="/dreams/synchronicities/new" element={<SynchronicityFormPage />} />
                <Route path="/dreams/synchronicities/:id/edit" element={<SynchronicityFormPage />} />
                <Route path="/dreams/glossary" element={<GlossaryPage />} />
                <Route path="/dreams/new" element={<DreamForm />} />
                <Route path="/dreams/:id" element={<DreamDetail />} />
                <Route path="/dreams/:id/edit" element={<DreamForm />} />
                <Route path="/stats" element={<Stats />} />
                <Route path="/profile" element={<Profile />} />
              </Route>
            </Route>

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
        {/* Botón flotante de ayuda e información legal */}
        <LegalHelpButton />
      </ErrorBoundary>
    </Router>
  );
};

export default AppRoutes;

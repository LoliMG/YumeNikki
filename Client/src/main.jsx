import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/theme.scss';
import App from './App.jsx';
import ErrorBoundary from './components/UI/ErrorBoundary/ErrorBoundary';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>
);

import React from 'react';
import { AuthContextProvider } from './contexts/AuthProvider';
import AppRoutes from './routes/AppRoutes';
import CosmicBackground from './components/CosmicBackground/CosmicBackground';

function App() {
  return (
    <div className="min-vh-100 d-flex flex-column position-relative" style={{ minHeight: '100vh' }}>
      <CosmicBackground />
      <div className="d-flex flex-column flex-grow-1 position-relative" style={{ zIndex: 1 }}>
        <AuthContextProvider>
          <AppRoutes />
        </AuthContextProvider>
      </div>
    </div>
  );
}

export default App;

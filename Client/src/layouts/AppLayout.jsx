import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar/Navbar';

const AppLayout = () => {
  return (
    <div className="d-flex flex-column min-vh-100 position-relative">
      <Navbar />
      <main className="flex-grow-1 position-relative z-1 py-4 py-md-5">
        <div className="container-xl px-3 px-md-4">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AppLayout;

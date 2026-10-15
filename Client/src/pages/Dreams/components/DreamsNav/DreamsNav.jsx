import React from 'react';
import { NavLink } from 'react-router-dom';
import { BookOpen, Sparkles, BookMarked } from 'lucide-react';
import './DreamsNav.css';

const DreamsNav = () => {
  return (
    <div className="dreams-subnav-container mb-4">
      <nav className="dreams-subnav-tabs" aria-label="Navegación onírica">
        <NavLink
          to="/dreams"
          end
          className={({ isActive }) => `dreams-subnav-tab ${isActive ? 'active' : ''}`}
        >
          <BookOpen size={16} />
          <span>Diario de Sueños</span>
        </NavLink>

        <NavLink
          to="/dreams/synchronicities"
          className={({ isActive }) => `dreams-subnav-tab ${isActive ? 'active' : ''}`}
        >
          <Sparkles size={16} />
          <span>Sincronías</span>
        </NavLink>

        <NavLink
          to="/dreams/glossary"
          className={({ isActive }) => `dreams-subnav-tab ${isActive ? 'active' : ''}`}
        >
          <BookMarked size={16} />
          <span>Glosario & Etiquetas</span>
        </NavLink>
      </nav>
    </div>
  );
};

export default DreamsNav;

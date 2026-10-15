import React from 'react';
import './Logo.css';

const Logo = ({ size = 'md', showText = true, className = '' }) => {
  return (
    <div className={`yume-logo yume-logo-${size} ${className}`}>
      <svg
        className="yume-logo-svg"
        viewBox="0 0 44 44"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="moonGold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fff3d1" />
            <stop offset="60%" stopColor="#e8c987" />
            <stop offset="100%" stopColor="#d4af37" />
          </linearGradient>
          <linearGradient id="starGlow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#a78bfa" />
          </linearGradient>
          <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Luna creciente estilizada */}
        <path
          d="M 24 5 A 16 16 0 1 0 35 31 A 13 13 0 1 1 24 5 Z"
          fill="url(#moonGold)"
          filter="url(#softGlow)"
        />

        {/* Estrella de cuatro puntas que acompaña la curva interior */}
        <path
          d="M 28 14 C 28 17 26 19 23 19 C 26 19 28 21 28 24 C 28 21 30 19 33 19 C 30 19 28 17 28 14 Z"
          fill="url(#starGlow)"
        />

        {/* Pequeño destello estelar extra */}
        <circle cx="34" cy="9" r="1.2" fill="#ffffff" opacity="0.9" />
      </svg>

      {showText && (
        <span className="yume-logo-text">
          Yume Nikki
        </span>
      )}
    </div>
  );
};

export default Logo;

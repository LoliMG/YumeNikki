import React, { useEffect, useRef } from 'react';
import './CosmicBackground.css';

const CosmicBackground = () => {
  const canvasRef = useRef(null);

  // Manto de estrellas renderizado en un único <canvas> 2D optimizado
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animationFrameId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      initStars();
    };

    window.addEventListener('resize', handleResize, { passive: true });

    // Generar estrellas fijas con fase de parpadeo lenta
    let stars = [];
    const starCount = Math.min(180, Math.floor((width * height) / 7500));

    const initStars = () => {
      stars = [];
      let seed = 42;
      const pseudoRandom = () => {
        seed = (seed * 9301 + 49297) % 233280;
        return seed / 233280;
      };

      for (let i = 0; i < starCount; i++) {
        const x = pseudoRandom() * width;
        const y = pseudoRandom() * height;
        const radius = 0.6 + pseudoRandom() * 1.4;
        const baseAlpha = 0.25 + pseudoRandom() * 0.45;
        const speed = 0.0006 + pseudoRandom() * 0.0012; // Parpadeo pausado y relajante
        const phase = pseudoRandom() * Math.PI * 2;

        const colorRoll = pseudoRandom();
        let color = '255, 255, 255'; // blanco
        if (colorRoll > 0.72) color = '216, 180, 254'; // lavanda
        else if (colorRoll > 0.48) color = '254, 240, 138'; // dorado

        stars.push({ x, y, radius, baseAlpha, speed, phase, color });
      }
    };

    initStars();

    let lastTime = performance.now();
    let isVisible = true;

    const handleVisibilityChange = () => {
      isVisible = !document.hidden;
      if (isVisible) {
        lastTime = performance.now();
        animationFrameId = requestAnimationFrame(render);
      } else {
        cancelAnimationFrame(animationFrameId);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    const render = (currentTime) => {
      if (!isVisible) return;

      const delta = currentTime - lastTime;
      // Limitar a ~30-60 FPS para máximo ahorro de batería
      if (delta > 32) {
        lastTime = currentTime;
        ctx.clearRect(0, 0, width, height);

        for (let i = 0; i < stars.length; i++) {
          const star = stars[i];
          star.phase += star.speed * delta;
          const currentAlpha = Math.max(0.1, star.baseAlpha + Math.sin(star.phase) * 0.22);

          ctx.beginPath();
          ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${star.color}, ${currentAlpha.toFixed(2)})`;
          ctx.fill();
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="cosmic-background" aria-hidden="true">
      {/* 1. Gradiente del firmamento nocturno azul medianoche profundo */}
      <div className="cosmic-sky-gradient" />

      {/* 2. Capa de nubes aterciopeladas y veladuras cozy */}
      <div className="cosmic-nebula-clouds" />

      {/* 3. Resplandor lunar cálido en la esquina superior derecha */}
      <div className="cosmic-moon-halo" />

      {/* 4. Canvas optimizado de micro-estrellas (sustituye 220 elementos DOM) */}
      <canvas ref={canvasRef} className="cosmic-canvas" />

      {/* 5. Lienzo vectorial SVG para constelaciones y destellos en cruz */}
      <svg
        className="cosmic-svg-canvas"
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Degradados radiales de alto rendimiento en sustitución de feGaussianBlur */}
          <radialGradient id="starGlowRadial">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
            <stop offset="35%" stopColor="#d8b4fe" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#1e1145" stopOpacity="0" />
          </radialGradient>

          <radialGradient id="sparkleGlowRadial">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
            <stop offset="30%" stopColor="#fae8ff" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#2e1065" stopOpacity="0" />
          </radialGradient>

          <radialGradient id="goldGlowRadial">
            <stop offset="0%" stopColor="#fffbeb" stopOpacity="1" />
            <stop offset="35%" stopColor="#fef08a" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#451a03" stopOpacity="0" />
          </radialGradient>

          {/* Símbolo de estrella con destello en cruz (4 puntas ópticas) */}
          <g id="sparkle-cross">
            <circle cx="0" cy="0" r="10" fill="url(#sparkleGlowRadial)" />
            <path d="M 0 -22 L 0 22" stroke="rgba(255, 255, 255, 0.9)" strokeWidth="1.2" strokeLinecap="round" />
            <path d="M -22 0 L 22 0" stroke="rgba(255, 255, 255, 0.9)" strokeWidth="1.2" strokeLinecap="round" />
            <path d="M -8 -8 L 8 8" stroke="rgba(255, 255, 255, 0.45)" strokeWidth="0.8" />
            <path d="M -8 8 L 8 -8" stroke="rgba(255, 255, 255, 0.45)" strokeWidth="0.8" />
            <circle cx="0" cy="0" r="2.2" fill="#ffffff" />
          </g>

          <g id="sparkle-cross-gold">
            <circle cx="0" cy="0" r="11" fill="url(#goldGlowRadial)" />
            <path d="M 0 -20 L 0 20" stroke="rgba(255, 240, 180, 0.92)" strokeWidth="1.2" strokeLinecap="round" />
            <path d="M -20 0 L 20 0" stroke="rgba(255, 240, 180, 0.92)" strokeWidth="1.2" strokeLinecap="round" />
            <path d="M -7 -7 L 7 7" stroke="rgba(255, 240, 180, 0.5)" strokeWidth="0.8" />
            <path d="M -7 7 L 7 -7" stroke="rgba(255, 240, 180, 0.5)" strokeWidth="0.8" />
            <circle cx="0" cy="0" r="2.4" fill="#fff9e0" />
          </g>
        </defs>

        {/* Constelaciones */}
        <g className="cosmic-constellations">
          {/* 1. Ursa Major */}
          <g className="constellation-group constellation-ursa">
            <polyline points="150,190 205,175 240,215 185,230 150,190" className="constellation-line" />
            <polyline points="240,215 285,250 330,265 375,305" className="constellation-line" />
            <circle cx="150" cy="190" r="4.5" fill="url(#starGlowRadial)" />
            <circle cx="205" cy="175" r="4.5" fill="url(#starGlowRadial)" />
            <circle cx="240" cy="215" r="5.2" fill="url(#starGlowRadial)" />
            <circle cx="185" cy="230" r="4.5" fill="url(#starGlowRadial)" />
            <circle cx="285" cy="250" r="4.5" fill="url(#starGlowRadial)" />
            <circle cx="330" cy="265" r="5.0" fill="url(#starGlowRadial)" />
            <circle cx="375" cy="305" r="5.0" fill="url(#starGlowRadial)" />
            <text x="230" y="160" className="constellation-label">Ursa Major</text>
          </g>

          {/* 2. Cassiopeia */}
          <g className="constellation-group constellation-cassiopeia">
            <polyline points="580,120 625,160 670,135 715,175 765,145" className="constellation-line" />
            <circle cx="580" cy="120" r="4.5" fill="url(#starGlowRadial)" />
            <circle cx="625" cy="160" r="5.0" fill="url(#starGlowRadial)" />
            <circle cx="670" cy="135" r="5.2" fill="url(#starGlowRadial)" />
            <circle cx="715" cy="175" r="4.5" fill="url(#starGlowRadial)" />
            <circle cx="765" cy="145" r="4.8" fill="url(#starGlowRadial)" />
            <text x="650" y="110" className="constellation-label">Cassiopeia</text>
          </g>

          {/* 3. Cygnus */}
          <g className="constellation-group constellation-cygnus">
            <line x1="1080" y1="210" x2="1190" y2="350" className="constellation-line" />
            <line x1="1090" y1="310" x2="1180" y2="250" className="constellation-line" />
            <circle cx="1080" cy="210" r="5.5" fill="url(#starGlowRadial)" />
            <circle cx="1135" cy="280" r="5.0" fill="url(#starGlowRadial)" />
            <circle cx="1190" cy="350" r="4.5" fill="url(#starGlowRadial)" />
            <circle cx="1090" cy="310" r="4.2" fill="url(#starGlowRadial)" />
            <circle cx="1180" cy="250" r="4.2" fill="url(#starGlowRadial)" />
            <text x="1110" y="195" className="constellation-label">Cygnus</text>
          </g>

          {/* 4. Orion */}
          <g className="constellation-group constellation-orion">
            <line x1="220" y1="580" x2="290" y2="595" className="constellation-line" />
            <line x1="220" y1="580" x2="245" y2="655" className="constellation-line" />
            <line x1="290" y1="595" x2="265" y2="665" className="constellation-line" />
            <line x1="245" y1="655" x2="265" y2="665" className="constellation-line" />
            <line x1="265" y1="665" x2="285" y2="675" className="constellation-line" />
            <line x1="245" y1="655" x2="230" y2="740" className="constellation-line" />
            <line x1="285" y1="675" x2="295" y2="735" className="constellation-line" />
            <circle cx="220" cy="580" r="5.5" fill="url(#goldGlowRadial)" />
            <circle cx="290" cy="595" r="4.8" fill="url(#starGlowRadial)" />
            <circle cx="245" cy="655" r="4.5" fill="url(#starGlowRadial)" />
            <circle cx="265" cy="665" r="4.5" fill="url(#starGlowRadial)" />
            <circle cx="285" cy="675" r="4.5" fill="url(#starGlowRadial)" />
            <circle cx="230" cy="740" r="4.2" fill="url(#starGlowRadial)" />
            <circle cx="295" cy="735" r="5.5" fill="url(#starGlowRadial)" />
            <text x="240" y="560" className="constellation-label">Orion</text>
          </g>

          {/* 5. Lyra */}
          <g className="constellation-group constellation-lyra">
            <polyline points="490,390 475,440 515,455 530,415 490,390" className="constellation-line" />
            <circle cx="490" cy="390" r="5.8" fill="url(#starGlowRadial)" />
            <circle cx="475" cy="440" r="4.0" fill="url(#starGlowRadial)" />
            <circle cx="515" cy="455" r="4.0" fill="url(#starGlowRadial)" />
            <circle cx="530" cy="415" r="4.0" fill="url(#starGlowRadial)" />
            <text x="500" y="375" className="constellation-label">Lyra</text>
          </g>

          {/* 6. Pegasus */}
          <g className="constellation-group constellation-pegasus">
            <polygon points="980,620 1080,635 1060,730 965,710" className="constellation-line" />
            <circle cx="980" cy="620" r="4.8" fill="url(#starGlowRadial)" />
            <circle cx="1080" cy="635" r="4.8" fill="url(#starGlowRadial)" />
            <circle cx="1060" cy="730" r="4.5" fill="url(#starGlowRadial)" />
            <circle cx="965" cy="710" r="4.5" fill="url(#starGlowRadial)" />
            <text x="1000" y="605" className="constellation-label">Pegasus</text>
          </g>

          {/* 7. Pleiades */}
          <g className="constellation-group constellation-pleiades">
            <circle cx="830" cy="420" r="4.2" fill="url(#starGlowRadial)" />
            <circle cx="838" cy="415" r="3.8" fill="url(#starGlowRadial)" />
            <circle cx="844" cy="422" r="3.6" fill="url(#starGlowRadial)" />
            <circle cx="835" cy="428" r="3.9" fill="url(#starGlowRadial)" />
            <circle cx="850" cy="420" r="3.5" fill="url(#starGlowRadial)" />
            <circle cx="854" cy="426" r="3.6" fill="url(#starGlowRadial)" />
            <circle cx="842" cy="433" r="3.2" fill="url(#starGlowRadial)" />
            <text x="825" y="400" className="constellation-label">Pleiades</text>
          </g>
        </g>

        {/* Estrellas destacadas con destello en cruz */}
        <g className="cosmic-sparkle-stars">
          <use href="#sparkle-cross" x="380" y="140" className="sparkle-pulse sparkle-1" />
          <use href="#sparkle-cross-gold" x="610" y="420" className="sparkle-pulse sparkle-2" />
          <use href="#sparkle-cross" x="920" y="280" className="sparkle-pulse sparkle-3" />
          <use href="#sparkle-cross" x="1220" y="560" className="sparkle-pulse sparkle-1" />
          <use href="#sparkle-cross-gold" x="180" y="460" className="sparkle-pulse sparkle-2" />
          <use href="#sparkle-cross" x="780" y="720" className="sparkle-pulse sparkle-3" />
          <use href="#sparkle-cross" x="1340" y="210" className="sparkle-pulse sparkle-2" />
          <use href="#sparkle-cross-gold" x="1120" y="740" className="sparkle-pulse sparkle-1" />
        </g>
      </svg>
    </div>
  );
};

export default CosmicBackground;

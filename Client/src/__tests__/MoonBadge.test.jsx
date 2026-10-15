import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import MoonBadge from '../components/MoonBadge/MoonBadge';

describe('MoonBadge Component', () => {
  it('renderiza correctamente el emoji de la fase y el símbolo del zodíaco', () => {
    render(
      <MoonBadge
        phaseName="Luna creciente"
        phaseEmoji="🌒"
        zodiacSign="Tauro"
        zodiacSymbol="♉︎"
        showText={true}
      />
    );

    expect(screen.getByText('🌒')).toBeInTheDocument();
    expect(screen.getByText('♉︎')).toBeInTheDocument();
    expect(screen.getByText('Luna creciente · Tauro')).toBeInTheDocument();
  });

  it('tiene un aria-label descriptivo para lectores de pantalla', () => {
    render(
      <MoonBadge
        phaseName="Luna llena"
        phaseEmoji="🌕"
        zodiacSign="Escorpio"
        zodiacSymbol="♏︎"
      />
    );

    const badge = screen.getByLabelText('Luna llena en Escorpio');
    expect(badge).toBeInTheDocument();
  });
});

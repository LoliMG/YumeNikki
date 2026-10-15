import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import CalendarView from '../pages/Home/components/CalendarView/CalendarView';

describe('CalendarView Component', () => {
  const dreams = [
    { id: 1, dream_date: '2026-10-14', tag_name: 'Lúcido', tag_color: '#38bdf8' }
  ];

  it('renderiza los días de la semana y la cabecera del calendario', () => {
    render(
      <CalendarView
        selectedDate="2026-10-14"
        onSelectDate={() => {}}
        onMonthChange={() => {}}
      />
    );

    expect(screen.getByText('Lun')).toBeInTheDocument();
    expect(screen.getByText('Dom')).toBeInTheDocument();
    expect(screen.getByText(/Octubre de 2026/i)).toBeInTheDocument();
  });

  it('permite cambiar de mes al pulsar los botones anterior y siguiente', () => {
    const handleMonthChange = vi.fn();
    render(
      <CalendarView
        selectedDate="2026-10-14"
        onSelectDate={() => {}}
        onMonthChange={handleMonthChange}
      />
    );

    // Navegar al mes siguiente (Noviembre)
    const nextBtn = screen.getByLabelText(/Mes siguiente/i);
    fireEvent.click(nextBtn);

    expect(screen.getByText(/Noviembre de 2026/i)).toBeInTheDocument();
    expect(handleMonthChange).toHaveBeenCalledTimes(1);
    const calledDate = handleMonthChange.mock.calls[0][0];
    expect(calledDate.getMonth()).toBe(10); // Noviembre (0-indexed)

    // Navegar al mes anterior dos veces (Noviembre -> Octubre -> Septiembre)
    const prevBtn = screen.getByLabelText(/Mes anterior/i);
    fireEvent.click(prevBtn);
    fireEvent.click(prevBtn);

    expect(screen.getByText(/Septiembre de 2026/i)).toBeInTheDocument();
    const lastCalledDate = handleMonthChange.mock.calls[2][0];
    expect(lastCalledDate.getMonth()).toBe(8); // Septiembre (0-indexed)
  });

  it('emite la fecha seleccionada en formato YYYY-MM-DD al pulsar sobre un día del mes', () => {
    const handleSelectDate = vi.fn();
    render(
      <CalendarView
        selectedDate="2026-10-14"
        dreams={dreams}
        onSelectDate={handleSelectDate}
        onMonthChange={() => {}}
      />
    );

    // Buscar el botón del día 15
    const dayBtn = screen.getByRole('button', { name: /Día 15/i });
    fireEvent.click(dayBtn);

    expect(handleSelectDate).toHaveBeenCalledWith('2026-10-15');
  });
});

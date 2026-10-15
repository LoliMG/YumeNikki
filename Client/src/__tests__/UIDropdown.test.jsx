import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import UIDropdown from '../components/UI/UIDropdown/UIDropdown';

describe('UIDropdown Component', () => {
  const options = [
    { value: 'all', label: 'Todos los tipos' },
    { value: 'lucid', label: 'Sueño lúcido' },
    { value: 'nightmare', label: 'Pesadilla' }
  ];

  it('renderiza el placeholder cuando no hay valor seleccionado', () => {
    render(<UIDropdown options={options} value="" onChange={() => {}} placeholder="Filtrar tipo..." />);
    expect(screen.getByText('Filtrar tipo...')).toBeInTheDocument();
  });

  it('muestra la etiqueta de la opción seleccionada', () => {
    render(<UIDropdown options={options} value="lucid" onChange={() => {}} />);
    expect(screen.getByText('Sueño lúcido')).toBeInTheDocument();
  });

  it('abre el menú desplegable al hacer clic en el trigger y lista las opciones', () => {
    render(<UIDropdown options={options} value="all" onChange={() => {}} />);
    const trigger = screen.getByRole('button');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();

    fireEvent.click(trigger);
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    expect(screen.getByText('Pesadilla')).toBeInTheDocument();
  });

  it('emite el nuevo valor mediante onChange al seleccionar una opción', () => {
    const handleChange = vi.fn();
    render(<UIDropdown options={options} value="all" onChange={handleChange} />);
    
    // Abrir dropdown
    fireEvent.click(screen.getByRole('button'));
    
    // Clic en 'Pesadilla'
    const nightmareOption = screen.getByText('Pesadilla');
    fireEvent.click(nightmareOption);

    expect(handleChange).toHaveBeenCalledWith('nightmare');
    // El menú debe haberse cerrado tras la selección
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('cierra el desplegable al pulsar la tecla Escape', () => {
    render(<UIDropdown options={options} value="all" onChange={() => {}} />);
    const trigger = screen.getByRole('button');
    fireEvent.click(trigger);
    expect(screen.getByRole('listbox')).toBeInTheDocument();

    fireEvent.keyDown(trigger, { key: 'Escape', code: 'Escape' });
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });
});

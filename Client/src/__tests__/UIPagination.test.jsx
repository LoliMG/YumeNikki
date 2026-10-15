import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import UIPagination from '../components/UI/UIPagination/UIPagination';

describe('UIPagination Component', () => {
  it('no se renderiza si hay una única página y pocos elementos', () => {
    const { container } = render(
      <UIPagination
        currentPage={1}
        totalPages={1}
        totalItems={5}
        itemsPerPage={10}
        onPageChange={() => {}}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('muestra el rango de elementos y el total correctamente', () => {
    render(
      <UIPagination
        currentPage={2}
        totalPages={10}
        totalItems={100}
        itemsPerPage={10}
        onPageChange={() => {}}
      />
    );

    // Página 2 con 10 items/página => 11 - 20 de 100
    expect(screen.getByText('11 - 20')).toBeInTheDocument();
    expect(screen.getByText('100')).toBeInTheDocument();
  });

  it('llama a onPageChange al hacer click en los botones numéricos y de navegación', () => {
    const handlePageChange = vi.fn();
    render(
      <UIPagination
        currentPage={2}
        totalPages={5}
        totalItems={50}
        itemsPerPage={10}
        onPageChange={handlePageChange}
      />
    );

    // Click en la página 3
    const page3Btn = screen.getByRole('button', { name: 'Página 3' });
    fireEvent.click(page3Btn);
    expect(handlePageChange).toHaveBeenCalledWith(3);

    // Click en página siguiente
    const nextBtn = screen.getByRole('button', { name: 'Página siguiente' });
    fireEvent.click(nextBtn);
    expect(handlePageChange).toHaveBeenCalledWith(3);

    // Click en página anterior
    const prevBtn = screen.getByRole('button', { name: 'Página anterior' });
    fireEvent.click(prevBtn);
    expect(handlePageChange).toHaveBeenCalledWith(1);
  });

  it('deshabilita controles de retroceso en la primera página', () => {
    render(
      <UIPagination
        currentPage={1}
        totalPages={5}
        totalItems={50}
        itemsPerPage={10}
        onPageChange={() => {}}
      />
    );

    expect(screen.getByRole('button', { name: 'Primera página' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Página anterior' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Página siguiente' })).not.toBeDisabled();
  });

  it('llama a onItemsPerPageChange al cambiar el selector de límite', () => {
    const handleLimitChange = vi.fn();
    render(
      <UIPagination
        currentPage={1}
        totalPages={5}
        totalItems={50}
        itemsPerPage={10}
        onPageChange={() => {}}
        onItemsPerPageChange={handleLimitChange}
        itemsPerPageOptions={[10, 15, 25]}
      />
    );

    const select = screen.getByLabelText('Por pág:');
    fireEvent.change(select, { target: { value: '15' } });
    expect(handleLimitChange).toHaveBeenCalledWith(15);
  });
});

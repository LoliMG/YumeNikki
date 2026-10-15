import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import './UIDropdown.css';

/**
 * UIDropdown: Componente de selección desplegable personalizado, elegante y accesible.
 * Reemplaza los selects nativos del navegador con un diseño temático místico y acogedor.
 * 
 * @param {Array} options - Array de objetos: [{ value, label, icon, color, subtitle }] o strings
 * @param {string|number} value - Valor seleccionado actualmente
 * @param {function} onChange - Callback al seleccionar: onChange(value)
 * @param {string} placeholder - Texto por defecto si no hay nada seleccionado
 * @param {boolean} disabled - Si el desplegable está deshabilitado
 * @param {string} id - ID del elemento para accesibilidad
 * @param {string} name - Nombre del campo para formularios
 * @param {string} ariaLabel - Etiqueta accesible para lectores de pantalla
 * @param {string} size - 'sm' | 'md' | 'lg' (por defecto 'md')
 * @param {string} className - Clases CSS adicionales
 */
const UIDropdown = ({
  options = [],
  value,
  onChange,
  placeholder = 'Seleccionar...',
  disabled = false,
  id,
  name,
  ariaLabel,
  size = 'md',
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Normalizar opciones
  const normalizedOptions = options.map(opt => {
    if (typeof opt === 'string' || typeof opt === 'number') {
      return { value: opt, label: String(opt) };
    }
    return opt;
  });

  // Opción seleccionada actualmente
  const selectedOption = normalizedOptions.find(opt => String(opt.value) === String(value)) || null;

  // Cerrar al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen]);

  // Manejar teclado
  const handleKeyDown = useCallback((e) => {
    if (disabled) return;

    if (e.key === 'Escape') {
      setIsOpen(false);
    } else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
        return;
      }
      const currentIndex = normalizedOptions.findIndex(opt => String(opt.value) === String(value));
      const nextIndex = e.key === 'ArrowDown'
        ? Math.min(currentIndex + 1, normalizedOptions.length - 1)
        : Math.max(currentIndex - 1, 0);
      if (normalizedOptions[nextIndex]) {
        onChange(normalizedOptions[nextIndex].value);
      }
    }
  }, [disabled, isOpen, normalizedOptions, value, onChange]);

  const handleSelect = (optionValue) => {
    if (disabled) return;
    onChange(optionValue);
    setIsOpen(false);
  };

  const toggleDropdown = () => {
    if (!disabled) setIsOpen(prev => !prev);
  };

  return (
    <div
      ref={containerRef}
      className={`ui-dropdown-wrapper ui-dropdown-${size} ${isOpen ? 'is-open' : ''} ${disabled ? 'is-disabled' : ''} ${className}`}
      onKeyDown={handleKeyDown}
    >
      {/* Input oculto para compatibilidad con formularios nativos */}
      {name && (
        <input
          type="hidden"
          name={name}
          value={value ?? ''}
          id={id ? `${id}-hidden` : undefined}
        />
      )}

      {/* Botón activador del desplegable */}
      <button
        type="button"
        id={id}
        className="ui-dropdown-trigger"
        onClick={toggleDropdown}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={ariaLabel || placeholder}
      >
        <div className="ui-dropdown-selection">
          {selectedOption ? (
            <span className="ui-dropdown-selected-label">
              {selectedOption.color && (
                <span
                  className="ui-dropdown-color-dot"
                  style={{ backgroundColor: selectedOption.color }}
                  aria-hidden="true"
                />
              )}
              {selectedOption.icon && (
                <span className="ui-dropdown-icon me-2">{selectedOption.icon}</span>
              )}
              {selectedOption.label}
            </span>
          ) : (
            <span className="ui-dropdown-placeholder">{placeholder}</span>
          )}
        </div>

        <ChevronDown
          size={16}
          className={`ui-dropdown-chevron ${isOpen ? 'rotate-180' : ''}`}
          aria-hidden="true"
        />
      </button>

      {/* Menú desplegable */}
      {isOpen && (
        <ul
          className="ui-dropdown-menu"
          role="listbox"
          aria-label={ariaLabel || placeholder}
          tabIndex={-1}
        >
          {normalizedOptions.length === 0 ? (
            <li className="ui-dropdown-item ui-dropdown-empty text-muted">
              Sin opciones disponibles
            </li>
          ) : (
            normalizedOptions.map(option => {
              const isSelected = String(option.value) === String(value);
              return (
                <li
                  key={String(option.value)}
                  className={`ui-dropdown-item ${isSelected ? 'is-selected' : ''}`}
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => handleSelect(option.value)}
                >
                  <div className="ui-dropdown-item-content">
                    {option.color && (
                      <span
                        className="ui-dropdown-color-dot"
                        style={{ backgroundColor: option.color }}
                        aria-hidden="true"
                      />
                    )}
                    {option.icon && (
                      <span className="ui-dropdown-icon me-2">{option.icon}</span>
                    )}
                    <span className="ui-dropdown-item-text">{option.label}</span>
                    {option.subtitle && (
                      <span className="ui-dropdown-item-sub">{option.subtitle}</span>
                    )}
                  </div>
                  {isSelected && (
                    <Check size={14} className="ui-dropdown-check-icon text-warning ms-2" />
                  )}
                </li>
              );
            })
          )}
        </ul>
      )}
    </div>
  );
};

export default UIDropdown;

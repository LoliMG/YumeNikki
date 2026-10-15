import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { PlusCircle } from 'lucide-react';
import UIButton from '../../../components/UI/UIButton/UIButton';
import UIPagination from '../../../components/UI/UIPagination/UIPagination';
import Loader from '../../../components/UI/Loader/Loader';
import api from '../../../helpers/api';
import DreamsNav from '../components/DreamsNav/DreamsNav';
import DreamFilters from './components/DreamFilters';
import DreamDateGroup from './components/DreamDateGroup';
import DreamEmptyState from './components/DreamEmptyState';
import './DreamList.css';

const DreamList = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [dreams, setDreams] = useState([]);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);

  // Estados de paginación
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(12);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1, page: 1, limit: 12 });

  // Estados de filtros
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [selectedTagId, setSelectedTagId] = useState(searchParams.get('tag_id') || '');
  const [startDate, setStartDate] = useState(searchParams.get('startDate') || '');
  const [endDate, setEndDate] = useState(searchParams.get('endDate') || '');
  const [character, setCharacter] = useState(searchParams.get('character') || '');
  const [place, setPlace] = useState(searchParams.get('place') || '');
  const [symbolism, setSymbolism] = useState(searchParams.get('symbolism') || '');

  // Cargar etiquetas del usuario
  useEffect(() => {
    const fetchTags = async () => {
      try {
        const res = await api.get('/tags');
        if (res.tags) setTags(res.tags);
      } catch (err) {
        console.error('Error al cargar etiquetas:', err);
      }
    };
    fetchTags();
  }, []);

  // Reiniciar a la página 1 cuando los filtros cambian
  useEffect(() => {
    setPage(1);
  }, [search, selectedTagId, startDate, endDate, character, place, symbolism]);

  // Cargar sueños con los filtros y paginación aplicados
  const fetchDreams = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.append('search', search.trim());
      if (selectedTagId) params.append('tag_id', selectedTagId);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      if (character.trim()) params.append('character', character.trim());
      if (place.trim()) params.append('place', place.trim());
      if (symbolism.trim()) params.append('symbolism', symbolism.trim());

      params.append('page', page);
      params.append('limit', limit);

      const res = await api.get(`/dreams?${params.toString()}`);
      if (res.dreams) {
        setDreams(res.dreams);
      }
      if (res.pagination) {
        setPagination(res.pagination);
      } else {
        setPagination({
          total: res.dreams ? res.dreams.length : 0,
          totalPages: 1,
          page: 1,
          limit
        });
      }
    } catch (err) {
      console.error('Error al cargar lista de sueños:', err);
    } finally {
      setLoading(false);
    }
  }, [search, selectedTagId, startDate, endDate, character, place, symbolism, page, limit]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchDreams();
    }, 250);

    return () => clearTimeout(timer);
  }, [fetchDreams]);

  // Limpiar todos los filtros
  const handleClearFilters = () => {
    setSearch('');
    setSelectedTagId('');
    setStartDate('');
    setEndDate('');
    setCharacter('');
    setPlace('');
    setSymbolism('');
    setPage(1);
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLimitChange = (newLimit) => {
    setLimit(newLimit);
    setPage(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const hasActiveFilters = Boolean(
    search || selectedTagId || startDate || endDate || character || place || symbolism
  );

  // Agrupación cronológica por fechas de la página actual
  const groupedDreams = useMemo(() => {
    const groups = {};

    for (const d of dreams) {
      const dateKey = typeof d.dream_date === 'string' ? d.dream_date.split('T')[0] : d.dream_date;
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(d);
    }

    const sortedDateKeys = Object.keys(groups).sort((a, b) => b.localeCompare(a));

    return sortedDateKeys.map(dateKey => {
      const sortedItems = groups[dateKey].sort((a, b) => {
        return (a.dream_time || '00:00').localeCompare(b.dream_time || '00:00');
      });

      let formattedHeader = dateKey;
      try {
        const [year, month, day] = dateKey.split('-').map(Number);
        const d = new Date(year, month - 1, day);
        formattedHeader = d.toLocaleDateString('es-ES', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        });
        formattedHeader = formattedHeader.charAt(0).toUpperCase() + formattedHeader.slice(1);
      } catch (_) {}

      return {
        dateKey,
        formattedHeader,
        dreams: sortedItems
      };
    });
  }, [dreams]);

  return (
    <div className="container-md py-3" style={{ maxWidth: 960 }}>
      {/* Pestañas de Navegación Onírica */}
      <DreamsNav />

      {/* Cabecera y Botón de creación */}
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
        <div>
          <h1 className="h2 font-serif fw-bold text-warning m-0">Diario de Sueños</h1>
          <p className="text-muted small m-0">Explora y filtra tus memorias nocturnas</p>
        </div>

        <UIButton
          variant="primary"
          onClick={() => navigate('/dreams/new')}
          className="d-flex align-items-center gap-2"
        >
          <PlusCircle size={17} aria-hidden="true" />
          <span>Registrar nuevo sueño</span>
        </UIButton>
      </div>

      {/* Barra de búsqueda y filtros */}
      <DreamFilters
        search={search}
        setSearch={setSearch}
        selectedTagId={selectedTagId}
        setSelectedTagId={setSelectedTagId}
        startDate={startDate}
        setStartDate={setStartDate}
        endDate={endDate}
        setEndDate={setEndDate}
        character={character}
        setCharacter={setCharacter}
        place={place}
        setPlace={setPlace}
        symbolism={symbolism}
        setSymbolism={setSymbolism}
        tags={tags}
        onClearFilters={handleClearFilters}
        hasActiveFilters={hasActiveFilters}
      />

      {/* Resultados de la búsqueda */}
      {loading ? (
        <Loader message="Buscando en tu diario..." />
      ) : groupedDreams.length === 0 ? (
        <DreamEmptyState
          hasActiveFilters={hasActiveFilters}
          onClearFilters={handleClearFilters}
        />
      ) : (
        <div className="d-flex flex-column gap-4">
          <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 text-muted small">
            <div>
              Página <span className="text-light fw-medium">{pagination.page || page}</span> de{' '}
              <span className="text-light fw-medium">{pagination.totalPages || 1}</span>{' '}
              ({pagination.total || dreams.length} sueño{(pagination.total || dreams.length) === 1 ? '' : 's'} en total)
            </div>
          </div>

          {groupedDreams.map(group => (
            <DreamDateGroup key={group.dateKey} group={group} />
          ))}

          {/* Componente de Paginación */}
          <UIPagination
            currentPage={pagination.page || page}
            totalPages={pagination.totalPages || 1}
            totalItems={pagination.total ?? dreams.length}
            itemsPerPage={limit}
            onPageChange={handlePageChange}
            onItemsPerPageChange={handleLimitChange}
            itemsPerPageOptions={[10, 15, 25]}
          />
        </div>
      )}
    </div>
  );
};

export default DreamList;

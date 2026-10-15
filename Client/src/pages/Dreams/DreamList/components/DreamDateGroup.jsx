import React from 'react';
import { Calendar } from 'lucide-react';
import DreamCard from './DreamCard';

const DreamDateGroup = ({ group }) => {
  return (
    <div className="dream-date-group">
      {/* Encabezado del día */}
      <div className="mb-2 d-flex align-items-center gap-2">
        <Calendar size={15} className="text-warning" aria-hidden="true" />
        <h2 className="h5 font-serif fw-bold text-light m-0">{group.formattedHeader}</h2>
        <span className="badge bg-secondary ms-1">{group.dreams.length}</span>
      </div>

      {/* Lista de sueños de ese día */}
      <div className="d-flex flex-column gap-2">
        {group.dreams.map(dream => (
          <DreamCard key={dream.id} dream={dream} />
        ))}
      </div>
    </div>
  );
};

export default DreamDateGroup;

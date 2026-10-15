import React from 'react';
import Card from 'react-bootstrap/Card';
import { Tag as TagIcon, PlusCircle, Edit2, Trash2 } from 'lucide-react';
import UIButton from '../../../components/UI/UIButton/UIButton';
import TagBadge from '../../../components/TagBadge/TagBadge';

const TagsManagerSection = ({
  tags,
  tagsLoading,
  onOpenTagModal,
  onStartDeleteTag
}) => {
  return (
    <Card className="bg-surface border-subtle shadow-sm rounded-4 overflow-hidden">
      <Card.Header className="bg-black bg-opacity-25 border-bottom border-subtle py-3 px-4 d-flex align-items-center justify-content-between">
        <div className="d-flex align-items-center gap-2">
          <TagIcon size={18} className="text-warning" />
          <h2 className="h5 font-serif text-light m-0">Gestión de Etiquetas Oníricas</h2>
        </div>
        <UIButton
          variant="primary"
          size="sm"
          onClick={() => onOpenTagModal(null)}
          className="d-flex align-items-center gap-1"
        >
          <PlusCircle size={15} />
          <span>Nueva etiqueta</span>
        </UIButton>
      </Card.Header>
      <Card.Body className="p-3 p-md-4">
        {tagsLoading ? (
          <p className="text-muted small py-2 m-0">Cargando etiquetas...</p>
        ) : (
          <div className="d-flex flex-column gap-2">
            {tags.map(t => (
              <div key={t.id} className="profile-tag-row d-flex align-items-center justify-content-between p-2 rounded">
                <div className="d-flex align-items-center gap-2">
                  <TagBadge tag={t} size="md" />
                  <span className="text-light fw-medium">{t.name}</span>
                  {t.is_default && (
                    <span className="badge bg-secondary bg-opacity-25 text-muted small">Por defecto</span>
                  )}
                </div>

                <div className="d-flex align-items-center gap-1">
                  <UIButton
                    variant="secondary"
                    size="sm"
                    className="p-1 px-2 small d-flex align-items-center gap-1"
                    onClick={() => onOpenTagModal(t)}
                    title="Editar etiqueta"
                  >
                    <Edit2 size={13} />
                    <span>Editar</span>
                  </UIButton>

                  <UIButton
                    variant="danger"
                    size="sm"
                    className="p-1 px-2 small d-flex align-items-center gap-1"
                    onClick={() => onStartDeleteTag(t)}
                    title="Eliminar etiqueta"
                  >
                    <Trash2 size={13} />
                    <span>Eliminar</span>
                  </UIButton>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default TagsManagerSection;

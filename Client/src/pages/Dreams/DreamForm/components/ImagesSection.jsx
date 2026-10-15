import React from 'react';
import Card from 'react-bootstrap/Card';
import { Image as ImageIcon, Trash2, X } from 'lucide-react';
import UIButton from '../../../../components/UI/UIButton/UIButton';
import { getImageUrl } from '../../../../helpers/api';

const ImagesSection = ({
  existingImages,
  newImagePreviews,
  fileInputRef,
  onFileSelect,
  onRemoveNewImage,
  onDeleteExistingImage
}) => {
  return (
    <Card className="bg-surface border-subtle mb-4 shadow-sm rounded-4 overflow-hidden">
      <Card.Header className="bg-black bg-opacity-25 border-bottom border-subtle py-3 px-4 d-flex align-items-center justify-content-between">
        <div className="d-flex align-items-center gap-2">
          <ImageIcon size={18} className="text-warning" />
          <h2 className="h5 font-serif text-light m-0">Ilustraciones y Bocetos</h2>
        </div>
        <UIButton
          variant="secondary"
          size="sm"
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="d-flex align-items-center gap-1"
        >
          <ImageIcon size={15} />
          <span>Adjuntar imagen</span>
        </UIButton>
      </Card.Header>
      <Card.Body className="p-3 p-md-4">
        <input
          type="file"
          ref={fileInputRef}
          onChange={onFileSelect}
          multiple
          accept="image/*"
          className="d-none"
        />

        {/* Galería de imágenes existentes en el servidor */}
        {existingImages.length > 0 && (
          <div className="mb-3">
            <h3 className="h6 text-muted mb-2">Imágenes guardadas</h3>
            <div className="dream-image-grid">
              {existingImages.map(img => (
                <div key={img.id} className="dream-image-thumbnail">
                  <img src={getImageUrl(img.file_path)} alt={img.original_name || 'Ilustración del sueño'} />
                  <button
                    type="button"
                    className="dream-image-delete-btn"
                    onClick={() => onDeleteExistingImage(img)}
                    aria-label="Eliminar imagen"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Galería de nuevas imágenes por subir */}
        {newImagePreviews.length > 0 && (
          <div>
            <h3 className="h6 text-muted mb-2">Imágenes por subir al guardar</h3>
            <div className="dream-image-grid">
              {newImagePreviews.map((previewUrl, idx) => (
                <div key={idx} className="dream-image-thumbnail">
                  <img src={previewUrl} alt="Vista previa de imagen" />
                  <button
                    type="button"
                    className="dream-image-delete-btn"
                    onClick={() => onRemoveNewImage(idx)}
                    aria-label="Quitar imagen"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {existingImages.length === 0 && newImagePreviews.length === 0 && (
          <p className="text-muted small m-0 fst-italic">
            No hay ilustraciones adjuntas a este sueño. Puedes subir dibujos, fotos o capturas de tu diario físico.
          </p>
        )}
      </Card.Body>
    </Card>
  );
};

export default ImagesSection;

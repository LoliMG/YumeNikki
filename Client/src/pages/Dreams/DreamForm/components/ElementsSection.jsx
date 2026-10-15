import React from 'react';
import Card from 'react-bootstrap/Card';
import { Users, MapPin, Sparkles, FileText } from 'lucide-react';
import { UIFormGroup, UIFormLabel, UIFormControl } from '../../../../components/UI/UIForm/UIForm';

const ElementsSection = ({ formData, onChange }) => {
  return (
    <>
      {/* SECCIÓN 3: Elementos Oníricos */}
      <Card className="bg-surface border-subtle mb-4 shadow-sm rounded-4 overflow-hidden">
        <Card.Header className="bg-black bg-opacity-25 border-bottom border-subtle py-3 px-4 d-flex align-items-center gap-2">
          <Users size={18} className="text-warning" />
          <h2 className="h5 font-serif text-light m-0">3. Elementos Oníricos</h2>
        </Card.Header>
        <Card.Body className="p-3 p-md-4">
          <div className="row g-3">
            {/* Personajes */}
            <div className="col-12 col-md-4">
              <UIFormGroup className="mb-0">
                <UIFormLabel htmlFor="dream-characters" className="d-flex align-items-center gap-1">
                  <Users size={14} />
                  <span>Personajes</span>
                </UIFormLabel>
                <UIFormControl
                  id="dream-characters"
                  as="textarea"
                  rows={3}
                  name="characters"
                  value={formData.characters}
                  onChange={onChange}
                  placeholder="Personas, criaturas o sombras que aparecieron..."
                />
              </UIFormGroup>
            </div>

            {/* Lugares */}
            <div className="col-12 col-md-4">
              <UIFormGroup className="mb-0">
                <UIFormLabel htmlFor="dream-places" className="d-flex align-items-center gap-1">
                  <MapPin size={14} />
                  <span>Lugares</span>
                </UIFormLabel>
                <UIFormControl
                  id="dream-places"
                  as="textarea"
                  rows={3}
                  name="places"
                  value={formData.places}
                  onChange={onChange}
                  placeholder="Espacios, casas, paisajes, habitaciones..."
                />
              </UIFormGroup>
            </div>

            {/* Simbolismos */}
            <div className="col-12 col-md-4">
              <UIFormGroup className="mb-0">
                <UIFormLabel htmlFor="dream-symbolisms" className="d-flex align-items-center gap-1">
                  <Sparkles size={14} />
                  <span>Simbolismos</span>
                </UIFormLabel>
                <UIFormControl
                  id="dream-symbolisms"
                  as="textarea"
                  rows={3}
                  name="symbolisms"
                  value={formData.symbolisms}
                  onChange={onChange}
                  placeholder="Objetos clave, números, colores o metáforas..."
                />
              </UIFormGroup>
            </div>
          </div>
        </Card.Body>
      </Card>

      {/* SECCIÓN 4: Notas y Reflexiones */}
      <Card className="bg-surface border-subtle mb-4 shadow-sm rounded-4 overflow-hidden">
        <Card.Header className="bg-black bg-opacity-25 border-bottom border-subtle py-3 px-4 d-flex align-items-center gap-2">
          <FileText size={18} className="text-warning" />
          <h2 className="h5 font-serif text-light m-0">4. Notas y Reflexiones</h2>
        </Card.Header>
        <Card.Body className="p-3 p-md-4">
          <UIFormGroup className="mb-0">
            <UIFormLabel htmlFor="dream-notes">
              Comentarios diurnos o interpretación personal
            </UIFormLabel>
            <UIFormControl
              id="dream-notes"
              as="textarea"
              rows={3}
              name="notes"
              value={formData.notes}
              onChange={onChange}
              placeholder="Sensación al despertar, reflexiones personales o relación con la vigilia..."
            />
          </UIFormGroup>
        </Card.Body>
      </Card>
    </>
  );
};

export default ElementsSection;

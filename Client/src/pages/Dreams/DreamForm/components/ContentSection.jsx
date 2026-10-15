import React from 'react';
import Card from 'react-bootstrap/Card';
import { Sparkles } from 'lucide-react';
import { UIFormGroup, UIFormLabel, UIFormControl } from '../../../../components/UI/UIForm/UIForm';

const ContentSection = ({ content, onChange }) => {
  return (
    <Card className="bg-surface border-subtle mb-4 shadow-sm rounded-4 overflow-hidden">
      <Card.Header className="bg-black bg-opacity-25 border-bottom border-subtle py-3 px-4 d-flex align-items-center gap-2">
        <Sparkles size={18} className="text-warning" />
        <h2 className="h5 font-serif text-light m-0">2. Relato del Sueño</h2>
      </Card.Header>
      <Card.Body className="p-3 p-md-4">
        <UIFormGroup className="mb-0">
          <UIFormLabel htmlFor="dream-content">
            ¿Qué ocurrió en el sueño?
          </UIFormLabel>
          <UIFormControl
            id="dream-content"
            as="textarea"
            rows={8}
            name="content"
            value={content}
            onChange={onChange}
            placeholder="Escribe aquí con todo el detalle que recuerdes: colores, sensaciones, diálogos, el discurrir de los acontecimientos..."
            className="fs-6 lh-base font-sans"
          />
        </UIFormGroup>
      </Card.Body>
    </Card>
  );
};

export default ContentSection;

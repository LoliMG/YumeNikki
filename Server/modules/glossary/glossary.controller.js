import * as glossaryDal from './glossary.dal.js';

export const listSymbols = async (req, res, next) => {
  try {
    const list = await glossaryDal.listSymbolsWithCounts(req.user_id);
    return res.json({ symbols: list });
  } catch (error) {
    next(error);
  }
};

export const createSymbol = async (req, res, next) => {
  try {
    const { symbol_name, archetype, personal_meaning } = req.body;

    if (!symbol_name || !symbol_name.trim() || !personal_meaning || !personal_meaning.trim()) {
      return res.status(400).json({ message: 'El nombre del símbolo y tu significado personal son obligatorios.' });
    }

    const created = await glossaryDal.createSymbol({
      userId: req.user_id,
      symbolName: symbol_name,
      archetype,
      personalMeaning: personal_meaning
    });

    return res.status(201).json({
      message: 'Símbolo añadido a tu glosario personal.',
      symbol: created
    });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ message: 'Ya tienes un símbolo registrado con ese nombre en tu glosario.' });
    }
    next(error);
  }
};

export const updateSymbol = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const { symbol_name, archetype, personal_meaning } = req.body;

    const existing = await glossaryDal.getSymbolById(id, req.user_id);
    if (!existing) {
      return res.status(404).json({ message: 'Símbolo no encontrado en tu glosario.' });
    }

    const updated = await glossaryDal.updateSymbol({
      id,
      userId: req.user_id,
      symbolName: symbol_name,
      archetype,
      personalMeaning: personal_meaning
    });

    return res.json({
      message: 'Símbolo actualizado con éxito.',
      symbol: updated
    });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ message: 'Ya existe otro símbolo con ese nombre.' });
    }
    next(error);
  }
};

export const deleteSymbol = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const deleted = await glossaryDal.deleteSymbol(id, req.user_id);
    if (!deleted) {
      return res.status(404).json({ message: 'Símbolo no encontrado.' });
    }
    return res.json({ message: 'Símbolo eliminado de tu glosario.' });
  } catch (error) {
    next(error);
  }
};

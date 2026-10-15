import { upload } from './multer.js';

export const handleSingleUpload = (fieldName = 'file') => {
  return (req, res, next) => {
    const uploadMiddleware = upload.single(fieldName);
    uploadMiddleware(req, res, (err) => {
      if (err) {
        return res.status(400).json({ message: err.message || 'Error al subir el archivo.' });
      }
      next();
    });
  };
};

export const handleMultipleUpload = (fieldName = 'images', maxCount = 10) => {
  return (req, res, next) => {
    const uploadMiddleware = upload.array(fieldName, maxCount);
    uploadMiddleware(req, res, (err) => {
      if (err) {
        return res.status(400).json({ message: err.message || 'Error al subir los archivos.' });
      }
      next();
    });
  };
};

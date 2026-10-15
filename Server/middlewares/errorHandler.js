export const errorHandler = (err, req, res, next) => {
  const isProduction = process.env.NODE_ENV === 'production';
  const status = err.status || err.statusCode || 500;

  if (status >= 500) {
    console.error('Server Internal Error:', err);
    if (isProduction) {
      return res.status(status).json({ message: 'Error interno del servidor.' });
    }
  }

  return res.status(status).json({
    message: err.message || 'Error inesperado.'
  });
};

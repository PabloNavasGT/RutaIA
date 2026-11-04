const errorHandler = (err, req, res, next) => {
  console.error('Error capturado:', err.message);
  
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    estado: 'Error',
    codigo: statusCode,
    mensaje: err.message || 'Error interno en el servidor.'
  });
};

module.exports = errorHandler;
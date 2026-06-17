export function notFound(req, res, next) {
  res.status(404).json({ ok: false, error: 'Ruta no encontrada' });
}

export function errorHandler(err, req, res, next) {
  console.error(err);
  const status = err.status || 500;
  res.status(status).json({
    ok: false,
    error: err.publicMessage || err.message || 'Error interno del servidor'
  });
}

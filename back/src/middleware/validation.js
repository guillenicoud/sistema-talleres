const positiveId = value => ['string', 'number'].includes(typeof value) && /^[1-9]\d*$/.test(String(value)) && Number.isSafeInteger(Number(value));
const time = value => typeof value === 'string' && /^(?:[01]\d|2[0-3]):[0-5]\d(?::[0-5]\d)?$/.test(value);

export function validateRequest(req, res, next) {
  const parts = req.path.split('/').filter(Boolean);
  const resources = ['alumnos', 'talleristas', 'talleres', 'detalle-taller', 'dias'];
  const daily = parts[0] === 'detalle-talleres' && parts[1] === 'dia';
  if (!resources.includes(parts[0]) && !daily) return next();
  const id = daily ? parts[2] : parts[1];
  if (id !== undefined && (!positiveId(id) || ((daily || parts[0] === 'dias') && Number(id) > 7))) {
    return res.status(400).json({ message: 'Identificador inválido' });
  }
  if (!['POST', 'PUT'].includes(req.method)) return next();
  const body = req.body;
  if (!body || typeof body !== 'object' || Array.isArray(body)) return res.status(400).json({ message: 'Datos inválidos' });
  let message;
  if (['alumnos', 'talleristas'].includes(parts[0])) {
    for (const field of ['nombre', 'apellido']) {
      if (typeof body[field] !== 'string' || !body[field].trim() || body[field].length > 100) message = 'Nombre y apellido son obligatorios (máximo 100 caracteres)';
      else body[field] = body[field].trim();
    }
    // El formulario original permite omitir DNI; validar su formato si se informa.
    if (body.dni == null) body.dni = '';
    if (body.dni !== '' && (!['string', 'number'].includes(typeof body.dni) || !/^\d{7,8}$/.test(String(body.dni)))) message = 'El DNI debe tener 7 u 8 dígitos';
    for (const field of ['email', 'telefono', 'direccion']) {
      if (body[field] == null) body[field] = '';
      if (typeof body[field] !== 'string' || body[field].length > 255) message = 'Datos de contacto inválidos';
    }
    if (body.email && (typeof body.email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email))) message = 'Email inválido';
  }
  if (parts[0] === 'talleres') {
    if (typeof body.taller !== 'string' || !body.taller.trim() || body.taller.length > 100) message = 'Nombre de taller obligatorio (máximo 100 caracteres)';
    else body.taller = body.taller.trim();
  }
  if (parts[0] === 'detalle-taller') {
    if (![body.id_taller, body.id_tallerista, body.id_dia].every(positiveId) || Number(body.id_dia) > 7) message = 'Seleccioná taller, tallerista y día válidos';
    if (!time(body.hora_inicio) || !time(body.hora_fin) || body.hora_inicio.padEnd(8, ':00') >= body.hora_fin.padEnd(8, ':00')) message = 'El horario de fin debe ser posterior al inicio';
    if (body.nivel == null) body.nivel = '';
    if (typeof body.nivel !== 'string' || body.nivel.length > 100) message = 'Nivel inválido';
  }
  if (message) return res.status(400).json({ message });
  next();
}

export function errorHandler(error, req, res, next) {
  if (res.headersSent) return next(error);
  if (error.type === 'entity.parse.failed') return res.status(400).json({ message: 'JSON inválido' });
  if (error.type === 'entity.too.large') return res.status(413).json({ message: 'Solicitud demasiado grande' });
  if (error.code === 'ER_DUP_ENTRY') return res.status(409).json({ message: 'El registro ya existe' });
  if (['ER_ROW_IS_REFERENCED_2', 'ER_NO_REFERENCED_ROW_2'].includes(error.code)) return res.status(409).json({ message: 'El registro tiene relaciones existentes o referencias inválidas' });
  // No registrar SQL, cuerpos de solicitudes, credenciales ni datos personales.
  console.error('Error de API:', error.code || error.name || 'UNKNOWN');
  res.status(500).json({ message: 'No se pudo completar la operación. Intentá nuevamente.' });
}

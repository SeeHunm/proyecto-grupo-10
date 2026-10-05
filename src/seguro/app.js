require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const { db, initDatabase } = require('./db');

const app = express();
app.disable('x-powered-by');
app.use(helmet());
app.use(express.json({ limit: '20kb' }));

const API_KEY = process.env.API_KEY;
const PORT = Number(process.env.PORT || 3001);

if (!API_KEY) {
  console.error('Falta API_KEY. Copia .env.example como .env antes de ejecutar.');
  process.exit(1);
}

function isPositiveInt(value) {
  return /^\d+$/.test(String(value)) && Number(value) > 0;
}

function authenticate(req, res, next) {
  if (req.get('x-api-key') !== API_KEY) {
    return res.status(401).json({ error: 'No autenticado' });
  }
  const userId = req.get('x-user-id');
  if (!isPositiveInt(userId)) {
    return res.status(401).json({ error: 'Identidad de usuario inválida' });
  }
  db.get('SELECT id, username, role FROM users WHERE id = ?', [Number(userId)], (err, user) => {
    if (err) return next(err);
    if (!user) return res.status(401).json({ error: 'Usuario no válido' });
    req.user = user;
    next();
  });
}

function requireAdmin(req, res, next) {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Permiso insuficiente' });
  next();
}

function requireZoneOwnership(req, res, next) {
  if (!isPositiveInt(req.params.id)) return res.status(400).json({ error: 'ID de zona inválido' });
  db.get('SELECT * FROM zones WHERE id = ?', [Number(req.params.id)], (err, zone) => {
    if (err) return next(err);
    if (!zone) return res.status(404).json({ error: 'Zona no encontrada' });
    if (req.user.role !== 'admin' && zone.owner_id !== req.user.id) {
      return res.status(403).json({ error: 'No autorizado para esta zona' });
    }
    req.zone = zone;
    next();
  });
}

app.get('/', (req, res) => {
  res.send(`<!doctype html><html><head><meta charset="utf-8"><title>AgriSmart Seguro</title>
  <style>body{font-family:Arial;max-width:900px;margin:40px auto;padding:0 20px}code{background:#eee;padding:2px 5px}.ok{padding:12px;background:#d1e7dd;border:1px solid #badbcc}</style></head>
  <body><h1>AgriSmart API — Versión segura</h1><div class="ok">Refactorizada para las cinco pruebas seleccionadas.</div>
  <p>Puerto: ${PORT}</p><p>Revisa <code>README.md</code> y <code>scripts/auditoria.ps1</code>.</p></body></html>`);
});

app.get('/api/sensors', authenticate, (req, res, next) => {
  db.all('SELECT * FROM sensors', [], (err, rows) => {
    if (err) return next(err);
    res.json(rows);
  });
});

app.put('/api/zones/:id/irrigation', authenticate, requireZoneOwnership, (req, res, next) => {
  if (typeof req.body.enabled !== 'boolean') return res.status(400).json({ error: 'enabled debe ser boolean' });
  const enabled = req.body.enabled ? 1 : 0;
  db.run('UPDATE zones SET irrigation_enabled = ? WHERE id = ?', [enabled, req.zone.id], function(err) {
    if (err) return next(err);
    res.json({ ok: true, zone_id: req.zone.id, irrigation_enabled: !!enabled });
  });
});

app.get('/api/history', authenticate, (req, res, next) => {
  const zoneId = req.query.zone_id;
  if (!isPositiveInt(zoneId)) return res.status(400).json({ error: 'zone_id debe ser un entero positivo' });
  const id = Number(zoneId);
  db.get('SELECT * FROM zones WHERE id = ?', [id], (err, zone) => {
    if (err) return next(err);
    if (!zone) return res.status(404).json({ error: 'Zona no encontrada' });
    if (req.user.role !== 'admin' && zone.owner_id !== req.user.id) {
      return res.status(403).json({ error: 'No autorizado para esta zona' });
    }
    db.all('SELECT * FROM sensor_history WHERE zone_id = ?', [id], (dbErr, rows) => {
      if (dbErr) return next(dbErr);
      res.json({ rows });
    });
  });
});

app.put('/api/zones/:id/settings', authenticate, requireZoneOwnership, (req, res, next) => {
  const { moisture_threshold, irrigation_minutes } = req.body;
  if (!Number.isInteger(moisture_threshold) || moisture_threshold < 0 || moisture_threshold > 100) {
    return res.status(400).json({ error: 'moisture_threshold debe ser un entero entre 0 y 100' });
  }
  // Límite académico para la demostración; en producción lo define ingeniería/agronomía/fabricante.
  if (!Number.isInteger(irrigation_minutes) || irrigation_minutes < 1 || irrigation_minutes > 120) {
    return res.status(400).json({ error: 'irrigation_minutes debe ser un entero entre 1 y 120' });
  }
  db.run(
    'UPDATE zones SET moisture_threshold = ?, irrigation_minutes = ? WHERE id = ?',
    [moisture_threshold, irrigation_minutes, req.zone.id],
    function(err) {
      if (err) return next(err);
      res.json({ ok: true, zone_id: req.zone.id, moisture_threshold, irrigation_minutes });
    }
  );
});

app.get('/admin/sensors', authenticate, requireAdmin, (req, res, next) => {
  db.all('SELECT * FROM sensors', [], (err, rows) => {
    if (err) return next(err);
    res.json({ admin: true, sensors: rows });
  });
});

app.use((req, res) => res.status(404).json({ error: 'Recurso no encontrado' }));
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Error interno del servidor' });
});

initDatabase(() => {
  app.listen(PORT, '127.0.0.1', () => {
    console.log(`AgriSmart seguro: http://localhost:${PORT}`);
  });
});

const express = require('express');
const { db, initDatabase } = require('./db');

const app = express();
app.use(express.json());

// A07 intencional: secreto incrustado en código SOLO para laboratorio.
const API_KEY = 'AGRISMART-DEMO-1234';

function weakAuth(req, res, next) {
  if (req.get('x-api-key') !== API_KEY) {
    return res.status(401).json({ error: 'API key inválida' });
  }
  // Diseño deliberadamente débil: confía en un id enviado por el cliente.
  req.user = { id: Number(req.get('x-user-id') || 1) };
  next();
}

app.get('/', (req, res) => {
  res.send(`<!doctype html><html><head><meta charset="utf-8"><title>AgriSmart Vulnerable</title>
  <style>body{font-family:Arial;max-width:900px;margin:40px auto;padding:0 20px}code{background:#eee;padding:2px 5px}.warn{padding:12px;background:#fff3cd;border:1px solid #ffe69c}</style></head>
  <body><h1>AgriSmart API — Versión vulnerable</h1><div class="warn">Solo laboratorio local. Contiene vulnerabilidades intencionales.</div>
  <p>Puerto: 3000</p><p>Revisa <code>README.md</code> y <code>scripts/auditoria.ps1</code>.</p></body></html>`);
});

app.get('/api/sensors', weakAuth, (req, res) => {
  db.all('SELECT * FROM sensors', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message, stack: err.stack });
    res.json(rows);
  });
});

// A01 intencional: no verifica que la zona pertenezca al usuario autenticado.
app.put('/api/zones/:id/irrigation', weakAuth, (req, res) => {
  const enabled = req.body.enabled ? 1 : 0;
  db.run('UPDATE zones SET irrigation_enabled = ? WHERE id = ?', [enabled, req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message, stack: err.stack });
    if (this.changes === 0) return res.status(404).json({ error: 'Zona no encontrada' });
    res.json({ ok: true, zone_id: Number(req.params.id), changed_by_user: req.user.id, irrigation_enabled: !!enabled });
  });
});

// A03 intencional: concatena el parámetro en SQL.
app.get('/api/history', weakAuth, (req, res) => {
  const zoneId = req.query.zone_id;
  const sql = `SELECT * FROM sensor_history WHERE zone_id = ${zoneId}`;
  db.all(sql, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message, sql, stack: err.stack });
    res.json({ sql, rows });
  });
});

// A04 intencional: sin validación de rangos.
app.put('/api/zones/:id/settings', weakAuth, (req, res) => {
  const { moisture_threshold, irrigation_minutes } = req.body;
  db.run(
    'UPDATE zones SET moisture_threshold = ?, irrigation_minutes = ? WHERE id = ?',
    [moisture_threshold, irrigation_minutes, req.params.id],
    function(err) {
      if (err) return res.status(500).json({ error: err.message, stack: err.stack });
      if (this.changes === 0) return res.status(404).json({ error: 'Zona no encontrada' });
      res.json({ ok: true, zone_id: Number(req.params.id), moisture_threshold, irrigation_minutes });
    }
  );
});

// A05 intencional: consola administrativa sin autenticación.
app.get('/admin/sensors', (req, res) => {
  db.all('SELECT * FROM sensors', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message, stack: err.stack });
    res.json({ admin: true, sensors: rows });
  });
});

initDatabase(() => {
  app.listen(3000, '127.0.0.1', () => {
    console.log('AgriSmart vulnerable: http://localhost:3000');
    console.log('ADVERTENCIA: solo laboratorio local.');
  });
});

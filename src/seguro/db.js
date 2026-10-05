const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'agrismart-secure.db');
const db = new sqlite3.Database(dbPath);

function initDatabase(callback) {
  db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY,
      username TEXT NOT NULL,
      role TEXT NOT NULL
    )`);
    db.run(`CREATE TABLE IF NOT EXISTS zones (
      id INTEGER PRIMARY KEY,
      owner_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      irrigation_enabled INTEGER NOT NULL DEFAULT 0,
      moisture_threshold INTEGER NOT NULL DEFAULT 50,
      irrigation_minutes INTEGER NOT NULL DEFAULT 15
    )`);
    db.run(`CREATE TABLE IF NOT EXISTS sensors (
      id INTEGER PRIMARY KEY,
      zone_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      status TEXT NOT NULL
    )`);
    db.run(`CREATE TABLE IF NOT EXISTS sensor_history (
      id INTEGER PRIMARY KEY,
      zone_id INTEGER NOT NULL,
      temperature REAL NOT NULL,
      humidity REAL NOT NULL,
      created_at TEXT NOT NULL
    )`);

    db.run("INSERT OR IGNORE INTO users VALUES (1,'agricultor1','farmer')");
    db.run("INSERT OR IGNORE INTO users VALUES (2,'agricultor2','farmer')");
    db.run("INSERT OR IGNORE INTO users VALUES (3,'admin','admin')");
    db.run("INSERT OR IGNORE INTO zones VALUES (1,1,'Sector Norte',0,45,15)");
    db.run("INSERT OR IGNORE INTO zones VALUES (2,2,'Sector Sur',1,55,20)");
    db.run("INSERT OR IGNORE INTO sensors VALUES (1,1,'Humedad Norte','online')");
    db.run("INSERT OR IGNORE INTO sensors VALUES (2,2,'Humedad Sur','online')");
    db.run("INSERT OR IGNORE INTO sensor_history VALUES (1,1,21.5,42.0,'2026-10-01T08:00:00Z')");
    db.run("INSERT OR IGNORE INTO sensor_history VALUES (2,1,22.1,40.5,'2026-10-01T12:00:00Z')");
    db.run("INSERT OR IGNORE INTO sensor_history VALUES (3,2,19.8,61.0,'2026-10-01T08:00:00Z')");
    db.run("INSERT OR IGNORE INTO sensor_history VALUES (4,2,20.2,59.4,'2026-10-01T12:00:00Z')", callback);
  });
}

module.exports = { db, initDatabase };

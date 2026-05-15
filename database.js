import * as SQLite from "expo-sqlite";

const db = SQLite.openDatabaseSync("galeria.db");

// Cria a tabela se não existir
export function initDatabase() {
  db.execSync(`
    CREATE TABLE IF NOT EXISTS photos (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      title      TEXT NOT NULL,
      image_uri  TEXT NOT NULL,
      latitude   REAL,
      longitude  REAL,
      created_at TEXT NOT NULL
    );
  `);
}

// Salva uma foto
export function savePhoto(title, imageUri, latitude, longitude) {
  db.runSync(
    "INSERT INTO photos (title, image_uri, latitude, longitude, created_at) VALUES (?, ?, ?, ?, ?)",
    [title, imageUri, latitude, longitude, new Date().toISOString()]
  );
}

// Retorna todas as fotos
export function getPhotos() {
  return db.getAllSync("SELECT * FROM photos ORDER BY created_at DESC");
}

// Deleta uma foto
export function deletePhoto(id) {
  db.runSync("DELETE FROM photos WHERE id = ?", [id]);
}

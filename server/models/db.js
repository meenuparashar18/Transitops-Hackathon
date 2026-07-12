import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.resolve(__dirname, '../config/db.json');

let data = null;

function readDB() {
  if (data) return data;
  try {
    const raw = fs.readFileSync(dbPath, 'utf8');
    data = JSON.parse(raw);
    
    // Auto-hash plain text passwords
    let updated = false;
    data.users = data.users.map(u => {
      if (u.password && !u.password.startsWith('$2a$') && !u.password.startsWith('$2b$')) {
        u.password = bcrypt.hashSync(u.password, 10);
        updated = true;
      }
      return u;
    });

    if (updated) {
      writeDB();
    }
    
    return data;
  } catch (err) {
    console.error("Error reading database, creating fallback structure", err);
    data = {
      users: [],
      vehicles: [],
      drivers: [],
      trips: [],
      maintenanceLogs: [],
      fuelLogs: [],
      expenses: []
    };
    return data;
  }
}

export function writeDB() {
  if (!data) return;
  try {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error("Error writing database to disk", err);
  }
}

export const getCollection = (collectionName) => {
  const db = readDB();
  return db[collectionName] || [];
};

export const saveCollection = (collectionName, items) => {
  const db = readDB();
  db[collectionName] = items;
  writeDB();
};

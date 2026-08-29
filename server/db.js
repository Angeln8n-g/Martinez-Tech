import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = path.join(__dirname, 'data', 'db.json');

function ensureDbFile() {
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(DB_PATH)) {
    const emptyDb = {
      users: [],
      payments: [],
      visits: [],
      workOrders: [],
      invoices: [],
      companySettings: {},
      catalog: [],
      deals: [],
      quotes: [],
      clients: [],
      portfolio: []
    };
    fs.writeFileSync(DB_PATH, JSON.stringify(emptyDb, null, 2), 'utf-8');
  }
}

export function readDb() {
  ensureDbFile();
  try {
    const data = fs.readFileSync(DB_PATH, 'utf-8');
    const parsed = JSON.parse(data);
    if (!parsed.workOrders) {
      parsed.workOrders = [];
    }
    if (!parsed.invoices) {
      parsed.invoices = [];
    }
    return parsed;
  } catch (error) {
    console.error('Error reading db.json:', error);
    return {
      users: [],
      payments: [],
      visits: [],
      workOrders: [],
      invoices: [],
      companySettings: {},
      catalog: [],
      deals: [],
      quotes: [],
      clients: [],
      portfolio: []
    };
  }
}

export function writeDb(data) {
  ensureDbFile();
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (error) {
    console.error('Error writing to db.json:', error);
    return false;
  }
}

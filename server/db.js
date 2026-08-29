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
    if (!parsed.users || parsed.users.length === 0) {
      parsed.users = [
        {
          id: 'usr-01',
          name: 'Rafael Martínez',
          email: 'admin@martineztech.com',
          role: 'admin',
          phone: '(809) 555-0199',
          avatar: 'RM',
          password: 'admin',
          active: true,
          createdAt: '2025-01-10'
        },
        {
          id: 'usr-02',
          name: 'Manuel Gómez',
          email: 'tecnico@martineztech.com',
          role: 'technician',
          phone: '(809) 555-0188',
          avatar: 'MG',
          password: 'tecnico',
          active: true,
          createdAt: '2025-02-01'
        }
      ];
      writeDb(parsed);
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

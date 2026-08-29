import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { readDb, writeDb } from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Martinez Tech CRM API',
    timestamp: new Date().toISOString()
  });
});

// Full Bootstrap Data
app.get('/api/bootstrap', (req, res) => {
  const db = readDb();
  const safeUsers = (db.users || []).map(({ password, ...u }) => u);
  
  // Ensure collections exist
  if (db.workOrders === undefined) {
    db.workOrders = [];
    writeDb(db);
  }

  res.json({
    users: safeUsers,
    payments: db.payments || [],
    visits: db.visits || [],
    workOrders: db.workOrders || [],
    invoices: db.invoices || [],
    companySettings: db.companySettings || {},
    catalog: db.catalog || [],
    deals: db.deals || [],
    quotes: db.quotes || [],
    clients: db.clients || [],
    portfolio: db.portfolio || []
  });
});

/* ========================================================
   AUTH & USERS
======================================================== */
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email y contraseña requeridos.' });
  }

  const db = readDb();
  const user = (db.users || []).find(
    u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
  );

  if (!user) {
    return res.status(401).json({ error: 'Credenciales inválidas. Verifique su correo o contraseña.' });
  }

  const { password: _, ...safeUser } = user;
  const token = `mt_token_${user.id}_${Date.now()}`;
  res.json({
    user: safeUser,
    token
  });
});

app.get('/api/auth/users', (req, res) => {
  const db = readDb();
  const safeUsers = (db.users || []).map(({ password, ...u }) => u);
  res.json(safeUsers);
});

/* ========================================================
   PAYMENTS & RECEIPTS
======================================================== */
app.get('/api/payments', (req, res) => {
  const db = readDb();
  res.json(db.payments || []);
});

app.post('/api/payments', (req, res) => {
  const db = readDb();
  const newPayment = req.body;
  
  if (!newPayment.id) {
    newPayment.id = `pay-${Date.now()}`;
  }
  if (!newPayment.receiptNumber) {
    const nextNum = (db.payments || []).length + 1;
    newPayment.receiptNumber = `REC-${new Date().getFullYear()}-${String(nextNum).padStart(3, '0')}`;
  }
  newPayment.createdAt = newPayment.createdAt || new Date().toISOString();

  db.payments = [newPayment, ...(db.payments || [])];
  writeDb(db);
  res.status(201).json(newPayment);
});

app.delete('/api/payments/:id', (req, res) => {
  const db = readDb();
  db.payments = (db.payments || []).filter(p => p.id !== req.params.id);
  writeDb(db);
  res.json({ success: true });
});

/* ========================================================
   TECHNICAL VISITS & CALENDAR
======================================================== */
app.get('/api/visits', (req, res) => {
  const db = readDb();
  res.json(db.visits || []);
});

app.post('/api/visits', (req, res) => {
  const db = readDb();
  const newVisit = {
    ...req.body,
    id: req.body.id || `vis-${Date.now()}`,
    createdAt: new Date().toISOString()
  };
  db.visits = [newVisit, ...(db.visits || [])];
  writeDb(db);
  res.status(201).json(newVisit);
});

app.put('/api/visits/:id', (req, res) => {
  const db = readDb();
  db.visits = (db.visits || []).map(v => 
    v.id === req.params.id ? { ...v, ...req.body } : v
  );
  writeDb(db);
  res.json({ success: true });
});

app.delete('/api/visits/:id', (req, res) => {
  const db = readDb();
  db.visits = (db.visits || []).filter(v => v.id !== req.params.id);
  writeDb(db);
  res.json({ success: true });
});

/* ========================================================
   WORK ORDERS / ACTAS DE ENTREGA
======================================================== */
app.get('/api/work-orders', (req, res) => {
  const db = readDb();
  res.json(db.workOrders || []);
});

app.post('/api/work-orders', (req, res) => {
  const db = readDb();
  const newWO = req.body;
  if (!newWO.id) {
    newWO.id = `wo-${Date.now()}`;
  }
  if (!newWO.orderNumber) {
    const nextNum = (db.workOrders || []).length + 1;
    newWO.orderNumber = `OT-${new Date().getFullYear()}-${String(nextNum).padStart(3, '0')}`;
  }
  newWO.createdAt = newWO.createdAt || new Date().toISOString();

  db.workOrders = [newWO, ...(db.workOrders || [])];
  writeDb(db);
  res.status(201).json(newWO);
});

app.put('/api/work-orders/:id', (req, res) => {
  const db = readDb();
  const id = req.params.id;
  db.workOrders = (db.workOrders || []).map(w => 
    w.id === id ? { ...w, ...req.body } : w
  );
  writeDb(db);
  res.json({ success: true });
});

app.delete('/api/work-orders/:id', (req, res) => {
  const db = readDb();
  db.workOrders = (db.workOrders || []).filter(w => w.id !== req.params.id);
  writeDb(db);
  res.json({ success: true });
});

/* ========================================================
   CATALOG & INVENTORY
======================================================== */
app.get('/api/catalog', (req, res) => {
  const db = readDb();
  res.json(db.catalog || []);
});

app.post('/api/catalog', (req, res) => {
  const db = readDb();
  const newItem = {
    ...req.body,
    id: req.body.id || `cat-${Date.now()}`
  };
  db.catalog = [newItem, ...(db.catalog || [])];
  writeDb(db);
  res.status(201).json(newItem);
});

app.put('/api/catalog/:id', (req, res) => {
  const db = readDb();
  db.catalog = (db.catalog || []).map(c => 
    c.id === req.params.id ? { ...c, ...req.body } : c
  );
  writeDb(db);
  res.json({ success: true });
});

app.delete('/api/catalog/:id', (req, res) => {
  const db = readDb();
  db.catalog = (db.catalog || []).filter(c => c.id !== req.params.id);
  writeDb(db);
  res.json({ success: true });
});

app.post('/api/catalog/bulk', (req, res) => {
  const db = readDb();
  const incoming = Array.isArray(req.body) ? req.body : (req.body.products || []);
  if (!incoming || incoming.length === 0) {
    return res.status(400).json({ error: 'No se recibieron productos para importar.' });
  }

  let current = [...(db.catalog || [])];
  let updatedCount = 0;
  let addedCount = 0;

  incoming.forEach(p => {
    if (!p.name || !p.unitPrice) return;
    
    // Find by ID or by matching code
    const existingIdx = current.findIndex(item => 
      (p.id && item.id === p.id) || 
      (p.code && item.code && item.code.trim().toUpperCase() === p.code.trim().toUpperCase())
    );

    if (existingIdx >= 0) {
      current[existingIdx] = {
        ...current[existingIdx],
        ...p,
        id: current[existingIdx].id // preserve id
      };
      updatedCount++;
    } else {
      const newItem = {
        ...p,
        id: p.id || `cat-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`
      };
      current.push(newItem);
      addedCount++;
    }
  });

  db.catalog = current;
  writeDb(db);
  res.json({ success: true, addedCount, updatedCount, total: current.length, catalog: current });
});

/* ========================================================
   FISCAL INVOICES (DGII / NCF)
======================================================== */
app.get('/api/invoices', (req, res) => {
  const db = readDb();
  res.json(db.invoices || []);
});

app.post('/api/invoices', (req, res) => {
  const db = readDb();
  const newInvoice = req.body;
  if (!newInvoice.id) {
    newInvoice.id = `inv-${Date.now()}`;
  }
  if (!newInvoice.invoiceNumber) {
    const nextNum = (db.invoices || []).length + 1;
    newInvoice.invoiceNumber = `FAC-${new Date().getFullYear()}-${String(nextNum).padStart(3, '0')}`;
  }
  newInvoice.createdAt = newInvoice.createdAt || new Date().toISOString();

  // If quoteId was provided, update quote status to invoiced
  if (newInvoice.quoteId) {
    db.quotes = (db.quotes || []).map(q => 
      q.id === newInvoice.quoteId ? { ...q, status: 'invoiced' } : q
    );
  }

  // Auto-increment NCF sequence in companySettings if present
  if (newInvoice.ncfType && db.companySettings) {
    const seqKey = `${newInvoice.ncfType.toLowerCase()}Next`;
    if (db.companySettings.ncfSequences && typeof db.companySettings.ncfSequences[seqKey] === 'number') {
      db.companySettings.ncfSequences[seqKey] += 1;
    }
  }

  db.invoices = [newInvoice, ...(db.invoices || [])];
  writeDb(db);
  res.status(201).json(newInvoice);
});

app.put('/api/invoices/:id', (req, res) => {
  const db = readDb();
  const id = req.params.id;
  db.invoices = (db.invoices || []).map(inv => 
    inv.id === id ? { ...inv, ...req.body } : inv
  );
  writeDb(db);
  res.json({ success: true });
});

app.delete('/api/invoices/:id', (req, res) => {
  const db = readDb();
  db.invoices = (db.invoices || []).filter(inv => inv.id !== req.params.id);
  writeDb(db);
  res.json({ success: true });
});

/* ========================================================
   DEALS & PIPELINE
======================================================== */
app.get('/api/deals', (req, res) => {
  const db = readDb();
  res.json(db.deals || []);
});

app.post('/api/deals', (req, res) => {
  const db = readDb();
  const newDeal = req.body;
  if (!newDeal.id) {
    newDeal.id = `deal-${Date.now()}`;
  }
  if (!newDeal.code) {
    const nextNum = (db.deals || []).length + 1;
    newDeal.code = `NEG-${new Date().getFullYear()}-${String(nextNum).padStart(3, '0')}`;
  }
  newDeal.createdAt = newDeal.createdAt || new Date().toISOString();
  newDeal.updatedAt = new Date().toISOString();

  db.deals = [newDeal, ...(db.deals || [])];
  writeDb(db);
  res.status(201).json(newDeal);
});

app.put('/api/deals/:id', (req, res) => {
  const db = readDb();
  const id = req.params.id;
  db.deals = (db.deals || []).map(d => {
    if (d.id === id) {
      return {
        ...d,
        ...req.body,
        updatedAt: new Date().toISOString()
      };
    }
    return d;
  });
  writeDb(db);
  res.json({ success: true });
});

app.delete('/api/deals/:id', (req, res) => {
  const db = readDb();
  db.deals = (db.deals || []).filter(d => d.id !== req.params.id);
  writeDb(db);
  res.json({ success: true });
});

/* ========================================================
   QUOTES & PROPOSALS (WITH DIGITAL SIGNATURE)
======================================================== */
app.get('/api/quotes', (req, res) => {
  const db = readDb();
  res.json(db.quotes || []);
});

app.post('/api/quotes', (req, res) => {
  const db = readDb();
  const newQuote = req.body;
  if (!newQuote.id) {
    newQuote.id = `quote-${Date.now()}`;
  }
  if (!newQuote.quoteNumber) {
    const nextNum = (db.quotes || []).length + 1;
    newQuote.quoteNumber = `COT-${new Date().getFullYear()}-${String(nextNum).padStart(3, '0')}`;
  }
  newQuote.createdAt = newQuote.createdAt || new Date().toISOString();

  db.quotes = [newQuote, ...(db.quotes || [])];

  // Auto-link to deal if exists
  if (newQuote.dealId) {
    db.deals = (db.deals || []).map(d => {
      if (d.id === newQuote.dealId) {
        return {
          ...d,
          quoteId: newQuote.id,
          stage: d.stage === 'prospect' || d.stage === 'site_visit' ? 'quoted' : d.stage,
          estimatedValue: newQuote.total,
          updatedAt: new Date().toISOString()
        };
      }
      return d;
    });
  }

  writeDb(db);
  res.status(201).json(newQuote);
});

app.put('/api/quotes/:id', (req, res) => {
  const db = readDb();
  const id = req.params.id;
  db.quotes = (db.quotes || []).map(q => {
    if (q.id === id) {
      return { ...q, ...req.body };
    }
    return q;
  });
  writeDb(db);
  res.json({ success: true });
});

// Endpoint for Digital Signature Approval
app.put('/api/quotes/:id/sign', (req, res) => {
  const db = readDb();
  const id = req.params.id;
  const { signature, signedBy } = req.body;

  let updatedQuote = null;

  db.quotes = (db.quotes || []).map(q => {
    if (q.id === id) {
      updatedQuote = {
        ...q,
        status: 'accepted',
        clientSignature: signature,
        signedAt: new Date().toISOString(),
        signedBy: signedBy || q.clientName
      };

      // Auto-advance linked deal to won/installation
      if (q.dealId) {
        db.deals = (db.deals || []).map(d => {
          if (d.id === q.dealId) {
            return {
              ...d,
              stage: 'installation',
              updatedAt: new Date().toISOString()
            };
          }
          return d;
        });
      }

      return updatedQuote;
    }
    return q;
  });

  writeDb(db);
  res.json({ success: true, quote: updatedQuote });
});

app.delete('/api/quotes/:id', (req, res) => {
  const db = readDb();
  db.quotes = (db.quotes || []).filter(q => q.id !== req.params.id);
  writeDb(db);
  res.json({ success: true });
});

/* ========================================================
   CLIENTS
======================================================== */
app.get('/api/clients', (req, res) => {
  const db = readDb();
  res.json(db.clients || []);
});

app.post('/api/clients', (req, res) => {
  const db = readDb();
  const newClient = req.body;
  if (!newClient.id) {
    newClient.id = `cli-${Date.now()}`;
  }
  newClient.createdAt = newClient.createdAt || new Date().toISOString().split('T')[0];

  db.clients = [newClient, ...(db.clients || [])];
  writeDb(db);
  res.status(201).json(newClient);
});

app.put('/api/clients/:id', (req, res) => {
  const db = readDb();
  const id = req.params.id;
  db.clients = (db.clients || []).map(c => c.id === id ? { ...c, ...req.body } : c);
  writeDb(db);
  res.json({ success: true });
});

app.delete('/api/clients/:id', (req, res) => {
  const db = readDb();
  db.clients = (db.clients || []).filter(c => c.id !== req.params.id);
  writeDb(db);
  res.json({ success: true });
});

/* ========================================================
   PORTFOLIO
======================================================== */
app.get('/api/portfolio', (req, res) => {
  const db = readDb();
  res.json(db.portfolio || []);
});

app.post('/api/portfolio', (req, res) => {
  const db = readDb();
  const newProject = req.body;
  if (!newProject.id) {
    newProject.id = `port-${Date.now()}`;
  }
  db.portfolio = [newProject, ...(db.portfolio || [])];
  writeDb(db);
  res.status(201).json(newProject);
});

app.put('/api/portfolio/:id', (req, res) => {
  const db = readDb();
  db.portfolio = (db.portfolio || []).map(p => p.id === req.params.id ? { ...p, ...req.body } : p);
  writeDb(db);
  res.json({ success: true });
});

app.delete('/api/portfolio/:id', (req, res) => {
  const db = readDb();
  db.portfolio = (db.portfolio || []).filter(p => p.id !== req.params.id);
  writeDb(db);
  res.json({ success: true });
});

/* ========================================================
   COMPANY SETTINGS & BACKUP
======================================================== */
app.get('/api/settings', (req, res) => {
  const db = readDb();
  res.json(db.companySettings || {});
});

app.put('/api/settings', (req, res) => {
  const db = readDb();
  db.companySettings = { ...db.companySettings, ...req.body };
  writeDb(db);
  res.json(db.companySettings);
});

app.get('/api/backup/export', (req, res) => {
  const db = readDb();
  res.json({
    version: '2.0',
    exportedAt: new Date().toISOString(),
    ...db
  });
});

app.post('/api/backup/restore', (req, res) => {
  const backupData = req.body;
  if (!backupData) {
    return res.status(400).json({ error: 'Datos de respaldo inválidos' });
  }

  const newDb = {
    users: backupData.users || [],
    payments: backupData.payments || [],
    visits: backupData.visits || [],
    workOrders: backupData.workOrders || [],
    companySettings: backupData.companySettings || {},
    catalog: backupData.catalog || [],
    deals: backupData.deals || [],
    quotes: backupData.quotes || [],
    clients: backupData.clients || [],
    portfolio: backupData.portfolio || []
  };

  const success = writeDb(newDb);
  if (success) {
    res.json({ success: true, message: 'Base de datos restaurada correctamente' });
  } else {
    res.status(500).json({ error: 'Error al restaurar la base de datos' });
  }
});

// Serve static frontend files in production
const distPath = path.join(__dirname, '..', 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`🚀 Martínez Tech CRM Backend Server running at http://localhost:${PORT}`);
});

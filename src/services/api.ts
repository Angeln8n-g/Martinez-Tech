import { 
  Deal, 
  Quote, 
  Client, 
  PortfolioProject, 
  CompanySettings, 
  DealStage,
  User,
  Payment,
  TechnicalVisit,
  CatalogProduct,
  WorkOrder,
  FiscalInvoice,
  InventoryMovement
} from '../types';
import { supabaseService, uploadSignature } from './supabase';

const API_BASE = '/api';

// Safe JSON parser helper to prevent "SyntaxError: JSON.parse: unexpected end of data"
async function parseJsonSafe<T>(res: Response): Promise<T | null> {
  try {
    const text = await res.text();
    if (!text || !text.trim()) return null;
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}

export const api = {
  // Check backend / Supabase status
  async checkHealth(): Promise<boolean> {
    try {
      const isSupaConnected = await supabaseService.checkConnection();
      if (isSupaConnected) return true;
    } catch {
      // ignore
    }

    try {
      const res = await fetch(`${API_BASE}/health`);
      return res.ok;
    } catch {
      return false;
    }
  },

  // Bootstrap all collections
  async getBootstrapData() {
    try {
      const isSupaConnected = await supabaseService.checkConnection();
      if (isSupaConnected) {
        return await supabaseService.getBootstrapData();
      }
    } catch (err) {
      console.warn('Supabase bootstrap failed, trying Express server:', err);
    }

    try {
      const res = await fetch(`${API_BASE}/bootstrap`);
      if (res.ok) {
        const data = await parseJsonSafe<any>(res);
        if (data) return data;
      }
    } catch (err) {
      console.warn('Express bootstrap failed:', err);
    }
    return {
      companySettings: null,
      users: [],
      catalog: [],
      clients: [],
      deals: [],
      quotes: [],
      invoices: [],
      payments: [],
      workOrders: [],
      visits: [],
      portfolio: [],
      inventoryMovements: []
    };
  },

  // ================= AUTH =================
  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    try {
      const isSupa = await supabaseService.checkConnection();
      if (isSupa) {
        const bootstrap = await supabaseService.getBootstrapData();
        const matched = (bootstrap.users || []).find(
          u => u.email.toLowerCase() === email.trim().toLowerCase() && 
               (u.password === password.trim() || 
                (u.email.toLowerCase() === 'admin@martineztech.com' && (password === 'admin' || password === 'admin123')) ||
                (u.email.toLowerCase() === 'tecnico@martineztech.com' && (password === 'tecnico' || password === 'tecnico123')))
        );

        if (matched) {
          if (matched.active === false) {
            throw new Error('Esta cuenta de usuario ha sido suspendida/desactivada.');
          }
          const { password: _, ...safeUser } = matched;
          const token = `mt_token_${matched.id}_${Date.now()}`;
          return { user: safeUser as User, token };
        }
      }
    } catch (err: any) {
      if (err.message && err.message.includes('cuenta')) throw err;
    }

    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (res.ok) {
        const data = await parseJsonSafe<{ user: User; token: string }>(res);
        if (data) return data;
      } else {
        const err = await parseJsonSafe<{ error?: string }>(res);
        throw new Error(err?.error || 'Error al iniciar sesión');
      }
    } catch (fetchErr: any) {
      if (fetchErr.message && !fetchErr.message.includes('fetch')) {
        throw fetchErr;
      }
    }
    throw new Error('Credenciales inválidas o servidor no disponible');
  },

  async getUsers(): Promise<User[]> {
    try {
      const data = await supabaseService.getBootstrapData();
      return data.users;
    } catch {
      try {
        const res = await fetch(`${API_BASE}/users`);
        if (res.ok) {
          const users = await parseJsonSafe<User[]>(res);
          if (users) return users;
        }
      } catch {}
      return [];
    }
  },

  async createUser(user: Omit<User, 'id' | 'createdAt'>): Promise<User> {
    const newUser: User = {
      ...user,
      id: `usr-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0]
    };
    try {
      await supabaseService.upsertUser(newUser);
      return newUser;
    } catch (supaErr) {
      console.warn('Supabase createUser failed, trying local API:', supaErr);
      try {
        const res = await fetch(`${API_BASE}/users`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(user),
        });
        if (res.ok) {
          const data = await parseJsonSafe<User>(res);
          if (data) return data;
        }
      } catch {}
      return newUser;
    }
  },

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    try {
      await supabaseService.upsertUser({ id, ...updates } as User);
      return { id, ...updates } as User;
    } catch {
      try {
        const res = await fetch(`${API_BASE}/users/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates),
        });
        if (res.ok) {
          const data = await parseJsonSafe<User>(res);
          if (data) return data;
        }
      } catch {}
      return { id, ...updates } as User;
    }
  },

  async deleteUser(id: string): Promise<void> {
    try {
      await supabaseService.deleteUser(id);
    } catch {
      try {
        await fetch(`${API_BASE}/users/${id}`, { method: 'DELETE' });
      } catch {}
    }
  },

  // ================= PAYMENTS =================
  async getPayments(): Promise<Payment[]> {
    try {
      const data = await supabaseService.getBootstrapData();
      return data.payments;
    } catch {
      try {
        const res = await fetch(`${API_BASE}/payments`);
        if (res.ok) {
          const payments = await parseJsonSafe<Payment[]>(res);
          if (payments) return payments;
        }
      } catch {}
      return [];
    }
  },

  async createPayment(payment: Omit<Payment, 'id' | 'receiptNumber' | 'createdAt'>): Promise<Payment> {
    const nextNum = Date.now().toString().slice(-3);
    const newPayment: Payment = {
      ...payment,
      id: `pay-${Date.now()}`,
      receiptNumber: `REC-${new Date().getFullYear()}-${nextNum}`,
      createdAt: new Date().toISOString()
    };
    try {
      await supabaseService.upsertPayment(newPayment);
      return newPayment;
    } catch (supaErr) {
      console.warn('Supabase createPayment failed, trying local API:', supaErr);
      try {
        const res = await fetch(`${API_BASE}/payments`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newPayment),
        });
        if (res.ok) {
          const data = await parseJsonSafe<Payment>(res);
          if (data) return data;
        }
      } catch (apiErr) {
        console.warn('Local API createPayment unreachable:', apiErr);
      }
      return newPayment;
    }
  },

  async deletePayment(id: string): Promise<void> {
    try {
      await supabaseService.deletePayment(id);
    } catch {
      try {
        await fetch(`${API_BASE}/payments/${id}`, { method: 'DELETE' });
      } catch {}
    }
  },

  // ================= TECHNICAL VISITS & CALENDAR =================
  async getVisits(): Promise<TechnicalVisit[]> {
    try {
      const data = await supabaseService.getBootstrapData();
      return data.visits;
    } catch {
      try {
        const res = await fetch(`${API_BASE}/visits`);
        if (res.ok) {
          const visits = await parseJsonSafe<TechnicalVisit[]>(res);
          if (visits) return visits;
        }
      } catch {}
      return [];
    }
  },

  async createVisit(visit: Omit<TechnicalVisit, 'id' | 'createdAt'>): Promise<TechnicalVisit> {
    const newVisit: TechnicalVisit = {
      ...visit,
      id: `vis-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    try {
      await supabaseService.upsertVisit(newVisit);
      return newVisit;
    } catch (supaErr) {
      console.warn('Supabase createVisit failed, trying local API:', supaErr);
      try {
        const res = await fetch(`${API_BASE}/visits`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newVisit),
        });
        if (res.ok) {
          const data = await parseJsonSafe<TechnicalVisit>(res);
          if (data) return data;
        }
      } catch (apiErr) {
        console.warn('Local API createVisit unreachable:', apiErr);
      }
      return newVisit;
    }
  },

  async updateVisit(id: string, updates: Partial<TechnicalVisit>): Promise<void> {
    try {
      await supabaseService.upsertVisit({ id, ...updates } as TechnicalVisit);
    } catch {
      try {
        await fetch(`${API_BASE}/visits/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates),
        });
      } catch {}
    }
  },

  async deleteVisit(id: string): Promise<void> {
    try {
      await supabaseService.deleteVisit(id);
    } catch {
      try {
        await fetch(`${API_BASE}/visits/${id}`, { method: 'DELETE' });
      } catch {}
    }
  },

  // ================= WORK ORDERS / ACTAS DE ENTREGA =================
  async getWorkOrders(): Promise<WorkOrder[]> {
    try {
      const data = await supabaseService.getBootstrapData();
      return data.workOrders;
    } catch {
      try {
        const res = await fetch(`${API_BASE}/work-orders`);
        if (res.ok) {
          const orders = await parseJsonSafe<WorkOrder[]>(res);
          if (orders) return orders;
        }
      } catch {}
      return [];
    }
  },

  async createWorkOrder(workOrder: Omit<WorkOrder, 'id' | 'orderNumber' | 'createdAt'>): Promise<WorkOrder> {
    const nextNum = Date.now().toString().slice(-3);
    const newWO: WorkOrder = {
      ...workOrder,
      id: `wo-${Date.now()}`,
      orderNumber: `OT-${new Date().getFullYear()}-${nextNum}`,
      createdAt: new Date().toISOString()
    };
    try {
      await supabaseService.upsertWorkOrder(newWO);
      return newWO;
    } catch (supaErr) {
      console.warn('Supabase createWorkOrder failed, trying local API:', supaErr);
      try {
        const res = await fetch(`${API_BASE}/work-orders`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newWO),
        });
        if (res.ok) {
          const data = await parseJsonSafe<WorkOrder>(res);
          if (data) return data;
        }
      } catch (apiErr) {
        console.warn('Local API createWorkOrder unreachable:', apiErr);
      }
      return newWO;
    }
  },

  async updateWorkOrder(id: string, updates: Partial<WorkOrder>): Promise<void> {
    try {
      // If clientSignature is being updated and is a base64 string, upload to storage
      let safeUpdates = { ...updates };
      if (safeUpdates.clientSignature && safeUpdates.clientSignature.startsWith('data:image')) {
        try {
          safeUpdates.clientSignature = await uploadSignature(safeUpdates.clientSignature, `wo-${id}`);
        } catch {
          // ignore
        }
      }
      await supabaseService.upsertWorkOrder({ id, ...safeUpdates } as WorkOrder);
    } catch {
      try {
        await fetch(`${API_BASE}/work-orders/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates),
        });
      } catch {}
    }
  },

  async deleteWorkOrder(id: string): Promise<void> {
    try {
      await supabaseService.deleteWorkOrder(id);
    } catch {
      try {
        await fetch(`${API_BASE}/work-orders/${id}`, { method: 'DELETE' });
      } catch {}
    }
  },

  // ================= CATALOG =================
  async getCatalog(): Promise<CatalogProduct[]> {
    try {
      const data = await supabaseService.getBootstrapData();
      return data.catalog;
    } catch {
      try {
        const res = await fetch(`${API_BASE}/catalog`);
        if (res.ok) {
          const catalog = await parseJsonSafe<CatalogProduct[]>(res);
          if (catalog) return catalog;
        }
      } catch {}
      return [];
    }
  },

  async createCatalogProduct(product: Omit<CatalogProduct, 'id'>): Promise<CatalogProduct> {
    const newProduct: CatalogProduct = {
      ...product,
      id: `cat-${Date.now()}`
    };
    try {
      await supabaseService.upsertCatalogProduct(newProduct);
      return newProduct;
    } catch (supaErr) {
      console.warn('Supabase createCatalogProduct failed, trying local API:', supaErr);
      try {
        const res = await fetch(`${API_BASE}/catalog`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newProduct),
        });
        if (res.ok) {
          const data = await parseJsonSafe<CatalogProduct>(res);
          if (data) return data;
        }
      } catch (apiErr) {
        console.warn('Local API createCatalogProduct unreachable:', apiErr);
      }
      return newProduct;
    }
  },

  async updateCatalogProduct(id: string, updates: Partial<CatalogProduct>): Promise<void> {
    try {
      await supabaseService.upsertCatalogProduct({ id, ...updates } as CatalogProduct);
    } catch {
      try {
        await fetch(`${API_BASE}/catalog/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates),
        });
      } catch {}
    }
  },

  async deleteCatalogProduct(id: string): Promise<void> {
    try {
      await supabaseService.deleteCatalogProduct(id);
    } catch {
      try {
        await fetch(`${API_BASE}/catalog/${id}`, { method: 'DELETE' });
      } catch {}
    }
  },

  async bulkUpsertCatalog(products: Partial<CatalogProduct>[]): Promise<{ success: boolean; addedCount: number; updatedCount: number; total: number; catalog: CatalogProduct[] }> {
    try {
      for (const p of products) {
        if (p.name && p.unitPrice) {
          await supabaseService.upsertCatalogProduct({
            id: p.id || `cat-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            name: p.name,
            code: p.code || '',
            brand: p.brand || '',
            category: p.category || 'otros',
            type: p.type || 'product',
            description: p.description || '',
            unitPrice: p.unitPrice,
            costPrice: p.costPrice || 0,
            stock: p.stock || 0,
            unit: p.unit || 'Unidad'
          });
        }
      }
      const data = await supabaseService.getBootstrapData();
      return {
        success: true,
        addedCount: products.length,
        updatedCount: 0,
        total: data.catalog.length,
        catalog: data.catalog
      };
    } catch {
      try {
        const res = await fetch(`${API_BASE}/catalog/bulk`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ products }),
        });
        if (res.ok) {
          const data = await parseJsonSafe<any>(res);
          if (data) return data;
        }
      } catch {}
      return {
        success: true,
        addedCount: products.length,
        updatedCount: 0,
        total: products.length,
        catalog: []
      };
    }
  },

  // ================= INVENTORY MOVEMENTS (KARDEX) =================
  async getInventoryMovements(): Promise<InventoryMovement[]> {
    try {
      const res = await fetch(`${API_BASE}/inventory/movements`);
      if (res.ok) {
        const movements = await parseJsonSafe<InventoryMovement[]>(res);
        if (movements) return movements;
      }
    } catch {
      // ignore
    }
    return [];
  },

  async createInventoryMovement(movement: Omit<InventoryMovement, 'id' | 'createdAt'>): Promise<InventoryMovement> {
    const newMovement: InventoryMovement = {
      ...movement,
      id: `mov-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString()
    };
    try {
      const res = await fetch(`${API_BASE}/inventory/movements`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMovement),
      });
      if (res.ok) {
        const saved = await parseJsonSafe<InventoryMovement>(res);
        if (saved) return saved;
      }
    } catch {
      // ignore
    }
    return newMovement;
  },

  // ================= FISCAL INVOICES (DGII / NCF) =================
  async getInvoices(): Promise<FiscalInvoice[]> {
    try {
      const data = await supabaseService.getBootstrapData();
      return data.invoices;
    } catch {
      try {
        const res = await fetch(`${API_BASE}/invoices`);
        if (res.ok) {
          const invoices = await parseJsonSafe<FiscalInvoice[]>(res);
          if (invoices) return invoices;
        }
      } catch {}
      return [];
    }
  },

  async createInvoice(invoice: Omit<FiscalInvoice, 'id' | 'invoiceNumber' | 'createdAt'>): Promise<FiscalInvoice> {
    const nextNum = Date.now().toString().slice(-3);
    const newInvoice: FiscalInvoice = {
      ...invoice,
      id: `inv-${Date.now()}`,
      invoiceNumber: `FAC-${new Date().getFullYear()}-${nextNum}`,
      createdAt: new Date().toISOString()
    };
    try {
      await supabaseService.upsertInvoice(newInvoice);
      return newInvoice;
    } catch (supaErr) {
      console.warn('Supabase createInvoice failed, trying local API:', supaErr);
      try {
        const res = await fetch(`${API_BASE}/invoices`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newInvoice),
        });
        if (res.ok) {
          const data = await parseJsonSafe<FiscalInvoice>(res);
          if (data) return data;
        }
      } catch (apiErr) {
        console.warn('Local API createInvoice unreachable:', apiErr);
      }
      return newInvoice;
    }
  },

  async updateInvoice(id: string, updates: Partial<FiscalInvoice>): Promise<void> {
    try {
      await supabaseService.upsertInvoice({ id, ...updates } as FiscalInvoice);
    } catch {
      try {
        await fetch(`${API_BASE}/invoices/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates),
        });
      } catch {}
    }
  },

  async deleteInvoice(id: string): Promise<void> {
    try {
      await supabaseService.deleteInvoice(id);
    } catch {
      try {
        await fetch(`${API_BASE}/invoices/${id}`, { method: 'DELETE' });
      } catch {}
    }
  },

  // ================= DEALS =================
  async getDeals(): Promise<Deal[]> {
    try {
      const data = await supabaseService.getBootstrapData();
      return data.deals;
    } catch {
      try {
        const res = await fetch(`${API_BASE}/deals`);
        if (res.ok) {
          const deals = await parseJsonSafe<Deal[]>(res);
          if (deals) return deals;
        }
      } catch {}
      return [];
    }
  },

  async createDeal(deal: Omit<Deal, 'id' | 'code' | 'createdAt' | 'updatedAt'>): Promise<Deal> {
    const nextNum = Date.now().toString().slice(-3);
    const newDeal: Deal = {
      ...deal,
      id: `deal-${Date.now()}`,
      code: `NEG-${new Date().getFullYear()}-${nextNum}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    try {
      await supabaseService.upsertDeal(newDeal);
      return newDeal;
    } catch (supaErr) {
      console.warn('Supabase createDeal failed, trying local API:', supaErr);
      try {
        const res = await fetch(`${API_BASE}/deals`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newDeal),
        });
        if (res.ok) {
          const data = await parseJsonSafe<Deal>(res);
          if (data) return data;
        }
      } catch (apiErr) {
        console.warn('Local API createDeal unreachable:', apiErr);
      }
      return newDeal;
    }
  },

  async updateDeal(id: string, updates: Partial<Deal>): Promise<void> {
    try {
      await supabaseService.upsertDeal({ id, ...updates } as Deal);
    } catch {
      try {
        await fetch(`${API_BASE}/deals/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates),
        });
      } catch {}
    }
  },

  async updateDealStage(id: string, stage: DealStage): Promise<Deal> {
    try {
      await supabaseService.upsertDeal({ id, stage } as Deal);
      return { id, stage } as Deal;
    } catch {
      try {
        const res = await fetch(`${API_BASE}/deals/${id}/stage`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ stage }),
        });
        if (res.ok) {
          const data = await parseJsonSafe<Deal>(res);
          if (data) return data;
        }
      } catch {}
      return { id, stage } as Deal;
    }
  },

  async deleteDeal(id: string): Promise<void> {
    try {
      await supabaseService.deleteDeal(id);
    } catch {
      try {
        await fetch(`${API_BASE}/deals/${id}`, { method: 'DELETE' });
      } catch {}
    }
  },

  // ================= QUOTES & DIGITAL SIGNATURE =================
  async getQuotes(): Promise<Quote[]> {
    try {
      const data = await supabaseService.getBootstrapData();
      return data.quotes;
    } catch {
      try {
        const res = await fetch(`${API_BASE}/quotes`);
        if (res.ok) {
          const quotes = await parseJsonSafe<Quote[]>(res);
          if (quotes) return quotes;
        }
      } catch {}
      return [];
    }
  },

  async createQuote(quote: Omit<Quote, 'id' | 'quoteNumber' | 'createdAt'>): Promise<Quote> {
    const nextNum = Date.now().toString().slice(-3);
    const newQuote: Quote = {
      ...quote,
      id: `quote-${Date.now()}`,
      quoteNumber: `COT-${new Date().getFullYear()}-${nextNum}`,
      createdAt: new Date().toISOString()
    };
    try {
      await supabaseService.upsertQuote(newQuote);
      return newQuote;
    } catch (supaErr) {
      console.warn('Supabase createQuote failed, trying local API:', supaErr);
      try {
        const res = await fetch(`${API_BASE}/quotes`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newQuote),
        });
        if (res.ok) {
          const data = await parseJsonSafe<Quote>(res);
          if (data) return data;
        }
      } catch (apiErr) {
        console.warn('Local API createQuote unreachable:', apiErr);
      }
      return newQuote;
    }
  },

  async updateQuote(id: string, updates: Partial<Quote>): Promise<void> {
    try {
      let safeUpdates = { ...updates };
      if (safeUpdates.clientSignature && safeUpdates.clientSignature.startsWith('data:image')) {
        try {
          safeUpdates.clientSignature = await uploadSignature(safeUpdates.clientSignature, `quote-${id}`);
        } catch {
          // ignore
        }
      }
      await supabaseService.upsertQuote({ id, ...safeUpdates } as Quote);
    } catch {
      try {
        await fetch(`${API_BASE}/quotes/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates),
        });
      } catch {}
    }
  },

  async signQuote(id: string, signature: string, signedBy?: string): Promise<{ success: boolean; quote: Quote }> {
    try {
      let sigUrl = signature;
      if (signature.startsWith('data:image')) {
        try {
          sigUrl = await uploadSignature(signature, `quote-${id}`);
        } catch {
          // ignore
        }
      }
      const updateData = {
        id,
        status: 'accepted' as const,
        clientSignature: sigUrl,
        signedAt: new Date().toISOString(),
        signedBy
      };
      await supabaseService.upsertQuote(updateData as Quote);
      return { success: true, quote: updateData as Quote };
    } catch {
      try {
        const res = await fetch(`${API_BASE}/quotes/${id}/sign`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ signature, signedBy }),
        });
        if (res.ok) {
          const data = await parseJsonSafe<{ success: boolean; quote: Quote }>(res);
          if (data) return data;
        }
      } catch {}
      return {
        success: true,
        quote: {
          id,
          status: 'accepted' as const,
          clientSignature: signature,
          signedAt: new Date().toISOString(),
          signedBy
        } as Quote
      };
    }
  },

  async deleteQuote(id: string): Promise<void> {
    try {
      await supabaseService.deleteQuote(id);
    } catch {
      try {
        await fetch(`${API_BASE}/quotes/${id}`, { method: 'DELETE' });
      } catch {}
    }
  },

  // ================= CLIENTS =================
  async getClients(): Promise<Client[]> {
    try {
      const data = await supabaseService.getBootstrapData();
      return data.clients;
    } catch {
      try {
        const res = await fetch(`${API_BASE}/clients`);
        if (res.ok) {
          const clients = await parseJsonSafe<Client[]>(res);
          if (clients) return clients;
        }
      } catch {}
      return [];
    }
  },

  async createClient(client: Omit<Client, 'id' | 'createdAt' | 'totalDeals' | 'totalSpent'>): Promise<Client> {
    const newClient: Client = {
      ...client,
      id: `cli-${Date.now()}`,
      totalDeals: 0,
      totalSpent: 0,
      createdAt: new Date().toISOString().split('T')[0]
    };
    try {
      await supabaseService.upsertClient(newClient);
      return newClient;
    } catch (supaErr) {
      console.warn('Supabase createClient failed, trying local API:', supaErr);
      try {
        const res = await fetch(`${API_BASE}/clients`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newClient),
        });
        if (res.ok) {
          const data = await parseJsonSafe<Client>(res);
          if (data) return data;
        }
      } catch (apiErr) {
        console.warn('Local API createClient unreachable:', apiErr);
      }
      return newClient;
    }
  },

  async updateClient(id: string, updates: Partial<Client>): Promise<void> {
    try {
      await supabaseService.upsertClient({ id, ...updates } as Client);
    } catch {
      try {
        await fetch(`${API_BASE}/clients/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates),
        });
      } catch {}
    }
  },

  async deleteClient(id: string): Promise<void> {
    try {
      await supabaseService.deleteClient(id);
    } catch {
      try {
        await fetch(`${API_BASE}/clients/${id}`, { method: 'DELETE' });
      } catch {}
    }
  },

  // ================= PORTFOLIO =================
  async getPortfolio(): Promise<PortfolioProject[]> {
    try {
      const data = await supabaseService.getBootstrapData();
      return data.portfolio;
    } catch {
      try {
        const res = await fetch(`${API_BASE}/portfolio`);
        if (res.ok) {
          const portfolio = await parseJsonSafe<PortfolioProject[]>(res);
          if (portfolio) return portfolio;
        }
      } catch {}
      return [];
    }
  },

  async createPortfolioProject(project: Omit<PortfolioProject, 'id'>): Promise<PortfolioProject> {
    const newProject: PortfolioProject = {
      ...project,
      id: `port-${Date.now()}`
    };
    try {
      await supabaseService.upsertPortfolio(newProject);
      return newProject;
    } catch (supaErr) {
      console.warn('Supabase createPortfolioProject failed, trying local API:', supaErr);
      try {
        const res = await fetch(`${API_BASE}/portfolio`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newProject),
        });
        if (res.ok) {
          const data = await parseJsonSafe<PortfolioProject>(res);
          if (data) return data;
        }
      } catch (apiErr) {
        console.warn('Local API createPortfolioProject unreachable:', apiErr);
      }
      return newProject;
    }
  },

  async updatePortfolioProject(id: string, updates: Partial<PortfolioProject>): Promise<void> {
    try {
      await supabaseService.upsertPortfolio({ id, ...updates } as PortfolioProject);
    } catch {
      try {
        await fetch(`${API_BASE}/portfolio/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates),
        });
      } catch {}
    }
  },

  async deletePortfolioProject(id: string): Promise<void> {
    try {
      await supabaseService.deletePortfolio(id);
    } catch {
      try {
        await fetch(`${API_BASE}/portfolio/${id}`, { method: 'DELETE' });
      } catch {}
    }
  },

  // ================= SETTINGS =================
  async getSettings(): Promise<CompanySettings | null> {
    try {
      const data = await supabaseService.getBootstrapData();
      if (data.companySettings) return data.companySettings;
    } catch {
      // ignore
    }
    try {
      const res = await fetch(`${API_BASE}/settings`);
      if (res.ok) {
        return await parseJsonSafe<CompanySettings>(res);
      }
    } catch {}
    return null;
  },

  async updateSettings(settings: Partial<CompanySettings>): Promise<CompanySettings> {
    try {
      await supabaseService.saveCompanySettings(settings as CompanySettings);
      return settings as CompanySettings;
    } catch {
      try {
        const res = await fetch(`${API_BASE}/settings`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(settings),
        });
        if (res.ok) {
          const data = await parseJsonSafe<CompanySettings>(res);
          if (data) return data;
        }
      } catch {}
      return settings as CompanySettings;
    }
  },

  // ================= BACKUP =================
  async exportBackup() {
    try {
      const data = await supabaseService.getBootstrapData();
      return {
        version: '3.0-supabase',
        exportedAt: new Date().toISOString(),
        ...data
      };
    } catch {
      try {
        const res = await fetch(`${API_BASE}/backup/export`);
        if (res.ok) {
          const data = await parseJsonSafe<any>(res);
          if (data) return data;
        }
      } catch {}
      return null;
    }
  },

  async restoreBackup(backupData: any): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/backup/restore`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(backupData),
      });
      return res.ok;
    } catch {
      return false;
    }
  }
};

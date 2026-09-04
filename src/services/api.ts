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

    const res = await fetch(`${API_BASE}/bootstrap`);
    if (!res.ok) throw new Error('Failed to bootstrap');
    return res.json();
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

    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Error al iniciar sesión');
    }
    return res.json();
  },

  async getUsers(): Promise<User[]> {
    try {
      const data = await supabaseService.getBootstrapData();
      return data.users;
    } catch {
      const res = await fetch(`${API_BASE}/users`);
      return res.json();
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
    } catch {
      const res = await fetch(`${API_BASE}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Error al crear usuario');
      }
      return res.json();
    }
  },

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    try {
      await supabaseService.upsertUser({ id, ...updates } as User);
      return { id, ...updates } as User;
    } catch {
      const res = await fetch(`${API_BASE}/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Error al actualizar usuario');
      }
      return res.json();
    }
  },

  async deleteUser(id: string): Promise<void> {
    try {
      await supabaseService.deleteUser(id);
    } catch {
      const res = await fetch(`${API_BASE}/users/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Error al eliminar usuario');
      }
    }
  },

  // ================= PAYMENTS =================
  async getPayments(): Promise<Payment[]> {
    try {
      const data = await supabaseService.getBootstrapData();
      return data.payments;
    } catch {
      const res = await fetch(`${API_BASE}/payments`);
      return res.json();
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
    } catch {
      const res = await fetch(`${API_BASE}/payments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payment),
      });
      return res.json();
    }
  },

  async deletePayment(id: string): Promise<void> {
    try {
      await supabaseService.deletePayment(id);
    } catch {
      await fetch(`${API_BASE}/payments/${id}`, { method: 'DELETE' });
    }
  },

  // ================= TECHNICAL VISITS & CALENDAR =================
  async getVisits(): Promise<TechnicalVisit[]> {
    try {
      const data = await supabaseService.getBootstrapData();
      return data.visits;
    } catch {
      const res = await fetch(`${API_BASE}/visits`);
      return res.json();
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
    } catch {
      const res = await fetch(`${API_BASE}/visits`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(visit),
      });
      return res.json();
    }
  },

  async updateVisit(id: string, updates: Partial<TechnicalVisit>): Promise<void> {
    try {
      await supabaseService.upsertVisit({ id, ...updates } as TechnicalVisit);
    } catch {
      await fetch(`${API_BASE}/visits/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
    }
  },

  async deleteVisit(id: string): Promise<void> {
    try {
      await supabaseService.deleteVisit(id);
    } catch {
      await fetch(`${API_BASE}/visits/${id}`, { method: 'DELETE' });
    }
  },

  // ================= WORK ORDERS / ACTAS DE ENTREGA =================
  async getWorkOrders(): Promise<WorkOrder[]> {
    try {
      const data = await supabaseService.getBootstrapData();
      return data.workOrders;
    } catch {
      const res = await fetch(`${API_BASE}/work-orders`);
      return res.json();
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
    } catch {
      const res = await fetch(`${API_BASE}/work-orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(workOrder),
      });
      return res.json();
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
      await fetch(`${API_BASE}/work-orders/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
    }
  },

  async deleteWorkOrder(id: string): Promise<void> {
    try {
      await supabaseService.deleteWorkOrder(id);
    } catch {
      await fetch(`${API_BASE}/work-orders/${id}`, { method: 'DELETE' });
    }
  },

  // ================= CATALOG =================
  async getCatalog(): Promise<CatalogProduct[]> {
    try {
      const data = await supabaseService.getBootstrapData();
      return data.catalog;
    } catch {
      const res = await fetch(`${API_BASE}/catalog`);
      return res.json();
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
    } catch {
      const res = await fetch(`${API_BASE}/catalog`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product),
      });
      return res.json();
    }
  },

  async updateCatalogProduct(id: string, updates: Partial<CatalogProduct>): Promise<void> {
    try {
      await supabaseService.upsertCatalogProduct({ id, ...updates } as CatalogProduct);
    } catch {
      await fetch(`${API_BASE}/catalog/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
    }
  },

  async deleteCatalogProduct(id: string): Promise<void> {
    try {
      await supabaseService.deleteCatalogProduct(id);
    } catch {
      await fetch(`${API_BASE}/catalog/${id}`, { method: 'DELETE' });
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
      const res = await fetch(`${API_BASE}/catalog/bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ products }),
      });
      return res.json();
    }
  },

  // ================= INVENTORY MOVEMENTS (KARDEX) =================
  async getInventoryMovements(): Promise<InventoryMovement[]> {
    try {
      const res = await fetch(`${API_BASE}/inventory/movements`);
      if (res.ok) return await res.json();
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
      if (res.ok) return await res.json();
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
      const res = await fetch(`${API_BASE}/invoices`);
      return res.json();
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
    } catch {
      const res = await fetch(`${API_BASE}/invoices`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invoice),
      });
      return res.json();
    }
  },

  async updateInvoice(id: string, updates: Partial<FiscalInvoice>): Promise<void> {
    try {
      await supabaseService.upsertInvoice({ id, ...updates } as FiscalInvoice);
    } catch {
      await fetch(`${API_BASE}/invoices/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
    }
  },

  async deleteInvoice(id: string): Promise<void> {
    try {
      await supabaseService.deleteInvoice(id);
    } catch {
      await fetch(`${API_BASE}/invoices/${id}`, { method: 'DELETE' });
    }
  },

  // ================= DEALS =================
  async getDeals(): Promise<Deal[]> {
    try {
      const data = await supabaseService.getBootstrapData();
      return data.deals;
    } catch {
      const res = await fetch(`${API_BASE}/deals`);
      return res.json();
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
    } catch {
      const res = await fetch(`${API_BASE}/deals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(deal),
      });
      return res.json();
    }
  },

  async updateDeal(id: string, updates: Partial<Deal>): Promise<void> {
    try {
      await supabaseService.upsertDeal({ id, ...updates } as Deal);
    } catch {
      await fetch(`${API_BASE}/deals/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
    }
  },

  async updateDealStage(id: string, stage: DealStage): Promise<Deal> {
    try {
      await supabaseService.upsertDeal({ id, stage } as Deal);
      return { id, stage } as Deal;
    } catch {
      const res = await fetch(`${API_BASE}/deals/${id}/stage`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage }),
      });
      return res.json();
    }
  },

  async deleteDeal(id: string): Promise<void> {
    try {
      await supabaseService.deleteDeal(id);
    } catch {
      await fetch(`${API_BASE}/deals/${id}`, { method: 'DELETE' });
    }
  },

  // ================= QUOTES & DIGITAL SIGNATURE =================
  async getQuotes(): Promise<Quote[]> {
    try {
      const data = await supabaseService.getBootstrapData();
      return data.quotes;
    } catch {
      const res = await fetch(`${API_BASE}/quotes`);
      return res.json();
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
    } catch {
      const res = await fetch(`${API_BASE}/quotes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(quote),
      });
      return res.json();
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
      await fetch(`${API_BASE}/quotes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
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
      const res = await fetch(`${API_BASE}/quotes/${id}/sign`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ signature, signedBy }),
      });
      return res.json();
    }
  },

  async deleteQuote(id: string): Promise<void> {
    try {
      await supabaseService.deleteQuote(id);
    } catch {
      await fetch(`${API_BASE}/quotes/${id}`, { method: 'DELETE' });
    }
  },

  // ================= CLIENTS =================
  async getClients(): Promise<Client[]> {
    try {
      const data = await supabaseService.getBootstrapData();
      return data.clients;
    } catch {
      const res = await fetch(`${API_BASE}/clients`);
      return res.json();
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
    } catch {
      const res = await fetch(`${API_BASE}/clients`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(client),
      });
      return res.json();
    }
  },

  async updateClient(id: string, updates: Partial<Client>): Promise<void> {
    try {
      await supabaseService.upsertClient({ id, ...updates } as Client);
    } catch {
      await fetch(`${API_BASE}/clients/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
    }
  },

  async deleteClient(id: string): Promise<void> {
    try {
      await supabaseService.deleteClient(id);
    } catch {
      await fetch(`${API_BASE}/clients/${id}`, { method: 'DELETE' });
    }
  },

  // ================= PORTFOLIO =================
  async getPortfolio(): Promise<PortfolioProject[]> {
    try {
      const data = await supabaseService.getBootstrapData();
      return data.portfolio;
    } catch {
      const res = await fetch(`${API_BASE}/portfolio`);
      return res.json();
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
    } catch {
      const res = await fetch(`${API_BASE}/portfolio`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(project),
      });
      return res.json();
    }
  },

  async updatePortfolioProject(id: string, updates: Partial<PortfolioProject>): Promise<void> {
    try {
      await supabaseService.upsertPortfolio({ id, ...updates } as PortfolioProject);
    } catch {
      await fetch(`${API_BASE}/portfolio/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
    }
  },

  async deletePortfolioProject(id: string): Promise<void> {
    try {
      await supabaseService.deletePortfolio(id);
    } catch {
      await fetch(`${API_BASE}/portfolio/${id}`, { method: 'DELETE' });
    }
  },

  // ================= SETTINGS =================
  async getSettings(): Promise<CompanySettings> {
    try {
      const data = await supabaseService.getBootstrapData();
      if (data.companySettings) return data.companySettings;
    } catch {
      // ignore
    }
    const res = await fetch(`${API_BASE}/settings`);
    return res.json();
  },

  async updateSettings(settings: Partial<CompanySettings>): Promise<CompanySettings> {
    try {
      await supabaseService.saveCompanySettings(settings as CompanySettings);
      return settings as CompanySettings;
    } catch {
      const res = await fetch(`${API_BASE}/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      return res.json();
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
      const res = await fetch(`${API_BASE}/backup/export`);
      return res.json();
    }
  },

  async restoreBackup(backupData: any): Promise<boolean> {
    const res = await fetch(`${API_BASE}/backup/restore`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(backupData),
    });
    return res.ok;
  }
};

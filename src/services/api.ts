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
  FiscalInvoice
} from '../types';

const API_BASE = '/api';

export const api = {
  // Check backend status
  async checkHealth(): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/health`);
      return res.ok;
    } catch {
      return false;
    }
  },

  // Bootstrap all collections
  async getBootstrapData() {
    const res = await fetch(`${API_BASE}/bootstrap`);
    if (!res.ok) throw new Error('Failed to bootstrap');
    return res.json();
  },

  // ================= AUTH =================
  async login(email: string, password: string): Promise<{ user: User; token: string }> {
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
    const res = await fetch(`${API_BASE}/auth/users`);
    return res.json();
  },

  // ================= PAYMENTS =================
  async getPayments(): Promise<Payment[]> {
    const res = await fetch(`${API_BASE}/payments`);
    return res.json();
  },

  async createPayment(payment: Omit<Payment, 'id' | 'receiptNumber' | 'createdAt'>): Promise<Payment> {
    const res = await fetch(`${API_BASE}/payments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payment),
    });
    return res.json();
  },

  async deletePayment(id: string): Promise<void> {
    await fetch(`${API_BASE}/payments/${id}`, { method: 'DELETE' });
  },

  // ================= TECHNICAL VISITS & CALENDAR =================
  async getVisits(): Promise<TechnicalVisit[]> {
    const res = await fetch(`${API_BASE}/visits`);
    return res.json();
  },

  async createVisit(visit: Omit<TechnicalVisit, 'id' | 'createdAt'>): Promise<TechnicalVisit> {
    const res = await fetch(`${API_BASE}/visits`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(visit),
    });
    return res.json();
  },

  async updateVisit(id: string, updates: Partial<TechnicalVisit>): Promise<void> {
    await fetch(`${API_BASE}/visits/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
  },

  async deleteVisit(id: string): Promise<void> {
    await fetch(`${API_BASE}/visits/${id}`, { method: 'DELETE' });
  },

  // ================= WORK ORDERS / ACTAS DE ENTREGA =================
  async getWorkOrders(): Promise<WorkOrder[]> {
    const res = await fetch(`${API_BASE}/work-orders`);
    return res.json();
  },

  async createWorkOrder(workOrder: Omit<WorkOrder, 'id' | 'orderNumber' | 'createdAt'>): Promise<WorkOrder> {
    const res = await fetch(`${API_BASE}/work-orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(workOrder),
    });
    return res.json();
  },

  async updateWorkOrder(id: string, updates: Partial<WorkOrder>): Promise<void> {
    await fetch(`${API_BASE}/work-orders/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
  },

  async deleteWorkOrder(id: string): Promise<void> {
    await fetch(`${API_BASE}/work-orders/${id}`, { method: 'DELETE' });
  },

  // ================= CATALOG =================
  async getCatalog(): Promise<CatalogProduct[]> {
    const res = await fetch(`${API_BASE}/catalog`);
    return res.json();
  },

  async createCatalogProduct(product: Omit<CatalogProduct, 'id'>): Promise<CatalogProduct> {
    const res = await fetch(`${API_BASE}/catalog`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product),
    });
    return res.json();
  },

  async updateCatalogProduct(id: string, updates: Partial<CatalogProduct>): Promise<void> {
    await fetch(`${API_BASE}/catalog/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
  },

  async deleteCatalogProduct(id: string): Promise<void> {
    await fetch(`${API_BASE}/catalog/${id}`, { method: 'DELETE' });
  },

  async bulkUpsertCatalog(products: Partial<CatalogProduct>[]): Promise<{ success: boolean; addedCount: number; updatedCount: number; total: number; catalog: CatalogProduct[] }> {
    const res = await fetch(`${API_BASE}/catalog/bulk`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ products }),
    });
    return res.json();
  },

  // ================= FISCAL INVOICES (DGII / NCF) =================
  async getInvoices(): Promise<FiscalInvoice[]> {
    const res = await fetch(`${API_BASE}/invoices`);
    return res.json();
  },

  async createInvoice(invoice: Omit<FiscalInvoice, 'id' | 'invoiceNumber' | 'createdAt'>): Promise<FiscalInvoice> {
    const res = await fetch(`${API_BASE}/invoices`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(invoice),
    });
    return res.json();
  },

  async updateInvoice(id: string, updates: Partial<FiscalInvoice>): Promise<void> {
    await fetch(`${API_BASE}/invoices/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
  },

  async deleteInvoice(id: string): Promise<void> {
    await fetch(`${API_BASE}/invoices/${id}`, { method: 'DELETE' });
  },

  // ================= DEALS =================
  async getDeals(): Promise<Deal[]> {
    const res = await fetch(`${API_BASE}/deals`);
    return res.json();
  },

  async createDeal(deal: Omit<Deal, 'id' | 'code' | 'createdAt' | 'updatedAt'>): Promise<Deal> {
    const res = await fetch(`${API_BASE}/deals`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(deal),
    });
    return res.json();
  },

  async updateDeal(id: string, updates: Partial<Deal>): Promise<void> {
    await fetch(`${API_BASE}/deals/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
  },

  async updateDealStage(id: string, stage: DealStage): Promise<Deal> {
    const res = await fetch(`${API_BASE}/deals/${id}/stage`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stage }),
    });
    return res.json();
  },

  async deleteDeal(id: string): Promise<void> {
    await fetch(`${API_BASE}/deals/${id}`, { method: 'DELETE' });
  },

  // ================= QUOTES & DIGITAL SIGNATURE =================
  async getQuotes(): Promise<Quote[]> {
    const res = await fetch(`${API_BASE}/quotes`);
    return res.json();
  },

  async createQuote(quote: Omit<Quote, 'id' | 'quoteNumber' | 'createdAt'>): Promise<Quote> {
    const res = await fetch(`${API_BASE}/quotes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(quote),
    });
    return res.json();
  },

  async updateQuote(id: string, updates: Partial<Quote>): Promise<void> {
    await fetch(`${API_BASE}/quotes/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
  },

  async signQuote(id: string, signature: string, signedBy?: string): Promise<{ success: boolean; quote: Quote }> {
    const res = await fetch(`${API_BASE}/quotes/${id}/sign`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ signature, signedBy }),
    });
    return res.json();
  },

  async deleteQuote(id: string): Promise<void> {
    await fetch(`${API_BASE}/quotes/${id}`, { method: 'DELETE' });
  },

  // ================= CLIENTS =================
  async getClients(): Promise<Client[]> {
    const res = await fetch(`${API_BASE}/clients`);
    return res.json();
  },

  async createClient(client: Omit<Client, 'id' | 'createdAt' | 'totalDeals' | 'totalSpent'>): Promise<Client> {
    const res = await fetch(`${API_BASE}/clients`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(client),
    });
    return res.json();
  },

  async updateClient(id: string, updates: Partial<Client>): Promise<void> {
    await fetch(`${API_BASE}/clients/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
  },

  async deleteClient(id: string): Promise<void> {
    await fetch(`${API_BASE}/clients/${id}`, { method: 'DELETE' });
  },

  // ================= PORTFOLIO =================
  async getPortfolio(): Promise<PortfolioProject[]> {
    const res = await fetch(`${API_BASE}/portfolio`);
    return res.json();
  },

  async createPortfolioProject(project: Omit<PortfolioProject, 'id'>): Promise<PortfolioProject> {
    const res = await fetch(`${API_BASE}/portfolio`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(project),
    });
    return res.json();
  },

  async updatePortfolioProject(id: string, updates: Partial<PortfolioProject>): Promise<void> {
    await fetch(`${API_BASE}/portfolio/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
  },

  async deletePortfolioProject(id: string): Promise<void> {
    await fetch(`${API_BASE}/portfolio/${id}`, { method: 'DELETE' });
  },

  // ================= SETTINGS =================
  async getSettings(): Promise<CompanySettings> {
    const res = await fetch(`${API_BASE}/settings`);
    return res.json();
  },

  async updateSettings(settings: Partial<CompanySettings>): Promise<CompanySettings> {
    const res = await fetch(`${API_BASE}/settings`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    });
    return res.json();
  },

  // ================= BACKUP =================
  async exportBackup() {
    const res = await fetch(`${API_BASE}/backup/export`);
    return res.json();
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

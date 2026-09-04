import { createClient } from '@supabase/supabase-js';
import {
  Deal,
  Quote,
  Client,
  PortfolioProject,
  CompanySettings,
  User,
  Payment,
  TechnicalVisit,
  CatalogProduct,
  WorkOrder,
  FiscalInvoice,
  AuditLog
} from '../types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://uxdaczuqxbsonbfxikcq.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV4ZGFjenVxeGJzb25iZnhpa2NxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg0NTc4NTQsImV4cCI6MjEwNDAzMzg1NH0.WBtZTdCt5NgOHH49uwPWKsZ2aFW7j16-Q7gB-K5wpoA';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/* ========================================================
   STORAGE HELPERS
======================================================== */

/**
 * Uploads an image file to the work-order-evidence bucket.
 * Returns the public URL of the uploaded image.
 */
export async function uploadWorkOrderImage(file: File): Promise<string> {
  const fileExt = file.name.split('.').pop() || 'jpg';
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
  const filePath = `evidence/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('work-order-evidence')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false
    });

  if (uploadError) {
    throw new Error(`Error al subir imagen: ${uploadError.message}`);
  }

  const { data } = supabase.storage
    .from('work-order-evidence')
    .getPublicUrl(filePath);

  return data.publicUrl;
}

/**
 * Uploads a base64 signature canvas data URL to the signatures bucket.
 * Returns the public URL.
 */
export async function uploadSignature(base64DataUrl: string, prefix = 'sig'): Promise<string> {
  if (!base64DataUrl.startsWith('data:image')) {
    return base64DataUrl; // Already a URL
  }

  const base64Content = base64DataUrl.split(',')[1];
  const byteCharacters = atob(base64Content);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  const blob = new Blob([byteArray], { type: 'image/png' });

  const fileName = `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}.png`;
  const filePath = `signatures/${fileName}`;

  const { error } = await supabase.storage
    .from('signatures')
    .upload(filePath, blob, {
      contentType: 'image/png',
      upsert: true
    });

  if (error) {
    console.error('Error uploading signature:', error);
    return base64DataUrl; // Fallback to raw dataUrl if upload fails
  }

  const { data } = supabase.storage.from('signatures').getPublicUrl(filePath);
  return data.publicUrl;
}

/* ========================================================
   DATA REPOSITORY VIA SUPABASE
======================================================== */

export const supabaseService = {
  // Check Connection
  async checkConnection(): Promise<boolean> {
    try {
      const { data, error } = await supabase.from('company_settings').select('id').limit(1);
      return !error && !!data;
    } catch {
      return false;
    }
  },

  // Bootstrap All Data
  async getBootstrapData() {
    const [
      settingsRes,
      usersRes,
      catalogRes,
      clientsRes,
      dealsRes,
      quotesRes,
      invoicesRes,
      paymentsRes,
      workOrdersRes,
      visitsRes,
      portfolioRes
    ] = await Promise.all([
      supabase.from('company_settings').select('*').single(),
      supabase.from('profiles').select('*'),
      supabase.from('catalog_products').select('*'),
      supabase.from('clients').select('*'),
      supabase.from('deals').select('*'),
      supabase.from('quotes').select('*'),
      supabase.from('fiscal_invoices').select('*'),
      supabase.from('payments').select('*'),
      supabase.from('work_orders').select('*'),
      supabase.from('technical_visits').select('*'),
      supabase.from('portfolio_projects').select('*')
    ]);

    // Map companySettings
    let companySettings: CompanySettings | null = null;
    if (settingsRes.data) {
      const d = settingsRes.data;
      companySettings = {
        name: d.name,
        legalName: d.legal_name || '',
        slogan: d.slogan || '',
        rnc: d.rnc || '',
        phone: d.phone || '',
        whatsapp: d.whatsapp || '',
        email: d.email || '',
        website: d.website || '',
        address: d.address || '',
        city: d.city || '',
        bankAccounts: d.bank_accounts || [],
        defaultTaxPercent: Number(d.default_tax_percent) || 18,
        defaultCurrency: d.default_currency || 'DOP',
        defaultWarranty: d.default_warranty || '',
        defaultTerms: d.default_terms || '',
        logoUrl: d.logo_url || '',
        socialLinks: d.social_links || {},
        ncfSequences: d.ncf_sequences || { b01Next: 1, b02Next: 1, b14Next: 1, b15Next: 1, ncfExpiryDate: '2027-12-31' }
      };
    }

    // Map users
    const users: User[] = (usersRes.data || []).map(u => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      phone: u.phone,
      avatar: u.avatar,
      password: u.password,
      active: u.active,
      createdAt: u.created_at,
      lastLogin: u.last_login
    }));

    // Map catalog
    const catalog: CatalogProduct[] = (catalogRes.data || []).map(p => ({
      id: p.id,
      code: p.code,
      name: p.name,
      brand: p.brand,
      category: p.category,
      type: p.type,
      description: p.description,
      unitPrice: Number(p.unit_price) || 0,
      costPrice: Number(p.cost_price) || 0,
      stock: Number(p.stock) || 0,
      unit: p.unit || 'Unidad'
    }));

    // Map clients
    const clients: Client[] = (clientsRes.data || []).map(c => ({
      id: c.id,
      name: c.name,
      company: c.company,
      phone: c.phone,
      email: c.email,
      rnc: c.rnc,
      address: c.address,
      city: c.city,
      type: c.type,
      notes: c.notes,
      totalDeals: c.total_deals || 0,
      totalSpent: Number(c.total_spent) || 0,
      createdAt: c.created_at
    }));

    // Map deals
    const deals: Deal[] = (dealsRes.data || []).map(d => ({
      id: d.id,
      code: d.code,
      title: d.title,
      clientId: d.client_id,
      clientName: d.client_name,
      clientPhone: d.client_phone,
      clientEmail: d.client_email,
      clientAddress: d.client_address,
      clientType: d.client_type,
      stage: d.stage,
      priority: d.priority,
      estimatedValue: Number(d.estimated_value) || 0,
      assignedTechnician: d.assigned_technician,
      serviceCategory: d.service_category,
      notes: d.notes,
      quoteId: d.quote_id,
      createdAt: d.created_at,
      updatedAt: d.updated_at,
      scheduledVisitDate: d.scheduled_visit_date,
      expectedCloseDate: d.expected_close_date,
      source: d.source
    }));

    // Map quotes
    const quotes: Quote[] = (quotesRes.data || []).map(q => ({
      id: q.id,
      quoteNumber: q.quote_number,
      dealId: q.deal_id,
      clientId: q.client_id,
      clientName: q.client_name,
      clientCompany: q.client_company,
      clientPhone: q.client_phone,
      clientEmail: q.client_email,
      clientRnc: q.client_rnc,
      clientAddress: q.client_address,
      date: q.date,
      validUntil: q.valid_until,
      items: q.items || [],
      subtotal: Number(q.subtotal) || 0,
      discountPercent: Number(q.discount_percent) || 0,
      discountAmount: Number(q.discount_amount) || 0,
      applyTax: q.apply_tax,
      taxPercent: Number(q.tax_percent) || 18,
      taxAmount: Number(q.tax_amount) || 0,
      total: Number(q.total) || 0,
      currency: q.currency || 'DOP',
      terms: q.terms || [],
      warrantyNotes: q.warranty_notes,
      paymentTerms: q.payment_terms,
      deliveryTime: q.delivery_time,
      notes: q.notes,
      status: q.status,
      clientSignature: q.client_signature,
      signedAt: q.signed_at,
      signedBy: q.signed_by,
      signedIp: q.signed_ip,
      createdBy: q.created_by,
      createdAt: q.created_at
    }));

    // Map invoices
    const invoices: FiscalInvoice[] = (invoicesRes.data || []).map(inv => ({
      id: inv.id,
      invoiceNumber: inv.invoice_number,
      ncf: inv.ncf,
      ncfType: inv.ncf_type,
      ncfTypeName: inv.ncf_type_name,
      ncfExpiryDate: inv.ncf_expiry_date,
      quoteId: inv.quote_id,
      quoteNumber: inv.quote_number,
      dealId: inv.deal_id,
      dealCode: inv.deal_code,
      clientId: inv.client_id,
      clientName: inv.client_name,
      clientRnc: inv.client_rnc,
      clientPhone: inv.client_phone,
      clientAddress: inv.client_address,
      date: inv.date,
      dueDate: inv.due_date,
      items: inv.items || [],
      subtotal: Number(inv.subtotal) || 0,
      discountPercent: Number(inv.discount_percent) || 0,
      discountAmount: Number(inv.discount_amount) || 0,
      taxPercent: Number(inv.tax_percent) || 18,
      taxAmount: Number(inv.tax_amount) || 0,
      total: Number(inv.total) || 0,
      currency: inv.currency || 'DOP',
      paymentStatus: inv.payment_status,
      paymentMethod: inv.payment_method,
      amountPaid: Number(inv.amount_paid) || 0,
      balanceDue: Number(inv.balance_due) || 0,
      notes: inv.notes,
      createdBy: inv.created_by,
      createdAt: inv.created_at
    }));

    // Map payments
    const payments: Payment[] = (paymentsRes.data || []).map(p => ({
      id: p.id,
      receiptNumber: p.receipt_number,
      quoteId: p.quote_id,
      quoteNumber: p.quote_number,
      dealId: p.deal_id,
      dealCode: p.deal_code,
      clientName: p.client_name,
      clientPhone: p.client_phone,
      amount: Number(p.amount) || 0,
      currency: p.currency || 'DOP',
      date: p.date,
      paymentMethod: p.payment_method,
      bankName: p.bank_name,
      referenceNumber: p.reference_number,
      concept: p.concept,
      notes: p.notes,
      createdBy: p.created_by,
      createdAt: p.created_at
    }));

    // Map work orders
    const workOrders: WorkOrder[] = (workOrdersRes.data || []).map(w => ({
      id: w.id,
      orderNumber: w.order_number,
      dealId: w.deal_id,
      dealCode: w.deal_code,
      quoteId: w.quote_id,
      quoteNumber: w.quote_number,
      clientName: w.client_name,
      clientPhone: w.client_phone,
      clientAddress: w.client_address,
      serviceCategory: w.service_category,
      assignedTechnician: w.assigned_technician,
      scheduledDate: w.scheduled_date,
      completedDate: w.completed_date,
      status: w.status,
      scopeOfWork: w.scope_of_work,
      checklist: w.checklist || [],
      beforeImages: w.before_images || [],
      afterImages: w.after_images || [],
      technicianNotes: w.technician_notes,
      clientSignature: w.client_signature,
      clientFeedback: w.client_feedback,
      signedAt: w.signed_at,
      signedByName: w.signed_by_name,
      createdBy: w.created_by,
      createdAt: w.created_at
    }));

    // Map visits
    const visits: TechnicalVisit[] = (visitsRes.data || []).map(v => ({
      id: v.id,
      dealId: v.deal_id,
      dealCode: v.deal_code,
      title: v.title,
      clientName: v.client_name,
      clientPhone: v.client_phone,
      address: v.address,
      date: v.date,
      time: v.time,
      type: v.type,
      assignedTechnician: v.assigned_technician,
      status: v.status,
      notes: v.notes,
      serviceCategory: v.service_category,
      createdAt: v.created_at
    }));

    // Map portfolio
    const portfolio: PortfolioProject[] = (portfolioRes.data || []).map(p => ({
      id: p.id,
      title: p.title,
      category: p.category,
      client: p.client,
      location: p.location,
      date: p.date,
      description: p.description,
      images: p.images || [],
      equipmentInstalled: p.equipment_installed || [],
      testimonial: p.testimonial,
      featured: p.featured
    }));

    return {
      companySettings,
      users,
      catalog,
      clients,
      deals,
      quotes,
      invoices,
      payments,
      workOrders,
      visits,
      portfolio
    };
  },

  // Save/Update Company Settings
  async saveCompanySettings(settings: CompanySettings) {
    const payload = {
      id: 'default',
      name: settings.name,
      legal_name: settings.legalName,
      slogan: settings.slogan,
      rnc: settings.rnc,
      phone: settings.phone,
      whatsapp: settings.whatsapp,
      email: settings.email,
      website: settings.website,
      address: settings.address,
      city: settings.city,
      bank_accounts: settings.bankAccounts,
      default_tax_percent: settings.defaultTaxPercent,
      default_currency: settings.defaultCurrency,
      default_warranty: settings.defaultWarranty,
      default_terms: settings.defaultTerms,
      logo_url: settings.logoUrl,
      social_links: settings.socialLinks,
      ncf_sequences: settings.ncfSequences,
      updated_at: new Date().toISOString()
    };
    const { error } = await supabase.from('company_settings').upsert(payload);
    if (error) throw error;
  },

  // Deals
  async upsertDeal(deal: Deal) {
    const payload = {
      id: deal.id,
      code: deal.code,
      title: deal.title,
      client_id: deal.clientId,
      client_name: deal.clientName,
      client_phone: deal.clientPhone,
      client_email: deal.clientEmail,
      client_address: deal.clientAddress,
      client_type: deal.clientType,
      stage: deal.stage,
      priority: deal.priority,
      estimated_value: deal.estimatedValue,
      assigned_technician: deal.assignedTechnician,
      service_category: deal.serviceCategory,
      notes: deal.notes,
      quote_id: deal.quoteId,
      scheduled_visit_date: deal.scheduledVisitDate,
      expected_close_date: deal.expectedCloseDate,
      source: deal.source,
      updated_at: new Date().toISOString()
    };
    const { error } = await supabase.from('deals').upsert(payload);
    if (error) throw error;
  },

  async deleteDeal(id: string) {
    const { error } = await supabase.from('deals').delete().eq('id', id);
    if (error) throw error;
  },

  // Quotes
  async upsertQuote(quote: Quote) {
    const payload = {
      id: quote.id,
      quote_number: quote.quoteNumber,
      deal_id: quote.dealId,
      client_id: quote.clientId,
      client_name: quote.clientName,
      client_company: quote.clientCompany,
      client_phone: quote.clientPhone,
      client_email: quote.clientEmail,
      client_rnc: quote.clientRnc,
      client_address: quote.clientAddress,
      date: quote.date,
      valid_until: quote.validUntil,
      items: quote.items,
      subtotal: quote.subtotal,
      discount_percent: quote.discountPercent,
      discount_amount: quote.discountAmount,
      apply_tax: quote.applyTax,
      tax_percent: quote.taxPercent,
      tax_amount: quote.taxAmount,
      total: quote.total,
      currency: quote.currency,
      terms: quote.terms,
      warranty_notes: quote.warrantyNotes,
      payment_terms: quote.paymentTerms,
      delivery_time: quote.deliveryTime,
      notes: quote.notes,
      status: quote.status,
      client_signature: quote.clientSignature,
      signed_at: quote.signedAt,
      signed_by: quote.signedBy,
      signed_ip: quote.signedIp,
      created_by: quote.createdBy,
      updated_at: new Date().toISOString()
    };
    const { error } = await supabase.from('quotes').upsert(payload);
    if (error) throw error;
  },

  async deleteQuote(id: string) {
    const { error } = await supabase.from('quotes').delete().eq('id', id);
    if (error) throw error;
  },

  // Work Orders
  async upsertWorkOrder(wo: WorkOrder) {
    const payload = {
      id: wo.id,
      order_number: wo.orderNumber,
      deal_id: wo.dealId,
      deal_code: wo.dealCode,
      quote_id: wo.quoteId,
      quote_number: wo.quoteNumber,
      client_name: wo.clientName,
      client_phone: wo.clientPhone,
      client_address: wo.clientAddress,
      service_category: wo.serviceCategory,
      assigned_technician: wo.assignedTechnician,
      scheduled_date: wo.scheduledDate,
      completed_date: wo.completedDate,
      status: wo.status,
      scope_of_work: wo.scopeOfWork,
      checklist: wo.checklist,
      before_images: wo.beforeImages,
      after_images: wo.afterImages,
      technician_notes: wo.technicianNotes,
      client_signature: wo.clientSignature,
      client_feedback: wo.clientFeedback,
      signed_at: wo.signedAt,
      signed_by_name: wo.signedByName,
      created_by: wo.createdBy,
      updated_at: new Date().toISOString()
    };
    const { error } = await supabase.from('work_orders').upsert(payload);
    if (error) throw error;
  },

  async deleteWorkOrder(id: string) {
    const { error } = await supabase.from('work_orders').delete().eq('id', id);
    if (error) throw error;
  },

  // Invoices
  async upsertInvoice(inv: FiscalInvoice) {
    const payload = {
      id: inv.id,
      invoice_number: inv.invoiceNumber,
      ncf: inv.ncf,
      ncf_type: inv.ncfType,
      ncf_type_name: inv.ncfTypeName,
      ncf_expiry_date: inv.ncfExpiryDate,
      quote_id: inv.quoteId,
      quote_number: inv.quoteNumber,
      deal_id: inv.dealId,
      deal_code: inv.dealCode,
      client_id: inv.clientId,
      client_name: inv.clientName,
      client_rnc: inv.clientRnc,
      client_phone: inv.clientPhone,
      client_address: inv.clientAddress,
      date: inv.date,
      due_date: inv.dueDate,
      items: inv.items,
      subtotal: inv.subtotal,
      discount_percent: inv.discountPercent,
      discount_amount: inv.discountAmount,
      tax_percent: inv.taxPercent,
      tax_amount: inv.taxAmount,
      total: inv.total,
      currency: inv.currency,
      payment_status: inv.paymentStatus,
      payment_method: inv.paymentMethod,
      amount_paid: inv.amountPaid,
      balance_due: inv.balanceDue,
      notes: inv.notes,
      created_by: inv.createdBy,
      updated_at: new Date().toISOString()
    };
    const { error } = await supabase.from('fiscal_invoices').upsert(payload);
    if (error) throw error;
  },

  async deleteInvoice(id: string) {
    const { error } = await supabase.from('fiscal_invoices').delete().eq('id', id);
    if (error) throw error;
  },

  // Payments
  async upsertPayment(p: Payment) {
    const payload = {
      id: p.id,
      receipt_number: p.receiptNumber,
      quote_id: p.quoteId,
      quote_number: p.quoteNumber,
      deal_id: p.dealId,
      deal_code: p.dealCode,
      client_name: p.clientName,
      client_phone: p.clientPhone,
      amount: p.amount,
      currency: p.currency,
      date: p.date,
      payment_method: p.paymentMethod,
      bank_name: p.bankName,
      reference_number: p.referenceNumber,
      concept: p.concept,
      notes: p.notes,
      created_by: p.createdBy,
      updated_at: new Date().toISOString()
    };
    const { error } = await supabase.from('payments').upsert(payload);
    if (error) throw error;
  },

  async deletePayment(id: string) {
    const { error } = await supabase.from('payments').delete().eq('id', id);
    if (error) throw error;
  },

  // Clients
  async upsertClient(c: Client) {
    const payload = {
      id: c.id,
      name: c.name,
      company: c.company,
      phone: c.phone,
      email: c.email,
      rnc: c.rnc,
      address: c.address,
      city: c.city,
      type: c.type,
      notes: c.notes,
      total_deals: c.totalDeals,
      total_spent: c.totalSpent,
      updated_at: new Date().toISOString()
    };
    const { error } = await supabase.from('clients').upsert(payload);
    if (error) throw error;
  },

  async deleteClient(id: string) {
    const { error } = await supabase.from('clients').delete().eq('id', id);
    if (error) throw error;
  },

  // Technical Visits
  async upsertVisit(v: TechnicalVisit) {
    const payload = {
      id: v.id,
      deal_id: v.dealId,
      deal_code: v.dealCode,
      title: v.title,
      client_name: v.clientName,
      client_phone: v.clientPhone,
      address: v.address,
      date: v.date,
      time: v.time,
      type: v.type,
      assigned_technician: v.assignedTechnician,
      status: v.status,
      notes: v.notes,
      service_category: v.serviceCategory,
      updated_at: new Date().toISOString()
    };
    const { error } = await supabase.from('technical_visits').upsert(payload);
    if (error) throw error;
  },

  async deleteVisit(id: string) {
    const { error } = await supabase.from('technical_visits').delete().eq('id', id);
    if (error) throw error;
  },

  // Catalog Products
  async upsertCatalogProduct(p: CatalogProduct) {
    const payload = {
      id: p.id,
      code: p.code,
      name: p.name,
      brand: p.brand,
      category: p.category,
      type: p.type,
      description: p.description,
      unit_price: p.unitPrice,
      cost_price: p.costPrice,
      stock: p.stock,
      unit: p.unit,
      updated_at: new Date().toISOString()
    };
    const { error } = await supabase.from('catalog_products').upsert(payload);
    if (error) throw error;
  },

  async deleteCatalogProduct(id: string) {
    const { error } = await supabase.from('catalog_products').delete().eq('id', id);
    if (error) throw error;
  },

  // Users / Profiles
  async upsertUser(u: User) {
    const payload = {
      id: u.id,
      name: u.name,
      email: u.email.toLowerCase(),
      role: u.role,
      phone: u.phone,
      avatar: u.avatar,
      password: u.password,
      active: u.active !== undefined ? u.active : true,
      last_login: u.lastLogin,
      updated_at: new Date().toISOString()
    };
    const { error } = await supabase.from('profiles').upsert(payload);
    if (error) throw error;
  },

  async deleteUser(id: string) {
    const { error } = await supabase.from('profiles').delete().eq('id', id);
    if (error) throw error;
  },

  // Portfolio
  async upsertPortfolio(p: PortfolioProject) {
    const payload = {
      id: p.id,
      title: p.title,
      category: p.category,
      client: p.client,
      location: p.location,
      date: p.date,
      description: p.description,
      images: p.images,
      equipment_installed: p.equipmentInstalled,
      testimonial: p.testimonial,
      featured: p.featured,
      updated_at: new Date().toISOString()
    };
    const { error } = await supabase.from('portfolio_projects').upsert(payload);
    if (error) throw error;
  },

  async deletePortfolio(id: string) {
    const { error } = await supabase.from('portfolio_projects').delete().eq('id', id);
    if (error) throw error;
  },

  // Audit Logs
  async fetchAuditLogs(): Promise<AuditLog[]> {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) {
      console.warn('Error fetching audit logs:', error);
      return [];
    }

    return (data || []).map((row: any) => ({
      id: row.id,
      userId: row.user_id,
      userName: row.user_name,
      userRole: row.user_role,
      action: row.action,
      entityType: row.entity_type,
      entityId: row.entity_id,
      details: row.details,
      createdAt: row.created_at
    }));
  },

  async createAuditLog(log: Omit<AuditLog, 'id' | 'createdAt'>): Promise<AuditLog | null> {
    const payload = {
      user_id: log.userId || null,
      user_name: log.userName,
      user_role: log.userRole,
      action: log.action,
      entity_type: log.entityType,
      entity_id: log.entityId || null,
      details: log.details
    };

    const { data, error } = await supabase
      .from('audit_logs')
      .insert(payload)
      .select()
      .single();

    if (error) {
      console.warn('Error creating audit log in Supabase:', error);
      return null;
    }

    return {
      id: data.id,
      userId: data.user_id,
      userName: data.user_name,
      userRole: data.user_role,
      action: data.action,
      entityType: data.entity_type,
      entityId: data.entity_id,
      details: data.details,
      createdAt: data.created_at
    };
  }
};

export const supabaseDb = supabaseService;

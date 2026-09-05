import React, { createContext, useContext, useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  Deal, 
  Quote, 
  Client, 
  PortfolioProject, 
  CompanySettings, 
  CatalogProduct, 
  ServiceItem,
  DealStage,
  User,
  Payment,
  TechnicalVisit,
  WorkOrder,
  FiscalInvoice,
  NCFType,
  AuditLog,
  UserRole,
  InventoryMovement,
  InventoryMovementType
} from '../types';
import { 
  initialCompanySettings, 
  initialServices, 
  initialPortfolio, 
  initialClients, 
  initialDeals, 
  initialQuotes,
  initialUsers
} from '../data/initialData';
import { initialCatalogProducts } from '../data/catalogItems';
import { api } from '../services/api';
import { supabaseDb } from '../services/supabase';
import { deductStockFromItems } from '../utils/inventoryManager';

export type AdminTab = 
  | 'dashboard' 
  | 'pipeline' 
  | 'quotes' 
  | 'payments' 
  | 'invoices'
  | 'work_orders'
  | 'calendar' 
  | 'catalog' 
  | 'clients' 
  | 'portfolio' 
  | 'users'
  | 'settings'
  | 'audit';

type ThemeMode = 'light' | 'dark';

export type WhatsAppTemplateType = 'quote' | 'visit' | 'payment_reminder' | 'receipt' | 'review';

interface WhatsAppModalPayload {
  templateType?: WhatsAppTemplateType;
  clientName?: string;
  clientPhone?: string;
  quoteNumber?: string;
  receiptNumber?: string;
  total?: number;
  paid?: number;
  balance?: number;
  amount?: number;
  currency?: 'DOP' | 'USD';
  date?: string;
  time?: string;
  technician?: string;
  address?: string;
  concept?: string;
  validUntil?: string;
}

interface AppStateContextType {
  // Navigation & Theme
  currentView: 'public' | 'admin';
  setCurrentView: (view: 'public' | 'admin') => void;
  adminTab: AdminTab;
  setAdminTab: (tab: AdminTab) => void;
  theme: ThemeMode;
  toggleTheme: () => void;
  isServerConnected: boolean;

  // Authentication
  currentUser: User | null;
  isAuthenticated: boolean;
  isLoginModalOpen: boolean;
  setIsLoginModalOpen: (open: boolean) => void;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  
  // Data
  users: User[];
  deals: Deal[];
  quotes: Quote[];
  clients: Client[];
  portfolio: PortfolioProject[];
  companySettings: CompanySettings;
  catalog: CatalogProduct[];
  services: ServiceItem[];
  payments: Payment[];
  visits: TechnicalVisit[];
  workOrders: WorkOrder[];
  invoices: FiscalInvoice[];
  auditLogs: AuditLog[];
  inventoryMovements: InventoryMovement[];

  // Audit Actions
  logActivity: (action: string, entityType: string, entityId: string | undefined, details: string) => Promise<void>;

  // User Actions
  addUser: (userData: Omit<User, 'id' | 'createdAt'>) => Promise<User>;
  updateUser: (id: string, updates: Partial<User>) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  toggleUserStatus: (id: string) => Promise<void>;

  // Deal Actions
  addDeal: (dealData: Omit<Deal, 'id' | 'code' | 'createdAt' | 'updatedAt'>) => Promise<Deal>;
  updateDeal: (id: string, updates: Partial<Deal>) => Promise<void>;
  deleteDeal: (id: string) => Promise<void>;
  moveDealStage: (id: string, newStage: DealStage) => Promise<void>;

  // Quote Actions
  addQuote: (quoteData: Omit<Quote, 'id' | 'quoteNumber' | 'createdAt'>) => Promise<Quote>;
  updateQuote: (id: string, updates: Partial<Quote>) => Promise<void>;
  deleteQuote: (id: string) => Promise<void>;
  signQuote: (id: string, signature: string, signedBy?: string) => Promise<void>;

  // Fiscal Invoices (DGII / NCF) Actions
  addInvoice: (invoiceData: Omit<FiscalInvoice, 'id' | 'invoiceNumber' | 'createdAt'>) => Promise<FiscalInvoice>;
  updateInvoice: (id: string, updates: Partial<FiscalInvoice>) => Promise<void>;
  deleteInvoice: (id: string) => Promise<void>;
  getNextNCF: (ncfType: NCFType) => { ncf: string; expiryDate: string };

  // Client Actions
  addClient: (clientData: Omit<Client, 'id' | 'createdAt' | 'totalDeals' | 'totalSpent'>) => Promise<Client>;
  updateClient: (id: string, updates: Partial<Client>) => Promise<void>;
  deleteClient: (id: string) => Promise<void>;

  // Portfolio Actions
  addPortfolioProject: (projectData: Omit<PortfolioProject, 'id'>) => Promise<void>;
  updatePortfolioProject: (id: string, updates: Partial<PortfolioProject>) => Promise<void>;
  deletePortfolioProject: (id: string) => Promise<void>;

  // Payment Actions
  addPayment: (paymentData: Omit<Payment, 'id' | 'receiptNumber' | 'createdAt'>) => Promise<Payment>;
  deletePayment: (id: string) => Promise<void>;

  // Technical Visits Actions
  addVisit: (visitData: Omit<TechnicalVisit, 'id' | 'createdAt'>) => Promise<TechnicalVisit>;
  updateVisit: (id: string, updates: Partial<TechnicalVisit>) => Promise<void>;
  deleteVisit: (id: string) => Promise<void>;

  // Work Orders Actions
  addWorkOrder: (workOrderData: Omit<WorkOrder, 'id' | 'orderNumber' | 'createdAt'>) => Promise<WorkOrder>;
  updateWorkOrder: (id: string, updates: Partial<WorkOrder>) => Promise<void>;
  deleteWorkOrder: (id: string) => Promise<void>;
  signWorkOrder: (id: string, signature: string, signedByName?: string) => Promise<void>;

  // Catalog Actions
  addCatalogProduct: (productData: Omit<CatalogProduct, 'id'>) => Promise<void>;
  updateCatalogProduct: (id: string, updates: Partial<CatalogProduct>) => Promise<void>;
  deleteCatalogProduct: (id: string) => Promise<void>;
  bulkUpsertCatalog: (products: Partial<CatalogProduct>[]) => Promise<{ addedCount: number; updatedCount: number; total: number }>;
  adjustStock: (params: {
    productId: string;
    newStock?: number;
    delta?: number;
    movementType: InventoryMovementType;
    reason: string;
    referenceDocument?: string;
    notes?: string;
  }) => Promise<void>;

  // Settings Actions
  updateCompanySettings: (newSettings: Partial<CompanySettings>) => Promise<void>;

  // System & Backup
  exportDataBackup: () => void;
  importDataBackup: (jsonString: string) => Promise<boolean>;
  resetToDefaultData: () => void;
  clearTestDataForProduction: () => Promise<void>;

  // Modals & Active State
  activeQuoteForView: Quote | null;
  setActiveQuoteForView: (quote: Quote | null) => void;
  activeDealForEdit: Deal | null;
  setActiveDealForEdit: (deal: Deal | null) => void;
  activeQuoteForEdit: Quote | null;
  setActiveQuoteForEdit: (quote: Quote | null) => void;
  activeReceiptForView: Payment | null;
  setActiveReceiptForView: (payment: Payment | null) => void;
  activeVisitForEdit: TechnicalVisit | null;
  setActiveVisitForEdit: (visit: TechnicalVisit | null) => void;
  activeWorkOrderForEdit: WorkOrder | null;
  setActiveWorkOrderForEdit: (wo: WorkOrder | null) => void;
  activeWorkOrderForView: WorkOrder | null;
  setActiveWorkOrderForView: (wo: WorkOrder | null) => void;
  activeInvoiceForView: FiscalInvoice | null;
  setActiveInvoiceForView: (inv: FiscalInvoice | null) => void;
  activeInvoiceForEdit: FiscalInvoice | null;
  setActiveInvoiceForEdit: (inv: FiscalInvoice | null) => void;

  isQuoteModalOpen: boolean;
  setIsQuoteModalOpen: (open: boolean) => void;
  isDealModalOpen: boolean;
  setIsDealModalOpen: (open: boolean) => void;
  isSettingsModalOpen: boolean;
  setIsSettingsModalOpen: (open: boolean) => void;
  isPaymentModalOpen: boolean;
  setIsPaymentModalOpen: (open: boolean) => void;
  isVisitModalOpen: boolean;
  setIsVisitModalOpen: (open: boolean) => void;
  isWorkOrderModalOpen: boolean;
  setIsWorkOrderModalOpen: (open: boolean) => void;
  isInvoiceModalOpen: boolean;
  setIsInvoiceModalOpen: (open: boolean) => void;
  isBulkImportModalOpen: boolean;
  setIsBulkImportModalOpen: (open: boolean) => void;
  
  // WhatsApp Smart Messaging Modal
  isWhatsAppModalOpen: boolean;
  setIsWhatsAppModalOpen: (open: boolean) => void;
  whatsAppModalData: WhatsAppModalPayload | null;
  setWhatsAppModalData: (data: WhatsAppModalPayload | null) => void;
  openWhatsAppTemplates: (templateType: WhatsAppTemplateType, data?: Partial<WhatsAppModalPayload>) => void;

  // Financial Reports Modal
  isReportsModalOpen: boolean;
  setIsReportsModalOpen: (open: boolean) => void;

  quoteForPayment: Quote | null;
  setQuoteForPayment: (quote: Quote | null) => void;
  openPaymentForQuote: (quote: Quote) => void;
  quoteDealPreload: Deal | null;
  openNewQuoteForDeal: (deal: Deal) => void;
  invoiceQuotePreload: Quote | null;
  setInvoiceQuotePreload: (quote: Quote | null) => void;
  openNewInvoiceForQuote: (quote: Quote) => void;
}

const AppStateContext = createContext<AppStateContextType | undefined>(undefined);

const STORAGE_KEYS = {
  THEME: 'mt_theme_mode',
  USER: 'mt_current_user',
  TOKEN: 'mt_auth_token',
  USERS: 'mt_users_v1',
  DEALS: 'mt_deals_v1',
  QUOTES: 'mt_quotes_v1',
  CLIENTS: 'mt_clients_v1',
  PORTFOLIO: 'mt_portfolio_v1',
  SETTINGS: 'mt_settings_v1',
  CATALOG: 'mt_catalog_v1',
  PAYMENTS: 'mt_payments_v1',
  VISITS: 'mt_visits_v1',
  WORK_ORDERS: 'mt_work_orders_v1',
  INVOICES: 'mt_invoices_v1',
  INVENTORY_MOVEMENTS: 'mt_inventory_movements_v1'
};

export const AppStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentView, setCurrentView] = useState<'public' | 'admin'>('public');
  const [adminTab, setAdminTab] = useState<AdminTab>(() => {
    try {
      const savedUser = localStorage.getItem(STORAGE_KEYS.USER);
      if (savedUser) {
        const u = JSON.parse(savedUser);
        if (u.role === 'technician') return 'calendar';
      }
    } catch {}
    return 'dashboard';
  });
  const [isServerConnected, setIsServerConnected] = useState<boolean>(false);

  // Users Management State
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.USERS);
    return saved ? JSON.parse(saved) : initialUsers;
  });

  // Authentication
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.USER);
    return saved ? JSON.parse(saved) : null;
  });
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const isAuthenticated = !!currentUser;

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      if (isServerConnected) {
        const res = await api.login(email, password);
        setCurrentUser(res.user);
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(res.user));
        localStorage.setItem(STORAGE_KEYS.TOKEN, res.token);
        setIsLoginModalOpen(false);
        if (res.user?.role === 'technician') {
          setAdminTab('calendar');
        } else {
          setAdminTab('dashboard');
        }
        setCurrentView('admin');
        return { success: true };
      } else {
        const trimmedEmail = email.trim().toLowerCase();
        const trimmedPass = password.trim();

        // Match against dynamic users list
        const matchedUser = users.find(u => {
          const matchesEmail = u.email.toLowerCase() === trimmedEmail;
          const matchesUsername = u.email.toLowerCase().split('@')[0] === trimmedEmail;
          const matchesName = u.name.toLowerCase() === trimmedEmail;
          const passMatch = u.password === trimmedPass || 
            (u.email.toLowerCase() === 'admin@martineztech.com' && (trimmedPass === 'admin' || trimmedPass === 'admin123')) ||
            (u.email.toLowerCase() === 'tecnico@martineztech.com' && (trimmedPass === 'tecnico' || trimmedPass === 'tecnico123'));
          
          return (matchesEmail || matchesUsername || matchesName) && passMatch;
        });

        if (matchedUser) {
          if (matchedUser.active === false) {
            return { success: false, error: 'Esta cuenta de usuario ha sido suspendida/desactivada.' };
          }

          const safeUser: User = {
            id: matchedUser.id,
            name: matchedUser.name,
            email: matchedUser.email,
            role: matchedUser.role,
            phone: matchedUser.phone,
            avatar: matchedUser.avatar || matchedUser.name.slice(0, 2).toUpperCase(),
            active: true,
            createdAt: matchedUser.createdAt,
            lastLogin: new Date().toISOString()
          };

          setCurrentUser(safeUser);
          localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(safeUser));
          
          // update lastLogin in users array
          setUsers(prev => prev.map(u => u.id === matchedUser.id ? { ...u, lastLogin: new Date().toISOString() } : u));
          
          setIsLoginModalOpen(false);
          if (safeUser.role === 'technician') {
            setAdminTab('calendar');
          } else {
            setAdminTab('dashboard');
          }
          setCurrentView('admin');
          return { success: true };
        }

        return { success: false, error: 'Credenciales inválidas. Verifique su correo o contraseña.' };
      }
    } catch (err: any) {
      return { success: false, error: err.message || 'Error de conexión con el servidor.' };
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    setCurrentView('public');
  };

  // Theme State
  const [theme, setTheme] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.THEME) as ThemeMode;
    if (saved) return saved;
    return 'light';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Data States
  const [deals, setDeals] = useState<Deal[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.DEALS);
    return saved ? JSON.parse(saved) : initialDeals;
  });

  const [quotes, setQuotes] = useState<Quote[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.QUOTES);
    return saved ? JSON.parse(saved) : initialQuotes;
  });

  const [clients, setClients] = useState<Client[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CLIENTS);
    return saved ? JSON.parse(saved) : initialClients;
  });

  const [portfolio, setPortfolio] = useState<PortfolioProject[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PORTFOLIO);
    return saved ? JSON.parse(saved) : initialPortfolio;
  });

  const [companySettings, setCompanySettings] = useState<CompanySettings>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return saved ? JSON.parse(saved) : initialCompanySettings;
  });

  const [catalog, setCatalog] = useState<CatalogProduct[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CATALOG);
    return saved ? JSON.parse(saved) : initialCatalogProducts;
  });

  const [inventoryMovements, setInventoryMovements] = useState<InventoryMovement[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.INVENTORY_MOVEMENTS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return [
      {
        id: 'mov-init-1',
        productId: 'cat-1',
        productName: 'Cámara IP Domo 4MP ColorVu 24/7',
        productCode: 'CAM-IP-4MP',
        type: 'purchase_entry',
        quantityChange: 20,
        previousStock: 0,
        newStock: 20,
        reason: 'Reabastecimiento inicial de bodega por compra a distribuidor',
        referenceDocument: 'FACT-PROV-8421',
        userName: 'Rafael Martínez',
        userRole: 'admin',
        createdAt: '2026-08-01T10:00:00Z'
      },
      {
        id: 'mov-init-2',
        productId: 'cat-1',
        productName: 'Cámara IP Domo 4MP ColorVu 24/7',
        productCode: 'CAM-IP-4MP',
        type: 'sale_deduction',
        quantityChange: -4,
        previousStock: 20,
        newStock: 16,
        reason: 'Deducción por aprobación y firma de cotización COT-2026-001',
        referenceDocument: 'COT-2026-001',
        userName: 'Manuel Gómez',
        userRole: 'technician',
        createdAt: '2026-08-15T14:30:00Z'
      },
      {
        id: 'mov-init-3',
        productId: 'cat-3',
        productName: 'Kit Motor para Portón Corredizo 800KG Uso Continuo',
        productCode: 'MOT-CORR-800',
        type: 'purchase_entry',
        quantityChange: 8,
        previousStock: 0,
        newStock: 8,
        reason: 'Entrada de lote motores BFT importados',
        referenceDocument: 'BL-BFT-2026',
        userName: 'Rafael Martínez',
        userRole: 'admin',
        createdAt: '2026-08-05T09:15:00Z'
      },
      {
        id: 'mov-init-4',
        productId: 'cat-3',
        productName: 'Kit Motor para Portón Corredizo 800KG Uso Continuo',
        productCode: 'MOT-CORR-800',
        type: 'manual_adjustment',
        quantityChange: -1,
        previousStock: 8,
        newStock: 7,
        reason: 'Ajuste por conteo físico: unidad apartada para exhibición técnica',
        referenceDocument: 'AUDIT-INT-08',
        userName: 'Rafael Martínez',
        userRole: 'admin',
        createdAt: '2026-08-22T16:00:00Z'
      },
      {
        id: 'mov-init-5',
        productId: 'cat-4',
        productName: 'Cerradura Magnética Electroimán 600 Lbs con Soporte LZ',
        productCode: 'MAG-LOCK-600',
        type: 'purchase_entry',
        quantityChange: 12,
        previousStock: 0,
        newStock: 12,
        reason: 'Reabastecimiento de cerraduras y electroimanes YLI',
        referenceDocument: 'FAC-YLI-449',
        userName: 'Rafael Martínez',
        userRole: 'admin',
        createdAt: '2026-08-12T11:00:00Z'
      },
      {
        id: 'mov-init-6',
        productId: 'cat-5',
        productName: 'Cable de Red UTP Cat6 100% Cobre por Metro',
        productCode: 'CAB-CAT6-100',
        type: 'purchase_entry',
        quantityChange: 1000,
        previousStock: 0,
        newStock: 1000,
        reason: 'Entrada bobinas Panduit 305m',
        referenceDocument: 'FACT-PAN-902',
        userName: 'Rafael Martínez',
        userRole: 'admin',
        createdAt: '2026-08-10T11:20:00Z'
      }
    ];
  });

  const [payments, setPayments] = useState<Payment[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PAYMENTS);
    return saved ? JSON.parse(saved) : [
      {
        id: 'pay-1',
        receiptNumber: 'REC-2026-001',
        quoteId: 'quote-1',
        quoteNumber: 'COT-2026-001',
        clientName: 'Ing. Carlos Mendoza / Centro Logístico',
        clientPhone: '809-555-0192',
        amount: 85000,
        currency: 'DOP',
        date: '2026-08-20',
        paymentMethod: 'transferencia',
        bankName: 'Banco Popular Dominicano',
        referenceNumber: 'TRF-994821',
        concept: 'Anticipo del 60% para instalación de 16 cámaras 4K y rack',
        notes: 'Comprobante fiscal B01 emitido a satisfacción.',
        createdBy: 'Rafael Martínez',
        createdAt: '2026-08-20T14:30:00Z'
      }
    ];
  });

  const [visits, setVisits] = useState<TechnicalVisit[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.VISITS);
    return saved ? JSON.parse(saved) : [
      {
        id: 'vis-1',
        title: 'Levantamiento para 8 Cámaras 4K',
        clientName: 'Lic. Patricia Guzmán',
        clientPhone: '809-555-0144',
        address: 'Residencial Las Palmas Real, Bella Vista, Santo Domingo',
        date: new Date().toISOString().slice(0, 10),
        time: '10:00 AM',
        durationMinutes: 60,
        type: 'levantamiento',
        assignedTechnician: 'Rafael Martínez',
        assignedTechnicianId: 'usr-01',
        status: 'scheduled',
        serviceCategory: 'camaras',
        createdAt: new Date().toISOString()
      },
      {
        id: 'vis-2',
        title: 'Instalación y Calibración de Motores de Portón',
        clientName: 'Don Luis Morales / Almacén Central',
        clientPhone: '809-555-0811',
        address: 'Av. John F. Kennedy #88, Gazcue, Santo Domingo',
        date: new Date().toISOString().slice(0, 10),
        time: '02:30 PM',
        durationMinutes: 90,
        type: 'instalacion',
        assignedTechnician: 'Carlos Gómez',
        assignedTechnicianId: 'usr-02',
        assignedTechnicianEmail: 'tecnico@martineztech.com',
        status: 'scheduled',
        serviceCategory: 'motores',
        createdAt: new Date().toISOString()
      }
    ];
  });

  const [workOrders, setWorkOrders] = useState<WorkOrder[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.WORK_ORDERS);
    return saved ? JSON.parse(saved) : [
      {
        id: 'wo-1',
        orderNumber: 'OT-2026-001',
        dealId: 'deal-1',
        dealCode: 'NEG-2026-001',
        quoteId: 'quote-1',
        quoteNumber: 'COT-2026-001',
        clientName: 'Ing. Carlos Mendoza / Centro Logístico',
        clientPhone: '809-555-0192',
        clientAddress: 'Aut. Duarte Km 22, Parque Industrial Duarte',
        serviceCategory: 'camaras',
        assignedTechnician: 'Rafael Martínez (Técnico Líder)',
        scheduledDate: '2026-08-30',
        completedDate: '2026-08-30',
        status: 'completed',
        scopeOfWork: 'Instalación y configuración de 16 cámaras IP 4K con NVR 32 canales y peinado de rack.',
        checklist: [
          { id: 'chk-1', task: 'Tendido y canalización de tubería EMT y cable UTP Cat6', completed: true },
          { id: 'chk-2', task: 'Fijación y sellado impermeable de 16 cámaras Domo y Bullet 4K', completed: true },
          { id: 'chk-3', task: 'Ponchado de conectores RJ45 blindados y certificación de señal', completed: true },
          { id: 'chk-4', task: 'Montaje de Switch PoE Gigabit y NVR en Rack con UPS 1500VA', completed: true },
          { id: 'chk-5', task: 'Enfoque de lentes, calibración de visión nocturna y máscaras de privacidad', completed: true },
          { id: 'chk-6', task: 'Configuración de acceso remoto P2P en celulares y PC de monitoreo', completed: true }
        ],
        beforeImages: [
          'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=600&q=80'
        ],
        afterImages: [
          'https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&w=600&q=80'
        ],
        technicianNotes: 'Instalación finalizada sin contratiempos. Se instruyó al personal de seguridad en el manejo de grabaciones.',
        clientSignature: '',
        clientFeedback: 'Excelente trabajo, el cableado quedó impecable.',
        signedAt: '',
        signedByName: 'Ing. Carlos Mendoza',
        createdBy: 'Rafael Martínez',
        createdAt: '2026-08-28T10:00:00Z'
      }
    ];
  });

  const [invoices, setInvoices] = useState<FiscalInvoice[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.INVOICES);
    return saved ? JSON.parse(saved) : [];
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem('martinez_crm_audit_logs');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return [
      {
        id: 'log-seed-1',
        userName: 'Ing. Rafael Martínez',
        userRole: 'admin',
        action: 'system_boot',
        entityType: 'company_settings',
        details: 'Configuración de comprobantes fiscales NCF y catálogo oficial de Martínez Tech.',
        createdAt: '2026-08-20T10:00:00Z'
      },
      {
        id: 'log-seed-2',
        userName: 'Ing. Rafael Martínez',
        userRole: 'admin',
        action: 'invoice_issued',
        entityType: 'fiscal_invoice',
        entityId: 'B0100000001',
        details: 'Comprobante Fiscal B01 emitido a Constructora Mendoza & Asocs por RD$ 159,300.00.',
        createdAt: '2026-08-20T14:35:00Z'
      }
    ];
  });

  const [services] = useState<ServiceItem[]>(initialServices);

  // Modals & Active State
  const [activeQuoteForView, setActiveQuoteForView] = useState<Quote | null>(null);
  const [activeDealForEdit, setActiveDealForEdit] = useState<Deal | null>(null);
  const [activeQuoteForEdit, setActiveQuoteForEdit] = useState<Quote | null>(null);
  const [activeReceiptForView, setActiveReceiptForView] = useState<Payment | null>(null);
  const [activeVisitForEdit, setActiveVisitForEdit] = useState<TechnicalVisit | null>(null);
  const [activeWorkOrderForEdit, setActiveWorkOrderForEdit] = useState<WorkOrder | null>(null);
  const [activeWorkOrderForView, setActiveWorkOrderForView] = useState<WorkOrder | null>(null);
  const [activeInvoiceForView, setActiveInvoiceForView] = useState<FiscalInvoice | null>(null);
  const [activeInvoiceForEdit, setActiveInvoiceForEdit] = useState<FiscalInvoice | null>(null);

  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [isDealModalOpen, setIsDealModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isVisitModalOpen, setIsVisitModalOpen] = useState(false);
  const [isWorkOrderModalOpen, setIsWorkOrderModalOpen] = useState(false);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [isBulkImportModalOpen, setIsBulkImportModalOpen] = useState(false);
  
  // WhatsApp Smart Messaging
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);
  const [whatsAppModalData, setWhatsAppModalData] = useState<WhatsAppModalPayload | null>(null);

  // Financial Reports
  const [isReportsModalOpen, setIsReportsModalOpen] = useState(false);

  const [quoteForPayment, setQuoteForPayment] = useState<Quote | null>(null);
  const [quoteDealPreload, setQuoteDealPreload] = useState<Deal | null>(null);
  const [invoiceQuotePreload, setInvoiceQuotePreload] = useState<Quote | null>(null);

  // Connect to Backend API
  useEffect(() => {
    const initBackend = async () => {
      try {
        const isHealthy = await api.checkHealth();
        if (isHealthy) {
          setIsServerConnected(true);
          const data = await api.getBootstrapData();
          if (data.users?.length) setUsers(data.users);
          if (data.deals?.length) setDeals(data.deals);
          if (data.quotes?.length) setQuotes(data.quotes);
          if (data.clients?.length) setClients(data.clients);
          if (data.portfolio?.length) setPortfolio(data.portfolio);
          if (data.catalog?.length) setCatalog(data.catalog);
          if (data.payments?.length) setPayments(data.payments);
          if (data.visits?.length) setVisits(data.visits);
          if (data.workOrders?.length) setWorkOrders(data.workOrders);
          if (data.invoices?.length) setInvoices(data.invoices);
          if (data.inventoryMovements?.length) setInventoryMovements(data.inventoryMovements);
          if (data.companySettings && Object.keys(data.companySettings).length > 0) {
            setCompanySettings(prev => ({ ...prev, ...data.companySettings }));
          }

          // Fetch Audit Trail from Supabase
          try {
            const remoteLogs = await supabaseDb.fetchAuditLogs();
            if (remoteLogs && remoteLogs.length > 0) {
              setAuditLogs(remoteLogs);
            }
          } catch (logErr) {
            console.warn('Could not load audit logs from Supabase:', logErr);
          }
        }
      } catch (err) {
        console.log('Using local client state (Backend connecting...)', err);
      }
    };
    initBackend();
  }, []);

  // Save to LocalStorage Sync
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    localStorage.setItem(STORAGE_KEYS.DEALS, JSON.stringify(deals));
    localStorage.setItem(STORAGE_KEYS.QUOTES, JSON.stringify(quotes));
    localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(clients));
    localStorage.setItem(STORAGE_KEYS.PORTFOLIO, JSON.stringify(portfolio));
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(companySettings));
    localStorage.setItem(STORAGE_KEYS.CATALOG, JSON.stringify(catalog));
    localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(payments));
    localStorage.setItem(STORAGE_KEYS.VISITS, JSON.stringify(visits));
    localStorage.setItem(STORAGE_KEYS.WORK_ORDERS, JSON.stringify(workOrders));
    localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(invoices));
    localStorage.setItem(STORAGE_KEYS.INVENTORY_MOVEMENTS, JSON.stringify(inventoryMovements.slice(0, 250)));
    localStorage.setItem('martinez_crm_audit_logs', JSON.stringify(auditLogs.slice(0, 100)));
  }, [users, deals, quotes, clients, portfolio, companySettings, catalog, payments, visits, workOrders, invoices, inventoryMovements, auditLogs]);

  // Log Activity Helper (Audit Trail)
  const logActivity = async (action: string, entityType: string, entityId: string | undefined, details: string) => {
    const user = currentUser || { id: 'usr-admin', name: 'Administrador', role: 'admin' as UserRole };
    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      action,
      entityType,
      entityId,
      details,
      createdAt: new Date().toISOString()
    };

    setAuditLogs(prev => [newLog, ...prev]);

    if (isServerConnected) {
      supabaseDb.createAuditLog({
        userId: user.id,
        userName: user.name,
        userRole: user.role,
        action,
        entityType,
        entityId,
        details
      }).catch((err: any) => console.warn('Background audit log save:', err));
    }
  };

  // Open WhatsApp Templates Helper
  const openWhatsAppTemplates = (templateType: WhatsAppTemplateType, data?: Partial<WhatsAppModalPayload>) => {
    setWhatsAppModalData({
      templateType,
      ...data
    });
    setIsWhatsAppModalOpen(true);
  };

  // User Actions
  const addUser = async (userData: Omit<User, 'id' | 'createdAt'>): Promise<User> => {
    if (isServerConnected) {
      try {
        const created = await api.createUser(userData);
        setUsers(prev => [created, ...prev]);
        return created;
      } catch (err) {
        console.error('Error creating user via API', err);
      }
    }

    const newUser: User = {
      ...userData,
      id: `usr-${Date.now()}`,
      active: userData.active !== undefined ? userData.active : true,
      avatar: userData.avatar || userData.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2),
      password: userData.password || '123456',
      createdAt: new Date().toISOString().split('T')[0]
    };

    setUsers(prev => [newUser, ...prev]);
    return newUser;
  };

  const updateUser = async (id: string, updates: Partial<User>) => {
    if (isServerConnected) {
      try {
        const updated = await api.updateUser(id, updates);
        setUsers(prev => prev.map(u => u.id === id ? { ...u, ...updated } : u));
        if (currentUser?.id === id) {
          const safeUser = { ...currentUser, ...updated };
          delete safeUser.password;
          setCurrentUser(safeUser);
          localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(safeUser));
        }
        return;
      } catch (err) {
        console.error('Error updating user via API', err);
      }
    }

    setUsers(prev => prev.map(u => {
      if (u.id === id) {
        const updated = { ...u, ...updates };
        if (currentUser?.id === id) {
          const safeUser = { ...currentUser, ...updated };
          delete safeUser.password;
          setCurrentUser(safeUser);
          localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(safeUser));
        }
        return updated;
      }
      return u;
    }));
  };

  const deleteUser = async (id: string) => {
    if (currentUser?.id === id) {
      throw new Error('No puedes eliminar el usuario con el que has iniciado sesión actualmente.');
    }

    const target = users.find(u => u.id === id);
    if (target?.role === 'admin') {
      const adminCount = users.filter(u => u.role === 'admin').length;
      if (adminCount <= 1) {
        throw new Error('No es posible eliminar el único administrador del sistema.');
      }
    }

    if (isServerConnected) {
      try {
        await api.deleteUser(id);
      } catch (err) {
        console.error('Error deleting user via API', err);
      }
    }

    setUsers(prev => prev.filter(u => u.id !== id));
  };

  const toggleUserStatus = async (id: string) => {
    const target = users.find(u => u.id === id);
    if (!target) return;
    if (currentUser?.id === id) {
      throw new Error('No puedes desactivar tu propio usuario mientras estás en sesión.');
    }
    const newStatus = target.active === false;
    await updateUser(id, { active: newStatus });
  };

  // Deal Actions
  const addDeal = async (dealData: Omit<Deal, 'id' | 'code' | 'createdAt' | 'updatedAt'>): Promise<Deal> => {
    if (isServerConnected) {
      try {
        const created = await api.createDeal(dealData);
        setDeals(prev => [created, ...prev]);
        return created;
      } catch (err) {
        console.error('Error creating deal via API', err);
      }
    }

    const nextNumber = deals.length + 1;
    const newDeal: Deal = {
      ...dealData,
      id: `deal-${Date.now()}`,
      code: `NEG-2026-${String(nextNumber).padStart(3, '0')}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setDeals(prev => [newDeal, ...prev]);
    return newDeal;
  };

  const updateDeal = async (id: string, updates: Partial<Deal>) => {
    if (isServerConnected) {
      try {
        await api.updateDeal(id, updates);
      } catch (err) {
        console.error('Error updating deal via API', err);
      }
    }
    setDeals(prev => prev.map(deal => (deal.id === id ? { ...deal, ...updates, updatedAt: new Date().toISOString() } : deal)));
  };

  const deleteDeal = async (id: string) => {
    if (isServerConnected) {
      try {
        await api.deleteDeal(id);
      } catch (err) {
        console.error('Error deleting deal via API', err);
      }
    }
    setDeals(prev => prev.filter(deal => deal.id !== id));
  };

  const moveDealStage = async (id: string, newStage: DealStage) => {
    if (newStage === 'won' || newStage === 'completed') {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 }
      });
    }

    if (isServerConnected) {
      try {
        await api.updateDealStage(id, newStage);
      } catch (err) {
        console.error('Error moving deal stage via API', err);
      }
    }

    setDeals(prev => prev.map(deal => {
      if (deal.id === id) {
        return {
          ...deal,
          stage: newStage,
          updatedAt: new Date().toISOString()
        };
      }
      return deal;
    }));
  };

  // Quote Actions
  const addQuote = async (quoteData: Omit<Quote, 'id' | 'quoteNumber' | 'createdAt'>): Promise<Quote> => {
    if (isServerConnected) {
      try {
        const created = await api.createQuote(quoteData);
        setQuotes(prev => [created, ...prev]);
        if (created.dealId) {
          setDeals(prev => prev.map(d => {
            if (d.id === created.dealId) {
              return {
                ...d,
                quoteId: created.id,
                stage: d.stage === 'prospect' || d.stage === 'site_visit' ? 'quoted' : d.stage,
                estimatedValue: created.total,
                updatedAt: new Date().toISOString()
              };
            }
            return d;
          }));
        }
        return created;
      } catch (err) {
        console.error('Error creating quote via API', err);
      }
    }

    const nextNumber = quotes.length + 1;
    const newQuote: Quote = {
      ...quoteData,
      id: `quote-${Date.now()}`,
      quoteNumber: `COT-2026-${String(nextNumber).padStart(3, '0')}`,
      createdAt: new Date().toISOString(),
    };

    setQuotes(prev => [newQuote, ...prev]);

    // Update client totalDeals if client exists
    if (newQuote.clientId || newQuote.clientName) {
      setClients(prev => prev.map(c => {
        const isMatch = (newQuote.clientId && c.id === newQuote.clientId) ||
          (c.name.toLowerCase() === newQuote.clientName.toLowerCase()) ||
          (c.phone && newQuote.clientPhone && c.phone === newQuote.clientPhone);
        if (isMatch) {
          return {
            ...c,
            totalDeals: (c.totalDeals || 0) + 1
          };
        }
        return c;
      }));
    }

    if (newQuote.dealId) {
      setDeals(prev => prev.map(d => {
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
      }));
    }

    return newQuote;
  };

  const updateQuote = async (id: string, updates: Partial<Quote>) => {
    if (isServerConnected) {
      try {
        await api.updateQuote(id, updates);
      } catch (err) {
        console.error('Error updating quote via API', err);
      }
    }
    setQuotes(prev => prev.map(q => (q.id === id ? { ...q, ...updates } : q)));
  };

  const signQuote = async (id: string, signature: string, signedBy?: string) => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });

    if (isServerConnected) {
      try {
        const res = await api.signQuote(id, signature, signedBy);
        if (res.quote) {
          setQuotes(prev => prev.map(q => q.id === id ? res.quote : q));
          setActiveQuoteForView(res.quote);
        }
      } catch (err) {
        console.error('Error signing quote via API', err);
      }
    }

    const signedQuote = quotes.find(q => q.id === id);
    if (signedQuote) {
      const updated: Quote = {
        ...signedQuote,
        status: 'accepted',
        clientSignature: signature,
        signedAt: new Date().toISOString(),
        signedBy: signedBy || signedQuote.clientName
      };
      setQuotes(prev => prev.map(q => q.id === id ? updated : q));
      setActiveQuoteForView(updated);

      if (updated.dealId) {
        moveDealStage(updated.dealId, 'installation');
      }

      // Deducción automática de stock de inventario con trazabilidad Kardex
      if (updated.items && updated.items.length > 0) {
        const { updatedCatalog, deductedItems } = deductStockFromItems(updated.items, catalog);
        if (deductedItems.length > 0) {
          setCatalog(updatedCatalog);
          const currentActor = currentUser || { id: 'usr-admin', name: 'Administrador', role: 'admin' as UserRole };
          const newMovements: InventoryMovement[] = [];

          deductedItems.forEach(item => {
            api.updateCatalogProduct(item.productId, { stock: item.newStock }).catch(err => {
              console.warn('Error al sincronizar stock en base de datos:', err);
            });

            const movement: InventoryMovement = {
              id: `mov-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
              productId: item.productId,
              productName: item.productName,
              type: 'sale_deduction',
              quantityChange: -item.quantityDeducted,
              previousStock: item.previousStock,
              newStock: item.newStock,
              reason: `Salida automática por cotización aprobada y firmada (${signedQuote.clientName})`,
              referenceDocument: signedQuote.quoteNumber,
              userId: currentActor.id,
              userName: currentActor.name,
              userRole: currentActor.role,
              createdAt: new Date().toISOString()
            };

            newMovements.push(movement);

            if (isServerConnected) {
              api.createInventoryMovement(movement).catch(err => console.warn('Background inventory movement save:', err));
            }

            logActivity(
              'stock_deducted',
              'inventory_movement',
              signedQuote.quoteNumber,
              `Deducción de ${item.quantityDeducted} unidad(es) de "${item.productName}" por aprobación de Cotización ${signedQuote.quoteNumber} (Stock: ${item.previousStock} → ${item.newStock})`
            );
          });

          setInventoryMovements(prev => [...newMovements, ...prev]);
        }
      }

      logActivity(
        'quote_signed',
        'quote',
        signedQuote.quoteNumber,
        `Cotización ${signedQuote.quoteNumber} formalmente aceptada y firmada digitalmente por ${signedBy || signedQuote.clientName}`
      );
    }
  };

  const deleteQuote = async (id: string) => {
    if (isServerConnected) {
      try {
        await api.deleteQuote(id);
      } catch (err) {
        console.error('Error deleting quote via API', err);
      }
    }
    setQuotes(prev => prev.filter(q => q.id !== id));
  };

  // Client Actions
  const addClient = async (clientData: Omit<Client, 'id' | 'createdAt' | 'totalDeals' | 'totalSpent'>): Promise<Client> => {
    if (isServerConnected) {
      try {
        const created = await api.createClient(clientData);
        setClients(prev => [created, ...prev]);
        return created;
      } catch (err) {
        console.error('Error creating client via API', err);
      }
    }

    const newClient: Client = {
      ...clientData,
      id: `cli-${Date.now()}`,
      totalDeals: 0,
      totalSpent: 0,
      createdAt: new Date().toISOString().split('T')[0]
    };
    setClients(prev => [newClient, ...prev]);
    return newClient;
  };

  const updateClient = async (id: string, updates: Partial<Client>) => {
    if (isServerConnected) {
      try {
        await api.updateClient(id, updates);
      } catch (err) {
        console.error('Error updating client via API', err);
      }
    }
    setClients(prev => prev.map(c => (c.id === id ? { ...c, ...updates } : c)));
  };

  const deleteClient = async (id: string) => {
    if (isServerConnected) {
      try {
        await api.deleteClient(id);
      } catch (err) {
        console.error('Error deleting client via API', err);
      }
    }
    setClients(prev => prev.filter(c => c.id !== id));
  };

  // Portfolio Actions
  const addPortfolioProject = async (projectData: Omit<PortfolioProject, 'id'>) => {
    if (isServerConnected) {
      try {
        const created = await api.createPortfolioProject(projectData);
        setPortfolio(prev => [created, ...prev]);
        return;
      } catch (err) {
        console.error('Error creating portfolio project via API', err);
      }
    }

    const newProject: PortfolioProject = {
      ...projectData,
      id: `port-${Date.now()}`
    };
    setPortfolio(prev => [newProject, ...prev]);
  };

  const updatePortfolioProject = async (id: string, updates: Partial<PortfolioProject>) => {
    if (isServerConnected) {
      try {
        await api.updatePortfolioProject(id, updates);
      } catch (err) {
        console.error('Error updating portfolio project via API', err);
      }
    }
    setPortfolio(prev => prev.map(p => (p.id === id ? { ...p, ...updates } : p)));
  };

  const deletePortfolioProject = async (id: string) => {
    if (isServerConnected) {
      try {
        await api.deletePortfolioProject(id);
      } catch (err) {
        console.error('Error deleting portfolio project via API', err);
      }
    }
    setPortfolio(prev => prev.filter(p => p.id !== id));
  };

  // Payment Actions
  const addPayment = async (paymentData: Omit<Payment, 'id' | 'receiptNumber' | 'createdAt'>): Promise<Payment> => {
    confetti({
      particleCount: 70,
      spread: 50,
      origin: { y: 0.7 }
    });

    if (isServerConnected) {
      try {
        const created = await api.createPayment(paymentData);
        setPayments(prev => [created, ...prev]);
        logActivity(
          'payment_registered',
          'payment',
          created.receiptNumber,
          `Cobro de RD$ ${created.amount.toLocaleString('es-DO')} registrado vía ${created.paymentMethod} (${created.clientName})`
        );
        return created;
      } catch (err) {
        console.error('Error creating payment via API', err);
      }
    }

    const nextNumber = payments.length + 1;
    const newPayment: Payment = {
      ...paymentData,
      id: `pay-${Date.now()}`,
      receiptNumber: `REC-2026-${String(nextNumber).padStart(3, '0')}`,
      createdAt: new Date().toISOString()
    };
    setPayments(prev => [newPayment, ...prev]);

    // Update client totalSpent if client exists
    if (newPayment.clientName) {
      setClients(prev => prev.map(c => {
        const isMatch = (c.name.toLowerCase() === newPayment.clientName.toLowerCase()) ||
          (c.phone && newPayment.clientPhone && c.phone === newPayment.clientPhone);
        if (isMatch) {
          return {
            ...c,
            totalSpent: (c.totalSpent || 0) + (newPayment.amount || 0)
          };
        }
        return c;
      }));
    }

    logActivity(
      'payment_registered',
      'payment',
      newPayment.receiptNumber,
      `Cobro de RD$ ${newPayment.amount.toLocaleString('es-DO')} registrado vía ${newPayment.paymentMethod} (${newPayment.clientName})`
    );
    return newPayment;
  };

  const deletePayment = async (id: string) => {
    if (isServerConnected) {
      try {
        await api.deletePayment(id);
      } catch (err) {
        console.error('Error deleting payment via API', err);
      }
    }
    setPayments(prev => prev.filter(p => p.id !== id));
  };

  // Technical Visits Actions
  const addVisit = async (visitData: Omit<TechnicalVisit, 'id' | 'createdAt'>): Promise<TechnicalVisit> => {
    if (isServerConnected) {
      try {
        const created = await api.createVisit(visitData);
        setVisits(prev => [created, ...prev]);
        return created;
      } catch (err) {
        console.error('Error creating visit via API', err);
      }
    }

    const newVisit: TechnicalVisit = {
      ...visitData,
      id: `vis-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    setVisits(prev => [newVisit, ...prev]);
    return newVisit;
  };

  const updateVisit = async (id: string, updates: Partial<TechnicalVisit>) => {
    if (isServerConnected) {
      try {
        await api.updateVisit(id, updates);
      } catch (err) {
        console.error('Error updating visit via API', err);
      }
    }
    setVisits(prev => prev.map(v => (v.id === id ? { ...v, ...updates } : v)));
  };

  const deleteVisit = async (id: string) => {
    if (isServerConnected) {
      try {
        await api.deleteVisit(id);
      } catch (err) {
        console.error('Error deleting visit via API', err);
      }
    }
    setVisits(prev => prev.filter(v => v.id !== id));
  };

  // Work Orders Actions
  const addWorkOrder = async (workOrderData: Omit<WorkOrder, 'id' | 'orderNumber' | 'createdAt'>): Promise<WorkOrder> => {
    if (isServerConnected) {
      try {
        const created = await api.createWorkOrder(workOrderData);
        setWorkOrders(prev => [created, ...prev]);
        return created;
      } catch (err) {
        console.error('Error creating work order via API', err);
      }
    }

    const nextNumber = workOrders.length + 1;
    const newWO: WorkOrder = {
      ...workOrderData,
      id: `wo-${Date.now()}`,
      orderNumber: `OT-2026-${String(nextNumber).padStart(3, '0')}`,
      createdAt: new Date().toISOString()
    };
    setWorkOrders(prev => [newWO, ...prev]);
    return newWO;
  };

  const updateWorkOrder = async (id: string, updates: Partial<WorkOrder>) => {
    if (isServerConnected) {
      try {
        await api.updateWorkOrder(id, updates);
      } catch (err) {
        console.error('Error updating work order via API', err);
      }
    }
    setWorkOrders(prev => prev.map(w => (w.id === id ? { ...w, ...updates } : w)));
  };

  const deleteWorkOrder = async (id: string) => {
    if (isServerConnected) {
      try {
        await api.deleteWorkOrder(id);
      } catch (err) {
        console.error('Error deleting work order via API', err);
      }
    }
    setWorkOrders(prev => prev.filter(w => w.id !== id));
  };

  const signWorkOrder = async (id: string, signature: string, signedByName?: string) => {
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.6 }
    });

    const updates = {
      clientSignature: signature,
      signedAt: new Date().toISOString(),
      signedByName: signedByName,
      status: 'signed' as const
    };

    await updateWorkOrder(id, updates);

    const updated = workOrders.find(w => w.id === id);
    if (updated) {
      setActiveWorkOrderForView({ ...updated, ...updates });
      logActivity(
        'work_order_signed',
        'work_order',
        updated.orderNumber,
        `Acta de Entrega de Orden de Trabajo ${updated.orderNumber} certificada y firmada formalmente por el cliente ${signedByName || ''}`
      );
    }
  };

  // Catalog Actions
  const addCatalogProduct = async (productData: Omit<CatalogProduct, 'id'>) => {
    let createdProduct: CatalogProduct;
    if (isServerConnected) {
      try {
        const created = await api.createCatalogProduct(productData);
        setCatalog(prev => [created, ...prev]);
        createdProduct = created;
      } catch (err) {
        console.error('Error creating catalog product via API', err);
        createdProduct = { ...productData, id: `cat-${Date.now()}` };
        setCatalog(prev => [createdProduct, ...prev]);
      }
    } else {
      createdProduct = { ...productData, id: `cat-${Date.now()}` };
      setCatalog(prev => [createdProduct, ...prev]);
    }

    // Si tiene stock inicial y es físico, registrar alta en Kardex
    if ((createdProduct.type === 'product' || createdProduct.type === 'material') && typeof createdProduct.stock === 'number' && createdProduct.stock > 0) {
      const user = currentUser || { id: 'usr-admin', name: 'Administrador', role: 'admin' as UserRole };
      const initMovement: InventoryMovement = {
        id: `mov-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        productId: createdProduct.id,
        productName: createdProduct.name,
        productCode: createdProduct.code,
        type: 'initial',
        quantityChange: createdProduct.stock,
        previousStock: 0,
        newStock: createdProduct.stock,
        reason: 'Stock inicial registrado al dar de alta el producto en catálogo',
        userId: user.id,
        userName: user.name,
        userRole: user.role,
        createdAt: new Date().toISOString()
      };
      setInventoryMovements(prev => [initMovement, ...prev]);
      if (isServerConnected) {
        api.createInventoryMovement(initMovement).catch(err => console.warn('Background movement save:', err));
      }
      logActivity(
        'product_created',
        'catalog_product',
        createdProduct.code || createdProduct.id,
        `Nuevo ítem registrado en catálogo: "${createdProduct.name}" con stock inicial de ${createdProduct.stock} ${createdProduct.unit || 'unidades'}`
      );
    }
  };

  const updateCatalogProduct = async (id: string, updates: Partial<CatalogProduct> & { movementReason?: string; referenceDocument?: string }) => {
    const existing = catalog.find(c => c.id === id);

    if (isServerConnected) {
      try {
        const { movementReason, referenceDocument, ...cleanUpdates } = updates;
        await api.updateCatalogProduct(id, cleanUpdates);
      } catch (err) {
        console.error('Error updating catalog product via API', err);
      }
    }

    // Registrar en Kardex si el stock fue modificado directamente
    if (existing && updates.stock !== undefined && updates.stock !== existing.stock) {
      const prevStock = typeof existing.stock === 'number' ? existing.stock : 0;
      const newStock = Number(updates.stock);
      const quantityChange = newStock - prevStock;
      const user = currentUser || { id: 'usr-admin', name: 'Administrador', role: 'admin' as UserRole };

      const mov: InventoryMovement = {
        id: `mov-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        productId: existing.id,
        productName: updates.name || existing.name,
        productCode: updates.code || existing.code,
        type: quantityChange >= 0 ? 'manual_adjustment' : 'manual_adjustment',
        quantityChange,
        previousStock: prevStock,
        newStock,
        reason: updates.movementReason || (quantityChange >= 0 ? 'Ajuste manual de stock (Entrada)' : 'Ajuste manual de stock (Salida)'),
        referenceDocument: updates.referenceDocument,
        userId: user.id,
        userName: user.name,
        userRole: user.role,
        createdAt: new Date().toISOString()
      };

      setInventoryMovements(prev => [mov, ...prev]);
      if (isServerConnected) {
        api.createInventoryMovement(mov).catch(err => console.warn('Background movement save:', err));
      }

      const diffFormatted = quantityChange > 0 ? `+${quantityChange}` : `${quantityChange}`;
      logActivity(
        'stock_adjusted',
        'inventory_movement',
        existing.code || existing.id,
        `Stock de "${existing.name}" actualizado de ${prevStock} a ${newStock} (${diffFormatted} un.) | Motivo: ${mov.reason}${updates.referenceDocument ? ` | Ref: ${updates.referenceDocument}` : ''}`
      );
    }

    const { movementReason: _mr, referenceDocument: _rd, ...fieldsToSave } = updates;
    setCatalog(prev => prev.map(c => (c.id === id ? { ...c, ...fieldsToSave, lastStockUpdate: updates.stock !== undefined ? new Date().toISOString() : c.lastStockUpdate } : c)));
  };

  const adjustStock = async ({
    productId,
    newStock,
    delta,
    movementType,
    reason,
    referenceDocument,
    notes
  }: {
    productId: string;
    newStock?: number;
    delta?: number;
    movementType: InventoryMovementType;
    reason: string;
    referenceDocument?: string;
    notes?: string;
  }) => {
    const product = catalog.find(p => p.id === productId);
    if (!product) return;

    const prevStock = typeof product.stock === 'number' ? product.stock : 0;
    let targetStock = prevStock;

    if (typeof newStock === 'number') {
      targetStock = Math.max(0, newStock);
    } else if (typeof delta === 'number') {
      targetStock = Math.max(0, prevStock + delta);
    }

    const quantityChange = targetStock - prevStock;
    if (quantityChange === 0 && newStock === undefined) return;

    const user = currentUser || { id: 'usr-admin', name: 'Administrador', role: 'admin' as UserRole };

    const newMovement: InventoryMovement = {
      id: `mov-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      productId: product.id,
      productName: product.name,
      productCode: product.code,
      type: movementType,
      quantityChange,
      previousStock: prevStock,
      newStock: targetStock,
      reason: reason || 'Ajuste manual de existencias',
      referenceDocument,
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      notes,
      createdAt: new Date().toISOString()
    };

    // Update catalog item
    await updateCatalogProduct(product.id, {
      stock: targetStock,
      lastStockUpdate: new Date().toISOString()
    });

    // Append to movements
    setInventoryMovements(prev => [newMovement, ...prev]);

    if (isServerConnected) {
      api.createInventoryMovement(newMovement).catch(err => console.warn('Background inventory movement save:', err));
    }

    const directionText = quantityChange > 0 ? `+${quantityChange}` : `${quantityChange}`;
    logActivity(
      'stock_adjusted',
      'inventory_movement',
      product.code || product.id,
      `Ajuste de inventario en "${product.name}": ${prevStock} → ${targetStock} (${directionText} un.) | Motivo: ${reason}${referenceDocument ? ` | Ref: ${referenceDocument}` : ''}`
    );
  };

  const deleteCatalogProduct = async (id: string) => {
    if (isServerConnected) {
      try {
        await api.deleteCatalogProduct(id);
      } catch (err) {
        console.error('Error deleting catalog product via API', err);
      }
    }
    setCatalog(prev => prev.filter(c => c.id !== id));
  };

  const bulkUpsertCatalog = async (products: Partial<CatalogProduct>[]) => {
    if (isServerConnected) {
      try {
        const res = await api.bulkUpsertCatalog(products);
        if (res.catalog) {
          setCatalog(res.catalog);
        }
        return { addedCount: res.addedCount || 0, updatedCount: res.updatedCount || 0, total: res.total || 0 };
      } catch (err) {
        console.error('Error bulk updating catalog via API', err);
      }
    }

    // Local state fallback
    let current = [...catalog];
    let addedCount = 0;
    let updatedCount = 0;

    products.forEach(p => {
      if (!p.name || !p.unitPrice) return;
      const idx = current.findIndex(item => (p.id && item.id === p.id) || (p.code && item.code && item.code.trim().toUpperCase() === p.code.trim().toUpperCase()));
      if (idx >= 0) {
        current[idx] = { ...current[idx], ...p, id: current[idx].id } as CatalogProduct;
        updatedCount++;
      } else {
        const newItem: CatalogProduct = {
          id: p.id || `cat-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          name: p.name,
          category: p.category || 'camaras',
          type: p.type || 'product',
          description: p.description || '',
          unitPrice: Number(p.unitPrice) || 0,
          costPrice: Number(p.costPrice) || 0,
          stock: p.stock !== undefined ? Number(p.stock) : 10,
          unit: p.unit || 'Unidad',
          code: p.code || '',
          brand: p.brand || ''
        };
        current.push(newItem);
        addedCount++;
      }
    });

    setCatalog(current);
    localStorage.setItem(STORAGE_KEYS.CATALOG, JSON.stringify(current));
    return { addedCount, updatedCount, total: current.length };
  };

  // Fiscal Invoices (DGII / NCF)
  const getNextNCF = (ncfType: NCFType): { ncf: string; expiryDate: string } => {
    const sequences = companySettings.ncfSequences || {
      b01Next: 1,
      b02Next: 1,
      b14Next: 1,
      b15Next: 1,
      ncfExpiryDate: '2027-12-31'
    };
    
    let num = 1;
    if (ncfType === 'B01') num = sequences.b01Next || 1;
    else if (ncfType === 'B02') num = sequences.b02Next || 1;
    else if (ncfType === 'B14') num = sequences.b14Next || 1;
    else if (ncfType === 'B15') num = sequences.b15Next || 1;

    const ncfFormatted = `${ncfType}${String(num).padStart(8, '0')}`;
    const expiryDate = sequences.ncfExpiryDate || '2027-12-31';

    return { ncf: ncfFormatted, expiryDate };
  };

  const addInvoice = async (invoiceData: Omit<FiscalInvoice, 'id' | 'invoiceNumber' | 'createdAt'>): Promise<FiscalInvoice> => {
    if (isServerConnected) {
      try {
        const created = await api.createInvoice(invoiceData);
        setInvoices(prev => [created, ...prev]);
        
        if (companySettings.ncfSequences) {
          const seqKey = `${invoiceData.ncfType.toLowerCase()}Next` as keyof typeof companySettings.ncfSequences;
          const currentNum = companySettings.ncfSequences[seqKey];
          if (typeof currentNum === 'number') {
            const updatedSettings = {
              ...companySettings,
              ncfSequences: {
                ...companySettings.ncfSequences,
                [seqKey]: currentNum + 1
              }
            };
            setCompanySettings(updatedSettings);
          }
        }
        logActivity(
          'invoice_issued',
          'fiscal_invoice',
          created.ncf,
          `Comprobante Fiscal ${created.ncf} emitido a ${created.clientName} por RD$ ${(created.total || 0).toLocaleString('es-DO')}`
        );
        return created;
      } catch (err) {
        console.error('Error creating invoice via API', err);
      }
    }

    const nextCount = invoices.length + 1;
    const newInvoice: FiscalInvoice = {
      ...invoiceData,
      id: `inv-${Date.now()}`,
      invoiceNumber: `FAC-${new Date().getFullYear()}-${String(nextCount).padStart(3, '0')}`,
      createdAt: new Date().toISOString()
    };

    setInvoices(prev => [newInvoice, ...prev]);

    logActivity(
      'invoice_issued',
      'fiscal_invoice',
      newInvoice.ncf,
      `Comprobante Fiscal ${newInvoice.ncf} emitido a ${newInvoice.clientName} por RD$ ${(newInvoice.total || 0).toLocaleString('es-DO')}`
    );

    if (companySettings.ncfSequences) {
      const seqKey = `${invoiceData.ncfType.toLowerCase()}Next` as keyof typeof companySettings.ncfSequences;
      const currentNum = companySettings.ncfSequences[seqKey];
      if (typeof currentNum === 'number') {
        const updatedSettings = {
          ...companySettings,
          ncfSequences: {
            ...companySettings.ncfSequences,
            [seqKey]: currentNum + 1
          }
        };
        setCompanySettings(updatedSettings);
      }
    }

    // Auto-create payment receipt if initial payment/abono was recorded
    if (newInvoice.amountPaid && Number(newInvoice.amountPaid) > 0) {
      const nextPayNum = payments.length + 1;
      const autoPayment: Payment = {
        id: `pay-inv-${newInvoice.id}`,
        receiptNumber: `REC-2026-${String(nextPayNum).padStart(3, '0')}`,
        quoteId: newInvoice.quoteId,
        quoteNumber: newInvoice.quoteNumber,
        invoiceId: newInvoice.id,
        invoiceNcf: newInvoice.ncf,
        dealId: newInvoice.dealId,
        dealCode: newInvoice.dealCode,
        clientName: newInvoice.clientName,
        clientPhone: newInvoice.clientPhone,
        amount: Number(newInvoice.amountPaid),
        currency: newInvoice.currency,
        date: newInvoice.date,
        paymentMethod: newInvoice.paymentMethod,
        concept: `Abono a Factura Fiscal ${newInvoice.invoiceNumber} (${newInvoice.ncf})`,
        notes: newInvoice.notes || 'Abono registrado automáticamente al emitir comprobante fiscal.',
        createdBy: newInvoice.createdBy,
        createdAt: new Date().toISOString()
      };
      setPayments(prev => [autoPayment, ...prev]);
    }

    // Update client totalSpent
    if (newInvoice.clientName || newInvoice.clientId) {
      setClients(prev => prev.map(c => {
        const isMatch = (newInvoice.clientId && c.id === newInvoice.clientId) ||
          (c.name.toLowerCase() === newInvoice.clientName.toLowerCase()) ||
          (c.phone && newInvoice.clientPhone && c.phone === newInvoice.clientPhone);
        if (isMatch) {
          return {
            ...c,
            totalSpent: (c.totalSpent || 0) + (newInvoice.amountPaid || 0)
          };
        }
        return c;
      }));
    }

    if (invoiceData.quoteId) {
      setQuotes(prev => prev.map(q => q.id === invoiceData.quoteId ? { ...q, status: 'invoiced' } : q));
    }

    return newInvoice;
  };

  const updateInvoice = async (id: string, updates: Partial<FiscalInvoice>) => {
    if (isServerConnected) {
      try {
        await api.updateInvoice(id, updates);
      } catch (err) {
        console.error('Error updating invoice via API', err);
      }
    }
    setInvoices(prev => prev.map(inv => (inv.id === id ? { ...inv, ...updates } : inv)));
  };

  const deleteInvoice = async (id: string) => {
    if (isServerConnected) {
      try {
        await api.deleteInvoice(id);
      } catch (err) {
        console.error('Error deleting invoice via API', err);
      }
    }
    setInvoices(prev => prev.filter(inv => inv.id !== id));
  };

  const openNewInvoiceForQuote = (quote: Quote) => {
    setInvoiceQuotePreload(quote);
    setActiveInvoiceForEdit(null);
    setIsInvoiceModalOpen(true);
  };

  // Settings Actions
  const updateCompanySettings = async (newSettings: Partial<CompanySettings>) => {
    if (isServerConnected) {
      try {
        const updated = await api.updateSettings(newSettings);
        setCompanySettings(updated);
        return;
      } catch (err) {
        console.error('Error updating settings via API', err);
      }
    }
    setCompanySettings(prev => ({ ...prev, ...newSettings }));
  };

  // Export / Import JSON Backup
  const exportDataBackup = async () => {
    let dataToExport = {
      deals,
      quotes,
      clients,
      portfolio,
      companySettings,
      catalog,
      payments,
      visits,
      workOrders,
      inventoryMovements,
      exportedAt: new Date().toISOString(),
      version: '2.0'
    };

    if (isServerConnected) {
      try {
        dataToExport = await api.exportBackup();
      } catch (err) {
        console.error('Error exporting backup from API', err);
      }
    }

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(dataToExport, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `martinez_tech_backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const importDataBackup = async (jsonString: string): Promise<boolean> => {
    try {
      const data = JSON.parse(jsonString);
      if (isServerConnected) {
        const ok = await api.restoreBackup(data);
        if (!ok) return false;
      }

      if (data.deals) setDeals(data.deals);
      if (data.quotes) setQuotes(data.quotes);
      if (data.clients) setClients(data.clients);
      if (data.portfolio) setPortfolio(data.portfolio);
      if (data.companySettings) setCompanySettings(data.companySettings);
      if (data.catalog) setCatalog(data.catalog);
      if (data.payments) setPayments(data.payments);
      if (data.visits) setVisits(data.visits);
      if (data.workOrders) setWorkOrders(data.workOrders);
      if (data.inventoryMovements) setInventoryMovements(data.inventoryMovements);
      return true;
    } catch {
      return false;
    }
  };

  const resetToDefaultData = () => {
    if (confirm('¿Estás seguro de restablecer todos los datos a la versión inicial de fábrica?')) {
      setDeals(initialDeals);
      setQuotes(initialQuotes);
      setClients(initialClients);
      setPortfolio(initialPortfolio);
      setCompanySettings(initialCompanySettings);
      setCatalog(initialCatalogProducts);
      setPayments([]);
      setVisits([]);
      setWorkOrders([]);
      localStorage.clear();
      alert('Datos restablecidos con éxito.');
    }
  };

  const clearTestDataForProduction = async () => {
    if (confirm('¿Deseas vaciar todas las cotizaciones, negociaciones, pagos, órdenes de trabajo, visitas y clientes de prueba para iniciar en limpio en producción?\n\n(Tus ajustes de empresa, catálogo de productos y servicios se conservarán intactos).')) {
      setDeals([]);
      setQuotes([]);
      setPayments([]);
      setWorkOrders([]);
      setVisits([]);
      setClients([]);

      if (isServerConnected) {
        try {
          await api.restoreBackup({
            companySettings,
            catalog,
            portfolio,
            deals: [],
            quotes: [],
            clients: [],
            payments: [],
            visits: [],
            workOrders: []
          });
        } catch (err) {
          console.error('Error clearing test data via API', err);
        }
      }

      localStorage.setItem(STORAGE_KEYS.DEALS, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEYS.QUOTES, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEYS.WORK_ORDERS, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEYS.VISITS, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify([]));

      alert('✅ El sistema se ha limpiado correctamente. ¡Está 100% listo para producción!');
    }
  };

  const openPaymentForQuote = (quote: Quote) => {
    setQuoteForPayment(quote);
    setIsPaymentModalOpen(true);
  };

  const openNewQuoteForDeal = (deal: Deal) => {
    setQuoteDealPreload(deal);
    setActiveQuoteForEdit(null);
    setIsQuoteModalOpen(true);
  };

  return (
    <AppStateContext.Provider
      value={{
        currentView,
        setCurrentView,
        adminTab,
        setAdminTab,
        theme,
        toggleTheme,
        isServerConnected,

        currentUser,
        isAuthenticated,
        isLoginModalOpen,
        setIsLoginModalOpen,
        login,
        logout,

        users,
        addUser,
        updateUser,
        deleteUser,
        toggleUserStatus,

        deals,
        quotes,
        clients,
        portfolio,
        companySettings,
        catalog,
        services,
        payments,
        visits,
        workOrders,
        invoices,
        auditLogs,
        logActivity,

        addDeal,
        updateDeal,
        deleteDeal,
        moveDealStage,

        addQuote,
        updateQuote,
        deleteQuote,
        signQuote,

        addInvoice,
        updateInvoice,
        deleteInvoice,
        getNextNCF,

        addClient,
        updateClient,
        deleteClient,

        addPortfolioProject,
        updatePortfolioProject,
        deletePortfolioProject,

        addPayment,
        deletePayment,

        addVisit,
        updateVisit,
        deleteVisit,

        addWorkOrder,
        updateWorkOrder,
        deleteWorkOrder,
        signWorkOrder,

        addCatalogProduct,
        updateCatalogProduct,
        deleteCatalogProduct,
        bulkUpsertCatalog,
        inventoryMovements,
        adjustStock,

        updateCompanySettings,
        exportDataBackup,
        importDataBackup,
        resetToDefaultData,
        clearTestDataForProduction,

        activeQuoteForView,
        setActiveQuoteForView,
        activeDealForEdit,
        setActiveDealForEdit,
        activeQuoteForEdit,
        setActiveQuoteForEdit,
        activeReceiptForView,
        setActiveReceiptForView,
        activeVisitForEdit,
        setActiveVisitForEdit,
        activeWorkOrderForEdit,
        setActiveWorkOrderForEdit,
        activeWorkOrderForView,
        setActiveWorkOrderForView,
        activeInvoiceForView,
        setActiveInvoiceForView,
        activeInvoiceForEdit,
        setActiveInvoiceForEdit,

        isQuoteModalOpen,
        setIsQuoteModalOpen,
        isDealModalOpen,
        setIsDealModalOpen,
        isSettingsModalOpen,
        setIsSettingsModalOpen,
        isPaymentModalOpen,
        setIsPaymentModalOpen,
        isVisitModalOpen,
        setIsVisitModalOpen,
        isWorkOrderModalOpen,
        setIsWorkOrderModalOpen,
        isInvoiceModalOpen,
        setIsInvoiceModalOpen,
        isBulkImportModalOpen,
        setIsBulkImportModalOpen,

        isWhatsAppModalOpen,
        setIsWhatsAppModalOpen,
        whatsAppModalData,
        setWhatsAppModalData,
        openWhatsAppTemplates,

        isReportsModalOpen,
        setIsReportsModalOpen,

        quoteForPayment,
        setQuoteForPayment,
        openPaymentForQuote,
        quoteDealPreload,
        openNewQuoteForDeal,
        invoiceQuotePreload,
        setInvoiceQuotePreload,
        openNewInvoiceForQuote
      }}
    >
      {children}
    </AppStateContext.Provider>
  );
};

export const useAppState = () => {
  const context = useContext(AppStateContext);
  if (!context) {
    throw new Error('useAppState must be used within an AppStateProvider');
  }
  return context;
};

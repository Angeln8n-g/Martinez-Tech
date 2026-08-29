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
  WorkOrder
} from '../types';
import { 
  initialCompanySettings, 
  initialServices, 
  initialPortfolio, 
  initialClients, 
  initialDeals, 
  initialQuotes 
} from '../data/initialData';
import { initialCatalogProducts } from '../data/catalogItems';
import { api } from '../services/api';

export type AdminTab = 
  | 'dashboard' 
  | 'pipeline' 
  | 'quotes' 
  | 'payments' 
  | 'work_orders'
  | 'calendar' 
  | 'catalog' 
  | 'clients' 
  | 'portfolio' 
  | 'settings';

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

  // Settings Actions
  updateCompanySettings: (newSettings: Partial<CompanySettings>) => Promise<void>;

  // System & Backup
  exportDataBackup: () => void;
  importDataBackup: (jsonString: string) => Promise<boolean>;
  resetToDefaultData: () => void;

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
}

const AppStateContext = createContext<AppStateContextType | undefined>(undefined);

const STORAGE_KEYS = {
  THEME: 'mt_theme_mode',
  USER: 'mt_current_user',
  TOKEN: 'mt_auth_token',
  DEALS: 'mt_deals_v1',
  QUOTES: 'mt_quotes_v1',
  CLIENTS: 'mt_clients_v1',
  PORTFOLIO: 'mt_portfolio_v1',
  SETTINGS: 'mt_settings_v1',
  CATALOG: 'mt_catalog_v1',
  PAYMENTS: 'mt_payments_v1',
  VISITS: 'mt_visits_v1',
  WORK_ORDERS: 'mt_work_orders_v1'
};

export const AppStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentView, setCurrentView] = useState<'public' | 'admin'>('public');
  const [adminTab, setAdminTab] = useState<AdminTab>('dashboard');
  const [isServerConnected, setIsServerConnected] = useState<boolean>(false);

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
        setCurrentView('admin');
        return { success: true };
      } else {
        if (
          (email.toLowerCase() === 'admin@martineztech.com' && password === 'admin123') ||
          (email.toLowerCase() === 'admin' && password === 'admin')
        ) {
          const user: User = {
            id: 'usr-01',
            name: 'Rafael Martínez',
            email: 'admin@martineztech.com',
            role: 'admin',
            phone: '(809) 555-0199',
            avatar: 'RM'
          };
          setCurrentUser(user);
          localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
          setIsLoginModalOpen(false);
          setCurrentView('admin');
          return { success: true };
        } else if (
          (email.toLowerCase() === 'tecnico@martineztech.com' && password === 'tecnico123') ||
          (email.toLowerCase() === 'tecnico' && password === 'tecnico')
        ) {
          const user: User = {
            id: 'usr-02',
            name: 'Manuel Gómez',
            email: 'tecnico@martineztech.com',
            role: 'technician',
            phone: '(809) 555-0188',
            avatar: 'MG'
          };
          setCurrentUser(user);
          localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
          setIsLoginModalOpen(false);
          setCurrentView('admin');
          return { success: true };
        }
        return { success: false, error: 'Credenciales inválidas. Ingrese con admin@martineztech.com / admin123' };
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
        address: 'Residencial Las Palmas Real, Bella Vista',
        date: new Date().toISOString().slice(0, 10),
        time: '10:00 AM',
        type: 'levantamiento',
        assignedTechnician: 'Rafael Martínez',
        status: 'scheduled',
        serviceCategory: 'camaras',
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

  const [services] = useState<ServiceItem[]>(initialServices);

  // Modals & Active State
  const [activeQuoteForView, setActiveQuoteForView] = useState<Quote | null>(null);
  const [activeDealForEdit, setActiveDealForEdit] = useState<Deal | null>(null);
  const [activeQuoteForEdit, setActiveQuoteForEdit] = useState<Quote | null>(null);
  const [activeReceiptForView, setActiveReceiptForView] = useState<Payment | null>(null);
  const [activeVisitForEdit, setActiveVisitForEdit] = useState<TechnicalVisit | null>(null);
  const [activeWorkOrderForEdit, setActiveWorkOrderForEdit] = useState<WorkOrder | null>(null);
  const [activeWorkOrderForView, setActiveWorkOrderForView] = useState<WorkOrder | null>(null);

  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [isDealModalOpen, setIsDealModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isVisitModalOpen, setIsVisitModalOpen] = useState(false);
  const [isWorkOrderModalOpen, setIsWorkOrderModalOpen] = useState(false);
  
  // WhatsApp Smart Messaging
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);
  const [whatsAppModalData, setWhatsAppModalData] = useState<WhatsAppModalPayload | null>(null);

  // Financial Reports
  const [isReportsModalOpen, setIsReportsModalOpen] = useState(false);

  const [quoteForPayment, setQuoteForPayment] = useState<Quote | null>(null);
  const [quoteDealPreload, setQuoteDealPreload] = useState<Deal | null>(null);

  // Connect to Backend API
  useEffect(() => {
    const initBackend = async () => {
      try {
        const isHealthy = await api.checkHealth();
        if (isHealthy) {
          setIsServerConnected(true);
          const data = await api.getBootstrapData();
          if (data.deals?.length) setDeals(data.deals);
          if (data.quotes?.length) setQuotes(data.quotes);
          if (data.clients?.length) setClients(data.clients);
          if (data.portfolio?.length) setPortfolio(data.portfolio);
          if (data.catalog?.length) setCatalog(data.catalog);
          if (data.payments?.length) setPayments(data.payments);
          if (data.visits?.length) setVisits(data.visits);
          if (data.workOrders?.length) setWorkOrders(data.workOrders);
          if (data.companySettings && Object.keys(data.companySettings).length > 0) {
            setCompanySettings(prev => ({ ...prev, ...data.companySettings }));
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
    localStorage.setItem(STORAGE_KEYS.DEALS, JSON.stringify(deals));
    localStorage.setItem(STORAGE_KEYS.QUOTES, JSON.stringify(quotes));
    localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(clients));
    localStorage.setItem(STORAGE_KEYS.PORTFOLIO, JSON.stringify(portfolio));
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(companySettings));
    localStorage.setItem(STORAGE_KEYS.CATALOG, JSON.stringify(catalog));
    localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(payments));
    localStorage.setItem(STORAGE_KEYS.VISITS, JSON.stringify(visits));
    localStorage.setItem(STORAGE_KEYS.WORK_ORDERS, JSON.stringify(workOrders));
  }, [deals, quotes, clients, portfolio, companySettings, catalog, payments, visits, workOrders]);

  // Open WhatsApp Templates Helper
  const openWhatsAppTemplates = (templateType: WhatsAppTemplateType, data?: Partial<WhatsAppModalPayload>) => {
    setWhatsAppModalData({
      templateType,
      ...data
    });
    setIsWhatsAppModalOpen(true);
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
    }
  };

  // Catalog Actions
  const addCatalogProduct = async (productData: Omit<CatalogProduct, 'id'>) => {
    if (isServerConnected) {
      try {
        const created = await api.createCatalogProduct(productData);
        setCatalog(prev => [created, ...prev]);
        return;
      } catch (err) {
        console.error('Error creating catalog product via API', err);
      }
    }

    const newItem: CatalogProduct = {
      ...productData,
      id: `cat-${Date.now()}`
    };
    setCatalog(prev => [newItem, ...prev]);
  };

  const updateCatalogProduct = async (id: string, updates: Partial<CatalogProduct>) => {
    if (isServerConnected) {
      try {
        await api.updateCatalogProduct(id, updates);
      } catch (err) {
        console.error('Error updating catalog product via API', err);
      }
    }
    setCatalog(prev => prev.map(c => (c.id === id ? { ...c, ...updates } : c)));
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

        addDeal,
        updateDeal,
        deleteDeal,
        moveDealStage,

        addQuote,
        updateQuote,
        deleteQuote,
        signQuote,

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

        updateCompanySettings,
        exportDataBackup,
        importDataBackup,
        resetToDefaultData,

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
        openNewQuoteForDeal
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

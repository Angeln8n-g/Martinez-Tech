export type ServiceCategory = 
  | 'camaras'
  | 'redes'
  | 'motores'
  | 'cerraduras'
  | 'acceso'
  | 'ponchadores'
  | 'alarmas'
  | 'intercom'
  | 'otros';

export interface ServiceItem {
  id: string;
  category: ServiceCategory;
  title: string;
  shortDescription: string;
  fullDescription: string;
  features: string[];
  benefits: string[];
  iconName: string;
  imageUrl: string;
  estimatedStartingPrice?: number;
  popular?: boolean;
}

export interface PortfolioProject {
  id: string;
  title: string;
  category: ServiceCategory;
  client: string;
  location: string;
  date: string;
  description: string;
  images: string[];
  equipmentInstalled: string[];
  testimonial?: {
    author: string;
    role: string;
    text: string;
    rating: number;
  };
  featured?: boolean;
}

export type DealStage = 
  | 'prospect'       // 1. Prospecto Nuevo
  | 'site_visit'     // 2. Levantamiento / Visita Técnica
  | 'quoted'         // 3. Presupuesto Elaborado / Enviado
  | 'negotiation'    // 4. En Negociación / Ajustes
  | 'won'            // 5. Aprobado / Ganado
  | 'installation'   // 6. En Ejecución / Instalación
  | 'completed'      // 7. Finalizado y Cobrado
  | 'lost';          // 8. Cancelado / Perdido

export type PriorityLevel = 'low' | 'medium' | 'high';
export type ClientType = 'residential' | 'commercial' | 'industrial' | 'building';

export interface Deal {
  id: string;
  code: string;
  title: string;
  clientId?: string;
  clientName: string;
  clientPhone: string;
  clientEmail?: string;
  clientAddress?: string;
  clientType: ClientType;
  stage: DealStage;
  priority: PriorityLevel;
  estimatedValue: number;
  assignedTechnician?: string;
  serviceCategory: ServiceCategory;
  notes: string;
  quoteId?: string;
  createdAt: string;
  updatedAt: string;
  scheduledVisitDate?: string;
  expectedCloseDate?: string;
  source?: string;
}

export interface QuoteItem {
  id: string;
  productId?: string;
  type: 'product' | 'service' | 'labor' | 'material';
  name: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  costPrice?: number;
  total: number;
}

export type QuoteStatus = 'draft' | 'sent' | 'accepted' | 'rejected' | 'invoiced';

export interface Quote {
  id: string;
  quoteNumber: string;
  dealId?: string;
  clientId?: string;
  clientName: string;
  clientCompany?: string;
  clientPhone: string;
  clientEmail?: string;
  clientRnc?: string;
  clientAddress: string;
  date: string;
  validUntil: string;
  items: QuoteItem[];
  subtotal: number;
  discountPercent: number;
  discountAmount: number;
  applyTax: boolean;
  taxPercent: number;
  taxAmount: number;
  total: number;
  currency: 'DOP' | 'USD';
  terms: string[];
  warrantyNotes: string;
  paymentTerms: string;
  deliveryTime: string;
  notes?: string;
  status: QuoteStatus;
  clientSignature?: string;
  signedAt?: string;
  signedBy?: string;
  signedIp?: string;
  createdBy: string;
  createdAt: string;
}

export interface Client {
  id: string;
  name: string;
  company?: string;
  phone: string;
  email?: string;
  rnc?: string;
  address: string;
  city: string;
  type: ClientType;
  notes?: string;
  totalDeals: number;
  totalSpent: number;
  createdAt: string;
}

export interface SocialLinks {
  instagram?: string;
  facebook?: string;
  tiktok?: string;
  linkedin?: string;
  youtube?: string;
}

export interface NCFSequences {
  b01Next: number; // Crédito Fiscal (B0100000001)
  b02Next: number; // Consumo Final (B0200000001)
  b14Next: number; // Régimen Especial (B1400000001)
  b15Next: number; // Gubernamental (B1500000001)
  ncfExpiryDate?: string;
}

export interface CompanySettings {
  name: string;
  legalName: string;
  slogan: string;
  rnc: string;
  phone: string;
  whatsapp: string;
  email: string;
  website: string;
  address: string;
  city: string;
  bankAccounts: {
    bank: string;
    accountNumber: string;
    accountType: string;
    holder: string;
  }[];
  defaultTaxPercent: number;
  defaultCurrency: 'DOP' | 'USD';
  defaultWarranty: string;
  defaultTerms: string;
  logoUrl: string;
  socialLinks?: SocialLinks;
  ncfSequences?: NCFSequences;
}

export type NCFType = 'B01' | 'B02' | 'B14' | 'B15';

export type InvoicePaymentStatus = 'paid' | 'partial' | 'pending' | 'cancelled';

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  taxPercent: number; // standard 18%
  taxAmount: number;
  total: number;
}

export interface FiscalInvoice {
  id: string;
  invoiceNumber: string; // e.g. FAC-2026-001
  ncf: string;           // e.g. B0100000001
  ncfType: NCFType;
  ncfTypeName: string;   // Factura para Crédito Fiscal
  ncfExpiryDate: string;
  quoteId?: string;
  quoteNumber?: string;
  dealId?: string;
  dealCode?: string;
  clientId?: string;
  clientName: string;
  clientRnc: string;
  clientPhone?: string;
  clientAddress?: string;
  date: string;
  dueDate: string;
  items: InvoiceItem[];
  subtotal: number;
  discountPercent: number;
  discountAmount: number;
  taxPercent: number;
  taxAmount: number;
  total: number;
  currency: 'DOP' | 'USD';
  paymentStatus: InvoicePaymentStatus;
  paymentMethod: PaymentMethod;
  amountPaid: number;
  balanceDue: number;
  notes?: string;
  createdBy: string;
  createdAt: string;
}

export interface CatalogProduct {
  id: string;
  code?: string;
  name: string;
  brand?: string;
  category: ServiceCategory;
  type: 'product' | 'service' | 'labor' | 'material';
  description: string;
  unitPrice: number;
  costPrice?: number;
  stock?: number;
  minStock?: number;
  location?: string;
  lastStockUpdate?: string;
  barcode?: string;
  unit: string;
}

export type InventoryMovementType = 
  | 'initial'           // Stock inicial / Alta de producto
  | 'purchase_entry'    // Entrada por compra / Reabastecimiento
  | 'manual_adjustment' // Ajuste por conteo físico o corrección manual
  | 'sale_deduction'    // Salida por cotización / venta aceptada
  | 'damage_loss'       // Salida por avería, merma o daño físico
  | 'return'            // Devolución (de cliente o a proveedor)
  | 'work_order_use';   // Consumo en orden de trabajo / instalación

export interface InventoryMovement {
  id: string;
  productId: string;
  productName: string;
  productCode?: string;
  type: InventoryMovementType;
  quantityChange: number; // Positivo (+) para entradas, Negativo (-) para salidas
  previousStock: number;
  newStock: number;
  reason: string;
  referenceDocument?: string; // e.g. COT-2026-001, FACT-102, AJUSTE-01
  userId?: string;
  userName: string;
  userRole: UserRole;
  notes?: string;
  createdAt: string;
}

export type UserRole = 'admin' | 'technician' | 'seller';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  avatar?: string;
  password?: string;
  active?: boolean;
  createdAt?: string;
  lastLogin?: string;
}

export interface AuditLog {
  id: string;
  userId?: string;
  userName: string;
  userRole: UserRole;
  action: string;
  entityType: string;
  entityId?: string;
  details: string;
  createdAt: string;
}

export type PaymentMethod = 'transferencia' | 'efectivo' | 'tarjeta' | 'cheque';

export interface Payment {
  id: string;
  receiptNumber: string;
  quoteId?: string;
  quoteNumber?: string;
  dealId?: string;
  dealCode?: string;
  clientName: string;
  clientPhone?: string;
  amount: number;
  currency: 'DOP' | 'USD';
  date: string;
  paymentMethod: PaymentMethod;
  bankName?: string;
  referenceNumber?: string;
  concept: string;
  notes?: string;
  createdBy: string;
  createdAt: string;
}

export type VisitType = 'levantamiento' | 'instalacion' | 'mantenimiento' | 'soporte';
export type VisitStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled';

export interface TechnicalVisit {
  id: string;
  dealId?: string;
  dealCode?: string;
  title: string;
  clientName: string;
  clientPhone: string;
  address: string;
  date: string;
  time: string;
  type: VisitType;
  assignedTechnician: string;
  status: VisitStatus;
  notes?: string;
  serviceCategory?: ServiceCategory;
  createdAt: string;
}

export type WorkOrderStatus = 'pending' | 'in_progress' | 'completed' | 'signed';

export interface WorkOrderChecklistItem {
  id: string;
  task: string;
  completed: boolean;
}

export interface WorkOrder {
  id: string;
  orderNumber: string;
  dealId?: string;
  dealCode?: string;
  quoteId?: string;
  quoteNumber?: string;
  clientName: string;
  clientPhone: string;
  clientAddress: string;
  serviceCategory: ServiceCategory;
  assignedTechnician: string;
  scheduledDate: string;
  completedDate?: string;
  status: WorkOrderStatus;
  scopeOfWork: string;
  checklist: WorkOrderChecklistItem[];
  beforeImages: string[];
  afterImages: string[];
  technicianNotes?: string;
  clientSignature?: string;
  clientFeedback?: string;
  signedAt?: string;
  signedByName?: string;
  createdBy: string;
  createdAt: string;
}

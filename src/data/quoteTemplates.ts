import { QuoteItem, ServiceCategory } from '../types';

export interface QuoteTemplate {
  id: string;
  name: string;
  category: ServiceCategory;
  description: string;
  badge?: string;
  isCustom?: boolean;
  createdAt?: string;
  items: Array<{
    productId?: string;
    type: 'product' | 'service' | 'labor' | 'material';
    name: string;
    description?: string;
    quantity: number;
    unitPrice: number;
    costPrice?: number;
  }>;
}

export const DEFAULT_QUOTE_TEMPLATES: QuoteTemplate[] = [
  {
    id: 'tpl-cctv-4cam',
    name: 'Kit CCTV 4 Cámaras IP Full HD ColorVu',
    category: 'camaras',
    description: 'Sistema completo de videovigilancia IP 24/7 a color con audio, NVR de 8 canales, disco de 2TB e instalación profesional.',
    badge: 'Más Cotizado',
    items: [
      {
        productId: 'prod-cam-01',
        type: 'product',
        name: 'Cámara IP Domo 4MP ColorVu / Visión Nocturna',
        description: 'Cámara tipo domo antivandálica con luz cálida y micrófono integrado.',
        quantity: 2,
        unitPrice: 3800,
        costPrice: 2450
      },
      {
        productId: 'prod-cam-02',
        type: 'product',
        name: 'Cámara Bullet IP 5MP Exterior PoE',
        description: 'Cámara bala metálica IP67 con detección de personas y vehículos.',
        quantity: 2,
        unitPrice: 4600,
        costPrice: 2980
      },
      {
        productId: 'prod-cam-03',
        type: 'product',
        name: 'NVR 8 Canales 4K con Switch PoE Integrado',
        description: 'Grabador IP con puertos PoE independientes y acceso remoto vía App móvil.',
        quantity: 1,
        unitPrice: 11500,
        costPrice: 7600
      },
      {
        productId: 'prod-cam-04',
        type: 'product',
        name: 'Disco Duro Especializado 2TB Surveillance',
        description: 'Almacenamiento grado videovigilancia para grabación continua 24/7.',
        quantity: 1,
        unitPrice: 5200,
        costPrice: 3600
      },
      {
        productId: 'prod-red-01',
        type: 'material',
        name: 'Bobina de Cable UTP Cat6 100% Cobre',
        description: 'Cable de red para alta velocidad y alimentación PoE.',
        quantity: 1,
        unitPrice: 8500,
        costPrice: 5800
      },
      {
        type: 'material',
        name: 'Accesorios de Montaje y Cajas de Paso Estancas',
        description: 'Cajas octogonales/cuadradas IP65, conectores RJ45 blindados y tornillería.',
        quantity: 4,
        unitPrice: 450,
        costPrice: 220
      },
      {
        type: 'labor',
        name: 'Instalación, Cableado y Puesta en Marcha CCTV (4 Puntos)',
        description: 'Tendido de cableado, fijación, ponchado, direccionamiento IP y configuración en celulares.',
        quantity: 1,
        unitPrice: 8500,
        costPrice: 3500
      }
    ]
  },
  {
    id: 'tpl-cctv-8cam',
    name: 'Kit CCTV 8 Cámaras 4K Empresarial',
    category: 'camaras',
    description: 'Solución corporativa de alta definición 4K con NVR de 16 canales, disco de 4TB, gabinete rack y respaldo energético.',
    badge: 'Empresarial',
    items: [
      {
        productId: 'prod-cam-02',
        type: 'product',
        name: 'Cámara Bullet IP 5MP Exterior PoE',
        description: 'Cámara bala metálica con protección IP67 y analítica de cruce de línea.',
        quantity: 6,
        unitPrice: 4600,
        costPrice: 2980
      },
      {
        productId: 'prod-cam-05',
        type: 'product',
        name: 'Cámara PTZ 360° con Zoom Óptico 25X y Seguimiento Inteligente',
        description: 'Cámara motorizada para cobertura perimetral amplia.',
        quantity: 2,
        unitPrice: 28500,
        costPrice: 19800
      },
      {
        type: 'product',
        name: 'NVR 16 Canales 4K con 16 Puertos PoE',
        description: 'Grabador profesional con redundancia y salida HDMI 4K independiente.',
        quantity: 1,
        unitPrice: 19500,
        costPrice: 13200
      },
      {
        type: 'product',
        name: 'Disco Duro Especializado 4TB Surveillance',
        description: 'Capacidad extendida para grabación ininterrumpida de 8 cámaras en alta resolución.',
        quantity: 1,
        unitPrice: 8900,
        costPrice: 6100
      },
      {
        productId: 'prod-red-01',
        type: 'material',
        name: 'Bobina de Cable UTP Cat6 100% Cobre',
        description: 'Cable de red puro cobre categoría 6.',
        quantity: 2,
        unitPrice: 8500,
        costPrice: 5800
      },
      {
        type: 'product',
        name: 'Gabinete Rack de Pared 6U con PDU y Ventilación',
        description: 'Armario metálico con llave de seguridad para resguardo del NVR y switches.',
        quantity: 1,
        unitPrice: 7500,
        costPrice: 4800
      },
      {
        type: 'labor',
        name: 'Instalación Integral, Certificación de Puntos y Configuración CCTV (8 Puntos)',
        description: 'Montaje en altura, cableado estructurado perimetral, configuración NVR y capacitación técnica.',
        quantity: 1,
        unitPrice: 16500,
        costPrice: 7000
      }
    ]
  },
  {
    id: 'tpl-acceso-puerta',
    name: 'Control de Acceso Biométrico / Puerta Principal',
    category: 'acceso',
    description: 'Sistema autónomo de acceso seguro con cerradura magnética de 600lbs, lector biométrico y botón de salida sin contacto.',
    badge: 'Seguridad',
    items: [
      {
        type: 'product',
        name: 'Cerradura Electromagnética 600 lbs con Sensor de Estado',
        description: 'Electroimán de alta retención para puertas de vidrio, aluminio o madera.',
        quantity: 1,
        unitPrice: 4200,
        costPrice: 2600
      },
      {
        type: 'material',
        name: 'Soporte ZL Universal para Cerradura Magnética',
        description: 'Herraje de fijación ajustable para aperturas hacia adentro o afuera.',
        quantity: 1,
        unitPrice: 1850,
        costPrice: 1100
      },
      {
        type: 'product',
        name: 'Terminal de Control de Acceso Biométrico y Tarjetas RFID',
        description: 'Lector autónomo con capacidad de 1,000 huellas y software de reportería.',
        quantity: 1,
        unitPrice: 8900,
        costPrice: 5700
      },
      {
        type: 'product',
        name: 'Pulsador de Salida Infrarrojo No-Touch (Sin Contacto)',
        description: 'Botón con sensor infrarrojo iluminado para salida higiénica.',
        quantity: 1,
        unitPrice: 1650,
        costPrice: 950
      },
      {
        type: 'product',
        name: 'Fuente de Alimentación Regulada 12V 5A con Respaldo de Batería',
        description: 'Gabinete metálico con cargador integrado y batería de gel sellada de 12V 7Ah.',
        quantity: 1,
        unitPrice: 4500,
        costPrice: 2900
      },
      {
        type: 'labor',
        name: 'Instalación y Calibración de Sistema de Acceso',
        description: 'Montaje mecánico en puerta, canalización de cableado, conexión de relevadores y enrolamiento inicial.',
        quantity: 1,
        unitPrice: 5500,
        costPrice: 2200
      }
    ]
  },
  {
    id: 'tpl-intercom-ip',
    name: 'Video Portero / Intercom IP con Pantalla Táctil',
    category: 'intercom',
    description: 'Comunicador inteligente para residencias o edificios corporativos con cámara HD, audio bidireccional y apertura remota desde smartphone.',
    badge: 'Smart Living',
    items: [
      {
        type: 'product',
        name: 'Frente de Calle Video Portero IP Metálico Antivandálico',
        description: 'Cámara gran angular 1080p con visión nocturna, lector RFID y relevador de puerta.',
        quantity: 1,
        unitPrice: 12800,
        costPrice: 8500
      },
      {
        type: 'product',
        name: 'Monitor Interior Táctil 7" WiFi / PoE',
        description: 'Pantalla de alta resolución con vista en vivo, intercomunicación y registro de llamadas.',
        quantity: 1,
        unitPrice: 9500,
        costPrice: 6200
      },
      {
        type: 'product',
        name: 'Switch de Red 5 Puertos Gigabit con 4 Puertos PoE',
        description: 'Distribuidor de red y alimentación para equipos de comunicación.',
        quantity: 1,
        unitPrice: 3800,
        costPrice: 2400
      },
      {
        type: 'labor',
        name: 'Instalación, Cableado e Integración con Red WiFi',
        description: 'Montaje de frente y monitor, configuración de parámetros IP y vinculación a aplicación de usuarios.',
        quantity: 1,
        unitPrice: 6500,
        costPrice: 2600
      }
    ]
  },
  {
    id: 'tpl-red-4puntos',
    name: 'Infraestructura de Red Cat6 (Pack 4 Puntos Certificados)',
    category: 'redes',
    description: 'Cableado estructurado para puestos de trabajo o puntos de acceso WiFi con materiales 100% cobre y canalización prolija.',
    badge: 'Redes',
    items: [
      {
        productId: 'prod-red-01',
        type: 'material',
        name: 'Bobina de Cable UTP Cat6 100% Cobre',
        description: 'Cable de par trenzado certificado de alta conductividad.',
        quantity: 1,
        unitPrice: 8500,
        costPrice: 5800
      },
      {
        type: 'material',
        name: 'Tomas Dobles RJ45 Cat6 con Placas Faceplate de Pared',
        description: 'Jacks modulares categoría 6 para montaje empotrado o superficial.',
        quantity: 4,
        unitPrice: 550,
        costPrice: 310
      },
      {
        type: 'material',
        name: 'Patch Cords Cat6 Certificados de 1.5 metros',
        description: 'Cables de conexión flexibles para equipos de usuario final.',
        quantity: 8,
        unitPrice: 280,
        costPrice: 140
      },
      {
        type: 'material',
        name: 'Tramos de Canaleta Plástica con Adhesivo y Tapa',
        description: 'Protección estética y organización para cables en oficinas.',
        quantity: 10,
        unitPrice: 220,
        costPrice: 120
      },
      {
        type: 'labor',
        name: 'Tendido, Ponchado y Certificación de Cableado (4 Puntos)',
        description: 'Instalación de canaletas, guía de cables, terminación en jacks y prueba de continuidad / mapa de cables.',
        quantity: 1,
        unitPrice: 7500,
        costPrice: 3000
      }
    ]
  }
];

const CUSTOM_TEMPLATES_STORAGE_KEY = 'martinez_tech_custom_quote_templates';

export const getCustomQuoteTemplates = (): QuoteTemplate[] => {
  try {
    const raw = localStorage.getItem(CUSTOM_TEMPLATES_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error cargando plantillas personalizadas:', err);
    return [];
  }
};

export const saveCustomQuoteTemplate = (
  newTemplate: Omit<QuoteTemplate, 'id' | 'isCustom' | 'createdAt'>
): QuoteTemplate => {
  const customTemplates = getCustomQuoteTemplates();
  const created: QuoteTemplate = {
    ...newTemplate,
    id: `custom-tpl-${Date.now()}`,
    isCustom: true,
    createdAt: new Date().toISOString()
  };
  customTemplates.unshift(created);
  localStorage.setItem(CUSTOM_TEMPLATES_STORAGE_KEY, JSON.stringify(customTemplates));
  return created;
};

export const deleteCustomQuoteTemplate = (templateId: string): void => {
  const customTemplates = getCustomQuoteTemplates();
  const filtered = customTemplates.filter(t => t.id !== templateId);
  localStorage.setItem(CUSTOM_TEMPLATES_STORAGE_KEY, JSON.stringify(filtered));
};

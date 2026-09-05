import { 
  ServiceItem, 
  PortfolioProject, 
  Deal, 
  Quote, 
  Client, 
  CompanySettings,
  User
} from '../types';

export const initialCompanySettings: CompanySettings = {
  name: 'MARTÍNEZ TECH',
  legalName: 'Martínez Tech Soluciones & Servicios S.R.L.',
  slogan: 'Soluciones - Servicios - Calidad',
  rnc: '132-45892-1',
  phone: '+1 (809) 555-0199',
  whatsapp: '18095550199',
  email: 'contacto@martineztech.com',
  website: 'www.martineztech.com',
  address: 'Av. Principal #124, Plaza Comercial Suite 3B',
  city: 'Santo Domingo, República Dominicana',
  bankAccounts: [
    {
      bank: 'Banco Popular Dominicano',
      accountNumber: '782390124',
      accountType: 'Corriente en Pesos (DOP)',
      holder: 'Martínez Tech S.R.L.'
    },
    {
      bank: 'Banco BHD',
      accountNumber: '298173401',
      accountType: 'Ahorros en Pesos (DOP)',
      holder: 'Martínez Tech S.R.L.'
    },
    {
      bank: 'Banreservas',
      accountNumber: '960238192',
      accountType: 'Corriente en Dólares (USD)',
      holder: 'Martínez Tech S.R.L.'
    }
  ],
  defaultTaxPercent: 18,
  defaultCurrency: 'DOP',
  defaultExchangeRate: 60.50,
  defaultWarranty: '1 año de garantía en equipos nuevos y 6 meses en mano de obra e instalación.',
  defaultTerms: 'Forma de pago: 60% de anticipo para inicio de trabajos y pedido de equipos, 40% contra entrega y conformidad de funcionamiento. Validez de la cotización: 15 días.',
  logoUrl: '/logo.png',
  socialLinks: {
    instagram: 'https://instagram.com/martineztech.do',
    facebook: 'https://facebook.com/martineztechrd',
    tiktok: 'https://tiktok.com/@martineztech',
    linkedin: 'https://linkedin.com/company/martinez-tech',
    youtube: 'https://youtube.com/@martineztech'
  },
  ncfSequences: {
    b01Next: 1,
    b02Next: 1,
    b14Next: 1,
    b15Next: 1,
    ncfExpiryDate: '2027-12-31'
  }
};

export const initialServices: ServiceItem[] = [
  {
    id: 'serv-camaras',
    category: 'camaras',
    title: 'Cámaras de Vigilancia',
    shortDescription: 'Sistemas de CCTV y cámaras IP de alta definición con visión nocturna, audio y monitoreo 24/7 en tu celular.',
    fullDescription: 'Diseñamos e instalamos soluciones de videovigilancia adaptadas a residencias, condominios, naves industriales y locales comerciales. Contamos con cámaras ColorVu (a color 24/7), cámaras motorizadas PTZ 360°, detección inteligente de personas y vehículos con inteligencia artificial y acceso remoto instantáneo desde cualquier lugar.',
    features: [
      'Visualización en tiempo real desde celular, tablet y PC',
      'Resoluciones Full HD, 2K y 4K con ultra nitidez',
      'Visión nocturna a color y gran alcance infrarrojo',
      'Detección inteligente de movimiento y cruce de línea',
      'Grabación continua en NVR/DVR y almacenamiento seguro'
    ],
    benefits: [
      'Disuasión activa de intrusos y robos',
      'Evidencia en video de alta calidad ante incidentes',
      'Supervisión de personal y operaciones de tu negocio'
    ],
    iconName: 'Camera',
    imageUrl: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&w=800&q=80',
    estimatedStartingPrice: 16500,
    popular: true
  },
  {
    id: 'serv-redes',
    category: 'redes',
    title: 'Redes Informáticas',
    shortDescription: 'Cableado estructurado Cat6/6A, fibra óptica, racks y cobertura Wi-Fi empresarial sin zonas muertas.',
    fullDescription: 'Construimos la infraestructura de conectividad que tu empresa u hogar necesita. Implementamos cableado estructurado certificado, ordenamiento y peinado de racks, switches administrables PoE, routers de alta capacidad y sistemas Wi-Fi Mesh de cobertura total sin caídas de señal.',
    features: [
      'Cableado estructurado Cat6 y Cat6A certificado',
      'Armado, peinado y etiquetado profesional de Racks',
      'Redes Wi-Fi empresariales con roaming continuo (Mesh)',
      'Segmentación de redes VLAN para mayor seguridad y velocidad',
      'Enlaces inalámbricos punto a punto de larga distancia'
    ],
    benefits: [
      'Máxima velocidad y estabilidad de conexión',
      'Cero interrupciones en llamadas VoIP y videollamadas',
      'Infraestructura escalable y organizada para el futuro'
    ],
    iconName: 'Network',
    imageUrl: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=800&q=80',
    estimatedStartingPrice: 12000,
    popular: true
  },
  {
    id: 'serv-motores',
    category: 'motores',
    title: 'Motores para Portón',
    shortDescription: 'Automatización de portones corredizos, batientes y levadizos con control remoto y apertura desde smartphone.',
    fullDescription: 'Automatizamos el acceso vehicular de tu residencia, edificio o complejo industrial. Instalamos motores de alto rendimiento y tráfico pesado con sistemas de seguridad antiaplastamiento, baterías de respaldo para cortes de luz y apertura inteligente desde tu teléfono móvil.',
    features: [
      'Motores corredizos y batientes para hasta 2,000 kg',
      'Apertura rápida y silenciosa con desaceleración suave',
      'Fotoceldas de seguridad antiaplastamiento para vehículos y peatones',
      'Controles remotos anticopia y apertura por App Wi-Fi',
      'Desbloqueo manual con llave de seguridad ante emergencias'
    ],
    benefits: [
      'Comodidad total al llegar y salir sin bajarte del vehículo',
      'Mayor seguridad perimetral al evitar esperas en la calle',
      'Durabilidad garantizada con materiales de alto tráfico'
    ],
    iconName: 'Car',
    imageUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80',
    estimatedStartingPrice: 28500,
    popular: true
  },
  {
    id: 'serv-cerraduras',
    category: 'cerraduras',
    title: 'Cerraduras Magnéticas',
    shortDescription: 'Electroimanes de alta potencia y cerraduras eléctricas para control de puertas de vidrio, madera y metal.',
    fullDescription: 'Sistemas de seguridad electromagnética de 300, 600 y 1200 libras de fuerza. Ideales para oficinas comerciales, consultorios médicos, laboratorios y accesos residenciales. Integrables con pulsadores no-touch, botoneras de emergencia y respaldo de batería.',
    features: [
      'Electroimanes de 600 y 1200 Lbs de fuerza de sujeción',
      'Soportes especializados en ZL y U para todo tipo de puertas',
      'Pulsadores de salida infrarrojos sin contacto (No-Touch)',
      'Fuentes de poder con batería de respaldo ininterrumpida',
      'Liberación automática ante alarmas o emergencias'
    ],
    benefits: [
      'Cierre hermético e infranqueable de puertas principales',
      'Higiene absoluta con pulsadores por proximidad',
      'Protección continúa incluso si falla la energía eléctrica'
    ],
    iconName: 'Lock',
    imageUrl: 'https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=800&q=80',
    estimatedStartingPrice: 9500
  },
  {
    id: 'serv-acceso',
    category: 'acceso',
    title: 'Control de Acceso',
    shortDescription: 'Sistemas biométricos faciales, huella dactilar y tarjetas RFID para restringir y auditar ingresos.',
    fullDescription: 'Administra quién entra y a qué áreas con la tecnología biométrica más avanzada del mercado. Controla accesos mediante reconocimiento facial sin contacto, lectores de huella de alta precisión, tarjetas o tags RFID y teclados con código PIN de seguridad.',
    features: [
      'Reconocimiento facial con IA ultra rápido (0.2s)',
      'Lectores biométricos de huella digital antivandalismo',
      'Acceso mediante tarjetas, llaveros RFID o códigos temporales',
      'Software de gestión de usuarios, horarios y permisos',
      'Registro histórico con fecha, hora y foto de cada ingreso'
    ],
    benefits: [
      'Control estricto de zonas restringidas y privadas',
      'Elimina el uso de llaves físicas fáciles de duplicar',
      'Auditoría y trazabilidad completa de visitantes y personal'
    ],
    iconName: 'Fingerprint',
    imageUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80',
    estimatedStartingPrice: 14500,
    popular: true
  },
  {
    id: 'serv-ponchadores',
    category: 'ponchadores',
    title: 'Ponchadores Biométricos',
    shortDescription: 'Relojes de control de asistencia de personal para cálculo exacto de horas trabajadas, turnos y tardanzas.',
    fullDescription: 'Optimiza la gestión de recursos humanos de tu empresa. Implementamos relojes ponchadores biométricos con software de asistencia que calcula horas regulares, horas extras, ausencias y reportes automáticos exportables a Excel y sistemas de nómina.',
    features: [
      'Identificación por huella dactilar, reconocimiento facial o RFID',
      'Prevención total de suplantación de identidad entre empleados',
      'Descarga de reportes por red TCP/IP, Wi-Fi o memoria USB',
      'Gestión de múltiples turnos rotativos, días feriados y permisos',
      'Exportación automática de resúmenes a Excel y sistemas de nómina'
    ],
    benefits: [
      'Ahorro significativo de tiempo en la elaboración de nómina',
      'Cero disputas sobre horas trabajadas y tardanzas',
      'Mayor disciplina y puntualidad en el equipo de trabajo'
    ],
    iconName: 'Clock',
    imageUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=800&q=80',
    estimatedStartingPrice: 11000
  },
  {
    id: 'serv-alarmas',
    category: 'alarmas',
    title: 'Alarmas de Seguridad',
    shortDescription: 'Sistemas inteligentes contra robo e intrusión con notificación instantánea al celular y sirenas de alta potencia.',
    fullDescription: 'Protege lo que más te importa con sistemas de alarma perimetral e interior de última generación. Incluyen sensores de apertura en puertas y ventanas, detectores de movimiento con inmunidad para mascotas, sensores de humo y sirenas estroboscópicas con conexión dual Wi-Fi y 4G GSM.',
    features: [
      'Paneles inalámbricos híbridos sin cables a la vista',
      'Notificaciones push inmediatas al smartphone y llamadas GSM',
      'Sensores infrarrojos inteligentes inmunes a mascotas',
      'Sirenas acústicas y lumínicas de 120dB para disuasión',
      'Armado y desarmado remoto desde cualquier lugar del mundo'
    ],
    benefits: [
      'Alerta inmediata ante cualquier intento de intrusión',
      'Tranquilidad absoluta cuando estás fuera de casa o tu negocio',
      'Integración con otros sistemas de seguridad del inmueble'
    ],
    iconName: 'Bell',
    imageUrl: 'https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=800&q=80',
    estimatedStartingPrice: 18000
  },
  {
    id: 'serv-intercom',
    category: 'intercom',
    title: 'Intercom & Video Porteros',
    shortDescription: 'Citofonía y video porteros para torres residenciales, oficinas y hogares con apertura de puerta remota.',
    fullDescription: 'Soluciones modernas de comunicación para edificios residenciales, oficinas y viviendas particulares. Permite ver y hablar con quien toca el timbre antes de abrir, contestar las llamadas desde el smartphone incluso cuando no estás en casa y liberar la cerradura con un solo toque.',
    features: [
      'Frentes de calle resistentes con cámara HD y visión nocturna',
      'Monitores táctiles interiores con audio bidireccional cristalino',
      'Recepción de llamadas del portero en el celular vía App',
      'Sistemas multidepartamento para edificios con directorio digital',
      'Apertura remota de puertas peatonales y vehiculares'
    ],
    benefits: [
      'Atención de visitantes desde cualquier lugar del mundo',
      'Verificación visual antes de autorizar el ingreso',
      'Mayor plusvalía y modernidad para tu inmueble o condominio'
    ],
    iconName: 'PhoneCall',
    imageUrl: 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?auto=format&fit=crop&w=800&q=80',
    estimatedStartingPrice: 21000
  }
];

export const initialPortfolio: PortfolioProject[] = [
  {
    id: 'port-01',
    title: 'Sistema de Vigilancia IP 4K y Red Wi-Fi Empresarial',
    category: 'camaras',
    client: 'Centro Logístico del Caribe S.A.',
    location: 'Santo Domingo Este, D.N.',
    date: 'Febrero 2026',
    description: 'Instalación completa de 16 cámaras IP 4K ColorVu con visión nocturna a color, NVR de 32 canales, peinado de Rack de comunicaciones 12U y 4 Access Points Wi-Fi 6 para cobertura total de almacén y oficinas.',
    images: [
      'https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=900&q=80'
    ],
    equipmentInstalled: [
      '16x Cámaras IP Bullet 5MP ColorVu PoE',
      '1x NVR Hikvision 4K 32 Canales con 8TB',
      '1x Switch PoE 24 Puertos Gigabit',
      '4x Access Points Wi-Fi 6 Ubiquiti UniFi',
      '1x Rack de Pared 12U con organizadores'
    ],
    testimonial: {
      author: 'Ing. Carlos Mendoza',
      role: 'Gerente de Operaciones',
      text: 'El equipo de Martínez Tech realizó un trabajo impecable. El peinado del rack y la calidad de las cámaras superaron nuestras expectativas. 100% recomendados.',
      rating: 5
    },
    featured: true
  },
  {
    id: 'port-02',
    title: 'Automatización de Portón de Alto Tráfico y Control de Acceso',
    category: 'motores',
    client: 'Residencial Las Palmas Real',
    location: 'Bella Vista, D.N.',
    date: 'Enero 2026',
    description: 'Montaje de motor corredizo de 1500kg para condominio de 38 apartamentos con fotoceldas de seguridad, receptor de largo alcance y sistema de apertura por tag RFID vehicular.',
    images: [
      'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=900&q=80'
    ],
    equipmentInstalled: [
      '1x Motor Corredizo Industrial BFT 1500kg',
      '2x Pares de fotoceldas antiaplastamiento',
      '1x Lector RFID UHF de largo alcance para vehículos',
      '80x Tags vehiculares para residentes',
      '1x Módulo de control inteligente por celular'
    ],
    testimonial: {
      author: 'Lic. Patricia Guzmán',
      role: 'Presidenta de Junta de Vecinos',
      text: 'Excelente servicio. El portón abre rápido, sin ruidos molestos y el sistema de tags nos ha solucionado el congestionamiento en la entrada.',
      rating: 5
    },
    featured: true
  },
  {
    id: 'port-03',
    title: 'Control de Acceso Biométrico y Cerraduras Magnéticas',
    category: 'acceso',
    client: 'Torre Médica Especializada',
    location: 'Piantini, Santo Domingo',
    date: 'Diciembre 2025',
    description: 'Instalación de 6 cerraduras magnéticas de 600lbs con botoneras no-touch y terminales de reconocimiento facial para acceso seguro a áreas de quirófano y laboratorio.',
    images: [
      'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=900&q=80'
    ],
    equipmentInstalled: [
      '6x Electroimanes 600 Lbs con soporte ZL',
      '4x Terminales Biométricas de Rostro y Tarjeta ZKTeco',
      '6x Pulsadores de salida infrarrojos No-Touch',
      '2x Fuentes de poder 12V 10A con batería de respaldo',
      'Software de gestión de asistencia y permisos'
    ],
    testimonial: {
      author: 'Dr. Manuel Peña',
      role: 'Director Médico',
      text: 'La biometría facial es rápida y al no requerir contacto físico garantiza los protocolos higiénicos que exigimos. Trabajo muy profesional.',
      rating: 5
    },
    featured: true
  },
  {
    id: 'port-04',
    title: 'Video Portero IP Multi-Apartamento y Citofonía Digital',
    category: 'intercom',
    client: 'Condominio Mirador del Sol',
    location: 'Naco, Santo Domingo',
    date: 'Noviembre 2025',
    description: 'Modernización del sistema de intercomunicación analógico antiguo por un sistema de Video Portero IP con pantalla táctil en recepción y conectividad a smartphone para 24 familias.',
    images: [
      'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?auto=format&fit=crop&w=900&q=80'
    ],
    equipmentInstalled: [
      '1x Frente de calle IP con cámara Full HD y teclado digital',
      '24x Licencias para recepción de llamadas en App móvil',
      '1x Monitor de conserjería táctil de 10 pulgadas',
      '1x Switch PoE de distribución y cableado Cat6'
    ],
    featured: true
  },
  {
    id: 'port-05',
    title: 'Infraestructura de Cableado Estructurado Cat6A y Rack Servidores',
    category: 'redes',
    client: 'Torre Corporativa Bella Vista',
    location: 'Av. Sarasota, Santo Domingo',
    date: 'Octubre 2025',
    description: 'Instalación de 48 puntos de red Gigabit certificados Cat6A, peinado de gabinete de 42U, switches Cisco administrables y certificación Fluke de enlace de fibra óptica.',
    images: [
      'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=900&q=80'
    ],
    equipmentInstalled: [
      '48x Puntos de Red Cat6A con conectores blindados',
      '2x Switches Cisco Gigabit PoE+ 24 Puertos',
      '1x Rack Servidores 42U con organizadores horizontales/verticales',
      '1x Enlace de Fibra Óptica OM3 de 10Gbps'
    ],
    testimonial: {
      author: 'Ing. Laura Valenzuela',
      role: 'Directora de TI',
      text: 'El orden y rotulación del rack son de nivel internacional. Las pruebas de velocidad y certificación de red pasaron al 100%.',
      rating: 5
    },
    featured: true
  },
  {
    id: 'port-06',
    title: 'Sistema de Alarma Perimetral Inalámbrica y Cámaras Solares',
    category: 'alarmas',
    client: 'Residencia Campestre Los Robles',
    location: 'Jarabacoa, La Vega',
    date: 'Septiembre 2025',
    description: 'Protección perimetral con barreras infrarrojas solares de 100 metros, sirenas de 120dB y panel de alarma híbrido con notificación push instantánea y comunicación 4G LTE.',
    images: [
      'https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=900&q=80'
    ],
    equipmentInstalled: [
      '1x Panel de Alarma Híbrido AJAX Hub 2 Plus 4G/Wi-Fi',
      '4x Barreras Fotoeléctricas Infrarrojas de 100m con panel solar',
      '8x Detectores de Movimiento para Exterior con cámara integrada',
      '2x Sirenas Estroboscópicas de 120dB'
    ],
    testimonial: {
      author: 'Sr. Roberto Henríquez',
      role: 'Propietario',
      text: 'Tranquilidad total al poder vigilar la propiedad a distancia y recibir fotos inmediatas si hay alguna alerta.',
      rating: 5
    },
    featured: true
  }
];

export const initialClients: Client[] = [
  {
    id: 'cli-01',
    name: 'Ing. Carlos Mendoza',
    company: 'Centro Logístico del Caribe S.A.',
    phone: '809-555-4321',
    email: 'cmendoza@logiscocaribe.com',
    rnc: '131-99887-2',
    address: 'Zona Franca San Isidro, Nave 14',
    city: 'Santo Domingo Este',
    type: 'industrial',
    notes: 'Cliente corporativo de alto volumen. Valora la rapidez de respuesta y soporte técnico.',
    totalDeals: 3,
    totalSpent: 285400,
    createdAt: '2025-08-10'
  },
  {
    id: 'cli-02',
    name: 'Lic. Patricia Guzmán',
    company: 'Residencial Las Palmas Real',
    phone: '829-555-8765',
    email: 'junta.laspalmas@gmail.com',
    rnc: '101-44556-9',
    address: 'Calle Los Robles #45, Bella Vista',
    city: 'Santo Domingo',
    type: 'building',
    notes: 'Condominio residencial. Facturar siempre a nombre de la junta con comprobante fiscal.',
    totalDeals: 2,
    totalSpent: 98000,
    createdAt: '2025-11-15'
  },
  {
    id: 'cli-03',
    name: 'Dr. Manuel Peña',
    company: 'Torre Médica Especializada',
    phone: '809-555-9012',
    email: 'dr.pena@torremedica.do',
    rnc: '130-11223-4',
    address: 'Av. Winston Churchill #102, Suite 402',
    city: 'Santo Domingo',
    type: 'commercial',
    notes: 'Clínica privada. Horarios de instalación deben ser fuera de consulta médica (después de 6pm o fines de semana).',
    totalDeals: 2,
    totalSpent: 145200,
    createdAt: '2025-12-01'
  },
  {
    id: 'cli-04',
    name: 'Marcos Rivas',
    company: 'Residencia Familiar',
    phone: '849-555-6677',
    email: 'mrivas.personal@gmail.com',
    address: 'Calle Costa Rica #12, Urb. Real',
    city: 'Santo Domingo',
    type: 'residential',
    notes: 'Interesado en cámaras perimetrales y motor para su portón corredizo.',
    totalDeals: 1,
    totalSpent: 48500,
    createdAt: '2026-01-20'
  }
];

export const initialDeals: Deal[] = [
  {
    id: 'deal-01',
    code: 'NEG-2026-001',
    title: 'Circuito Cerrado de 8 Cámaras 4K + Control Biométrico',
    clientId: 'cli-01',
    clientName: 'Centro Logístico del Caribe S.A.',
    clientPhone: '809-555-4321',
    clientEmail: 'cmendoza@logiscocaribe.com',
    clientAddress: 'Zona Franca San Isidro, Nave 14',
    clientType: 'industrial',
    stage: 'installation',
    priority: 'high',
    estimatedValue: 78500,
    assignedTechnician: 'Martínez Tech - Equipo 1',
    serviceCategory: 'camaras',
    notes: 'Anticipo del 60% recibido. Materiales en sitio, instalación programada para finalizar este viernes.',
    quoteId: 'quot-01',
    createdAt: '2026-02-14T09:30:00Z',
    updatedAt: '2026-02-25T14:20:00Z',
    scheduledVisitDate: '2026-02-16',
    expectedCloseDate: '2026-02-28',
    source: 'Referido'
  },
  {
    id: 'deal-02',
    code: 'NEG-2026-002',
    title: 'Sustitución de Motor de Portón Corredizo 1000kg',
    clientId: 'cli-02',
    clientName: 'Residencial Las Palmas Real',
    clientPhone: '829-555-8765',
    clientEmail: 'junta.laspalmas@gmail.com',
    clientAddress: 'Calle Los Robles #45, Bella Vista',
    clientType: 'building',
    stage: 'won',
    priority: 'high',
    estimatedValue: 34500,
    assignedTechnician: 'Téc. Rafael Martínez',
    serviceCategory: 'motores',
    notes: 'Presupuesto aprobado por la junta. Coordinando fecha de entrega del motor italiano y controles.',
    quoteId: 'quot-02',
    createdAt: '2026-02-18T11:00:00Z',
    updatedAt: '2026-02-27T16:45:00Z',
    expectedCloseDate: '2026-03-05',
    source: 'Cliente Recurrente'
  },
  {
    id: 'deal-03',
    code: 'NEG-2026-003',
    title: 'Ponchador de Asistencia con Reconocimiento Facial + Red Wi-Fi',
    clientId: 'cli-03',
    clientName: 'Torre Médica Especializada',
    clientPhone: '809-555-9012',
    clientEmail: 'dr.pena@torremedica.do',
    clientAddress: 'Av. Winston Churchill #102, Suite 402',
    clientType: 'commercial',
    stage: 'negotiation',
    priority: 'medium',
    estimatedValue: 26800,
    assignedTechnician: 'Téc. Rafael Martínez',
    serviceCategory: 'ponchadores',
    notes: 'El cliente solicitó un 5% de descuento en el equipo ponchador si contrata la extensión Wi-Fi.',
    quoteId: 'quot-03',
    createdAt: '2026-02-22T15:10:00Z',
    updatedAt: '2026-02-28T10:00:00Z',
    expectedCloseDate: '2026-03-10',
    source: 'Sitio Web'
  },
  {
    id: 'deal-04',
    code: 'NEG-2026-004',
    title: 'Cerraduras Magnéticas para 3 Puertas de Acceso',
    clientName: 'Bufete Jurídico Almonte & Asoc.',
    clientPhone: '809-555-7788',
    clientEmail: 'recepcion@almontejuridico.do',
    clientAddress: 'Av. 27 de Febrero #301, Torre Empresarial',
    clientType: 'commercial',
    stage: 'quoted',
    priority: 'medium',
    estimatedValue: 21500,
    assignedTechnician: 'Martínez Tech',
    serviceCategory: 'cerraduras',
    notes: 'Cotización enviada vía WhatsApp y correo. En espera de revisión por el socio director.',
    createdAt: '2026-02-24T08:45:00Z',
    updatedAt: '2026-02-26T12:00:00Z',
    expectedCloseDate: '2026-03-08',
    source: 'WhatsApp'
  },
  {
    id: 'deal-05',
    code: 'NEG-2026-005',
    title: 'Levantamiento para Sistema de Alarma y Cámaras Residencial',
    clientId: 'cli-04',
    clientName: 'Marcos Rivas',
    clientPhone: '849-555-6677',
    clientEmail: 'mrivas.personal@gmail.com',
    clientAddress: 'Calle Costa Rica #12, Urb. Real',
    clientType: 'residential',
    stage: 'site_visit',
    priority: 'low',
    estimatedValue: 45000,
    serviceCategory: 'alarmas',
    notes: 'Visita técnica agendada para el sábado a las 10:00 AM para medir distancias de cableado.',
    createdAt: '2026-02-27T17:00:00Z',
    updatedAt: '2026-02-28T09:00:00Z',
    scheduledVisitDate: '2026-03-01',
    source: 'Formulario Web'
  },
  {
    id: 'deal-06',
    code: 'NEG-2026-006',
    title: 'Cotización Solicitada: Video Portero IP Edificio 12 Aptos',
    clientName: 'Junta Condominio Los Cacicazgos III',
    clientPhone: '809-555-1122',
    clientEmail: 'cacicazgos3@hotmail.com',
    clientAddress: 'Av. Enriquillo #88, Los Cacicazgos',
    clientType: 'building',
    stage: 'prospect',
    priority: 'high',
    estimatedValue: 62000,
    serviceCategory: 'intercom',
    notes: 'Entró por el cotizador de la página web. Quieren cambiar citófono viejo que no funciona.',
    createdAt: '2026-02-28T21:15:00Z',
    updatedAt: '2026-02-28T21:15:00Z',
    source: 'Cotizador Rápido Web'
  }
];

export const initialQuotes: Quote[] = [
  {
    id: 'quot-01',
    quoteNumber: 'COT-2026-001',
    dealId: 'deal-01',
    clientId: 'cli-01',
    clientName: 'Centro Logístico del Caribe S.A.',
    clientCompany: 'Centro Logístico del Caribe S.A.',
    clientPhone: '809-555-4321',
    clientEmail: 'cmendoza@logiscocaribe.com',
    clientRnc: '131-99887-2',
    clientAddress: 'Zona Franca San Isidro, Nave 14, SDE',
    date: '2026-02-18',
    validUntil: '2026-03-05',
    items: [
      {
        id: 'qi-1',
        type: 'product',
        name: 'Cámara IP Domo 4MP ColorVu / Visión Nocturna',
        description: 'Cámara antivandálica con micrófono y visión a color 24/7',
        quantity: 4,
        unitPrice: 3800,
        total: 15200
      },
      {
        id: 'qi-2',
        type: 'product',
        name: 'Cámara Bullet IP 5MP Exterior PoE',
        description: 'Cámara metálica IP67 para perímetro exterior',
        quantity: 4,
        unitPrice: 4600,
        total: 18400
      },
      {
        id: 'qi-3',
        type: 'product',
        name: 'NVR 8 Canales 4K con Switch PoE Integrado',
        description: 'Grabador en red 8 puertos PoE + acceso remoto móvil',
        quantity: 1,
        unitPrice: 11500,
        total: 11500
      },
      {
        id: 'qi-4',
        type: 'product',
        name: 'Disco Duro Especializado para Vigilancia 2TB Surveillance',
        description: 'WD Purple 24/7 para grabación ininterrumpida',
        quantity: 1,
        unitPrice: 5200,
        total: 5200
      },
      {
        id: 'qi-5',
        type: 'material',
        name: 'Bobina de Cable UTP Cat6 100% Cobre (305 metros)',
        description: 'Cable de red para alta velocidad y alimentación PoE',
        quantity: 1,
        unitPrice: 8500,
        total: 8500
      },
      {
        id: 'qi-6',
        type: 'labor',
        name: 'Instalación y Configuración de Cámara de Seguridad (por punto)',
        description: 'Tendido, fijación, canalizado, ponchado y configuración NVR/App',
        quantity: 8,
        unitPrice: 1500,
        total: 12000
      },
      {
        id: 'qi-7',
        type: 'product',
        name: 'Terminal de Control de Acceso Biométrico Rostro + Huella',
        description: 'Lector inteligente para acceso a oficinas centrales',
        quantity: 1,
        unitPrice: 16500,
        total: 16500
      }
    ],
    subtotal: 87300,
    discountPercent: 10,
    discountAmount: 8730,
    applyTax: false,
    taxPercent: 18,
    taxAmount: 0,
    total: 78570,
    currency: 'DOP',
    terms: [
      '60% de anticipo al aprobar la orden, 40% al finalizar la instalación y entrega conforme.',
      'Garantía: 1 año en equipos por defectos de fábrica y 6 meses en instalación.',
      'Incluye capacitación al personal administrativo sobre el uso de la app y software.'
    ],
    warrantyNotes: '1 año en equipos principales, 6 meses en mano de obra y accesorios pasivos.',
    paymentTerms: 'Transferencia bancaria o cheque a nombre de Martínez Tech S.R.L.',
    deliveryTime: '3 a 5 días laborables a partir del anticipo.',
    notes: 'Proyecto en ejecución. Instalación coordinada con la gerencia de planta.',
    status: 'accepted',
    createdBy: 'Rafael Martínez',
    createdAt: '2026-02-18T10:00:00Z'
  },
  {
    id: 'quot-02',
    quoteNumber: 'COT-2026-002',
    dealId: 'deal-02',
    clientId: 'cli-02',
    clientName: 'Residencial Las Palmas Real',
    clientCompany: 'Residencial Las Palmas Real',
    clientPhone: '829-555-8765',
    clientEmail: 'junta.laspalmas@gmail.com',
    clientRnc: '101-44556-9',
    clientAddress: 'Calle Los Robles #45, Bella Vista',
    date: '2026-02-20',
    validUntil: '2026-03-07',
    items: [
      {
        id: 'qi-11',
        type: 'product',
        name: 'Kit de Motor Corredizo Residencial/Comercial 800kg',
        description: 'Motor electromecánico de alto tráfico con 2 controles y sensores',
        quantity: 1,
        unitPrice: 24500,
        total: 24500
      },
      {
        id: 'qi-12',
        type: 'material',
        name: 'Cremallera de Acero Galvanizado para Portón Corredizo (metro)',
        description: 'Cremalleras reforzadas para portón corredizo de 5 metros',
        quantity: 5,
        unitPrice: 850,
        total: 4250
      },
      {
        id: 'qi-13',
        type: 'product',
        name: 'Par de Fotoceldas de Seguridad Antiaplastamiento',
        description: 'Sensores infrarrojos de protección vehicular',
        quantity: 1,
        unitPrice: 2200,
        total: 2200
      },
      {
        id: 'qi-14',
        type: 'labor',
        name: 'Instalación Mecánica y Eléctrica de Motor de Portón',
        description: 'Soldadura de cremalleras, fijación base, cableado y calibración',
        quantity: 1,
        unitPrice: 5500,
        total: 5500
      }
    ],
    subtotal: 36450,
    discountPercent: 5,
    discountAmount: 1822.5,
    applyTax: false,
    taxPercent: 18,
    taxAmount: 0,
    total: 34627.5,
    currency: 'DOP',
    terms: [
      '50% de anticipo para reserva de motor, 50% al terminar la instalación.',
      'Validez de la oferta: 15 días a partir de la fecha de emisión.'
    ],
    warrantyNotes: '1 año de garantía en motor y tarjeta electrónica, 6 meses en instalación.',
    paymentTerms: 'Transferencia bancaria Banco Popular / BHD.',
    deliveryTime: '2 días laborables.',
    notes: 'Incluye programación de controles existentes compatibles.',
    status: 'accepted',
    createdBy: 'Rafael Martínez',
    createdAt: '2026-02-20T14:30:00Z'
  }
];

export const initialUsers: User[] = [
  {
    id: 'usr-01',
    name: 'Rafael Martínez',
    email: 'admin@martineztech.com',
    role: 'admin',
    phone: '(809) 555-0199',
    avatar: 'RM',
    password: 'admin',
    active: true,
    createdAt: '2025-01-10',
    schedule: {
      workDays: [1, 2, 3, 4, 5, 6],
      startTime: '08:00',
      endTime: '18:00',
      lunchStart: '12:00',
      lunchEnd: '13:00',
      maxVisitsPerDay: 6
    }
  },
  {
    id: 'usr-02',
    name: 'Carlos Gómez',
    email: 'tecnico@martineztech.com',
    role: 'technician',
    phone: '(809) 555-0188',
    avatar: 'CG',
    password: 'tecnico',
    active: true,
    createdAt: '2025-02-01',
    schedule: {
      workDays: [1, 2, 3, 4, 5, 6],
      startTime: '08:00',
      endTime: '18:00',
      lunchStart: '12:00',
      lunchEnd: '13:00',
      maxVisitsPerDay: 6
    }
  }
];


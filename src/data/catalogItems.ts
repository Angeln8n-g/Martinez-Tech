import { CatalogProduct } from '../types';

export const initialCatalogProducts: CatalogProduct[] = [
  // Cámaras de Vigilancia
  {
    id: 'prod-cam-01',
    name: 'Cámara IP Domo 4MP ColorVu / Visión Nocturna',
    category: 'camaras',
    type: 'product',
    description: 'Cámara tipo domo antivandálica 4 Megapíxeles con luz cálida para visualización a color 24/7 y micrófono incorporado.',
    unitPrice: 3800,
    unit: 'unidad'
  },
  {
    id: 'prod-cam-02',
    name: 'Cámara Bullet IP 5MP Exterior PoE',
    category: 'camaras',
    type: 'product',
    description: 'Cámara tipo bala metálica con protección IP67 para intemperie, IR de 40 metros y detección de personas/vehículos.',
    unitPrice: 4600,
    unit: 'unidad'
  },
  {
    id: 'prod-cam-03',
    name: 'NVR 8 Canales 4K con Switch PoE Integrado',
    category: 'camaras',
    type: 'product',
    description: 'Grabador de video en red para hasta 8 cámaras IP, puertos PoE independientes y acceso remoto vía App móvil.',
    unitPrice: 11500,
    unit: 'unidad'
  },
  {
    id: 'prod-cam-04',
    name: 'Disco Duro Especializado para Vigilancia 2TB Surveillance',
    category: 'camaras',
    type: 'product',
    description: 'Disco duro Western Digital Purple / Seagate Skyhawk para grabación continua 24/7 de alta confiabilidad.',
    unitPrice: 5200,
    unit: 'unidad'
  },
  {
    id: 'prod-cam-05',
    name: 'Cámara PTZ 360° con Zoom Óptico 25X y Seguimiento Inteligente',
    category: 'camaras',
    type: 'product',
    description: 'Cámara móvil motorizada con giro 360°, alcance IR 100m y autofoco para perímetros extensos.',
    unitPrice: 28500,
    unit: 'unidad'
  },

  // Redes Informáticas
  {
    id: 'prod-red-01',
    name: 'Bobina de Cable UTP Cat6 100% Cobre (305 metros)',
    category: 'redes',
    type: 'material',
    description: 'Cable de red para alta velocidad Gigabit y alimentación PoE de cámaras y puntos de acceso.',
    unitPrice: 8500,
    unit: 'bobina'
  },
  {
    id: 'prod-red-02',
    name: 'Punto de Acceso Wi-Fi 6 Doble Banda Empresarial (Access Point)',
    category: 'redes',
    type: 'product',
    description: 'Access point de alto rendimiento con tecnología Wi-Fi 6 AX3000, gestión en la nube y cobertura de hasta 150m².',
    unitPrice: 9400,
    unit: 'unidad'
  },
  {
    id: 'prod-red-03',
    name: 'Switch Administrable Gigabit 16 Puertos PoE+ (150W)',
    category: 'redes',
    type: 'product',
    description: 'Switch capa 2 con soporte de VLAN, QoS y alimentación PoE en todos sus puertos.',
    unitPrice: 14800,
    unit: 'unidad'
  },
  {
    id: 'prod-red-04',
    name: 'Gabinete Rack de Pared 9U con Puerta de Vidrio',
    category: 'redes',
    type: 'product',
    description: 'Rack metálico para organizar switches, NVR, patch panels y PDU de forma segura y ventilada.',
    unitPrice: 6900,
    unit: 'unidad'
  },
  {
    id: 'prod-red-05',
    name: 'Patch Panel 24 Puertos Cat6 con Organizador',
    category: 'redes',
    type: 'product',
    description: 'Panel de parcheo para remate profesional de cableado estructurado en rack.',
    unitPrice: 2400,
    unit: 'unidad'
  },

  // Motores para Portón
  {
    id: 'prod-mot-01',
    name: 'Kit de Motor Corredizo Residencial/Comercial 800kg',
    category: 'motores',
    type: 'product',
    description: 'Motor electromecánico para portones corredizos de hasta 800 kg. Incluye 2 controles remotos, tarjeta electrónica y sensores de límite.',
    unitPrice: 24500,
    unit: 'kit'
  },
  {
    id: 'prod-mot-02',
    name: 'Cremallera de Acero Galvanizado para Portón Corredizo (metro)',
    category: 'motores',
    type: 'material',
    description: 'Cremallera metálica reforzada para engranaje de motor corredizo.',
    unitPrice: 850,
    unit: 'metro'
  },
  {
    id: 'prod-mot-03',
    name: 'Kit de Brazos Hidráulicos / Batientes para Portón Doble Hoja',
    category: 'motores',
    type: 'product',
    description: 'Sistema batiente de alto rendimiento para portones de 2 hojas de hasta 3 metros por hoja.',
    unitPrice: 42000,
    unit: 'kit'
  },
  {
    id: 'prod-mot-04',
    name: 'Módulo de Apertura Inteligente Wi-Fi para Smartphone',
    category: 'motores',
    type: 'product',
    description: 'Permite abrir y cerrar el portón desde el celular desde cualquier parte del mundo y ver el estado en tiempo real.',
    unitPrice: 3500,
    unit: 'unidad'
  },
  {
    id: 'prod-mot-05',
    name: 'Par de Fotoceldas de Seguridad Antiaplastamiento',
    category: 'motores',
    type: 'product',
    description: 'Sensores infrarrojos para detener o revertir el cierre del portón si detecta un vehículo o persona.',
    unitPrice: 2200,
    unit: 'par'
  },

  // Cerraduras Magnéticas
  {
    id: 'prod-cer-01',
    name: 'Cerradura Electroimán 600 Lbs con Indicador LED',
    category: 'cerraduras',
    type: 'product',
    description: 'Cerradura magnética de 600 libras de fuerza de sujeción para puertas de cristal, madera o metal.',
    unitPrice: 4200,
    unit: 'unidad'
  },
  {
    id: 'prod-cer-02',
    name: 'Soporte ZL para Cerradura Magnética de 600 Lbs',
    category: 'cerraduras',
    type: 'material',
    description: 'Herraje de aluminio anodizado para montaje en puertas que abren hacia adentro.',
    unitPrice: 1600,
    unit: 'unidad'
  },
  {
    id: 'prod-cer-03',
    name: 'Pulsador de Salida Sin Contacto (No Touch Infrared)',
    category: 'cerraduras',
    type: 'product',
    description: 'Botón de salida higiénico por proximidad con iluminación LED bicolor.',
    unitPrice: 1500,
    unit: 'unidad'
  },
  {
    id: 'prod-cer-04',
    name: 'Fuente de Poder Ininterrumpida 12V 5A con Batería de Respaldo',
    category: 'cerraduras',
    type: 'product',
    description: 'Fuente con gabinete metálico y batería de 7Ah para mantener cerraduras operando ante cortes de energía eléctrica.',
    unitPrice: 3900,
    unit: 'unidad'
  },

  // Control de Acceso
  {
    id: 'prod-acc-01',
    name: 'Terminal de Control de Acceso Biométrico Rostro + Huella + Tarjeta',
    category: 'acceso',
    type: 'product',
    description: 'Lector inteligente con reconocimiento facial con IA en 0.2 segundos, pantalla táctil LCD y reporte TCP/IP.',
    unitPrice: 16500,
    unit: 'unidad'
  },
  {
    id: 'prod-acc-02',
    name: 'Teclado Autónomo Antivandálico con Lector RFID y PIN',
    category: 'acceso',
    type: 'product',
    description: 'Carcasa metálica exterior IP68 con teclado retroiluminado y capacidad para 2000 usuarios.',
    unitPrice: 3200,
    unit: 'unidad'
  },
  {
    id: 'prod-acc-03',
    name: 'Llaveros / Tarjetas RFID de Proximidad 125kHz (Paquete 50 unid)',
    category: 'acceso',
    type: 'material',
    description: 'Tokens de proximidad en plástico resistente para apertura de accesos.',
    unitPrice: 1800,
    unit: 'paquete'
  },

  // Ponchadores de Asistencia
  {
    id: 'prod-pon-01',
    name: 'Reloj Ponchador Biométrico de Asistencia con Huella y Reportes USB/Red',
    category: 'ponchadores',
    type: 'product',
    description: 'Equipo para control de asistencia de empleados con descarga de reportes en Excel directamente o mediante software en red.',
    unitPrice: 8900,
    unit: 'unidad'
  },
  {
    id: 'prod-pon-02',
    name: 'Ponchador con Reconocimiento Facial y Conexión Wi-Fi / Nube',
    category: 'ponchadores',
    type: 'product',
    description: 'Equipo avanzado sin contacto que evita la suplantación mediante IA y sincronización directa a la nube.',
    unitPrice: 15400,
    unit: 'unidad'
  },

  // Alarmas de Seguridad
  {
    id: 'prod-ala-01',
    name: 'Kit de Panel de Alarma Inalámbrico Inteligente Wi-Fi + 4G GSM',
    category: 'alarmas',
    type: 'product',
    description: 'Panel central con batería de respaldo, sirena integrada, compatible con app Tuya / Smart Life y notificación de llamada.',
    unitPrice: 13500,
    unit: 'kit'
  },
  {
    id: 'prod-ala-02',
    name: 'Sensor de Movimiento Infrarrojo PIR Inalámbrico Antimascotas',
    category: 'alarmas',
    type: 'product',
    description: 'Detector de movimiento con inmunidad para mascotas de hasta 20 kg y alcance de 12 metros.',
    unitPrice: 1650,
    unit: 'unidad'
  },
  {
    id: 'prod-ala-03',
    name: 'Sensor Magnético Inalámbrico para Puertas y Ventanas',
    category: 'alarmas',
    type: 'product',
    description: 'Contacto magnético de respuesta inmediata para perímetro.',
    unitPrice: 950,
    unit: 'unidad'
  },
  {
    id: 'prod-ala-04',
    name: 'Sirena Exterior de Alta Potencia 120dB con Luz Estroboscópica',
    category: 'alarmas',
    type: 'product',
    description: 'Sirena acústica y lumínica disuasiva resistente al agua y polvo.',
    unitPrice: 2800,
    unit: 'unidad'
  },

  // Intercom y Video Porteros
  {
    id: 'prod-int-01',
    name: 'Kit de Video Portero IP con Pantalla Táctil 7" y Cámara HD',
    category: 'intercom',
    type: 'product',
    description: 'Frente de calle exterior con visión nocturna y timbre, pantalla interior touch para responder y abrir cerradura desde la app móvil.',
    unitPrice: 18900,
    unit: 'kit'
  },
  {
    id: 'prod-int-02',
    name: 'Frente de Calle Multi-Apartamento para Edificios (Citofonía Digital)',
    category: 'intercom',
    type: 'product',
    description: 'Panel de marcación digital con teclado numérico, lector de tarjetas y directorio para condominios de hasta 100 departamentos.',
    unitPrice: 36000,
    unit: 'unidad'
  },

  // Mano de Obra y Servicios Técnicos
  {
    id: 'serv-lab-01',
    name: 'Instalación y Configuración de Cámara de Seguridad (por punto)',
    category: 'camaras',
    type: 'labor',
    description: 'Fijación, conexionado, canalizado de hasta 20m, ponchado RJ45, enfoque, configuración en NVR y vinculación a aplicación móvil.',
    unitPrice: 1500,
    unit: 'punto'
  },
  {
    id: 'serv-lab-02',
    name: 'Instalación Mecánica y Eléctrica de Motor de Portón',
    category: 'motores',
    type: 'labor',
    description: 'Soldadura de cremalleras o soportes, fijación de base, cableado de potencia, programación de fines de carrera y calibración de controles.',
    unitPrice: 5500,
    unit: 'servicio'
  },
  {
    id: 'serv-lab-03',
    name: 'Instalación de Sistema de Control de Acceso y Cerradura Magnética',
    category: 'acceso',
    type: 'labor',
    description: 'Montaje de electroimán con soporte ZL, instalación de botón de salida, lector biométrico, fuente y programación de usuarios.',
    unitPrice: 4500,
    unit: 'puerta'
  },
  {
    id: 'serv-lab-04',
    name: 'Tendido y Certificación de Punto de Red Cat6',
    category: 'redes',
    type: 'labor',
    description: 'Canalizado superficial o empotrado, paso de cable UTP, ponchado jack rj45, patch panel y prueba de continuidad/velocidad.',
    unitPrice: 1200,
    unit: 'punto'
  },
  {
    id: 'serv-lab-05',
    name: 'Levantamiento Técnico y Diagnóstico en Sitio',
    category: 'otros',
    type: 'service',
    description: 'Visita técnica de evaluación de necesidades, medición perimetral y elaboración de propuesta técnica formal.',
    unitPrice: 1000,
    unit: 'visita'
  }
];

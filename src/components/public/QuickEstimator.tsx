import React, { useState } from 'react';
import { useAppState } from '../../context/AppStateContext';
import { 
  Plus, 
  Minus, 
  MessageCircle, 
  CheckCircle2, 
  Phone, 
  User, 
  MapPin, 
  Building2,
  FileDown,
  ShieldCheck,
  HardDrive,
  Clock,
  Layers,
  Check,
  Video,
  Radio,
  Wifi,
  Lock,
  CalendarCheck,
  Bell,
  PhoneCall,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { formatCurrency, createWhatsAppUrl } from '../../utils/formatters';
import jsPDF from 'jspdf';

interface EstimatorConfig {
  preset: 'custom' | 'office' | 'residential' | 'industrial';
  // 1. Videovigilancia CCTV
  cameras: number;
  cameraType: 'hd' | 'ip_colorvu' | 'ptz';
  storageDays: 15 | 30 | 60;
  // 2. Automatización de Portones
  gateMotor: boolean;
  gateMotorType: 'corredizo' | 'batiente';
  gateSmartModule: boolean;
  gatePhotocells: boolean;
  // 3. Infraestructura de Red & Wi-Fi 6
  networkPoints: number;
  wifiAccessPoints: number;
  // 4. Control de Acceso & Cerraduras
  magneticDoors: number;
  accessControl: boolean;
  accessType: 'rfid' | 'facial';
  // 5. Control de Asistencia
  timeClocks: number;
  // 6. Sistema de Alarma
  alarmSystem: boolean;
  // 7. Video Porteros & Intercom
  intercomUnits: number;
  // Fiscal DGII
  includeItbis: boolean;
}

interface BreakdownItem {
  name: string;
  category: string;
  qty: number;
  unitPrice: number;
  totalPrice: number;
  details?: string;
}

export const QuickEstimator: React.FC = () => {
  const { companySettings, addDeal } = useAppState();

  const [config, setConfig] = useState<EstimatorConfig>({
    preset: 'office',
    cameras: 4,
    cameraType: 'ip_colorvu',
    storageDays: 30,
    gateMotor: false,
    gateMotorType: 'corredizo',
    gateSmartModule: true,
    gatePhotocells: true,
    networkPoints: 4,
    wifiAccessPoints: 1,
    magneticDoors: 1,
    accessControl: true,
    accessType: 'facial',
    timeClocks: 1,
    alarmSystem: false,
    intercomUnits: 0,
    includeItbis: false
  });

  const [showBreakdown, setShowBreakdown] = useState(false);
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientAddress, setClientAddress] = useState('');
  const [clientType, setClientType] = useState<'residential' | 'commercial' | 'building'>('commercial');
  const [submitted, setSubmitted] = useState(false);
  const [generatingPdf, setGeneratingPdf] = useState(false);

  // Apply Quick Preset
  const handleApplyPreset = (preset: 'office' | 'residential' | 'industrial') => {
    if (preset === 'office') {
      setConfig({
        preset: 'office',
        cameras: 4,
        cameraType: 'ip_colorvu',
        storageDays: 30,
        gateMotor: false,
        gateMotorType: 'corredizo',
        gateSmartModule: false,
        gatePhotocells: false,
        networkPoints: 4,
        wifiAccessPoints: 1,
        magneticDoors: 1,
        accessControl: true,
        accessType: 'facial',
        timeClocks: 1,
        alarmSystem: true,
        intercomUnits: 0,
        includeItbis: config.includeItbis
      });
      setClientType('commercial');
    } else if (preset === 'residential') {
      setConfig({
        preset: 'residential',
        cameras: 4,
        cameraType: 'ip_colorvu',
        storageDays: 30,
        gateMotor: true,
        gateMotorType: 'corredizo',
        gateSmartModule: true,
        gatePhotocells: true,
        networkPoints: 2,
        wifiAccessPoints: 1,
        magneticDoors: 0,
        accessControl: false,
        accessType: 'facial',
        timeClocks: 0,
        alarmSystem: false,
        intercomUnits: 1,
        includeItbis: config.includeItbis
      });
      setClientType('residential');
    } else if (preset === 'industrial') {
      setConfig({
        preset: 'industrial',
        cameras: 8,
        cameraType: 'ip_colorvu',
        storageDays: 60,
        gateMotor: true,
        gateMotorType: 'corredizo',
        gateSmartModule: true,
        gatePhotocells: true,
        networkPoints: 8,
        wifiAccessPoints: 2,
        magneticDoors: 2,
        accessControl: true,
        accessType: 'facial',
        timeClocks: 2,
        alarmSystem: true,
        intercomUnits: 1,
        includeItbis: true
      });
      setClientType('building');
    }
  };

  // Mark preset as custom when user alters values manually
  const updateConfig = (updater: (prev: EstimatorConfig) => EstimatorConfig) => {
    setConfig(prev => {
      const updated = updater(prev);
      return { ...updated, preset: 'custom' };
    });
  };

  // Generate detailed Bill of Materials
  const getBreakdownItems = (): BreakdownItem[] => {
    const items: BreakdownItem[] = [];

    // 1. CCTV
    if (config.cameras > 0) {
      const camUnit = config.cameraType === 'ip_colorvu' ? 3800 : config.cameraType === 'ptz' ? 14000 : 2500;
      const camLabel = config.cameraType === 'ip_colorvu' 
        ? 'Cámara IP ColorVu 24/7 (Audio + Luz Blanca)' 
        : config.cameraType === 'ptz' 
        ? 'Cámara PTZ Domo 360° Zoom Óptico 25x' 
        : 'Cámara HD 1080p Infrarrojo Tradicional';
      items.push({
        name: camLabel,
        category: 'Videovigilancia',
        qty: config.cameras,
        unitPrice: camUnit,
        totalPrice: config.cameras * camUnit
      });

      // NVR / DVR
      const nvrPrice = config.cameras <= 4 ? 6500 : config.cameras <= 8 ? 11500 : 18500;
      const nvrChannels = config.cameras <= 4 ? 4 : config.cameras <= 8 ? 8 : 16;
      items.push({
        name: `Grabador NVR/DVR ${nvrChannels} Canales 4K H.265+`,
        category: 'Videovigilancia',
        qty: 1,
        unitPrice: nvrPrice,
        totalPrice: nvrPrice
      });

      // HDD
      const hddPrice = config.storageDays === 15 ? 3800 : config.storageDays === 30 ? 5200 : 8900;
      const hddCapacity = config.storageDays === 15 ? '1TB' : config.storageDays === 30 ? '2TB' : '4TB';
      items.push({
        name: `Disco Duro Surveillance ${hddCapacity} (Western Digital Purple / Seagate SkyHawk)`,
        category: 'Videovigilancia',
        qty: 1,
        unitPrice: hddPrice,
        totalPrice: hddPrice,
        details: `Retención estimada: ~${config.storageDays} días`
      });

      // Mano de obra e insumos CCTV
      const laborPerCam = 1500;
      items.push({
        name: `Instalación, cableado estructurado Cat6 y cajas de paso por punto`,
        category: 'Mano de Obra & Insumos',
        qty: config.cameras,
        unitPrice: laborPerCam,
        totalPrice: config.cameras * laborPerCam
      });
    }

    // 2. Portones
    if (config.gateMotor) {
      const motorBase = config.gateMotorType === 'corredizo' ? 24500 : 42000;
      const motorName = config.gateMotorType === 'corredizo' 
        ? 'Motor Corredizo Industrial 800kg + 4m Cremalleras + 2 Controles' 
        : 'Sistema Batiente Doble Brazo Electromecánico + Central + 2 Controles';
      items.push({
        name: motorName,
        category: 'Automatización',
        qty: 1,
        unitPrice: motorBase,
        totalPrice: motorBase
      });

      items.push({
        name: 'Instalación mecánica, soldadura y calibración de finales de carrera',
        category: 'Mano de Obra & Insumos',
        qty: 1,
        unitPrice: 5500,
        totalPrice: 5500
      });

      if (config.gateSmartModule) {
        items.push({
          name: 'Módulo Wi-Fi Inteligente para apertura remota vía Smartphone',
          category: 'Automatización',
          qty: 1,
          unitPrice: 3500,
          totalPrice: 3500
        });
      }

      if (config.gatePhotocells) {
        items.push({
          name: 'Par de Fotoceldas Infrarrojas de Seguridad Anti-aplastamiento',
          category: 'Automatización',
          qty: 1,
          unitPrice: 2800,
          totalPrice: 2800
        });
      }
    }

    // 3. Redes
    if (config.networkPoints > 0) {
      items.push({
        name: 'Puntos de Red Cat6 100% Cobre con Faceplate, Jack RJ45 y Patch Cord',
        category: 'Redes & Datos',
        qty: config.networkPoints,
        unitPrice: 1200,
        totalPrice: config.networkPoints * 1200
      });
    }

    if (config.wifiAccessPoints > 0) {
      items.push({
        name: 'Access Point Corporativo Wi-Fi 6 de Alta Densidad (PoE)',
        category: 'Redes & Datos',
        qty: config.wifiAccessPoints,
        unitPrice: 9400,
        totalPrice: config.wifiAccessPoints * 9400
      });
    }

    // 4. Control de Acceso
    if (config.magneticDoors > 0) {
      const lockPrice = 4200;
      const bracketPrice = 1600;
      const labor = 4500;
      items.push({
        name: 'Cerradura Electromagnética 600-1200 lbs + Soporte ZL + Pulsador No-Touch',
        category: 'Control de Acceso',
        qty: config.magneticDoors,
        unitPrice: lockPrice + bracketPrice + labor,
        totalPrice: config.magneticDoors * (lockPrice + bracketPrice + labor)
      });

      items.push({
        name: 'Fuente de Alimentación Centralizada con Batería de Respaldo 12V 7Ah',
        category: 'Control de Acceso',
        qty: 1,
        unitPrice: 3900,
        totalPrice: 3900
      });
    }

    if (config.accessControl) {
      const terminalPrice = config.accessType === 'facial' ? 16500 : 4500;
      const terminalName = config.accessType === 'facial'
        ? 'Terminal Biométrico Facial con Reconocimiento en <0.2s + Huella + RFID'
        : 'Lector Autonómo de Tarjetas RFID y Llaveros de Proximidad';
      items.push({
        name: terminalName,
        category: 'Control de Acceso',
        qty: 1,
        unitPrice: terminalPrice,
        totalPrice: terminalPrice
      });
    }

    // 5. Ponchadores
    if (config.timeClocks > 0) {
      items.push({
        name: 'Reloj Checador / Ponchador Biométrico con Software de Asistencia y Turnos',
        category: 'Asistencia Laboral',
        qty: config.timeClocks,
        unitPrice: 11500,
        totalPrice: config.timeClocks * 11500
      });
    }

    // 6. Alarma
    if (config.alarmSystem) {
      items.push({
        name: 'Sistema de Alarma Inalámbrico (Central + 2 Sensores PIR + 2 Contactos + Sirena 110dB + App)',
        category: 'Intrusión',
        qty: 1,
        unitPrice: 16500,
        totalPrice: 16500
      });
    }

    // 7. Intercom
    if (config.intercomUnits > 0) {
      items.push({
        name: 'Frente de Calle Intercom IP HD con Apertura de Cerradura',
        category: 'Citofonía',
        qty: 1,
        unitPrice: 18900,
        totalPrice: 18900
      });

      if (config.intercomUnits > 1) {
        items.push({
          name: 'Pantalla Táctil Interior 7" Adicional para Video Portero',
          category: 'Citofonía',
          qty: config.intercomUnits - 1,
          unitPrice: 8500,
          totalPrice: (config.intercomUnits - 1) * 8500
        });
      }
    }

    return items;
  };

  const breakdownItems = getBreakdownItems();
  const subtotal = breakdownItems.reduce((acc, item) => acc + item.totalPrice, 0);
  const itbis = config.includeItbis ? Math.round(subtotal * 0.18) : 0;
  const currentEstimatedTotal = subtotal + itbis;

  // Handle WhatsApp submission and Lead creation in CRM
  const handleCreateLeadAndWhatsApp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName || !clientPhone) return;

    const summaryItems: string[] = [];
    if (config.cameras > 0) summaryItems.push(`${config.cameras} Cámaras (${config.cameraType.toUpperCase()}, ${config.storageDays}d retención)`);
    if (config.gateMotor) summaryItems.push(`Motor de Portón (${config.gateMotorType}${config.gateSmartModule ? ' + Wi-Fi' : ''})`);
    if (config.magneticDoors > 0) summaryItems.push(`${config.magneticDoors} Cerraduras Magnéticas`);
    if (config.accessControl) summaryItems.push(`Control de Acceso (${config.accessType})`);
    if (config.networkPoints > 0) summaryItems.push(`${config.networkPoints} Puntos de Red Cat6`);
    if (config.wifiAccessPoints > 0) summaryItems.push(`${config.wifiAccessPoints} APs Wi-Fi 6`);
    if (config.timeClocks > 0) summaryItems.push(`${config.timeClocks} Ponchadores Biométricos`);
    if (config.alarmSystem) summaryItems.push(`Sistema de Alarma contra Intrusión`);
    if (config.intercomUnits > 0) summaryItems.push(`${config.intercomUnits} Puntos de Intercom`);

    await addDeal({
      title: `Cotizador Web: ${summaryItems[0] || 'Seguridad Integral'}`,
      clientName,
      clientPhone,
      clientAddress,
      clientType: clientType,
      serviceCategory: config.cameras > 0 ? 'camaras' : config.gateMotor ? 'motores' : 'redes',
      stage: 'prospect',
      priority: 'high',
      estimatedValue: currentEstimatedTotal,
      notes: `Requerimientos seleccionados en Consola Web:\n${summaryItems.map(s => `- ${s}`).join('\n')}\n${config.includeItbis ? 'Comprobante Fiscal B01 solicitado (con ITBIS 18%).' : 'Precio base preliminar.'}`
    });

    setSubmitted(true);

    let msg = `¡Hola NexaGate Security! Mi nombre es *${clientName}*.\n\n`;
    msg += `He configurado la siguiente cotización preliminar en la Consola Web:\n`;
    msg += `-----------------------------------------\n`;
    msg += summaryItems.map(item => `• ${item}`).join('\n') + `\n`;
    msg += `-----------------------------------------\n`;
    if (config.includeItbis) {
      msg += `Subtotal: ${formatCurrency(subtotal)}\n`;
      msg += `ITBIS (18%): ${formatCurrency(itbis)}\n`;
      msg += `💰 *TOTAL FACTURADO:* ${formatCurrency(currentEstimatedTotal)}\n`;
      msg += `📄 *Factura Fiscal:* Requiere Comprobante B01\n`;
    } else {
      msg += `💰 *PRESUPUESTO ESTIMADO:* ${formatCurrency(currentEstimatedTotal)}\n`;
    }
    if (clientAddress) msg += `📍 *Ubicación / Sector:* ${clientAddress}\n`;
    msg += `\n¿Podrían coordinar una visita técnica presencial o enviarme la cotización formal?`;

    setTimeout(() => {
      window.open(createWhatsAppUrl(companySettings.whatsapp, msg), '_blank');
    }, 400);
  };

  // Generate and Download Branded PDF Quote
  const handleDownloadPdf = () => {
    setGeneratingPdf(true);
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const primaryColor = [0, 114, 255]; // #0072ff
      const darkBg = [10, 14, 24];
      const textColor = [255, 255, 255];
      const slateGray = [148, 163, 184];

      // Header Banner Background
      doc.setFillColor(darkBg[0], darkBg[1], darkBg[2]);
      doc.rect(0, 0, 210, 42, 'F');

      // Top line accent
      doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.rect(0, 0, 210, 3, 'F');

      // Brand Title
      doc.setTextColor(textColor[0], textColor[1], textColor[2]);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(18);
      doc.text('NEXAGATE SECURITY', 14, 16);

      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(slateGray[0], slateGray[1], slateGray[2]);
      doc.text('CÁMARAS DE SEGURIDAD · PORTONES ELÉCTRICOS · CONTROLES DE ACCESO', 14, 22);
      doc.text(`Razón Social: ${companySettings.name} · RNC: ${companySettings.rnc} · Tel: ${companySettings.phone}`, 14, 27);
      doc.text(`Dirección: ${companySettings.address}, ${companySettings.city}`, 14, 32);

      // Quote metadata badge
      const quoteCode = `COT-PRE-${Date.now().toString().slice(-6)}`;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(0, 114, 255);
      doc.text('ESTIMACIÓN TÉCNICA', 145, 16);
      doc.setFontSize(8);
      doc.setTextColor(255, 255, 255);
      doc.text(`Referencia: ${quoteCode}`, 145, 22);
      doc.text(`Fecha: ${new Date().toLocaleDateString('es-DO')}`, 145, 27);
      doc.text(`Validez: 15 Días Calendario`, 145, 32);

      // Client Box
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(14, 48, 182, 22, 2, 2, 'F');
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(14, 48, 182, 22, 2, 2, 'S');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(15, 23, 42);
      doc.text('CLIENTE / PROSPECTO:', 18, 55);
      doc.setFont('helvetica', 'normal');
      doc.text(clientName || 'Cliente Particular / Empresa', 62, 55);

      doc.setFont('helvetica', 'bold');
      doc.text('CONTACTO TELEFÓNICO:', 18, 62);
      doc.setFont('helvetica', 'normal');
      doc.text(clientPhone || 'Por coordinar', 62, 62);

      if (clientAddress) {
        doc.setFont('helvetica', 'bold');
        doc.text('UBICACIÓN:', 125, 55);
        doc.setFont('helvetica', 'normal');
        doc.text(clientAddress, 147, 55);
      }

      // Table Header
      let y = 78;
      doc.setFillColor(15, 23, 42);
      doc.rect(14, y, 182, 8, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.text('DESCRIPCIÓN DE PARTIDA / EQUIPAMIENTO', 18, y + 5.5);
      doc.text('CANT.', 135, y + 5.5);
      doc.text('PRECIO UNIT.', 152, y + 5.5);
      doc.text('TOTAL (DOP)', 175, y + 5.5);

      y += 8;

      // Table Rows
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(30, 41, 59);

      breakdownItems.forEach((item, index) => {
        if (y > 250) {
          doc.addPage();
          y = 20;
        }

        const bg = index % 2 === 0 ? 255 : 248;
        doc.setFillColor(bg, bg, bg);
        doc.rect(14, y, 182, 7, 'F');

        doc.text(item.name.length > 70 ? item.name.substring(0, 68) + '...' : item.name, 18, y + 4.8);
        doc.text(item.qty.toString(), 138, y + 4.8);
        doc.text(formatCurrency(item.unitPrice), 152, y + 4.8);
        doc.text(formatCurrency(item.totalPrice), 175, y + 4.8);

        y += 7;
      });

      // Bottom Totals Box
      y += 4;
      doc.setDrawColor(203, 213, 225);
      doc.line(14, y, 196, y);
      y += 6;

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(51, 65, 85);
      doc.text('SUBTOTAL EQUIPOS E INSTALACIÓN:', 110, y);
      doc.text(formatCurrency(subtotal), 172, y);

      if (config.includeItbis) {
        y += 5;
        doc.text('ITBIS REGULATORIO (18%):', 110, y);
        doc.text(formatCurrency(itbis), 172, y);
      }

      y += 6;
      doc.setFillColor(0, 114, 255);
      doc.rect(108, y - 4, 88, 8, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      doc.text('TOTAL ESTIMADO (DOP):', 112, y + 1.5);
      doc.text(formatCurrency(currentEstimatedTotal), 170, y + 1.5);

      // Terms & Guarantee Note
      y += 18;
      doc.setFillColor(241, 245, 249);
      doc.roundedRect(14, y, 182, 28, 2, 2, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(15, 23, 42);
      doc.text('CONDICIONES GENERALES Y GARANTÍA ESCRITA:', 18, y + 6);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(71, 85, 105);
      doc.text('• Todos los equipos cuentan con 1 año de garantía escrita con reemplazo inmediato ante defectos de fábrica.', 18, y + 11);
      doc.text('• Instalación efectuada bajo normas de cableado estructurado ANSI/TIA-568 y tuberías de protección EMT/PVC.', 18, y + 15);
      doc.text('• Los montos reflejados son estimaciones preliminares sujetas a confirmación tras levantamiento técnico en sitio.', 18, y + 19);
      doc.text('• Soporte técnico post-venta 24/7 y aplicaciones móviles sin cuotas mensuales recurrentes.', 18, y + 23);

      // Save PDF
      doc.save(`NexaGate_Cotizacion_${clientName ? clientName.replace(/\s+/g, '_') : 'Estimada'}.pdf`);
    } catch (err) {
      console.error('Error generating PDF', err);
    } finally {
      setGeneratingPdf(false);
    }
  };

  return (
    <section id="cotizador" className="py-24 bg-[#080c14] border-y border-slate-800/80 relative transition-colors">
      {/* Subtle background illumination */}
      <div className="absolute top-1/4 right-1/4 w-[600px] h-[400px] bg-nexablue-600/10 blur-[160px] rounded-full pointer-events-none -z-10" />
      <div className="absolute bottom-1/4 left-10 w-[400px] h-[300px] bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header - No eyebrow per craft rules */}
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-4">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
            Consola de Configuración y Estimación
          </h2>
          <p className="text-slate-300 text-base sm:text-lg font-normal leading-relaxed">
            Personaliza las partidas de videovigilancia, automatización y control perimetral para calcular una estimación preliminar con equipamiento certificado e instalación en República Dominicana.
          </p>

          {/* Quick Presets Bar */}
          <div className="pt-4 flex items-center justify-center gap-2 sm:gap-3 flex-wrap">
            <span className="text-xs font-mono text-slate-400 font-bold uppercase mr-1">Kits Rápidos:</span>
            
            <button
              type="button"
              onClick={() => handleApplyPreset('office')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 ${
                config.preset === 'office'
                  ? 'bg-nexablue-600 border-nexablue-400 text-white shadow-glow-nexablue'
                  : 'bg-[#0a0e18] border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
              }`}
            >
              <Building2 className="w-3.5 h-3.5 text-nexablue-400" />
              <span>Oficina / Comercio</span>
            </button>

            <button
              type="button"
              onClick={() => handleApplyPreset('residential')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 ${
                config.preset === 'residential'
                  ? 'bg-nexablue-600 border-nexablue-400 text-white shadow-glow-nexablue'
                  : 'bg-[#0a0e18] border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Residencial / Villa</span>
            </button>

            <button
              type="button"
              onClick={() => handleApplyPreset('industrial')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 ${
                config.preset === 'industrial'
                  ? 'bg-nexablue-600 border-nexablue-400 text-white shadow-glow-nexablue'
                  : 'bg-[#0a0e18] border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-amber-400" />
              <span>Industrial / Almacén</span>
            </button>

            {config.preset === 'custom' && (
              <span className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-nexablue-400 text-xs font-mono">
                Configuración a Medida
              </span>
            )}
          </div>
        </div>

        {/* Two Columns: Options Grid & Live Budget Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: 7 Hardware Modules (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* 1. Videovigilancia CCTV */}
            <div className="p-6 sm:p-7 rounded-3xl bg-[#0a0e18] border border-slate-800 space-y-5 shadow-xl">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-nexablue-500/10 border border-nexablue-500/20 flex items-center justify-center text-nexablue-400 flex-shrink-0 mt-0.5">
                    <Video className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-white">
                      Sistemas de Videovigilancia CCTV / IP
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Grabador NVR/DVR 4K, disco duro surveillance dedicado, cableado e instalación
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 bg-[#06080e] p-1.5 rounded-xl border border-slate-800 shadow-inner">
                  <button
                    type="button"
                    onClick={() => updateConfig(prev => ({ ...prev, cameras: Math.max(0, prev.cameras - 2) }))}
                    className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 disabled:opacity-30 transition-colors"
                    disabled={config.cameras <= 0}
                    aria-label="Disminuir cámaras"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-10 text-center text-sm font-mono font-black text-white">{config.cameras}</span>
                  <button
                    type="button"
                    onClick={() => updateConfig(prev => ({ ...prev, cameras: prev.cameras + 2 }))}
                    className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 transition-colors"
                    aria-label="Aumentar cámaras"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {config.cameras > 0 && (
                <div className="space-y-4 pt-3 border-t border-slate-800">
                  {/* Camera Optical Technology */}
                  <div>
                    <div className="text-xs font-mono text-slate-400 mb-2 font-bold uppercase">Óptica y Tecnología de Lente:</div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      <button
                        type="button"
                        onClick={() => updateConfig(prev => ({ ...prev, cameraType: 'ip_colorvu' }))}
                        className={`p-3 rounded-2xl text-xs text-left transition-all border ${
                          config.cameraType === 'ip_colorvu'
                            ? 'bg-nexablue-950/80 border-nexablue-500 text-white shadow-glow-nexablue'
                            : 'bg-[#06080e] border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                        }`}
                      >
                        <div className="font-bold flex items-center justify-between">
                          <span>IP ColorVu 24/7</span>
                          <span className="text-[10px] text-nexablue-400 font-mono">Top</span>
                        </div>
                        <div className="text-[11px] text-slate-400 mt-1">Color total nocturno + micrófono</div>
                      </button>

                      <button
                        type="button"
                        onClick={() => updateConfig(prev => ({ ...prev, cameraType: 'hd' }))}
                        className={`p-3 rounded-2xl text-xs text-left transition-all border ${
                          config.cameraType === 'hd'
                            ? 'bg-nexablue-950/80 border-nexablue-500 text-white shadow-glow-nexablue'
                            : 'bg-[#06080e] border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                        }`}
                      >
                        <div className="font-bold">HD 1080p Estándar</div>
                        <div className="text-[11px] text-slate-400 mt-1">Infrarrojo tradicional blanco y negro</div>
                      </button>

                      <button
                        type="button"
                        onClick={() => updateConfig(prev => ({ ...prev, cameraType: 'ptz' }))}
                        className={`p-3 rounded-2xl text-xs text-left transition-all border ${
                          config.cameraType === 'ptz'
                            ? 'bg-nexablue-950/80 border-nexablue-500 text-white shadow-glow-nexablue'
                            : 'bg-[#06080e] border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                        }`}
                      >
                        <div className="font-bold">PTZ Domo 360°</div>
                        <div className="text-[11px] text-slate-400 mt-1">Zoom óptico 25x y seguimiento IA</div>
                      </button>
                    </div>
                  </div>

                  {/* Storage Retention Selection */}
                  <div>
                    <div className="text-xs font-mono text-slate-400 mb-2 font-bold uppercase flex items-center justify-between">
                      <span>Capacidad de Almacenamiento Continuo:</span>
                      <span className="text-nexablue-400 font-normal">H.265+ Surveillance Grade</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2.5">
                      {[
                        { days: 15, label: '15 Días (1TB)', desc: 'Residencias pequeñas' },
                        { days: 30, label: '30 Días (2TB)', desc: 'Estándar normativo' },
                        { days: 60, label: '60 Días (4TB)', desc: 'Auditoría corporativa' }
                      ].map((s) => (
                        <button
                          key={s.days}
                          type="button"
                          onClick={() => updateConfig(prev => ({ ...prev, storageDays: s.days as 15 | 30 | 60 }))}
                          className={`p-2.5 rounded-xl text-xs text-left border transition-all ${
                            config.storageDays === s.days
                              ? 'bg-nexablue-950/80 border-nexablue-500 text-white'
                              : 'bg-[#06080e] border-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          <div className="font-bold">{s.label}</div>
                          <div className="text-[10px] text-slate-500 mt-0.5">{s.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 2. Automatización de Portones */}
            <div className="p-6 sm:p-7 rounded-3xl bg-[#0a0e18] border border-slate-800 space-y-5 shadow-xl">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-nexablue-500/10 border border-nexablue-500/20 flex items-center justify-center text-nexablue-400 flex-shrink-0 mt-0.5">
                    <Radio className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-white">
                      Automatización de Portón Eléctrico
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Motores electromecánicos italianos, cremalleras de acero y controles remotos
                    </p>
                  </div>
                </div>
                
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.gateMotor}
                    onChange={(e) => updateConfig(prev => ({ ...prev, gateMotor: e.target.checked }))}
                    className="sr-only peer"
                  />
                  <div className="w-12 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-nexablue-600"></div>
                </label>
              </div>

              {config.gateMotor && (
                <div className="space-y-3 pt-3 border-t border-slate-800">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => updateConfig(prev => ({ ...prev, gateMotorType: 'corredizo' }))}
                      className={`py-3 px-4 rounded-2xl text-xs font-bold text-left transition-all border ${
                        config.gateMotorType === 'corredizo'
                          ? 'bg-nexablue-950/80 border-nexablue-500 text-white shadow-glow-nexablue'
                          : 'bg-[#06080e] border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      <div className="font-bold">Corredizo / Deslizante (800kg)</div>
                      <div className="text-[11px] text-slate-400 mt-1">Para portones sobre riel vehicular</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => updateConfig(prev => ({ ...prev, gateMotorType: 'batiente' }))}
                      className={`py-3 px-4 rounded-2xl text-xs font-bold text-left transition-all border ${
                        config.gateMotorType === 'batiente'
                          ? 'bg-nexablue-950/80 border-nexablue-500 text-white shadow-glow-nexablue'
                          : 'bg-[#06080e] border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      <div className="font-bold">Batiente Doble Brazo</div>
                      <div className="text-[11px] text-slate-400 mt-1">Para portones abatibles de 2 hojas</div>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <label className="flex items-center gap-3 p-3 rounded-xl bg-[#06080e] border border-slate-800 cursor-pointer text-xs font-semibold text-slate-300 hover:border-slate-700">
                      <input
                        type="checkbox"
                        checked={config.gateSmartModule}
                        onChange={(e) => updateConfig(prev => ({ ...prev, gateSmartModule: e.target.checked }))}
                        className="rounded bg-slate-800 border-slate-700 text-nexablue-600 focus:ring-nexablue-500"
                      />
                      <span>Módulo Wi-Fi Smartphone</span>
                    </label>

                    <label className="flex items-center gap-3 p-3 rounded-xl bg-[#06080e] border border-slate-800 cursor-pointer text-xs font-semibold text-slate-300 hover:border-slate-700">
                      <input
                        type="checkbox"
                        checked={config.gatePhotocells}
                        onChange={(e) => updateConfig(prev => ({ ...prev, gatePhotocells: e.target.checked }))}
                        className="rounded bg-slate-800 border-slate-700 text-nexablue-600 focus:ring-nexablue-500"
                      />
                      <span>Fotoceldas Anti-aplastamiento</span>
                    </label>
                  </div>
                </div>
              )}
            </div>

            {/* 3. Infraestructura de Red & Wi-Fi 6 */}
            <div className="p-6 sm:p-7 rounded-3xl bg-[#0a0e18] border border-slate-800 space-y-4 shadow-xl">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-nexablue-500/10 border border-nexablue-500/20 flex items-center justify-center text-nexablue-400 flex-shrink-0 mt-0.5">
                  <Wifi className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-white">
                    Infraestructura de Red & Wi-Fi 6
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Cableado estructurado Cat6 100% cobre certificado y Access Points empresariales
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#06080e] border border-slate-800">
                  <span className="text-xs font-bold text-slate-200">Puntos de Red Cat6:</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => updateConfig(prev => ({ ...prev, networkPoints: Math.max(0, prev.networkPoints - 1) }))}
                      className="p-1.5 rounded-lg bg-slate-900 text-slate-300 hover:bg-slate-800 font-bold"
                      aria-label="Disminuir puntos de red"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-6 text-center text-xs font-mono font-black text-white">{config.networkPoints}</span>
                    <button
                      type="button"
                      onClick={() => updateConfig(prev => ({ ...prev, networkPoints: prev.networkPoints + 1 }))}
                      className="p-1.5 rounded-lg bg-slate-900 text-slate-300 hover:bg-slate-800 font-bold"
                      aria-label="Aumentar puntos de red"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#06080e] border border-slate-800">
                  <span className="text-xs font-bold text-slate-200">APs Wi-Fi 6 Corporativos:</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => updateConfig(prev => ({ ...prev, wifiAccessPoints: Math.max(0, prev.wifiAccessPoints - 1) }))}
                      className="p-1.5 rounded-lg bg-slate-900 text-slate-300 hover:bg-slate-800 font-bold"
                      aria-label="Disminuir APs"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-6 text-center text-xs font-mono font-black text-white">{config.wifiAccessPoints}</span>
                    <button
                      type="button"
                      onClick={() => updateConfig(prev => ({ ...prev, wifiAccessPoints: prev.wifiAccessPoints + 1 }))}
                      className="p-1.5 rounded-lg bg-slate-900 text-slate-300 hover:bg-slate-800 font-bold"
                      aria-label="Aumentar APs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* 4. Control de Acceso & Cerraduras Magnéticas */}
            <div className="p-6 sm:p-7 rounded-3xl bg-[#0a0e18] border border-slate-800 space-y-4 shadow-xl">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-nexablue-500/10 border border-nexablue-500/20 flex items-center justify-center text-nexablue-400 flex-shrink-0 mt-0.5">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-white">
                    Control de Acceso & Cerraduras Magnéticas
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Electroimanes 600-1200 lbs, pulsadores no-touch y terminales biométricos
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#06080e] border border-slate-800">
                  <span className="text-xs font-bold text-slate-200">Puertas con Electroimán:</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => updateConfig(prev => ({ ...prev, magneticDoors: Math.max(0, prev.magneticDoors - 1) }))}
                      className="p-1.5 rounded-lg bg-slate-900 text-slate-300 hover:bg-slate-800 font-bold"
                      aria-label="Disminuir electroimanes"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-6 text-center text-xs font-mono font-black text-white">{config.magneticDoors}</span>
                    <button
                      type="button"
                      onClick={() => updateConfig(prev => ({ ...prev, magneticDoors: prev.magneticDoors + 1 }))}
                      className="p-1.5 rounded-lg bg-slate-900 text-slate-300 hover:bg-slate-800 font-bold"
                      aria-label="Aumentar electroimanes"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#06080e] border border-slate-800">
                  <span className="text-xs font-bold text-slate-200">Lector Biométrico:</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.accessControl}
                      onChange={(e) => updateConfig(prev => ({ ...prev, accessControl: e.target.checked }))}
                      className="sr-only peer"
                    />
                    <div className="w-12 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-nexablue-600"></div>
                  </label>
                </div>
              </div>

              {config.accessControl && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => updateConfig(prev => ({ ...prev, accessType: 'facial' }))}
                    className={`py-2.5 px-3.5 rounded-xl text-xs font-bold text-left transition-all border ${
                      config.accessType === 'facial'
                        ? 'bg-nexablue-950/80 border-nexablue-500 text-white'
                        : 'bg-[#06080e] border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <div className="font-bold">Biometría Facial Anti-Spoofing</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">Reconocimiento sin contacto a 1.5m</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => updateConfig(prev => ({ ...prev, accessType: 'rfid' }))}
                    className={`py-2.5 px-3.5 rounded-xl text-xs font-bold text-left transition-all border ${
                      config.accessType === 'rfid'
                        ? 'bg-nexablue-950/80 border-nexablue-500 text-white'
                        : 'bg-[#06080e] border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <div className="font-bold">Lector RFID / Tarjetas</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">Llaveros y tarjetas de proximidad 125kHz</div>
                  </button>
                </div>
              )}
            </div>

            {/* 5. Control de Asistencia (Ponchadores) */}
            <div className="p-6 sm:p-7 rounded-3xl bg-[#0a0e18] border border-slate-800 space-y-4 shadow-xl">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-nexablue-500/10 border border-nexablue-500/20 flex items-center justify-center text-nexablue-400 flex-shrink-0 mt-0.5">
                    <CalendarCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-white">
                      Control de Asistencia Laboral (Ponchadores)
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Relojes biométricos con software de gestión de turnos, tardanzas y nómina
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 bg-[#06080e] p-1.5 rounded-xl border border-slate-800 shadow-inner">
                  <button
                    type="button"
                    onClick={() => updateConfig(prev => ({ ...prev, timeClocks: Math.max(0, prev.timeClocks - 1) }))}
                    className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 disabled:opacity-30 transition-colors"
                    disabled={config.timeClocks <= 0}
                    aria-label="Disminuir ponchadores"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-10 text-center text-sm font-mono font-black text-white">{config.timeClocks}</span>
                  <button
                    type="button"
                    onClick={() => updateConfig(prev => ({ ...prev, timeClocks: prev.timeClocks + 1 }))}
                    className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 transition-colors"
                    aria-label="Aumentar ponchadores"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* 6. Sistema de Alarma contra Intrusión */}
            <div className="p-6 sm:p-7 rounded-3xl bg-[#0a0e18] border border-slate-800 space-y-4 shadow-xl">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-nexablue-500/10 border border-nexablue-500/20 flex items-center justify-center text-nexablue-400 flex-shrink-0 mt-0.5">
                    <Bell className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-white">
                      Sistema de Alarma contra Intrusión
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Central híbrida, sensores PIR antimascota, sirena de alta potencia y app móvil sin mensualidades
                    </p>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.alarmSystem}
                    onChange={(e) => updateConfig(prev => ({ ...prev, alarmSystem: e.target.checked }))}
                    className="sr-only peer"
                  />
                  <div className="w-12 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-nexablue-600"></div>
                </label>
              </div>
            </div>

            {/* 7. Intercomunicadores & Video Porteros IP */}
            <div className="p-6 sm:p-7 rounded-3xl bg-[#0a0e18] border border-slate-800 space-y-4 shadow-xl">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-nexablue-500/10 border border-nexablue-500/20 flex items-center justify-center text-nexablue-400 flex-shrink-0 mt-0.5">
                    <PhoneCall className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-white">
                      Video Porteros & Intercom IP
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Frentes de calle resistentes a la intemperie y pantallas interiores táctiles de 7"
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 bg-[#06080e] p-1.5 rounded-xl border border-slate-800 shadow-inner">
                  <button
                    type="button"
                    onClick={() => updateConfig(prev => ({ ...prev, intercomUnits: Math.max(0, prev.intercomUnits - 1) }))}
                    className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 disabled:opacity-30 transition-colors"
                    disabled={config.intercomUnits <= 0}
                    aria-label="Disminuir intercomunicadores"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-10 text-center text-sm font-mono font-black text-white">{config.intercomUnits}</span>
                  <button
                    type="button"
                    onClick={() => updateConfig(prev => ({ ...prev, intercomUnits: prev.intercomUnits + 1 }))}
                    className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 transition-colors"
                    aria-label="Aumentar intercomunicadores"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Sticky Budget & Telemetry Console (5 cols) */}
          <div className="lg:col-span-5 sticky top-24 space-y-6">
            
            <div className="p-6 sm:p-7 rounded-3xl bg-[#0a0e18] border border-slate-800 shadow-2xl space-y-6">
              
              {/* Financial Summary Card */}
              <div className="p-6 rounded-2xl bg-[#06080e] border border-slate-800 space-y-4 shadow-inner">
                <div className="flex items-center justify-between text-xs font-mono text-nexablue-400 font-bold uppercase tracking-wider">
                  <span>Presupuesto Estimado</span>
                  <span className="flex items-center gap-1.5 text-emerald-400 text-[10px]">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span>CÁLCULO ACTIVO</span>
                  </span>
                </div>

                <div className="text-3xl sm:text-4xl font-black text-white font-mono tracking-tight">
                  {formatCurrency(currentEstimatedTotal)}
                </div>

                {/* ITBIS DGII Toggle */}
                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-slate-200">Comprobante Fiscal B01</div>
                    <div className="text-[10px] text-slate-500">Incluir ITBIS (18%) para empresas</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.includeItbis}
                      onChange={(e) => updateConfig(prev => ({ ...prev, includeItbis: e.target.checked }))}
                      className="sr-only peer"
                    />
                    <div className="w-10 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-nexablue-600"></div>
                  </label>
                </div>

                {config.includeItbis && (
                  <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] font-mono space-y-1 text-slate-300">
                    <div className="flex justify-between">
                      <span>Subtotal Equipos & Mano de Obra:</span>
                      <span>{formatCurrency(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-amber-400">
                      <span>ITBIS (18%):</span>
                      <span>+{formatCurrency(itbis)}</span>
                    </div>
                  </div>
                )}

                {/* Collapsible Bill of Materials */}
                <button
                  type="button"
                  onClick={() => setShowBreakdown(!showBreakdown)}
                  className="w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-mono flex items-center justify-between transition-colors"
                >
                  <span className="flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-nexablue-400" />
                    <span>Ver Desglose Técnico ({breakdownItems.length} Partidas)</span>
                  </span>
                  {showBreakdown ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                {showBreakdown && (
                  <div className="max-h-60 overflow-y-auto space-y-1.5 pr-1 text-[11px] font-mono border-t border-slate-800 pt-3">
                    {breakdownItems.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between text-slate-400 py-1 border-b border-slate-900">
                        <span className="truncate max-w-[200px]">{item.qty}x {item.name}</span>
                        <span className="text-slate-200 flex-shrink-0 font-bold">{formatCurrency(item.totalPrice)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Technical Telemetry Badges */}
              <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-slate-400">
                <div className="p-2.5 rounded-xl bg-[#06080e] border border-slate-800 flex items-center gap-2">
                  <HardDrive className="w-4 h-4 text-nexablue-400 flex-shrink-0" />
                  <div>
                    <div className="text-white font-bold">~{config.storageDays} Días</div>
                    <div>Grabación Continua</div>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-[#06080e] border border-slate-800 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <div>
                    <div className="text-white font-bold">1 a 3 Días</div>
                    <div>Despliegue Estimado</div>
                  </div>
                </div>
              </div>

              {/* Form to submit and connect with WhatsApp */}
              <form onSubmit={handleCreateLeadAndWhatsApp} className="space-y-3.5">
                <div className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-nexablue-400" />
                  <span>Formalizar Cotización o Visita</span>
                </div>

                <div className="space-y-1">
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      placeholder="Nombre o Razón Social *"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#06080e] border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-nexablue-500 shadow-inner"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      required
                      placeholder="Teléfono / WhatsApp *"
                      value={clientPhone}
                      onChange={(e) => setClientPhone(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#06080e] border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-nexablue-500 shadow-inner"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Sector / Ubicación (ej. Santo Domingo, Piantini)"
                      value={clientAddress}
                      onChange={(e) => setClientAddress(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#06080e] border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-nexablue-500 shadow-inner"
                    />
                  </div>
                </div>

                {/* Primary CTA: WhatsApp */}
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg hover:shadow-emerald-600/30 transition-all border border-emerald-400/30"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Enviar Presupuesto vía WhatsApp</span>
                </button>

                {/* Secondary CTA: Download PDF */}
                <button
                  type="button"
                  onClick={handleDownloadPdf}
                  disabled={generatingPdf}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#06080e] hover:bg-slate-900 text-slate-300 hover:text-white border border-slate-800 hover:border-nexablue-500/50 font-bold text-xs transition-all shadow-sm"
                >
                  <FileDown className="w-4 h-4 text-nexablue-400" />
                  <span>{generatingPdf ? 'Generando PDF...' : 'Descargar Cotización Formal PDF'}</span>
                </button>

                {submitted && (
                  <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2.5 animate-fadeIn">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>¡Cotización registrada en sistema! Conectando con WhatsApp...</span>
                  </div>
                )}
              </form>

            </div>

          </div>

        </div>

      </div>
    </section>
  );
};

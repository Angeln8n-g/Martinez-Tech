import React, { useState } from 'react';
import { useAppState } from '../../context/AppStateContext';
import { 
  Calculator, 
  Plus, 
  Minus, 
  Send, 
  MessageCircle, 
  CheckCircle2, 
  Sparkles, 
  Phone, 
  User, 
  MapPin, 
  Building2,
  HelpCircle
} from 'lucide-react';
import { formatCurrency, createWhatsAppUrl } from '../../utils/formatters';

interface EstimatorConfig {
  cameras: number;
  cameraType: 'hd' | 'ip_colorvu' | 'ptz';
  networkPoints: number;
  wifiAccessPoints: number;
  gateMotor: boolean;
  gateMotorType: 'corredizo' | 'batiente';
  gateSmartModule: boolean;
  magneticDoors: number;
  accessControl: boolean;
  accessType: 'rfid' | 'facial';
  timeClocks: number;
  alarmSystem: boolean;
  intercomUnits: number;
}

export const QuickEstimator: React.FC = () => {
  const { companySettings, addDeal } = useAppState();

  const [config, setConfig] = useState<EstimatorConfig>({
    cameras: 4,
    cameraType: 'ip_colorvu',
    networkPoints: 2,
    wifiAccessPoints: 1,
    gateMotor: false,
    gateMotorType: 'corredizo',
    gateSmartModule: false,
    magneticDoors: 0,
    accessControl: false,
    accessType: 'facial',
    timeClocks: 0,
    alarmSystem: false,
    intercomUnits: 0
  });

  // Client form for lead generation
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientAddress, setClientAddress] = useState('');
  const [clientType, setClientType] = useState<'residential' | 'commercial' | 'building'>('residential');
  const [submitted, setSubmitted] = useState(false);

  // Price calculations in DOP
  const calculateTotal = () => {
    let total = 0;

    if (config.cameras > 0) {
      const camUnit = config.cameraType === 'ip_colorvu' ? 3800 : config.cameraType === 'ptz' ? 14000 : 2500;
      const nvrPrice = config.cameras <= 4 ? 6500 : config.cameras <= 8 ? 11500 : 18500;
      const hddPrice = 5200;
      const laborPerCam = 1500;
      total += (config.cameras * camUnit) + nvrPrice + hddPrice + (config.cameras * laborPerCam);
    }

    if (config.networkPoints > 0) total += config.networkPoints * 1200;
    if (config.wifiAccessPoints > 0) total += config.wifiAccessPoints * 9400;

    if (config.gateMotor) {
      const motorBase = config.gateMotorType === 'corredizo' ? 24500 : 42000;
      const installLabor = 5500;
      total += motorBase + installLabor;
      if (config.gateSmartModule) total += 3500;
    }

    if (config.magneticDoors > 0) {
      const lockPrice = 4200;
      const bracketPrice = 1600;
      const powerSupply = 3900;
      const labor = 4500;
      total += config.magneticDoors * (lockPrice + bracketPrice + labor) + powerSupply;
    }

    if (config.accessControl) {
      const terminalPrice = config.accessType === 'facial' ? 16500 : 4500;
      total += terminalPrice;
    }

    if (config.timeClocks > 0) total += config.timeClocks * 11500;
    if (config.alarmSystem) total += 16500;
    if (config.intercomUnits > 0) total += 18900 + (config.intercomUnits - 1) * 8500;

    return Math.round(total);
  };

  const currentEstimatedTotal = calculateTotal();

  const handleCreateLeadAndWhatsApp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName || !clientPhone) return;

    // Generate details summary
    const summaryItems: string[] = [];
    if (config.cameras > 0) summaryItems.push(`${config.cameras} Cámaras (${config.cameraType.toUpperCase()})`);
    if (config.gateMotor) summaryItems.push(`Motor de Portón (${config.gateMotorType})`);
    if (config.magneticDoors > 0) summaryItems.push(`${config.magneticDoors} Cerraduras Magnéticas`);
    if (config.accessControl) summaryItems.push(`Control de Acceso (${config.accessType})`);
    if (config.networkPoints > 0) summaryItems.push(`${config.networkPoints} Puntos de Red`);
    if (config.wifiAccessPoints > 0) summaryItems.push(`${config.wifiAccessPoints} APs Wi-Fi`);
    if (config.timeClocks > 0) summaryItems.push(`${config.timeClocks} Ponchadores`);
    if (config.alarmSystem) summaryItems.push(`Sistema de Alarma`);
    if (config.intercomUnits > 0) summaryItems.push(`${config.intercomUnits} Puntos de Intercom`);

    const summaryText = summaryItems.join(', ');

    // Register lead in CRM automatically
    await addDeal({
      title: `Prospecto Web: ${summaryItems[0] || 'Servicios Varios'}`,
      clientName,
      clientPhone,
      clientAddress,
      clientType: clientType,
      serviceCategory: config.cameras > 0 ? 'camaras' : config.gateMotor ? 'motores' : 'redes',
      stage: 'prospect',
      priority: 'high',
      estimatedValue: currentEstimatedTotal,
      notes: `Requerimientos seleccionados en cotizador web:\n${summaryItems.map(s => `- ${s}`).join('\n')}`
    });

    setSubmitted(true);

    // Build WhatsApp message
    let msg = `¡Hola Martínez Tech! Mi nombre es *${clientName}*.\n\n`;
    msg += `He configurado una cotización estimada en su sitio web:\n`;
    msg += `-----------------------------------------\n`;
    msg += summaryItems.map(item => `• ${item}`).join('\n') + `\n`;
    msg += `-----------------------------------------\n`;
    msg += `💰 *Presupuesto Estimado:* ${formatCurrency(currentEstimatedTotal)}\n`;
    if (clientAddress) msg += `📍 *Ubicación:* ${clientAddress}\n`;
    msg += `\n¿Podrían coordinar una visita técnica o enviarme el presupuesto formal? Gracias.`;

    setTimeout(() => {
      window.open(createWhatsAppUrl(companySettings.whatsapp, msg), '_blank');
    }, 400);
  };

  return (
    <section id="cotizador" className="py-24 bg-white dark:bg-slate-950 relative transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-brand-green-100 dark:bg-brand-green-500/10 border border-brand-green-300 dark:border-brand-green-500/20 text-brand-green-800 dark:text-brand-green-400 text-xs font-bold uppercase tracking-wider shadow-sm">
            <Calculator className="w-4 h-4" />
            Estimador Inmediato
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            Cotizador Rápido de Instalaciones
          </h2>
          <p className="text-slate-700 dark:text-slate-400 text-sm sm:text-base font-medium">
            Selecciona los equipos y servicios que necesitas para obtener un presupuesto preliminar instantáneo.
          </p>
        </div>

        {/* Two Columns: Options Grid & Live Budget Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column (7 cols) */}
          <div className="lg:col-span-7 space-y-5">
            
            {/* 1. Cámaras de Seguridad */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-300 dark:border-slate-800 space-y-4 shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    📹 Cámaras de Seguridad
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">Incluye NVR, Disco Duro Surveillance e Instalación</p>
                </div>
                <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border border-slate-300 dark:border-slate-700 shadow-sm">
                  <button
                    type="button"
                    onClick={() => setConfig(prev => ({ ...prev, cameras: Math.max(0, prev.cameras - 2) }))}
                    className="p-1.5 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-300 disabled:opacity-40"
                    disabled={config.cameras <= 0}
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-8 text-center text-sm font-black text-slate-900 dark:text-white">{config.cameras}</span>
                  <button
                    type="button"
                    onClick={() => setConfig(prev => ({ ...prev, cameras: prev.cameras + 2 }))}
                    className="p-1.5 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-300"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {config.cameras > 0 && (
                <div className="grid grid-cols-2 gap-2 pt-2 border-t-2 border-slate-200 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setConfig(prev => ({ ...prev, cameraType: 'ip_colorvu' }))}
                    className={`py-2 px-3 rounded-lg text-xs font-bold border-2 text-left transition-all shadow-sm ${
                      config.cameraType === 'ip_colorvu'
                        ? 'bg-brand-teal-50 dark:bg-brand-teal-500/20 border-brand-teal-600 text-brand-teal-900 dark:text-brand-teal-300'
                        : 'bg-slate-50 dark:bg-slate-800/60 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-400'
                    }`}
                  >
                    ✨ IP ColorVu (Color 24/7 + Audio)
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfig(prev => ({ ...prev, cameraType: 'hd' }))}
                    className={`py-2 px-3 rounded-lg text-xs font-bold border-2 text-left transition-all shadow-sm ${
                      config.cameraType === 'hd'
                        ? 'bg-brand-teal-50 dark:bg-brand-teal-500/20 border-brand-teal-600 text-brand-teal-900 dark:text-brand-teal-300'
                        : 'bg-slate-50 dark:bg-slate-800/60 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-400'
                    }`}
                  >
                    📹 HD 1080p Estándar
                  </button>
                </div>
              )}
            </div>

            {/* 2. Motores para Portón */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-300 dark:border-slate-800 space-y-4 shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    🚗 Motor para Portón Eléctrico
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">Incluye controles remotos, sensores e instalación</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.gateMotor}
                    onChange={(e) => setConfig(prev => ({ ...prev, gateMotor: e.target.checked }))}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-300 dark:bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-green-600"></div>
                </label>
              </div>

              {config.gateMotor && (
                <div className="space-y-2 pt-2 border-t-2 border-slate-200 dark:border-slate-800">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setConfig(prev => ({ ...prev, gateMotorType: 'corredizo' }))}
                      className={`py-2 px-3 rounded-lg text-xs font-bold border-2 text-left transition-all shadow-sm ${
                        config.gateMotorType === 'corredizo'
                          ? 'bg-brand-teal-50 dark:bg-brand-teal-500/20 border-brand-teal-600 text-brand-teal-900 dark:text-brand-teal-300'
                          : 'bg-slate-50 dark:bg-slate-800/60 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-400'
                      }`}
                    >
                      🚪 Corredizo / Deslizante (800kg)
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfig(prev => ({ ...prev, gateMotorType: 'batiente' }))}
                      className={`py-2 px-3 rounded-lg text-xs font-bold border-2 text-left transition-all shadow-sm ${
                        config.gateMotorType === 'batiente'
                          ? 'bg-brand-teal-50 dark:bg-brand-teal-500/20 border-brand-teal-600 text-brand-teal-900 dark:text-brand-teal-300'
                          : 'bg-slate-50 dark:bg-slate-800/60 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-400'
                      }`}
                    >
                      🔄 Batiente Doble Brazo
                    </button>
                  </div>

                  <label className="flex items-center gap-2.5 p-2 rounded-lg bg-slate-50 dark:bg-slate-800/40 cursor-pointer text-xs font-semibold text-slate-800 dark:text-slate-300 border border-slate-300 dark:border-slate-700">
                    <input
                      type="checkbox"
                      checked={config.gateSmartModule}
                      onChange={(e) => setConfig(prev => ({ ...prev, gateSmartModule: e.target.checked }))}
                      className="rounded border-slate-300 dark:border-slate-700 text-brand-teal-600 focus:ring-brand-teal-500"
                    />
                    <span>📲 Agregar módulo inteligente para abrir y cerrar desde el celular</span>
                  </label>
                </div>
              )}
            </div>

            {/* 3. Redes y Wi-Fi */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-300 dark:border-slate-800 space-y-4 shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    🌐 Redes & Wi-Fi Empresarial
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">Cableado Cat6 y Puntos de Acceso Wi-Fi 6</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-300 dark:border-slate-700">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-300">Puntos de Red Cat6:</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setConfig(prev => ({ ...prev, networkPoints: Math.max(0, prev.networkPoints - 1) }))}
                      className="p-1 rounded bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-300 font-bold"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-6 text-center text-xs font-black text-slate-900 dark:text-white">{config.networkPoints}</span>
                    <button
                      type="button"
                      onClick={() => setConfig(prev => ({ ...prev, networkPoints: prev.networkPoints + 1 }))}
                      className="p-1 rounded bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-300 font-bold"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-300 dark:border-slate-700">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-300">Access Points Wi-Fi 6:</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setConfig(prev => ({ ...prev, wifiAccessPoints: Math.max(0, prev.wifiAccessPoints - 1) }))}
                      className="p-1 rounded bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-300 font-bold"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-6 text-center text-xs font-black text-slate-900 dark:text-white">{config.wifiAccessPoints}</span>
                    <button
                      type="button"
                      onClick={() => setConfig(prev => ({ ...prev, wifiAccessPoints: prev.wifiAccessPoints + 1 }))}
                      className="p-1 rounded bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-300 font-bold"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* 4. Cerraduras y Control de Acceso */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-300 dark:border-slate-800 space-y-4 shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    🔐 Cerraduras Magnéticas & Biométrico
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">Electroimanes 600lbs, pulsadores y control de acceso</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-300 dark:border-slate-700">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-300">Puertas con Electroimán:</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setConfig(prev => ({ ...prev, magneticDoors: Math.max(0, prev.magneticDoors - 1) }))}
                      className="p-1 rounded bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-300 font-bold"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-6 text-center text-xs font-black text-slate-900 dark:text-white">{config.magneticDoors}</span>
                    <button
                      type="button"
                      onClick={() => setConfig(prev => ({ ...prev, magneticDoors: prev.magneticDoors + 1 }))}
                      className="p-1 rounded bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-300 font-bold"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-300 dark:border-slate-700">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-300">Control de Acceso:</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.accessControl}
                      onChange={(e) => setConfig(prev => ({ ...prev, accessControl: e.target.checked }))}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-300 dark:bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-green-600"></div>
                  </label>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Live Budget Summary & WhatsApp Form (5 cols) */}
          <div className="lg:col-span-5 sticky top-28 space-y-6">
            
            <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-900 border-2 border-brand-teal-500/40 shadow-xl space-y-6">
              
              {/* Total Calculation Card */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 text-white space-y-2 border border-slate-800 shadow-inner">
                <div className="flex items-center justify-between text-xs text-brand-teal-300 font-bold uppercase tracking-wider">
                  <span>Presupuesto Estimado Preliminar</span>
                  <Sparkles className="w-4 h-4 text-brand-green-400" />
                </div>
                <div className="text-3xl sm:text-4xl font-black text-white font-mono tracking-tight">
                  {formatCurrency(currentEstimatedTotal)}
                </div>
                <p className="text-[11px] text-slate-400">
                  *Precio de referencia con equipos e instalación estándar en República Dominicana.
                </p>
              </div>

              {/* Form to submit and connect with WhatsApp */}
              <form onSubmit={handleCreateLeadAndWhatsApp} className="space-y-3.5">
                <div className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Recibir Presupuesto Formal por WhatsApp
                </div>

                <div className="space-y-1">
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      placeholder="Tu Nombre o Empresa *"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:border-brand-teal-500 shadow-sm"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      required
                      placeholder="Número de Teléfono / WhatsApp *"
                      value={clientPhone}
                      onChange={(e) => setClientPhone(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:border-brand-teal-500 shadow-sm"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Ubicación o Sector (ej. Bella Vista, Santiago)"
                      value={clientAddress}
                      onChange={(e) => setClientAddress(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:border-brand-teal-500 shadow-sm"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-brand-green-600 hover:from-emerald-500 hover:to-brand-green-500 text-white font-black text-sm shadow-lg hover:shadow-xl transition-all transform active:scale-98"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span>Enviar y Chatear por WhatsApp</span>
                </button>

                {submitted && (
                  <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-500/30 text-emerald-900 dark:text-emerald-300 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>¡Solicitud registrada! Abriendo WhatsApp con nuestro equipo técnico...</span>
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

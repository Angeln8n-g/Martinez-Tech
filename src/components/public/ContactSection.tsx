import React, { useState } from 'react';
import { useAppState } from '../../context/AppStateContext';
import { 
  Phone, 
  Mail, 
  MapPin, 
  MessageCircle, 
  Send, 
  CheckCircle2, 
  Clock,
  Instagram,
  Facebook,
  Linkedin,
  Youtube
} from 'lucide-react';
import { createWhatsAppUrl } from '../../utils/formatters';
import { ServiceCategory } from '../../types';

export const ContactSection: React.FC = () => {
  const { companySettings, addDeal } = useAppState();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [category, setCategory] = useState<ServiceCategory>('camaras');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) return;

    addDeal({
      title: `Contacto Web: Solicitud de ${category.toUpperCase()}`,
      clientName: name,
      clientPhone: phone,
      clientEmail: email,
      clientAddress: address,
      clientType: 'residential',
      stage: 'prospect',
      priority: 'medium',
      estimatedValue: 15000,
      serviceCategory: category,
      notes: `Mensaje del cliente: ${message || 'Solicitud de información general desde formulario de contacto web.'}`,
      source: 'Formulario de Contacto Web'
    });

    setSent(true);
  };

  const handleWhatsApp = () => {
    const text = `¡Hola *${companySettings.name}*! Mi nombre es *${name || 'un cliente interesado'}*. Me gustaría solicitar información técnica y cotización.`;
    window.open(createWhatsAppUrl(companySettings.whatsapp, text), '_blank');
  };

  return (
    <section id="contacto" className="py-24 relative overflow-hidden bg-[#06080e] transition-colors border-t border-slate-900">
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-nexablue-600/5 rounded-full blur-3xl pointer-events-none -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header - No eyebrow per craft rules */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Despliegue Técnico y Solicitud de Cotizaciones
          </h2>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed font-normal">
            Canal directo con nuestro centro de ingeniería y operaciones. Asesoría especializada y respuesta garantizada en menos de 30 minutos hábiles.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* Contact Info Cards (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            
            <div className="p-6 sm:p-7 rounded-2xl bg-[#0a0e18] border border-slate-800/90 space-y-6 shadow-xl">
              <h3 className="text-lg font-black text-white border-b border-slate-800 pb-3 flex items-center justify-between">
                <span>Información Técnica de Enlace</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </h3>

              <div className="space-y-5">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-nexablue-500/10 border border-nexablue-500/20 flex items-center justify-center text-nexablue-400 flex-shrink-0 shadow-sm">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">Línea Directa</div>
                    <a href={`tel:${companySettings.phone}`} className="text-sm font-bold text-white hover:text-nexablue-400 transition-colors">
                      {companySettings.phone}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 flex-shrink-0 shadow-sm">
                    <MessageCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">WhatsApp Central</div>
                    <button 
                      onClick={handleWhatsApp}
                      className="text-sm font-bold text-emerald-400 hover:text-emerald-300 hover:underline text-left block"
                    >
                      {companySettings.phone} (Chatear de inmediato)
                    </button>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 flex-shrink-0 shadow-sm">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">Correo Institucional</div>
                    <a href={`mailto:${companySettings.email}`} className="text-sm font-bold text-white hover:text-nexablue-300 transition-colors">
                      {companySettings.email}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 flex-shrink-0 shadow-sm">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">Sede Operativa & Cobertura</div>
                    <div className="text-sm font-bold text-slate-200">
                      {companySettings.address}
                    </div>
                    <div className="text-xs text-emerald-400 font-medium mt-0.5">
                      {companySettings.city} · Cobertura y Despliegue Nacional
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 flex-shrink-0 shadow-sm">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">Horario de Guardia Técnica</div>
                    <div className="text-xs text-slate-300 font-medium">Lunes a Viernes: 8:00 AM - 6:00 PM</div>
                    <div className="text-xs text-slate-300 font-medium">Sábados: 8:30 AM - 2:00 PM (Emergencias 24/7)</div>
                  </div>
                </div>

                {/* Social media connections */}
                <div className="pt-4 border-t border-slate-800">
                  <div className="text-xs font-bold text-slate-300 mb-2.5 uppercase tracking-wider">Canales de Verificación:</div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {companySettings.socialLinks?.instagram && (
                      <a
                        href={companySettings.socialLinks.instagram}
                        target="_blank"
                        rel="@martinez_.tech"
                        className="p-2.5 rounded-xl bg-[#06080e] border border-slate-800 text-pink-400 hover:text-pink-300 hover:border-pink-500/40 transition-all shadow-sm"
                        title="Instagram @martinez_.tech"
                      >
                        <Instagram className="w-4 h-4" />
                      </a>
                    )}
                    {companySettings.socialLinks?.facebook && (
                      <a
                        href={companySettings.socialLinks.facebook}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2.5 rounded-xl bg-[#06080e] border border-slate-800 text-blue-400 hover:text-blue-300 hover:border-blue-500/40 transition-all shadow-sm"
                        title="Facebook NexaGate Security"
                      >
                        <Facebook className="w-4 h-4" />
                      </a>
                    )}
                    {companySettings.socialLinks?.tiktok && (
                      <a
                        href={companySettings.socialLinks.tiktok}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2.5 rounded-xl bg-[#06080e] border border-slate-800 text-white hover:border-slate-500 transition-all shadow-sm flex items-center justify-center font-bold text-xs"
                        title="TikTok @martineztech"
                      >
                        <span className="font-mono text-[10px]">TT</span>
                      </a>
                    )}
                    {companySettings.socialLinks?.linkedin && (
                      <a
                        href={companySettings.socialLinks.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2.5 rounded-xl bg-[#06080e] border border-slate-800 text-sky-400 hover:text-sky-300 hover:border-sky-500/40 transition-all shadow-sm"
                        title="LinkedIn"
                      >
                        <Linkedin className="w-4 h-4" />
                      </a>
                    )}
                    {companySettings.socialLinks?.youtube && (
                      <a
                        href={companySettings.socialLinks.youtube}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2.5 rounded-xl bg-[#06080e] border border-slate-800 text-red-400 hover:text-red-300 hover:border-red-500/40 transition-all shadow-sm"
                        title="YouTube"
                      >
                        <Youtube className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>
              </div>

            </div>

            {/* Direct WhatsApp Callout */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-950/60 to-[#0a0e18] border border-emerald-500/30 space-y-3 shadow-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-sm">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-white">¿Requieres asistencia o cotización inmediata?</h4>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Contacta directamente a nuestra guardia técnica por WhatsApp con despacho prioritario.
              </p>
              <button
                onClick={handleWhatsApp}
                className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-emerald-600/30 border border-emerald-400/30"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Iniciar Enlace Vía WhatsApp</span>
              </button>
            </div>

          </div>

          {/* Form (7 cols) */}
          <div className="lg:col-span-7">
            <div className="p-6 sm:p-8 rounded-2xl bg-[#0a0e18] border border-slate-800/90 shadow-2xl space-y-6">
              
              <div className="border-b border-slate-800 pb-4">
                <h3 className="text-xl font-black text-white">
                  Formulario de Solicitud de Presupuesto
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Completa los datos técnicos a continuación para agendar una evaluación en sitio o recibir tu cotización formal.
                </p>
              </div>

              {!sent ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-300">
                        Nombre completo o Razón Social <span className="text-nexablue-400">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Ej. Ing. Juan Pérez / Empresa SRL"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl bg-[#06080e] border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-nexablue-500 focus:ring-1 focus:ring-nexablue-500/30 shadow-inner"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-300">
                        Teléfono / WhatsApp <span className="text-nexablue-400">*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="Ej. (809) 555-1234"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl bg-[#06080e] border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-nexablue-500 focus:ring-1 focus:ring-nexablue-500/30 shadow-inner"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-300">
                        Correo Electrónico (Opcional)
                      </label>
                      <input
                        type="email"
                        placeholder="ejemplo@correo.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl bg-[#06080e] border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-nexablue-500 focus:ring-1 focus:ring-nexablue-500/30 shadow-inner"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-300">
                        Sistema o Especialidad de Interés
                      </label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value as ServiceCategory)}
                        className="w-full px-4 py-2.5 rounded-xl bg-[#06080e] border border-slate-800 text-sm text-white font-medium focus:outline-none focus:border-nexablue-500 focus:ring-1 focus:ring-nexablue-500/30 shadow-inner"
                      >
                        <option value="camaras" className="bg-[#0a0e18]">Cámaras de Seguridad CCTV & Analítica IP</option>
                        <option value="redes" className="bg-[#0a0e18]">Cableado Estructurado & Wi-Fi Corporativo</option>
                        <option value="motores" className="bg-[#0a0e18]">Automatización de Portones Eléctricos</option>
                        <option value="cerraduras" className="bg-[#0a0e18]">Cerraduras Magnéticas & Control de Puertas</option>
                        <option value="acceso" className="bg-[#0a0e18]">Control de Acceso Biométrico & RFID</option>
                        <option value="ponchadores" className="bg-[#0a0e18]">Terminales de Asistencia Laboral</option>
                        <option value="alarmas" className="bg-[#0a0e18]">Sistemas de Alarma & Intrusión Perimetral</option>
                        <option value="intercom" className="bg-[#0a0e18]">Video Porteros & Intercom IP Multi-departamento</option>
                        <option value="otros" className="bg-[#0a0e18]">Solución Integral / Múltiples Especialidades</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300">
                      Ubicación de Instalación o Sector
                    </label>
                    <input
                      type="text"
                      placeholder="Ej. Calle 5ta #18, Urb. Real, Santo Domingo"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-[#06080e] border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-nexablue-500 focus:ring-1 focus:ring-nexablue-500/30 shadow-inner"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300">
                      Especificaciones o Requerimientos Técnicos
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Describe tu requerimiento (ej. número de accesos, tipo de portón, metraje de cableado, almacenamiento requerido, etc.)."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-[#06080e] border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-nexablue-500 focus:ring-1 focus:ring-nexablue-500/30 resize-none shadow-inner"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 px-6 rounded-xl bg-nexablue-600 hover:bg-nexablue-500 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-glow-nexablue transition-all"
                  >
                    <Send className="w-4 h-4" />
                    <span>Enviar Solicitud de Presupuesto</span>
                  </button>

                </form>
              ) : (
                <div className="p-8 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-center space-y-4 animate-fadeIn shadow-inner">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <h4 className="text-lg font-bold text-white">¡Solicitud Registrada Exitosamente!</h4>
                  <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
                    Tu requerimiento ha sido registrado en el sistema operativo de NexaGate Security. Nuestro equipo de soporte técnico te contactará al <strong className="text-emerald-400">{phone}</strong> a la mayor brevedad.
                  </p>
                  <button
                    type="button"
                    onClick={() => setSent(false)}
                    className="px-4 py-2 rounded-lg bg-slate-900 text-slate-300 text-xs font-bold hover:bg-slate-800 border border-slate-700 shadow-sm"
                  >
                    Enviar otra consulta
                  </button>
                </div>
              )}

            </div>
          </div>

        </div>

      </div>
    </section>
  );
};

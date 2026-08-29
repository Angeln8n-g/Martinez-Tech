import React, { useState } from 'react';
import { useAppState } from '../../context/AppStateContext';
import { 
  Phone, 
  Mail, 
  MapPin, 
  MessageCircle, 
  Send, 
  CheckCircle2, 
  Clock 
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
    <section id="contacto" className="py-24 relative overflow-hidden bg-slate-100/60 dark:bg-slate-950 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-brand-green-100 dark:bg-brand-green-500/10 border border-brand-green-300 dark:border-brand-green-500/20 text-brand-green-800 dark:text-brand-green-400 text-xs font-bold uppercase tracking-wider shadow-sm">
            Estamos Listos Para Atenderte
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            Contáctanos o Solicita una Visita Técnica
          </h2>
          <p className="text-slate-700 dark:text-slate-400 text-sm sm:text-base font-medium">
            Envíanos un mensaje y te responderemos en menos de 30 minutos hábiles con asesoría personalizada.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* Contact Info Cards (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 space-y-6 shadow-md">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white border-b-2 border-slate-200 dark:border-slate-800 pb-3">
                Información de Contacto
              </h3>

              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-brand-teal-50 dark:bg-brand-teal-500/10 border border-brand-teal-300 dark:border-brand-teal-500/20 flex items-center justify-center text-brand-teal-600 dark:text-brand-teal-400 flex-shrink-0 shadow-sm">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-600 dark:text-slate-400 font-bold">Llámanos directamente</div>
                    <a href={`tel:${companySettings.phone}`} className="text-sm font-bold text-slate-900 dark:text-white hover:text-brand-teal-600 dark:hover:text-brand-teal-300">
                      {companySettings.phone}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-300 dark:border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 flex-shrink-0 shadow-sm">
                    <MessageCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-600 dark:text-slate-400 font-bold">WhatsApp Oficial</div>
                    <button 
                      onClick={handleWhatsApp}
                      className="text-sm font-bold text-emerald-700 dark:text-emerald-400 hover:underline text-left block"
                    >
                      {companySettings.phone} (Chatear ahora)
                    </button>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-300 dark:border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400 flex-shrink-0 shadow-sm">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-600 dark:text-slate-400 font-bold">Correo Electrónico</div>
                    <a href={`mailto:${companySettings.email}`} className="text-sm font-bold text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-300">
                      {companySettings.email}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-300 dark:border-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400 flex-shrink-0 shadow-sm">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-600 dark:text-slate-400 font-bold">Ubicación y Cobertura</div>
                    <div className="text-sm font-bold text-slate-900 dark:text-slate-200">
                      {companySettings.address}
                    </div>
                    <div className="text-xs text-brand-green-700 dark:text-brand-green-400 font-bold mt-0.5">
                      {companySettings.city} (Servicio a nivel nacional)
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-400 flex-shrink-0 shadow-sm">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-600 dark:text-slate-400 font-bold">Horario de Operación</div>
                    <div className="text-xs text-slate-800 dark:text-slate-300 font-medium">Lunes a Viernes: 8:00 AM - 6:00 PM</div>
                    <div className="text-xs text-slate-800 dark:text-slate-300 font-medium">Sábados: 8:30 AM - 2:00 PM</div>
                  </div>
                </div>
              </div>

            </div>

            {/* Direct WhatsApp Callout */}
            <div className="p-6 rounded-2xl bg-emerald-50 dark:bg-gradient-to-r dark:from-emerald-950/80 dark:to-slate-900 border border-emerald-300 dark:border-emerald-500/30 space-y-3 shadow-md">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-emerald-100 dark:bg-emerald-500/20 border border-emerald-300 dark:border-emerald-500/30 flex items-center justify-center text-emerald-800 dark:text-emerald-400 shadow-sm">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">¿Tienes una urgencia o consulta rápida?</h4>
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                Escríbenos directamente a WhatsApp y te atenderemos al instante.
              </p>
              <button
                onClick={handleWhatsApp}
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-md border border-emerald-700/20"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Abrir Chat en WhatsApp</span>
              </button>
            </div>

          </div>

          {/* Form (7 cols) */}
          <div className="lg:col-span-7">
            <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 shadow-md dark:shadow-xl space-y-6">
              
              <div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white">
                  Formulario de Solicitud de Presupuesto
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 font-medium">
                  Completa los campos a continuación para agendar una visita técnica o recibir una cotización.
                </p>
              </div>

              {!sent ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-800 dark:text-slate-300">
                        Nombre completo o Empresa <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Ej. Ing. Juan Pérez / Empresa SRL"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-sm text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:border-brand-teal-500 shadow-sm"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-800 dark:text-slate-300">
                        Teléfono / WhatsApp <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="Ej. (809) 555-1234"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-sm text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:border-brand-teal-500 shadow-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-800 dark:text-slate-300">
                        Correo Electrónico (Opcional)
                      </label>
                      <input
                        type="email"
                        placeholder="ejemplo@correo.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-sm text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:border-brand-teal-500 shadow-sm"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-800 dark:text-slate-300">
                        Servicio Principal de Interés
                      </label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value as ServiceCategory)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-sm text-slate-900 dark:text-white font-medium focus:outline-none focus:border-brand-teal-500 shadow-sm"
                      >
                        <option value="camaras">Cámaras de Vigilancia (CCTV/IP)</option>
                        <option value="redes">Redes Informáticas & Wi-Fi</option>
                        <option value="motores">Motores para Portón</option>
                        <option value="cerraduras">Cerraduras Magnéticas</option>
                        <option value="acceso">Control de Acceso Biométrico</option>
                        <option value="ponchadores">Ponchadores de Asistencia</option>
                        <option value="alarmas">Alarmas de Seguridad</option>
                        <option value="intercom">Intercom & Video Porteros</option>
                        <option value="otros">Múltiples / Otros Servicios</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-800 dark:text-slate-300">
                      Dirección o Sector del Inmueble
                    </label>
                    <input
                      type="text"
                      placeholder="Ej. Calle 5ta #18, Urb. Real, Santo Domingo"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-sm text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:border-brand-teal-500 shadow-sm"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-800 dark:text-slate-300">
                      Detalles o Comentarios Adicionales
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Cuéntanos brevemente qué necesitas (ej. cuántas puertas, tipo de portón, metros de cableado, etc.)."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-sm text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:border-brand-teal-500 resize-none shadow-sm"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-brand-teal-500 to-brand-green-500 hover:from-brand-teal-400 hover:to-brand-green-400 text-slate-950 font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all"
                  >
                    <Send className="w-4 h-4" />
                    <span>Enviar Solicitud de Presupuesto</span>
                  </button>

                </form>
              ) : (
                <div className="p-6 rounded-xl bg-brand-green-50 dark:bg-brand-green-950/40 border border-brand-green-300 dark:border-brand-green-500/40 text-center space-y-4 animate-fadeIn shadow-sm">
                  <div className="w-12 h-12 rounded-full bg-brand-green-100 dark:bg-brand-green-500/20 text-brand-green-700 dark:text-brand-green-400 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <h4 className="text-lg font-bold text-slate-900 dark:text-white">¡Gracias por contactar a Martínez Tech!</h4>
                  <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 max-w-md mx-auto font-medium">
                    Tu solicitud ha sido asignada a nuestro equipo técnico. Nos comunicaremos al número <strong className="text-brand-green-800 dark:text-brand-green-300">{phone}</strong> a la mayor brevedad.
                  </p>
                  <button
                    type="button"
                    onClick={() => setSent(false)}
                    className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-300 text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 shadow-sm"
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

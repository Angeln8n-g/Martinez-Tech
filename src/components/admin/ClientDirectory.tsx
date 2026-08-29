import React, { useState } from 'react';
import { useAppState } from '../../context/AppStateContext';
import { Client, ClientType } from '../../types';
import { 
  Plus, 
  Search, 
  Building2, 
  Phone, 
  Mail, 
  MapPin, 
  MessageCircle, 
  Trash2, 
  Edit, 
  X
} from 'lucide-react';
import { formatCurrency, createWhatsAppUrl } from '../../utils/formatters';

export const ClientDirectory: React.FC = () => {
  const { clients, deals, quotes, addClient, updateClient, deleteClient } = useAppState();

  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<ClientType | 'all'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  // Form fields
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [type, setType] = useState<ClientType>('residential');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [rnc, setRnc] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Santo Domingo');
  const [notes, setNotes] = useState('');

  const filteredClients = clients.filter(c => {
    const matchesSearch = 
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.company && c.company.toLowerCase().includes(searchTerm.toLowerCase())) ||
      c.phone.includes(searchTerm) ||
      (c.email && c.email.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesType = typeFilter === 'all' || c.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const openNewModal = () => {
    setEditingClient(null);
    setName('');
    setCompany('');
    setType('residential');
    setPhone('');
    setEmail('');
    setRnc('');
    setAddress('');
    setCity('Santo Domingo');
    setNotes('');
    setIsModalOpen(true);
  };

  const openEditModal = (c: Client) => {
    setEditingClient(c);
    setName(c.name);
    setCompany(c.company || '');
    setType(c.type);
    setPhone(c.phone);
    setEmail(c.email || '');
    setRnc(c.rnc || '');
    setAddress(c.address || '');
    setCity(c.city || 'Santo Domingo');
    setNotes(c.notes || '');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) return;

    if (editingClient) {
      await updateClient(editingClient.id, {
        name,
        company,
        type,
        phone,
        email,
        rnc,
        address,
        city,
        notes
      });
    } else {
      await addClient({
        name,
        company,
        type,
        phone,
        email,
        rnc,
        address,
        city,
        notes
      });
    }

    setIsModalOpen(false);
  };

  const handleWhatsApp = (c: Client) => {
    const text = `¡Hola ${c.name}! Le contactamos de Martínez Tech. ¿En qué podemos apoyarle con sus sistemas de seguridad y tecnología?`;
    window.open(createWhatsAppUrl(c.phone, text), '_blank');
  };

  const getClientTypeLabel = (t: ClientType) => {
    switch (t) {
      case 'commercial': return 'Comercial / Empresa';
      case 'building': return 'Condominio / Edificio';
      case 'industrial': return 'Industrial / Nave';
      default: return 'Residencial / Hogar';
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Top Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-300 dark:border-slate-800 shadow-md">
        
        <div className="flex items-center gap-3 flex-1 flex-wrap">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por nombre, empresa, teléfono o correo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:border-brand-teal-500 shadow-sm"
            />
          </div>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as any)}
            className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 font-bold focus:outline-none focus:border-brand-teal-500 shadow-sm"
          >
            <option value="all">Todos los Tipos de Clientes</option>
            <option value="residential">Residencial / Hogar</option>
            <option value="commercial">Comercial / Empresa</option>
            <option value="building">Condominio / Edificio</option>
            <option value="industrial">Industrial / Nave</option>
          </select>
        </div>

        <button
          onClick={openNewModal}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-teal-600 hover:bg-brand-teal-500 text-white font-bold text-xs shadow-md border border-brand-teal-700/20"
        >
          <Plus className="w-4 h-4" />
          <span>Nuevo Cliente</span>
        </button>
      </div>

      {/* Clients Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredClients.map((client) => {
          const clientDeals = deals.filter(d => d.clientPhone === client.phone || d.clientName.toLowerCase() === client.name.toLowerCase());
          const clientQuotes = quotes.filter(q => q.clientPhone === client.phone || q.clientName.toLowerCase() === client.name.toLowerCase());

          return (
            <div
              key={client.id}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 hover:border-brand-teal-500 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <h4 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                      {client.name}
                    </h4>
                    {client.company && (
                      <div className="text-xs font-bold text-slate-700 dark:text-slate-400 flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5 text-brand-teal-600 dark:text-brand-teal-400" />
                        <span>{client.company}</span>
                      </div>
                    )}
                  </div>

                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-300 border border-slate-300 dark:border-slate-700">
                    {getClientTypeLabel(client.type)}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                    <span>{client.phone}</span>
                  </div>

                  {client.email && (
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                      <Mail className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                      <span className="truncate">{client.email}</span>
                    </div>
                  )}

                  {client.address && (
                    <div className="flex items-start gap-2 text-slate-600 dark:text-slate-400 text-[11px]">
                      <MapPin className="w-3.5 h-3.5 text-brand-green-600 flex-shrink-0 mt-0.5" />
                      <span>{client.address}, {client.city}</span>
                    </div>
                  )}

                  {client.rnc && (
                    <div className="text-[11px] text-slate-500 font-mono">
                      RNC/Cédula: {client.rnc}
                    </div>
                  )}
                </div>

                {client.notes && (
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/60 p-2 rounded-lg border border-slate-200 dark:border-slate-700">
                    {client.notes}
                  </p>
                )}
              </div>

              <div className="pt-3 border-t-2 border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">
                  <strong>{clientDeals.length}</strong> negociaciones · <strong>{clientQuotes.length}</strong> cotizaciones
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleWhatsApp(client)}
                    className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/80 hover:bg-emerald-100 text-emerald-800 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/30"
                    title="WhatsApp"
                  >
                    <MessageCircle className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => openEditModal(client)}
                    className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700"
                    title="Editar"
                  >
                    <Edit className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => {
                      if (confirm(`¿Eliminar al cliente ${client.name}?`)) {
                        deleteClient(client.id);
                      }
                    }}
                    className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-rose-100 text-rose-600 dark:text-rose-400 border border-slate-300 dark:border-slate-700"
                    title="Eliminar"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Client Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-2xl max-w-lg w-full p-6 relative max-h-[90vh] overflow-y-auto shadow-2xl space-y-5">
            
            <div className="flex items-center justify-between border-b-2 border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {editingClient ? 'Editar Cliente' : 'Registrar Nuevo Cliente'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-black dark:hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-300">Nombre Completo / Contacto *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Ing. Marcos Rivas"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white shadow-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-300">Empresa / Razón Social</label>
                  <input
                    type="text"
                    placeholder="Ej. Constructora del Este"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white shadow-sm"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-300">Tipo de Cliente</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as ClientType)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-200 font-medium"
                  >
                    <option value="residential">Residencial / Hogar</option>
                    <option value="commercial">Comercial / Empresa</option>
                    <option value="building">Condominio / Edificio</option>
                    <option value="industrial">Industrial / Nave</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-300">Teléfono / WhatsApp *</label>
                  <input
                    type="tel"
                    required
                    placeholder="809-555-1234"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white shadow-sm"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-300">Correo Electrónico</label>
                  <input
                    type="email"
                    placeholder="cliente@correo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white shadow-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-300">RNC o Cédula</label>
                  <input
                    type="text"
                    placeholder="131-99887-1"
                    value={rnc}
                    onChange={(e) => setRnc(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white font-mono shadow-sm"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-300">Ciudad</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white shadow-sm"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-300">Dirección Física / Sector</label>
                <input
                  type="text"
                  placeholder="Calle, número de casa/edificio, sector"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white shadow-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-300">Notas Adicionales</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Detalles sobre preferencias, horarios de visita, etc."
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white resize-none shadow-sm"
                />
              </div>

              <div className="pt-3 border-t-2 border-slate-200 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-300 border border-slate-300 dark:border-slate-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-brand-teal-600 hover:bg-brand-teal-500 text-white font-bold text-xs shadow-md border border-brand-teal-700/20"
                >
                  Guardar Cliente
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};

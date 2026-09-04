import React, { useState, useEffect, useRef } from 'react';
import { useAppState, AdminTab } from '../../context/AppStateContext';
import { useToast } from '../ui/ToastNotification';
import { 
  Search, 
  FileText, 
  Users, 
  Receipt, 
  Wrench, 
  Package, 
  Kanban, 
  Plus, 
  ArrowRight, 
  Moon, 
  Sun, 
  Download,
  X,
  Sparkles
} from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

interface PaletteItem {
  id: string;
  group: 'Acciones Rápidas' | 'Presupuestos' | 'Clientes' | 'Comprobantes NCF' | 'Órdenes de Trabajo' | 'Catálogo';
  title: string;
  subtitle?: string;
  icon: React.ComponentType<{ className?: string }>;
  action: () => void;
}

export const CommandPaletteModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { 
    quotes, 
    clients, 
    invoices, 
    workOrders, 
    catalog, 
    setAdminTab,
    setIsDealModalOpen,
    setActiveDealForEdit,
    setIsQuoteModalOpen,
    setActiveQuoteForEdit,
    setActiveQuoteForView,
    setIsWorkOrderModalOpen,
    setActiveWorkOrderForEdit,
    setActiveWorkOrderForView,
    setActiveInvoiceForView,
    setIsReportsModalOpen,
    theme,
    toggleTheme
  } = useAppState();

  const { showToast } = useToast();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Build items based on query
  const cleanQuery = query.toLowerCase().trim();

  const allItems: PaletteItem[] = [
    // Quick Actions
    {
      id: 'act-new-quote',
      group: 'Acciones Rápidas',
      title: 'Crear Nuevo Presupuesto',
      subtitle: 'Cotización comercial formal con desglose de equipos',
      icon: Plus,
      action: () => {
        setActiveQuoteForEdit(null);
        setIsQuoteModalOpen(true);
        onClose();
      }
    },
    {
      id: 'act-new-deal',
      group: 'Acciones Rápidas',
      title: 'Registrar Nueva Negociación',
      subtitle: 'Crear prospecto o lead en el embudo CRM',
      icon: Kanban,
      action: () => {
        setActiveDealForEdit(null);
        setIsDealModalOpen(true);
        onClose();
      }
    },
    {
      id: 'act-new-wo',
      group: 'Acciones Rápidas',
      title: 'Crear Orden de Trabajo',
      subtitle: 'Acta de entrega técnica con fotos antes/después',
      icon: Wrench,
      action: () => {
        setActiveWorkOrderForEdit(null);
        setIsWorkOrderModalOpen(true);
        onClose();
      }
    },
    {
      id: 'act-reports-dgii',
      group: 'Acciones Rápidas',
      title: 'Generar Formatos DGII (607 y 606)',
      subtitle: 'Exportación a TXT oficial y Excel de ventas e ITBIS',
      icon: Download,
      action: () => {
        setIsReportsModalOpen(true);
        onClose();
      }
    },
    {
      id: 'act-toggle-theme',
      group: 'Acciones Rápidas',
      title: theme === 'dark' ? 'Cambiar a Modo Claro' : 'Cambiar a Modo Oscuro',
      subtitle: 'Alternar esquema de color de la interfaz',
      icon: theme === 'dark' ? Sun : Moon,
      action: () => {
        toggleTheme();
        showToast(theme === 'dark' ? 'Modo claro activado' : 'Modo oscuro activado', 'info');
        onClose();
      }
    },

    // Quotes
    ...quotes.slice(0, 15).map(q => ({
      id: `quote-${q.id}`,
      group: 'Presupuestos' as const,
      title: `${q.quoteNumber} · ${q.clientName}`,
      subtitle: `${formatCurrency(q.total, q.currency)} — Estado: ${q.status.toUpperCase()}`,
      icon: FileText,
      action: () => {
        setActiveQuoteForView(q);
        onClose();
      }
    })),

    // Invoices
    ...invoices.slice(0, 15).map(inv => ({
      id: `inv-${inv.id}`,
      group: 'Comprobantes NCF' as const,
      title: `${inv.ncf} (${inv.ncfType}) · ${inv.clientName}`,
      subtitle: `${formatCurrency(inv.total, inv.currency)} — RNC: ${inv.clientRnc || 'N/A'}`,
      icon: Receipt,
      action: () => {
        setActiveInvoiceForView(inv);
        onClose();
      }
    })),

    // Work Orders
    ...workOrders.slice(0, 15).map(w => ({
      id: `wo-${w.id}`,
      group: 'Órdenes de Trabajo' as const,
      title: `${w.orderNumber} · ${w.clientName}`,
      subtitle: `Técnico: ${w.assignedTechnician || 'Sin asignar'} — ${w.status}`,
      icon: Wrench,
      action: () => {
        setActiveWorkOrderForView(w);
        onClose();
      }
    })),

    // Clients
    ...clients.slice(0, 15).map(c => ({
      id: `cli-${c.id}`,
      group: 'Clientes' as const,
      title: c.name,
      subtitle: `${c.company ? `${c.company} · ` : ''}${c.phone} — RNC: ${c.rnc || 'Consumo'}`,
      icon: Users,
      action: () => {
        setAdminTab('clients');
        onClose();
      }
    })),

    // Catalog
    ...catalog.slice(0, 15).map(p => ({
      id: `cat-${p.id}`,
      group: 'Catálogo' as const,
      title: p.name,
      subtitle: `${formatCurrency(p.unitPrice)} — Stock: ${p.stock ?? 10} disp. [${p.category}]`,
      icon: Package,
      action: () => {
        setAdminTab('catalog');
        onClose();
      }
    }))
  ];

  const filteredItems = cleanQuery === ''
    ? allItems.slice(0, 8)
    : allItems.filter(item => 
        item.title.toLowerCase().includes(cleanQuery) ||
        (item.subtitle && item.subtitle.toLowerCase().includes(cleanQuery)) ||
        item.group.toLowerCase().includes(cleanQuery)
      ).slice(0, 12);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % (filteredItems.length || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + filteredItems.length) % (filteredItems.length || 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredItems[selectedIndex]) {
        filteredItems[selectedIndex].action();
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/70 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh] animate-slideUp"
        onClick={e => e.stopPropagation()}
      >
        {/* Search Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-200 dark:border-slate-800">
          <Search className="w-5 h-5 text-brand-teal-600 dark:text-brand-teal-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Buscar cotización (COT-...), cliente, NCF (B01...), orden o acción..."
            className="w-full bg-transparent text-sm sm:text-base text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none font-medium"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <span className="hidden sm:inline-block text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-300 dark:border-slate-700">
            ESC
          </span>
        </div>

        {/* Results List */}
        <div className="overflow-y-auto p-2 divide-y divide-slate-100 dark:divide-slate-800/60 max-h-[55vh]">
          {filteredItems.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs space-y-2">
              <Sparkles className="w-8 h-8 text-slate-300 dark:text-slate-700 mx-auto" />
              <p>No se encontraron resultados para "{query}"</p>
              <p className="text-[11px] text-slate-500">Prueba con un número de cotización, nombre de cliente o código NCF.</p>
            </div>
          ) : (
            filteredItems.map((item, idx) => {
              const Icon = item.icon;
              const isSelected = idx === selectedIndex;

              return (
                <div
                  key={item.id}
                  onClick={() => item.action()}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between p-3 rounded-2xl cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-brand-teal-50 dark:bg-brand-teal-950/50 text-slate-900 dark:text-white'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/40 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`p-2 rounded-xl border ${
                      isSelected 
                        ? 'bg-brand-teal-500 text-slate-950 border-brand-teal-600' 
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                    }`}>
                      <Icon className="w-4 h-4 shrink-0" />
                    </div>

                    <div className="min-w-0">
                      <div className="text-xs font-bold truncate leading-tight">
                        {item.title}
                      </div>
                      {item.subtitle && (
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                          {item.subtitle}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 ml-3">
                    <span className="text-[10px] uppercase font-bold text-slate-400 font-mono hidden sm:inline">
                      {item.group}
                    </span>
                    <ArrowRight className={`w-3.5 h-3.5 ${isSelected ? 'text-brand-teal-600 dark:text-brand-teal-400 translate-x-0.5' : 'text-slate-300 dark:text-slate-700'} transition-transform`} />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Shortcut Bar */}
        <div className="px-5 py-2.5 bg-slate-50 dark:bg-slate-950/60 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 font-medium">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-[10px] font-mono font-bold">↑↓</kbd>
              <span>Navegar</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-[10px] font-mono font-bold">↵</kbd>
              <span>Seleccionar</span>
            </span>
          </div>

          <span className="font-mono text-[10px] text-slate-400">
            Martínez Tech Spotlight
          </span>
        </div>

      </div>
    </div>
  );
};

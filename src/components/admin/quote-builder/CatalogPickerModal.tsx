import React, { useState, useMemo } from 'react';
import { CatalogProduct, ServiceCategory, QuoteItem } from '../../../types';
import { formatCurrency, getCategoryInfo, roundToTwoDecimals } from '../../../utils/formatters';
import { 
  Search, 
  X, 
  Package, 
  Layers, 
  Wrench, 
  ShieldCheck, 
  Check, 
  Plus, 
  Minus, 
  AlertCircle,
  Tag,
  DollarSign,
  TrendingUp,
  Boxes
} from 'lucide-react';

interface CatalogPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  catalog: CatalogProduct[];
  currency: 'DOP' | 'USD';
  exchangeRate?: number;
  canViewCosts: boolean;
  onAddItem: (item: Omit<QuoteItem, 'id' | 'total'>, quantity: number) => void;
}

const CATEGORIES: Array<{ id: ServiceCategory | 'all'; label: string }> = [
  { id: 'all', label: 'Todas las Categorías' },
  { id: 'camaras', label: 'Cámaras' },
  { id: 'redes', label: 'Redes' },
  { id: 'acceso', label: 'Control Acceso' },
  { id: 'alarmas', label: 'Alarmas' },
  { id: 'intercom', label: 'Intercom' },
  { id: 'motores', label: 'Motores' },
  { id: 'cerraduras', label: 'Cerraduras' }
];

const ITEM_TYPES: Array<{ id: string; label: string; icon: React.FC<{ className?: string }> }> = [
  { id: 'all', label: 'Todos los Tipos', icon: Layers },
  { id: 'product', label: 'Equipos', icon: Package },
  { id: 'material', label: 'Materiales', icon: Boxes },
  { id: 'labor', label: 'Mano de Obra', icon: Wrench },
  { id: 'service', label: 'Servicios', icon: ShieldCheck }
];

export const CatalogPickerModal: React.FC<CatalogPickerModalProps> = ({
  isOpen,
  onClose,
  catalog,
  currency,
  exchangeRate = 60.50,
  canViewCosts,
  onAddItem
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory | 'all'>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [addedIds, setAddedIds] = useState<Record<string, boolean>>({});

  // Filter catalog items
  const filteredProducts = useMemo(() => {
    return catalog.filter(prod => {
      // Search term
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesName = prod.name.toLowerCase().includes(query);
        const matchesDesc = (prod.description || '').toLowerCase().includes(query);
        const matchesBrand = (prod.brand || '').toLowerCase().includes(query);
        const matchesCode = (prod.code || '').toLowerCase().includes(query);
        if (!matchesName && !matchesDesc && !matchesBrand && !matchesCode) {
          return false;
        }
      }

      // Category filter
      if (selectedCategory !== 'all' && prod.category !== selectedCategory) {
        return false;
      }

      // Type filter
      if (selectedType !== 'all' && prod.type !== selectedType) {
        return false;
      }

      return true;
    });
  }, [catalog, searchQuery, selectedCategory, selectedType]);

  const getItemQuantity = (id: string) => quantities[id] || 1;

  const handleQuantityChange = (id: string, delta: number) => {
    setQuantities(prev => {
      const current = prev[id] || 1;
      const updated = Math.max(1, current + delta);
      return { ...prev, [id]: updated };
    });
  };

  const handleDirectQuantityChange = (id: string, value: number) => {
    setQuantities(prev => ({
      ...prev,
      [id]: Math.max(1, value || 1)
    }));
  };

  const handleAdd = (prod: CatalogProduct) => {
    const qty = getItemQuantity(prod.id);
    
    // Calculate prices in target currency
    let effectivePrice = prod.unitPrice;
    let effectiveCost = prod.costPrice;

    if (currency === 'USD') {
      // If base prices in catalog are DOP, convert to USD
      effectivePrice = roundToTwoDecimals(prod.unitPrice / exchangeRate);
      effectiveCost = prod.costPrice ? roundToTwoDecimals(prod.costPrice / exchangeRate) : undefined;
    }

    onAddItem({
      productId: prod.id,
      name: prod.name,
      description: prod.description || '',
      quantity: qty,
      unitPrice: effectivePrice,
      costPrice: effectiveCost,
      type: prod.type
    }, qty);

    // Provide visual feedback
    setAddedIds(prev => ({ ...prev, [prod.id]: true }));
    setTimeout(() => {
      setAddedIds(prev => ({ ...prev, [prod.id]: false }));
    }, 1200);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div 
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-5xl h-[90vh] max-h-[850px] flex flex-col overflow-hidden text-slate-900 dark:text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-teal-500/10 border border-brand-teal-500/20 flex items-center justify-center text-brand-teal-600 dark:text-brand-teal-400">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                <span>Catálogo Técnico Martínez Tech</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono">
                  {filteredProducts.length} ítems
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Selecciona equipos, materiales y partidas de mano de obra para agregar a tu presupuesto.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filters & Search Toolbar */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por nombre, código SKU, marca, especificación técnica..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-brand-teal-500 transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filter Chips: Categories & Types */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            {/* Category horizontal scroll */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-thin">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                    selectedCategory === cat.id
                      ? 'bg-brand-teal-600 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Type selector tabs */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/90 p-1 rounded-xl shrink-0">
              {ITEM_TYPES.map(t => {
                const Icon = t.icon;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setSelectedType(t.id)}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                      selectedType === t.id
                        ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-bold'
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
                    }`}
                  >
                    <Icon className="w-3 h-3" />
                    <span>{t.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Product Cards List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-2.5">
          {filteredProducts.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center p-6 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                <Search className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                  No se encontraron productos o servicios
                </p>
                <p className="text-xs text-slate-500 max-w-sm mt-1">
                  Intenta cambiar las palabras de búsqueda o seleccionar "Todas las Categorías".
                </p>
              </div>
              <button
                type="button"
                onClick={() => { setSearchQuery(''); setSelectedCategory('all'); setSelectedType('all'); }}
                className="text-xs font-bold text-brand-teal-600 dark:text-brand-teal-400 hover:underline"
              >
                Limpiar filtros
              </button>
            </div>
          ) : (
            filteredProducts.map(prod => {
              const isPhysical = prod.type === 'product' || prod.type === 'material';
              const stock = prod.stock ?? 10;
              const isOutOfStock = isPhysical && stock === 0;
              const isLowStock = isPhysical && stock > 0 && stock <= (prod.minStock || 3);
              const qty = getItemQuantity(prod.id);
              const isAdded = addedIds[prod.id];
              const catInfo = getCategoryInfo(prod.category);

              // Unit price in current currency
              const displayPrice = currency === 'USD' 
                ? roundToTwoDecimals(prod.unitPrice / exchangeRate) 
                : prod.unitPrice;

              const displayCost = (canViewCosts && prod.costPrice)
                ? (currency === 'USD' ? roundToTwoDecimals(prod.costPrice / exchangeRate) : prod.costPrice)
                : null;

              const marginPct = (canViewCosts && displayCost && displayPrice > 0)
                ? Math.round(((displayPrice - displayCost) / displayPrice) * 100)
                : null;

              return (
                <div 
                  key={prod.id}
                  className={`p-3.5 rounded-xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                    isOutOfStock 
                      ? 'bg-slate-50/60 dark:bg-slate-900/30 border-slate-200 dark:border-slate-800/80 opacity-75'
                      : 'bg-white dark:bg-slate-800/70 border-slate-200 dark:border-slate-700/80 hover:border-brand-teal-400 dark:hover:border-brand-teal-500 shadow-xs'
                  }`}
                >
                  {/* Left info */}
                  <div className="flex-1 space-y-1.5 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${catInfo.color}`}>
                        {catInfo.label}
                      </span>
                      
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                        {prod.type === 'product' ? 'Equipo' : prod.type === 'material' ? 'Material' : prod.type === 'labor' ? 'Mano de Obra' : 'Servicio'}
                      </span>

                      {prod.code && (
                        <span className="text-[10px] font-mono text-slate-400">
                          SKU: {prod.code}
                        </span>
                      )}

                      {/* Stock badge */}
                      {isPhysical ? (
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md font-mono ${
                          isOutOfStock 
                            ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-300 dark:border-rose-800/60'
                            : isLowStock
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300 dark:border-amber-800/60'
                              : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800/60'
                        }`}>
                          {isOutOfStock ? 'Agotado (0)' : `Stock: ${stock} ${prod.unit || 'uds'}`}
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 italic">
                          Disponibilidad inmediata
                        </span>
                      )}
                    </div>

                    <h4 className="font-bold text-sm text-slate-900 dark:text-white leading-tight">
                      {prod.name}
                    </h4>

                    {prod.description && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                        {prod.description}
                      </p>
                    )}
                  </div>

                  {/* Right actions: Price & Add */}
                  <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
                    {/* Financial stats */}
                    <div className="text-left sm:text-right">
                      <div className="font-black text-sm text-slate-900 dark:text-white font-mono">
                        {formatCurrency(displayPrice, currency)}
                        <span className="text-[10px] font-normal text-slate-500 ml-1">/ {prod.unit || 'ud'}</span>
                      </div>
                      
                      {canViewCosts && displayCost && (
                        <div className="flex items-center sm:justify-end gap-1.5 text-[10px] text-slate-500">
                          <span>Costo: <strong className="font-mono text-amber-600 dark:text-amber-400">{formatCurrency(displayCost, currency)}</strong></span>
                          {marginPct !== null && (
                            <span className={`px-1 rounded font-bold ${
                              marginPct >= 35 
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                                : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                            }`}>
                              {marginPct}% mrg
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Quantity & Add button */}
                    <div className="flex items-center gap-2">
                      <div className="flex items-center rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 p-0.5">
                        <button
                          type="button"
                          onClick={() => handleQuantityChange(prod.id, -1)}
                          className="p-1 rounded text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <input
                          type="number"
                          min="1"
                          value={qty}
                          onChange={(e) => handleDirectQuantityChange(prod.id, parseInt(e.target.value) || 1)}
                          className="w-9 text-center bg-transparent text-xs font-bold text-slate-900 dark:text-white focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none font-mono"
                        />
                        <button
                          type="button"
                          onClick={() => handleQuantityChange(prod.id, 1)}
                          className="p-1 rounded text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleAdd(prod)}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all shadow-xs ${
                          isAdded
                            ? 'bg-emerald-600 text-white scale-95'
                            : 'bg-brand-teal-600 hover:bg-brand-teal-500 text-white'
                        }`}
                      >
                        {isAdded ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>¡Agregado!</span>
                          </>
                        ) : (
                          <>
                            <Plus className="w-3.5 h-3.5" />
                            <span>Agregar</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 flex items-center justify-between">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            <span>¿No encuentras lo que buscas? Puedes crear una </span>
            <strong className="text-slate-700 dark:text-slate-300">+ Fila Manual</strong>
            <span> en cualquier momento.</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-xs font-bold hover:opacity-90 transition-opacity"
          >
            Listo, Volver al Presupuesto
          </button>
        </div>

      </div>
    </div>
  );
};

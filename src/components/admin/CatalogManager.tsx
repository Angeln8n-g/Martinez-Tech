import React, { useState } from 'react';
import { useAppState } from '../../context/AppStateContext';
import { useToast } from '../ui/ToastNotification';
import { CatalogProduct, ServiceCategory, InventoryMovementType } from '../../types';
import { 
  Plus, 
  Search, 
  Trash2, 
  Edit, 
  X, 
  Upload, 
  Download, 
  AlertTriangle, 
  Package,
  Boxes,
  ArrowUpDown,
  History,
  TrendingUp,
  DollarSign,
  MapPin,
  CheckCircle2,
  ArrowDownRight,
  ArrowUpRight,
  RefreshCw,
  Eye,
  FileText
} from 'lucide-react';
import { formatCurrency, getCategoryInfo } from '../../utils/formatters';
import { 
  getProductStockStatus, 
  calculateInventoryValuation, 
  getMovementTypeInfo,
  COMMON_ADJUSTMENT_REASONS 
} from '../../utils/inventoryManager';

export const CatalogManager: React.FC = () => {
  const { 
    catalog, 
    addCatalogProduct, 
    updateCatalogProduct, 
    deleteCatalogProduct, 
    setIsBulkImportModalOpen,
    inventoryMovements,
    adjustStock,
    currentUser
  } = useAppState();

  const { showToast } = useToast();

  // Active top view tab
  const [activeTab, setActiveTab] = useState<'catalog' | 'kardex' | 'valuation'>('catalog');

  // Search & Filters for Catalog
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [stockFilter, setStockFilter] = useState<'all' | 'low_or_out'>('all');

  // Search & Filters for Kardex
  const [kardexSearch, setKardexSearch] = useState('');
  const [kardexTypeFilter, setKardexTypeFilter] = useState<string>('all');
  const [kardexProductFilter, setKardexProductFilter] = useState<string>('all');

  // Add / Edit Product Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<CatalogProduct | null>(null);

  // Form fields
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [category, setCategory] = useState<ServiceCategory>('camaras');
  const [type, setType] = useState<'product' | 'service' | 'labor' | 'material'>('product');
  const [description, setDescription] = useState('');
  const [unitPrice, setUnitPrice] = useState<number>(0);
  const [costPrice, setCostPrice] = useState<number>(0);
  const [stock, setStock] = useState<number>(10);
  const [minStock, setMinStock] = useState<number>(3);
  const [location, setLocation] = useState<string>('');
  const [unit, setUnit] = useState('Unidad');
  const [adjustmentReason, setAdjustmentReason] = useState<string>('Conteo físico / Cuadre mensual de existencias');
  const [customReason, setCustomReason] = useState<string>('');
  const [referenceDocument, setReferenceDocument] = useState<string>('');

  // Quick Adjustment & Product Kardex Modal State
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [selectedProductForAdjustment, setSelectedProductForAdjustment] = useState<CatalogProduct | null>(null);
  const [adjustModalSubTab, setAdjustModalSubTab] = useState<'adjust' | 'history'>('adjust');
  const [adjustAction, setAdjustAction] = useState<'entry' | 'exit' | 'set'>('entry');
  const [adjustQuantity, setAdjustQuantity] = useState<number>(1);
  const [quickReason, setQuickReason] = useState<string>('Compra a distribuidor / Reabastecimiento de bodega');
  const [quickCustomReason, setQuickCustomReason] = useState<string>('');
  const [quickReference, setQuickReference] = useState<string>('');
  const [quickNotes, setQuickNotes] = useState<string>('');

  // Open Create Modal
  const openNewModal = () => {
    setEditingProduct(null);
    setCode('');
    setName('');
    setBrand('');
    setCategory('camaras');
    setType('product');
    setDescription('');
    setUnitPrice(0);
    setCostPrice(0);
    setStock(10);
    setMinStock(3);
    setLocation('');
    setUnit('Unidad');
    setAdjustmentReason('Conteo físico / Cuadre mensual de existencias');
    setCustomReason('');
    setReferenceDocument('');
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const openEditModal = (p: CatalogProduct) => {
    setEditingProduct(p);
    setCode(p.code || '');
    setName(p.name);
    setBrand(p.brand || '');
    setCategory(p.category);
    setType(p.type);
    setDescription(p.description);
    setUnitPrice(p.unitPrice);
    setCostPrice(p.costPrice || 0);
    setStock(p.stock !== undefined ? p.stock : 0);
    setMinStock(p.minStock !== undefined ? p.minStock : 3);
    setLocation(p.location || '');
    setUnit(p.unit || 'Unidad');
    setAdjustmentReason('Conteo físico / Cuadre mensual de existencias');
    setCustomReason('');
    setReferenceDocument('');
    setIsModalOpen(true);
  };

  // Open Quick Adjustment Modal for a specific product
  const openQuickAdjustModal = (p: CatalogProduct, initialAction: 'entry' | 'exit' | 'set' = 'entry') => {
    setSelectedProductForAdjustment(p);
    setAdjustModalSubTab('adjust');
    setAdjustAction(initialAction);
    setAdjustQuantity(initialAction === 'set' ? (p.stock ?? 0) : 5);
    setQuickReason(
      initialAction === 'entry' 
        ? 'Compra a distribuidor / Reabastecimiento de bodega'
        : initialAction === 'exit'
        ? 'Merma por avería, rotura o daño físico'
        : 'Conteo físico / Cuadre mensual de existencias'
    );
    setQuickCustomReason('');
    setQuickReference('');
    setQuickNotes('');
    setIsAdjustModalOpen(true);
  };

  // Open Product History Modal
  const openProductHistoryModal = (p: CatalogProduct) => {
    setSelectedProductForAdjustment(p);
    setAdjustModalSubTab('history');
    setIsAdjustModalOpen(true);
  };

  // Handle Create / Edit Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || unitPrice <= 0) return;

    const isPhysical = type === 'product' || type === 'material';
    const finalStock = isPhysical ? Number(stock) : 0;
    const finalReason = customReason.trim() || adjustmentReason;

    if (editingProduct) {
      const prevStock = typeof editingProduct.stock === 'number' ? editingProduct.stock : 0;
      const stockHasChanged = isPhysical && finalStock !== prevStock;

      await updateCatalogProduct(editingProduct.id, {
        code,
        name,
        brand,
        category,
        type,
        description,
        unitPrice: Number(unitPrice),
        costPrice: Number(costPrice),
        stock: finalStock,
        minStock: isPhysical ? Number(minStock) : undefined,
        location: isPhysical ? location : undefined,
        unit,
        ...(stockHasChanged ? {
          movementReason: finalReason,
          referenceDocument: referenceDocument.trim() || undefined
        } : {})
      });

      showToast(`Artículo "${name}" actualizado con éxito.`, 'success');
    } else {
      await addCatalogProduct({
        code,
        name,
        brand,
        category,
        type,
        description,
        unitPrice: Number(unitPrice),
        costPrice: Number(costPrice),
        stock: finalStock,
        minStock: isPhysical ? Number(minStock) : undefined,
        location: isPhysical ? location : undefined,
        unit
      });

      showToast(`Artículo "${name}" agregado al catálogo.`, 'success');
    }

    setIsModalOpen(false);
  };

  // Handle Quick Adjust Submit
  const handleQuickAdjustSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductForAdjustment) return;

    const currentStock = typeof selectedProductForAdjustment.stock === 'number' ? selectedProductForAdjustment.stock : 0;
    let newStockVal = currentStock;
    let movType: InventoryMovementType = 'manual_adjustment';

    if (adjustAction === 'entry') {
      newStockVal = currentStock + Math.max(1, Number(adjustQuantity));
      movType = 'purchase_entry';
    } else if (adjustAction === 'exit') {
      newStockVal = Math.max(0, currentStock - Math.max(1, Number(adjustQuantity)));
      movType = 'damage_loss';
    } else {
      newStockVal = Math.max(0, Number(adjustQuantity));
      movType = 'manual_adjustment';
    }

    const reasonToUse = quickCustomReason.trim() || quickReason;

    await adjustStock({
      productId: selectedProductForAdjustment.id,
      newStock: newStockVal,
      movementType: movType,
      reason: reasonToUse,
      referenceDocument: quickReference.trim() || undefined,
      notes: quickNotes.trim() || undefined
    });

    showToast(`Existencias de "${selectedProductForAdjustment.name}" actualizadas a ${newStockVal} ${selectedProductForAdjustment.unit || 'unidades'}.`, 'success');
    setIsAdjustModalOpen(false);
  };

  // Filtered Catalog
  const filteredCatalog = catalog.filter(item => {
    const matchesSearch = 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.code && item.code.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.brand && item.brand.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.location && item.location.toLowerCase().includes(searchTerm.toLowerCase())) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    const matchesType = typeFilter === 'all' || item.type === typeFilter;
    const matchesStock = stockFilter === 'all' || (
      (item.type === 'product' || item.type === 'material') && 
      (typeof item.stock !== 'number' || item.stock <= (item.minStock ?? 3))
    );

    return matchesSearch && matchesCategory && matchesType && matchesStock;
  });

  // Filtered Kardex Movements
  const filteredMovements = inventoryMovements.filter(m => {
    const matchesSearch = 
      m.productName.toLowerCase().includes(kardexSearch.toLowerCase()) ||
      (m.productCode && m.productCode.toLowerCase().includes(kardexSearch.toLowerCase())) ||
      (m.referenceDocument && m.referenceDocument.toLowerCase().includes(kardexSearch.toLowerCase())) ||
      m.reason.toLowerCase().includes(kardexSearch.toLowerCase()) ||
      m.userName.toLowerCase().includes(kardexSearch.toLowerCase());

    const matchesType = kardexTypeFilter === 'all' || m.type === kardexTypeFilter;
    const matchesProduct = kardexProductFilter === 'all' || m.productId === kardexProductFilter;

    return matchesSearch && matchesType && matchesProduct;
  });

  // Inventory Valuation Metrics
  const valuation = calculateInventoryValuation(catalog);
  const lowStockItems = catalog.filter(p => 
    (p.type === 'product' || p.type === 'material') && 
    (typeof p.stock !== 'number' || p.stock <= (p.minStock ?? 3))
  );

  // Export Catalog CSV
  const handleExportCatalog = () => {
    if (catalog.length === 0) {
      showToast('No hay productos en el catálogo para exportar.', 'warning');
      return;
    }

    const headers = 'Codigo,Nombre_Producto,Marca,Categoria,Tipo,Descripcion,Precio_Venta_DOP,Costo_Compra_DOP,Stock,Stock_Minimo,Ubicacion,Unidad';
    const rows = catalog.map(p => {
      const escape = (str: string = '') => `"${str.replace(/"/g, '""')}"`;
      return [
        escape(p.code || ''),
        escape(p.name),
        escape(p.brand || ''),
        escape(p.category),
        escape(p.type),
        escape(p.description),
        p.unitPrice,
        p.costPrice || 0,
        p.stock !== undefined ? p.stock : 0,
        p.minStock !== undefined ? p.minStock : 3,
        escape(p.location || ''),
        escape(p.unit || 'Unidad')
      ].join(',');
    });

    const csvContent = '\uFEFF' + [headers, ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `catalogo_precios_martinez_tech_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    showToast('Catálogo de productos exportado en CSV', 'success');
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Export Kardex CSV
  const handleExportKardex = () => {
    if (filteredMovements.length === 0) {
      showToast('No hay movimientos en el Kardex para exportar.', 'warning');
      return;
    }

    const headers = 'Fecha,Hora,Tipo_Movimiento,Producto,Codigo,Variacion,Stock_Anterior,Stock_Final,Motivo,Referencia_Doc,Usuario,Rol';
    const rows = filteredMovements.map(m => {
      const escape = (str: string = '') => `"${str.replace(/"/g, '""')}"`;
      const dateObj = new Date(m.createdAt);
      const dateStr = dateObj.toLocaleDateString('es-DO');
      const timeStr = dateObj.toLocaleTimeString('es-DO', { hour: '2-digit', minute: '2-digit' });
      const typeInfo = getMovementTypeInfo(m.type);

      return [
        dateStr,
        timeStr,
        escape(typeInfo.label),
        escape(m.productName),
        escape(m.productCode || ''),
        m.quantityChange > 0 ? `+${m.quantityChange}` : m.quantityChange,
        m.previousStock,
        m.newStock,
        escape(m.reason),
        escape(m.referenceDocument || ''),
        escape(m.userName),
        escape(m.userRole)
      ].join(',');
    });

    const csvContent = '\uFEFF' + [headers, ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `kardex_movimientos_martinez_tech_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    showToast('Bitácora Kardex exportada en CSV con éxito', 'success');
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Top Header & Navigation Sub-Tabs */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-300 dark:border-slate-800 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-brand-teal-50 dark:bg-brand-teal-950/80 text-brand-teal-700 dark:text-brand-teal-400 border border-brand-teal-300 dark:border-brand-teal-600/40">
              <Boxes className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                Gestión de Catálogo, Inventario & Kardex
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                Control físico de existencias, trazabilidad de movimientos y auditoría de inventario en tiempo real.
              </p>
            </div>
          </div>
        </div>

        {/* View Switcher Buttons */}
        <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab('catalog')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'catalog'
                ? 'bg-white dark:bg-slate-900 text-brand-teal-700 dark:text-brand-teal-400 shadow-sm border border-slate-200 dark:border-slate-700'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Catálogo & Artículos ({catalog.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('kardex')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'kardex'
                ? 'bg-white dark:bg-slate-900 text-brand-teal-700 dark:text-brand-teal-400 shadow-sm border border-slate-200 dark:border-slate-700'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Kardex / Movimientos ({inventoryMovements.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('valuation')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'valuation'
                ? 'bg-white dark:bg-slate-900 text-brand-teal-700 dark:text-brand-teal-400 shadow-sm border border-slate-200 dark:border-slate-700'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Alertas & Valoración</span>
            {lowStockItems.length > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-amber-500 text-slate-950 font-black text-[10px]">
                {lowStockItems.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* =========================================================
          TAB 1: CATALOG GRID
      ========================================================= */}
      {activeTab === 'catalog' && (
        <div className="space-y-6">
          {/* Top Filter Bar & Actions */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-300 dark:border-slate-800 shadow-md">
            
            <div className="flex items-center gap-3 flex-1 flex-wrap">
              <div className="relative flex-1 min-w-[240px]">
                <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar por equipo, código, marca, ubicación o descripción..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:border-brand-teal-500 shadow-sm"
                />
              </div>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 font-medium focus:outline-none focus:border-brand-teal-500 shadow-sm"
              >
                <option value="all">Todas las Categorías</option>
                <option value="camaras">Cámaras de Vigilancia</option>
                <option value="redes">Redes Informáticas</option>
                <option value="motores">Motores para Portón</option>
                <option value="cerraduras">Cerraduras Magnéticas</option>
                <option value="acceso">Control de Acceso</option>
                <option value="ponchadores">Ponchadores</option>
                <option value="alarmas">Alarmas</option>
                <option value="intercom">Intercom</option>
              </select>

              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 font-medium focus:outline-none focus:border-brand-teal-500 shadow-sm"
              >
                <option value="all">Todos los Tipos</option>
                <option value="product">Equipos / Productos</option>
                <option value="labor">Mano de Obra / Instalación</option>
                <option value="material">Materiales / Insumos</option>
                <option value="service">Servicios</option>
              </select>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => setStockFilter(prev => prev === 'all' ? 'low_or_out' : 'all')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
                  stockFilter === 'low_or_out'
                    ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-300 border-amber-400 dark:border-amber-600 shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-200'
                }`}
                title="Filtrar productos con existencia crítica o agotados"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                <span>Bajo Stock ({valuation.lowStockCount + valuation.outOfStockCount})</span>
              </button>

              <button
                onClick={handleExportCatalog}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs border border-slate-300 dark:border-slate-700 shadow-sm transition-colors"
                title="Exportar listado a archivo CSV compatible con Excel"
              >
                <Download className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span className="hidden sm:inline">Exportar Excel</span>
              </button>

              <button
                onClick={() => setIsBulkImportModalOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-brand-teal-50 dark:hover:bg-brand-teal-950/60 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs shadow-sm transition-colors"
              >
                <Upload className="w-4 h-4 text-brand-teal-600 dark:text-brand-teal-400" />
                <span>Carga Masiva CSV</span>
              </button>

              <button
                onClick={openNewModal}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-brand-teal-500 to-brand-green-500 hover:from-brand-teal-400 hover:to-brand-green-400 text-slate-950 font-black text-xs shadow-md border border-brand-teal-600/30 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Nuevo Ítem</span>
              </button>
            </div>
          </div>

          {/* Catalog Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredCatalog.map((item) => {
              const catInfo = getCategoryInfo(item.category);
              const isPhysical = item.type === 'product' || item.type === 'material';

              return (
                <div
                  key={item.id}
                  className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 hover:border-brand-teal-500 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between flex-wrap gap-1.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${catInfo.color}`}>
                        {catInfo.label}
                      </span>
                      <div className="flex items-center gap-1.5">
                        {isPhysical && (() => {
                          const stockInfo = getProductStockStatus(item.stock, item.minStock);
                          return (
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${stockInfo.badgeClass}`}>
                              {stockInfo.label}
                            </span>
                          );
                        })()}
                        <span className="text-[10px] font-mono font-bold text-slate-700 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-300 dark:border-slate-700">
                          {item.code || item.type.toUpperCase()}
                        </span>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                        {item.name}
                      </h4>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        {item.brand && (
                          <span className="text-[11px] font-bold text-brand-teal-700 dark:text-brand-teal-400">
                            Marca: {item.brand}
                          </span>
                        )}
                        {item.location && (
                          <span className="text-[11px] font-medium text-slate-500 flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            {item.location}
                          </span>
                        )}
                      </div>
                    </div>

                    <p className="text-xs text-slate-700 dark:text-slate-400 line-clamp-2 leading-relaxed font-normal">
                      {item.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t-2 border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider">
                        Precio Venta ({item.unit})
                      </div>
                      <div className="text-lg font-black text-brand-green-700 dark:text-brand-green-400 font-mono">
                        {formatCurrency(item.unitPrice)}
                      </div>
                      {item.costPrice ? (
                        <div className="text-[10px] text-slate-500 font-mono font-medium">
                          Costo: {formatCurrency(item.costPrice)}
                        </div>
                      ) : null}
                    </div>

                    <div className="flex items-center gap-1.5">
                      {isPhysical && (
                        <button
                          onClick={() => openQuickAdjustModal(item)}
                          className="px-2.5 py-1.5 rounded-xl bg-brand-teal-50 dark:bg-brand-teal-950/60 hover:bg-brand-teal-100 dark:hover:bg-brand-teal-900/80 text-brand-teal-800 dark:text-brand-teal-300 border border-brand-teal-300 dark:border-brand-teal-600/40 text-xs font-bold flex items-center gap-1 transition-colors"
                          title="Ajustar Stock / Ver Kardex del producto"
                        >
                          <Boxes className="w-3.5 h-3.5 text-brand-teal-600" />
                          <span>Stock: {item.stock ?? 0}</span>
                        </button>
                      )}

                      <button
                        onClick={() => openEditModal(item)}
                        className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700"
                        title="Editar Artículo"
                      >
                        <Edit className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => {
                          if (confirm(`¿Eliminar ${item.name} del catálogo?`)) {
                            deleteCatalogProduct(item.id);
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
        </div>
      )}

      {/* =========================================================
          TAB 2: KARDEX / INVENTORY MOVEMENTS AUDIT
      ========================================================= */}
      {activeTab === 'kardex' && (
        <div className="space-y-6">
          {/* Kardex Filters & Export */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-300 dark:border-slate-800 shadow-md">
            <div className="flex items-center gap-3 flex-1 flex-wrap">
              <div className="relative flex-1 min-w-[240px]">
                <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar por producto, referencia, motivo o usuario..."
                  value={kardexSearch}
                  onChange={(e) => setKardexSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:border-brand-teal-500 shadow-sm"
                />
              </div>

              <select
                value={kardexTypeFilter}
                onChange={(e) => setKardexTypeFilter(e.target.value)}
                className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 font-medium focus:outline-none focus:border-brand-teal-500 shadow-sm"
              >
                <option value="all">Todos los Movimientos</option>
                <option value="purchase_entry">Entradas por Compra (+)</option>
                <option value="sale_deduction">Salidas por Cotización (-)</option>
                <option value="manual_adjustment">Ajustes por Conteo (±)</option>
                <option value="damage_loss">Mermas / Daño (-)</option>
                <option value="return">Devoluciones (+)</option>
                <option value="work_order_use">Uso en Orden Técnica (-)</option>
                <option value="initial">Stock Inicial</option>
              </select>

              <select
                value={kardexProductFilter}
                onChange={(e) => setKardexProductFilter(e.target.value)}
                className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 font-medium focus:outline-none focus:border-brand-teal-500 shadow-sm max-w-[200px]"
              >
                <option value="all">Todos los Productos</option>
                {catalog.filter(p => p.type === 'product' || p.type === 'material').map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            <button
              onClick={handleExportKardex}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs border border-slate-300 dark:border-slate-700 shadow-sm transition-colors whitespace-nowrap self-start lg:self-auto"
            >
              <Download className="w-4 h-4 text-brand-teal-600 dark:text-brand-teal-400" />
              <span>Exportar Kardex CSV</span>
            </button>
          </div>

          {/* Kardex Table */}
          <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-3xl overflow-hidden shadow-md">
            {filteredMovements.length === 0 ? (
              <div className="p-12 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mx-auto">
                  <History className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-slate-800 dark:text-white">
                  No hay movimientos registrados en el Kardex
                </h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Los movimientos se generan automáticamente al ingresar compras, reabastecer stock, realizar conteos físicos o al aprobar cotizaciones.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                      <th className="py-3 px-4">Fecha y Hora</th>
                      <th className="py-3 px-4">Tipo</th>
                      <th className="py-3 px-4">Producto & Código</th>
                      <th className="py-3 px-4 text-center">Variación</th>
                      <th className="py-3 px-4 text-center">Existencias</th>
                      <th className="py-3 px-4">Motivo / Documento</th>
                      <th className="py-3 px-4">Responsable</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    {filteredMovements.map((mov) => {
                      const typeInfo = getMovementTypeInfo(mov.type);
                      const isPositive = mov.quantityChange > 0;
                      const isNegative = mov.quantityChange < 0;

                      return (
                        <tr key={mov.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                          <td className="py-3 px-4 whitespace-nowrap">
                            <div className="font-bold text-slate-900 dark:text-white">
                              {new Date(mov.createdAt).toLocaleDateString('es-DO')}
                            </div>
                            <div className="text-[10px] text-slate-500 font-mono">
                              {new Date(mov.createdAt).toLocaleTimeString('es-DO', { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </td>

                          <td className="py-3 px-4 whitespace-nowrap">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${typeInfo.badgeClass}`}>
                              {isPositive ? <ArrowUpRight className="w-3 h-3" /> : isNegative ? <ArrowDownRight className="w-3 h-3" /> : <RefreshCw className="w-3 h-3" />}
                              {typeInfo.badgeLabel}
                            </span>
                          </td>

                          <td className="py-3 px-4">
                            <div className="font-bold text-slate-900 dark:text-white">
                              {mov.productName}
                            </div>
                            {mov.productCode && (
                              <div className="text-[10px] font-mono text-brand-teal-700 dark:text-brand-teal-400 font-semibold">
                                {mov.productCode}
                              </div>
                            )}
                          </td>

                          <td className="py-3 px-4 text-center whitespace-nowrap">
                            <span className={`font-mono font-black text-xs px-2 py-0.5 rounded-lg ${
                              isPositive
                                ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                                : isNegative
                                ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300'
                                : 'bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300'
                            }`}>
                              {isPositive ? `+${mov.quantityChange}` : mov.quantityChange}
                            </span>
                          </td>

                          <td className="py-3 px-4 text-center whitespace-nowrap font-mono text-xs">
                            <span className="text-slate-500">{mov.previousStock}</span>
                            <span className="mx-1.5 text-slate-400">→</span>
                            <span className="font-black text-slate-900 dark:text-white">{mov.newStock}</span>
                          </td>

                          <td className="py-3 px-4 max-w-xs">
                            <div className="text-slate-800 dark:text-slate-200 font-medium line-clamp-1">
                              {mov.reason}
                            </div>
                            {mov.referenceDocument && (
                              <div className="text-[10px] text-brand-teal-700 dark:text-brand-teal-400 font-mono font-semibold">
                                Ref: {mov.referenceDocument}
                              </div>
                            )}
                          </td>

                          <td className="py-3 px-4 whitespace-nowrap">
                            <div className="font-bold text-slate-900 dark:text-white">
                              {mov.userName}
                            </div>
                            <div className="text-[10px] text-slate-500 uppercase font-mono">
                              {mov.userRole}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================
          TAB 3: INVENTORY VALUATION & CRITICAL REORDER ALERTS
      ========================================================= */}
      {activeTab === 'valuation' && (
        <div className="space-y-6">
          {/* Executive KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 flex items-center justify-center shrink-0 border border-blue-200 dark:border-blue-700/40">
                <DollarSign className="w-6 h-6" />
              </div>
              <div>
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Capital en Bodega (Costo)
                </div>
                <div className="text-xl font-black text-slate-900 dark:text-white font-mono mt-0.5">
                  {formatCurrency(valuation.totalCostValue)}
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  {valuation.totalUnits} unidades físicas activas
                </div>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0 border border-emerald-200 dark:border-emerald-700/40">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Valor Comercial (Venta)
                </div>
                <div className="text-xl font-black text-brand-green-700 dark:text-brand-green-400 font-mono mt-0.5">
                  {formatCurrency(valuation.totalRetailValue)}
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  {valuation.totalItems} artículos en inventario
                </div>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 flex items-center justify-center shrink-0 border border-purple-200 dark:border-purple-700/40">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Margen Bruto Proyectado
                </div>
                <div className="text-xl font-black text-purple-700 dark:text-purple-300 font-mono mt-0.5">
                  {formatCurrency(valuation.projectedGrossProfit)}
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  Rentabilidad estimada: {valuation.projectedMarginPercent.toFixed(1)}%
                </div>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0 border border-amber-200 dark:border-amber-700/40">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Artículos Críticos / Agotados
                </div>
                <div className="text-xl font-black text-amber-700 dark:text-amber-400 font-mono mt-0.5">
                  {valuation.lowStockCount + valuation.outOfStockCount}
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  {valuation.outOfStockCount} agotados | {valuation.lowStockCount} bajo umbral
                </div>
              </div>
            </div>
          </div>

          {/* Urgent Reorder Table */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-300 dark:border-slate-800 shadow-md space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                  Listado de Reposición Urgente & Stock Crítico
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Productos que han alcanzado o cruzado su umbral de existencia mínima recomendada.
                </p>
              </div>
            </div>

            {lowStockItems.length === 0 ? (
              <div className="p-8 text-center bg-emerald-50/50 dark:bg-emerald-950/20 rounded-2xl border border-emerald-200 dark:border-emerald-800/40 space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                <h4 className="text-sm font-bold text-emerald-800 dark:text-emerald-300">
                  ¡Inventario en Niveles Óptimos!
                </h4>
                <p className="text-xs text-emerald-700 dark:text-emerald-400">
                  Ningún producto del catálogo tiene existencias en nivel crítico o por debajo de su umbral mínimo.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                      <th className="py-3 px-4">Producto & Código</th>
                      <th className="py-3 px-4 text-center">Stock Actual</th>
                      <th className="py-3 px-4 text-center">Mínimo Sugerido</th>
                      <th className="py-3 px-4 text-center">Faltante</th>
                      <th className="py-3 px-4 text-right">Costo Unitario</th>
                      <th className="py-3 px-4 text-right">Inversión Estimada</th>
                      <th className="py-3 px-4 text-center">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    {lowStockItems.map(item => {
                      const current = item.stock ?? 0;
                      const min = item.minStock ?? 3;
                      const deficit = Math.max(0, min - current);
                      const cost = item.costPrice || 0;
                      const estimatedReorderCost = deficit * cost;

                      return (
                        <tr key={item.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                          <td className="py-3 px-4">
                            <div className="font-bold text-slate-900 dark:text-white">
                              {item.name}
                            </div>
                            <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-0.5">
                              {item.code && <span className="font-mono font-bold text-brand-teal-600">{item.code}</span>}
                              {item.location && <span>Ubicación: {item.location}</span>}
                            </div>
                          </td>

                          <td className="py-3 px-4 text-center font-mono font-black text-sm">
                            <span className={current <= 0 ? 'text-rose-600 dark:text-rose-400' : 'text-amber-600 dark:text-amber-400'}>
                              {current} {item.unit || 'un.'}
                            </span>
                          </td>

                          <td className="py-3 px-4 text-center font-mono font-bold text-slate-600 dark:text-slate-400">
                            {min} {item.unit || 'un.'}
                          </td>

                          <td className="py-3 px-4 text-center font-mono font-black text-rose-600 dark:text-rose-400">
                            -{deficit} {item.unit || 'un.'}
                          </td>

                          <td className="py-3 px-4 text-right font-mono text-slate-700 dark:text-slate-300">
                            {formatCurrency(cost)}
                          </td>

                          <td className="py-3 px-4 text-right font-mono font-black text-slate-900 dark:text-white">
                            {formatCurrency(estimatedReorderCost)}
                          </td>

                          <td className="py-3 px-4 text-center">
                            <button
                              type="button"
                              onClick={() => openQuickAdjustModal(item, 'entry')}
                              className="px-3 py-1.5 rounded-xl bg-brand-teal-600 hover:bg-brand-teal-500 text-white font-bold text-xs shadow-sm border border-brand-teal-700/30 flex items-center gap-1 mx-auto"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>Reabastecer</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL 1: ADD / EDIT PRODUCT MODAL (WITH STOCK & AUDIT)
      ========================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-2xl max-w-lg w-full p-6 relative max-h-[90vh] overflow-y-auto shadow-2xl space-y-5">
            
            <div className="flex items-center justify-between border-b-2 border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {editingProduct ? 'Editar Ítem del Catálogo' : 'Nuevo Ítem en Catálogo'}
                </h3>
                <p className="text-xs text-slate-500">
                  Administración de especificaciones comerciales, precios y existencias físicas.
                </p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-black dark:hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-300">Código de Referencia</label>
                  <input
                    type="text"
                    placeholder="Ej. CAM-IP-4MP"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:border-brand-teal-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-300">Marca / Fabricante</label>
                  <input
                    type="text"
                    placeholder="Ej. Hikvision / BFT"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-brand-teal-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-300">
                  Nombre del Equipo o Servicio <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Cámara IP Domo 4MP ColorVu 24/7"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-brand-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-300">Categoría Técnica</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ServiceCategory)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-200 focus:outline-none focus:border-brand-teal-500"
                  >
                    <option value="camaras">Cámaras de Vigilancia</option>
                    <option value="redes">Redes Informáticas</option>
                    <option value="motores">Motores para Portón</option>
                    <option value="cerraduras">Cerraduras Magnéticas</option>
                    <option value="acceso">Control de Acceso</option>
                    <option value="ponchadores">Ponchadores</option>
                    <option value="alarmas">Alarmas</option>
                    <option value="intercom">Intercom</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-300">Tipo de Ítem</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-200 focus:outline-none focus:border-brand-teal-500 font-bold"
                  >
                    <option value="product">Equipo / Producto (Control de Stock)</option>
                    <option value="material">Material / Insumo (Control de Stock)</option>
                    <option value="labor">Mano de Obra / Instalación</option>
                    <option value="service">Servicio Técnico</option>
                  </select>
                </div>
              </div>

              {/* Physical Inventory Controls (Stock & Location) */}
              {(type === 'product' || type === 'material') ? (
                <div className="p-3.5 rounded-xl bg-brand-teal-50/50 dark:bg-brand-teal-950/30 border border-brand-teal-200 dark:border-brand-teal-800/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-brand-teal-900 dark:text-brand-teal-300 flex items-center gap-1.5">
                      <Boxes className="w-4 h-4 text-brand-teal-600" />
                      Existencias Físicas & Almacén
                    </span>
                    {editingProduct && (
                      <span className="text-[10px] font-mono font-bold text-slate-500">
                        Stock actual: {editingProduct.stock ?? 0}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-bold text-slate-800 dark:text-slate-300">
                          {editingProduct ? 'Nuevo Stock' : 'Stock Inicial'}
                        </label>
                        {editingProduct && stock !== (editingProduct.stock ?? 0) && (
                          <span className={`text-[9px] font-mono font-black px-1.5 py-0.2 rounded ${
                            stock > (editingProduct.stock ?? 0)
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                              : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                          }`}>
                            {stock > (editingProduct.stock ?? 0) ? `+${stock - (editingProduct.stock ?? 0)}` : stock - (editingProduct.stock ?? 0)}
                          </span>
                        )}
                      </div>
                      <input
                        type="number"
                        min="0"
                        value={stock}
                        onChange={(e) => setStock(Math.max(0, Number(e.target.value)))}
                        className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-black text-brand-teal-800 dark:text-brand-teal-300 font-mono focus:outline-none focus:border-brand-teal-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-800 dark:text-slate-300">
                        Stock Mínimo (Alerta)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={minStock}
                        onChange={(e) => setMinStock(Math.max(0, Number(e.target.value)))}
                        className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-200 font-mono focus:outline-none focus:border-brand-teal-500"
                        title="Cuando el stock llegue a esta cantidad, el sistema marcará alerta crítica"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-800 dark:text-slate-300">
                        Ubicación Bodega
                      </label>
                      <input
                        type="text"
                        placeholder="Ej. Pasillo A-1"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-200 focus:outline-none focus:border-brand-teal-500"
                      />
                    </div>
                  </div>

                  {/* Audit Trail Requirement if Stock Changed on existing item */}
                  {editingProduct && stock !== (editingProduct.stock ?? 0) && (
                    <div className="pt-2 border-t border-brand-teal-200 dark:border-brand-teal-800/40 space-y-2">
                      <div className="text-[10px] font-bold text-brand-teal-900 dark:text-brand-teal-300 uppercase tracking-wider flex items-center gap-1">
                        <History className="w-3.5 h-3.5" />
                        Registro de Auditoría Obligatorio (Kardex)
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400">Motivo del Ajuste *</label>
                          <select
                            value={adjustmentReason}
                            onChange={(e) => setAdjustmentReason(e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-[11px] text-slate-900 dark:text-slate-200"
                          >
                            {COMMON_ADJUSTMENT_REASONS.map(r => (
                              <option key={r.value} value={r.value}>{r.value}</option>
                            ))}
                            <option value="otro">Otro motivo personalizado...</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400">Doc. o Comprobante de Referencia</label>
                          <input
                            type="text"
                            placeholder="Ej. Factura #892, Cuadre mensual"
                            value={referenceDocument}
                            onChange={(e) => setReferenceDocument(e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-[11px] text-slate-900 dark:text-slate-200"
                          />
                        </div>
                      </div>

                      {adjustmentReason === 'otro' && (
                        <div>
                          <input
                            type="text"
                            placeholder="Escribe el motivo detallado del ajuste de existencias..."
                            value={customReason}
                            onChange={(e) => setCustomReason(e.target.value)}
                            required
                            className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-[11px] text-slate-900 dark:text-slate-200"
                          />
                        </div>
                      )}
                    </div>
                  )}

                </div>
              ) : (
                <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-400 flex items-center gap-2">
                  <Package className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>Este ítem es de tipo <strong>{type === 'labor' ? 'Mano de Obra' : 'Servicio'}</strong>; no maneja inventario físico ni existencias en bodega.</span>
                </div>
              )}

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-300">Precio Venta (RD$) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    step="10"
                    value={unitPrice}
                    onChange={(e) => setUnitPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-bold text-brand-green-700 dark:text-brand-green-400 font-mono focus:outline-none focus:border-brand-teal-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-300">Costo Compra (RD$)</label>
                  <input
                    type="number"
                    min="0"
                    step="10"
                    value={costPrice}
                    onChange={(e) => setCostPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-200 font-mono focus:outline-none focus:border-brand-teal-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-300">Unidad de Medida</label>
                  <input
                    type="text"
                    placeholder="Unidad, Metro, Kit"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-200 focus:outline-none focus:border-brand-teal-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-300">Descripción Técnica</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Especificaciones clave, garantía del fabricante, etc."
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white resize-none focus:outline-none focus:border-brand-teal-500"
                />
              </div>

              <div className="pt-3 border-t-2 border-slate-200 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-300 border border-slate-300 dark:border-slate-700 hover:bg-slate-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-brand-teal-600 hover:bg-brand-teal-500 text-white font-bold text-xs shadow-md border border-brand-teal-700/20"
                >
                  Guardar en Catálogo
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* =========================================================
          MODAL 2: QUICK STOCK ADJUSTMENT & PRODUCT KARDEX MODAL
      ========================================================= */}
      {isAdjustModalOpen && selectedProductForAdjustment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-3xl max-w-xl w-full p-6 relative max-h-[90vh] overflow-y-auto shadow-2xl space-y-5">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b-2 border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-mono font-bold text-brand-teal-700 dark:text-brand-teal-400 bg-brand-teal-50 dark:bg-brand-teal-950/60 px-2 py-0.5 rounded border border-brand-teal-300 dark:border-brand-teal-600/30">
                  {selectedProductForAdjustment.code || 'ARTÍCULO'}
                </span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1">
                  {selectedProductForAdjustment.name}
                </h3>
              </div>
              <button 
                onClick={() => setIsAdjustModalOpen(false)} 
                className="text-slate-400 hover:text-black dark:hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Sub-Tabs */}
            <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
              <button
                type="button"
                onClick={() => setAdjustModalSubTab('adjust')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  adjustModalSubTab === 'adjust'
                    ? 'bg-brand-teal-50 dark:bg-brand-teal-950/60 text-brand-teal-800 dark:text-brand-teal-300 border border-brand-teal-300 dark:border-brand-teal-600/40'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                Ajustar Existencias
              </button>
              <button
                type="button"
                onClick={() => setAdjustModalSubTab('history')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  adjustModalSubTab === 'history'
                    ? 'bg-brand-teal-50 dark:bg-brand-teal-950/60 text-brand-teal-800 dark:text-brand-teal-300 border border-brand-teal-300 dark:border-brand-teal-600/40'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                Historial de este Artículo (Kardex)
              </button>
            </div>

            {/* Sub-Tab 1: Quick Adjust Form */}
            {adjustModalSubTab === 'adjust' && (
              <form onSubmit={handleQuickAdjustSubmit} className="space-y-4">
                
                {/* Action Selector: Entry, Exit, Set */}
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setAdjustAction('entry');
                      setQuickReason('Compra a distribuidor / Reabastecimiento de bodega');
                    }}
                    className={`p-3 rounded-xl border text-center transition-all ${
                      adjustAction === 'entry'
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-400 text-emerald-800 dark:text-emerald-300 font-black shadow-sm'
                        : 'bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <ArrowUpRight className="w-5 h-5 mx-auto mb-1 text-emerald-600" />
                    <div className="text-xs font-bold">+ Entrada</div>
                    <div className="text-[10px] text-slate-500">Compra / Reabastecer</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setAdjustAction('exit');
                      setQuickReason('Merma por avería, rotura o daño físico');
                    }}
                    className={`p-3 rounded-xl border text-center transition-all ${
                      adjustAction === 'exit'
                        ? 'bg-rose-50 dark:bg-rose-950/60 border-rose-400 text-rose-800 dark:text-rose-300 font-black shadow-sm'
                        : 'bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <ArrowDownRight className="w-5 h-5 mx-auto mb-1 text-rose-600" />
                    <div className="text-xs font-bold">- Salida</div>
                    <div className="text-[10px] text-slate-500">Merma / Daño / Baja</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setAdjustAction('set');
                      setAdjustQuantity(selectedProductForAdjustment.stock ?? 0);
                      setQuickReason('Conteo físico / Cuadre mensual de existencias');
                    }}
                    className={`p-3 rounded-xl border text-center transition-all ${
                      adjustAction === 'set'
                        ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-400 text-blue-800 dark:text-blue-300 font-black shadow-sm'
                        : 'bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <RefreshCw className="w-5 h-5 mx-auto mb-1 text-blue-600" />
                    <div className="text-xs font-bold">= Conteo Físico</div>
                    <div className="text-[10px] text-slate-500">Fijar total exacto</div>
                  </button>
                </div>

                {/* Calculation preview pill */}
                <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                      Existencia Actual
                    </span>
                    <span className="text-sm font-black text-slate-900 dark:text-white font-mono">
                      {selectedProductForAdjustment.stock ?? 0} {selectedProductForAdjustment.unit || 'unidades'}
                    </span>
                  </div>

                  <span className="text-slate-400 font-bold text-base">→</span>

                  <div className="text-right">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                      Stock Resultante
                    </span>
                    <span className="text-sm font-black font-mono text-brand-teal-700 dark:text-brand-teal-300">
                      {adjustAction === 'entry' 
                        ? (selectedProductForAdjustment.stock ?? 0) + Math.max(0, Number(adjustQuantity))
                        : adjustAction === 'exit'
                        ? Math.max(0, (selectedProductForAdjustment.stock ?? 0) - Math.max(0, Number(adjustQuantity)))
                        : Math.max(0, Number(adjustQuantity))
                      } {selectedProductForAdjustment.unit || 'unidades'}
                    </span>
                  </div>
                </div>

                {/* Input quantity */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-300">
                    {adjustAction === 'set' ? 'Cantidad Exacta Contada en Bodega' : 'Cantidad de Unidades a Mover'}
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={adjustQuantity}
                    onChange={(e) => setAdjustQuantity(Math.max(0, Number(e.target.value)))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-sm font-mono font-black text-slate-900 dark:text-white focus:outline-none focus:border-brand-teal-500"
                  />
                </div>

                {/* Reason */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-300">Motivo del Ajuste *</label>
                  <select
                    value={quickReason}
                    onChange={(e) => setQuickReason(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-200"
                  >
                    {COMMON_ADJUSTMENT_REASONS.map(r => (
                      <option key={r.value} value={r.value}>{r.value}</option>
                    ))}
                    <option value="otro">Otro motivo personalizado...</option>
                  </select>
                </div>

                {quickReason === 'otro' && (
                  <div className="space-y-1">
                    <input
                      type="text"
                      required
                      placeholder="Explica el motivo del movimiento..."
                      value={quickCustomReason}
                      onChange={(e) => setQuickCustomReason(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                    />
                  </div>
                )}

                {/* Reference doc & notes */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-800 dark:text-slate-300">No. Comprobante / Factura</label>
                    <input
                      type="text"
                      placeholder="Ej. FACT-PROV-901"
                      value={quickReference}
                      onChange={(e) => setQuickReference(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-800 dark:text-slate-300">Notas Adicionales</label>
                    <input
                      type="text"
                      placeholder="Ej. Recibido por chofer"
                      value={quickNotes}
                      onChange={(e) => setQuickNotes(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="pt-3 border-t-2 border-slate-200 dark:border-slate-800 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAdjustModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 hover:bg-slate-200"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-brand-teal-600 hover:bg-brand-teal-500 text-white font-bold text-xs shadow-md border border-brand-teal-700/20"
                  >
                    Confirmar y Registrar en Kardex
                  </button>
                </div>

              </form>
            )}

            {/* Sub-Tab 2: Individual Product Kardex */}
            {adjustModalSubTab === 'history' && (
              <div className="space-y-3">
                {(() => {
                  const productMovements = inventoryMovements.filter(m => m.productId === selectedProductForAdjustment.id);

                  if (productMovements.length === 0) {
                    return (
                      <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-500 text-xs">
                        Este artículo aún no tiene movimientos individuales registrados en el Kardex.
                      </div>
                    );
                  }

                  return (
                    <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
                      {productMovements.map(m => {
                        const typeInfo = getMovementTypeInfo(m.type);
                        const isPositive = m.quantityChange > 0;

                        return (
                          <div
                            key={m.id}
                            className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-xs flex items-center justify-between gap-3"
                          >
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-2">
                                <span className={`px-2 py-0.2 rounded-full text-[10px] font-bold border ${typeInfo.badgeClass}`}>
                                  {typeInfo.badgeLabel}
                                </span>
                                <span className="font-bold text-slate-900 dark:text-white">
                                  {m.reason}
                                </span>
                              </div>
                              <div className="text-[11px] text-slate-500">
                                {new Date(m.createdAt).toLocaleString('es-DO')} • Por: {m.userName} ({m.userRole})
                                {m.referenceDocument && ` • Ref: ${m.referenceDocument}`}
                              </div>
                            </div>

                            <div className="text-right shrink-0">
                              <span className={`font-mono font-black text-xs px-2 py-0.5 rounded-lg ${
                                isPositive
                                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                                  : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                              }`}>
                                {isPositive ? `+${m.quantityChange}` : m.quantityChange}
                              </span>
                              <div className="text-[10px] font-mono text-slate-500 mt-1">
                                {m.previousStock} → <strong className="text-slate-900 dark:text-white">{m.newStock}</strong>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
};

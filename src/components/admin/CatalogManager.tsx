import React, { useState } from 'react';
import { useAppState } from '../../context/AppStateContext';
import { CatalogProduct, ServiceCategory } from '../../types';
import { 
  Plus, 
  Search, 
  Trash2, 
  Edit, 
  X
} from 'lucide-react';
import { formatCurrency, getCategoryInfo } from '../../utils/formatters';

export const CatalogManager: React.FC = () => {
  const { catalog, addCatalogProduct, updateCatalogProduct, deleteCatalogProduct } = useAppState();

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

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
  const [unit, setUnit] = useState('Unidad');

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
    setUnit('Unidad');
    setIsModalOpen(true);
  };

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
    setStock(p.stock !== undefined ? p.stock : 10);
    setUnit(p.unit || 'Unidad');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || unitPrice <= 0) return;

    if (editingProduct) {
      await updateCatalogProduct(editingProduct.id, {
        code,
        name,
        brand,
        category,
        type,
        description,
        unitPrice: Number(unitPrice),
        costPrice: Number(costPrice),
        stock: Number(stock),
        unit
      });
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
        stock: Number(stock),
        unit
      });
    }

    setIsModalOpen(false);
  };

  const filteredCatalog = catalog.filter(item => {
    const matchesSearch = 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.code && item.code.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.brand && item.brand.toLowerCase().includes(searchTerm.toLowerCase())) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    const matchesType = typeFilter === 'all' || item.type === typeFilter;

    return matchesSearch && matchesCategory && matchesType;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Top Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-300 dark:border-slate-800 shadow-md">
        
        <div className="flex items-center gap-3 flex-1 flex-wrap">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por equipo, código, marca o descripción..."
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

        <button
          onClick={openNewModal}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-teal-600 hover:bg-brand-teal-500 text-white font-bold text-xs shadow-md border border-brand-teal-700/20"
        >
          <Plus className="w-4 h-4" />
          <span>Agregar Ítem al Catálogo</span>
        </button>
      </div>

      {/* Catalog Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredCatalog.map((item) => {
          const catInfo = getCategoryInfo(item.category);

          return (
            <div
              key={item.id}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 hover:border-brand-teal-500 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${catInfo.color}`}>
                    {catInfo.label}
                  </span>
                  <span className="text-[10px] font-mono font-bold text-slate-700 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-300 dark:border-slate-700">
                    {item.code || item.type.toUpperCase()}
                  </span>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                    {item.name}
                  </h4>
                  {item.brand && (
                    <div className="text-[11px] font-bold text-brand-teal-700 dark:text-brand-teal-400 mt-0.5">
                      Marca: {item.brand}
                    </div>
                  )}
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

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditModal(item)}
                    className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700"
                    title="Editar"
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

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-2xl max-w-lg w-full p-6 relative max-h-[90vh] overflow-y-auto shadow-2xl space-y-5">
            
            <div className="flex items-center justify-between border-b-2 border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {editingProduct ? 'Editar Ítem del Catálogo' : 'Nuevo Ítem en Catálogo'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-black dark:hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-300">Código de Referencia</label>
                  <input
                    type="text"
                    placeholder="Ej. CAM-IP-4MP"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-300">Marca / Fabricante</label>
                  <input
                    type="text"
                    placeholder="Ej. Hikvision / BFT"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-300">Nombre del Equipo o Servicio *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Cámara IP Domo 4MP ColorVu 24/7"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-300">Categoría Técnica</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ServiceCategory)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-200"
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
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-200"
                  >
                    <option value="product">Equipo / Producto</option>
                    <option value="labor">Mano de Obra / Instalación</option>
                    <option value="material">Material / Insumo</option>
                    <option value="service">Servicio</option>
                  </select>
                </div>
              </div>

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
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-bold text-brand-green-700 dark:text-brand-green-400 font-mono"
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
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-200 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-300">Unidad de Medida</label>
                  <input
                    type="text"
                    placeholder="Unidad, Metro, Kit"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-200"
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
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white resize-none"
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
                  Guardar en Catálogo
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};

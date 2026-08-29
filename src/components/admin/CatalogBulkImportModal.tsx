import React, { useState, useRef } from 'react';
import { useAppState } from '../../context/AppStateContext';
import { CatalogProduct, ServiceCategory } from '../../types';
import { 
  X, 
  Upload, 
  Download, 
  FileSpreadsheet, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  ArrowRight,
  Info
} from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

export const CatalogBulkImportModal: React.FC = () => {
  const { 
    isBulkImportModalOpen, 
    setIsBulkImportModalOpen, 
    catalog, 
    bulkUpsertCatalog 
  } = useAppState();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [parsedRows, setParsedRows] = useState<Partial<CatalogProduct>[]>([]);
  const [fileName, setFileName] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [successResult, setSuccessResult] = useState<{ added: number; updated: number; total: number } | null>(null);

  if (!isBulkImportModalOpen) return null;

  // Download sample CSV template
  const handleDownloadTemplate = () => {
    const headers = 'Codigo,Nombre_Producto,Marca,Categoria,Tipo,Descripcion,Precio_Venta_DOP,Costo_Compra_DOP,Stock,Unidad';
    const sampleRows = [
      'CAM-IP-4MP,Cámara IP Domo 4MP ColorVu (Audio + Color 24/7),Hikvision,camaras,product,Lente 2.8mm gran angular visión nocturna cálida 30m,3800,2700,20,Unidad',
      'CAM-IP-BULLET,Cámara IP Bullet 4MP Exterior Metálica IP67,Hikvision,camaras,product,Carcasa aluminio visión 40m detección personas,4200,2950,15,Unidad',
      'MOT-CORR-800,Kit Motor para Portón Corredizo 800KG Uso Continuo,BFT,motores,product,Incluye motor 2 controles y fotoceldas,24500,17500,5,Kit',
      'MAG-LOCK-600,Cerradura Magnética Electroimán 600 Lbs con Soporte LZ,YLI,cerraduras,product,Fuerza 280kg indicador LED para puertas metal o madera,4200,2800,8,Unidad',
      'CAB-CAT6-100,Cable de Red UTP Cat6 100% Cobre por Metro,Panduit,redes,material,Certificado gigabit ethernet alta velocidad,45,28,500,Metro',
      'MO-CAM-INST,Mano de Obra Instalación y Ponchado Cámara CCTV/IP,Martínez Tech,camaras,labor,Fijación canalización estética y configuración en app,1500,0,999,Punto'
    ];

    const csvContent = '\uFEFF' + [headers, ...sampleRows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'plantilla_catalogo_martinez_tech.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Parse CSV Line (handles quotes and semicolons/commas)
  const parseCSVLine = (text: string): string[] => {
    const delimiter = text.includes(';') && !text.includes(',') ? ';' : ',';
    const result: string[] = [];
    let cur = '';
    let inQuotes = false;

    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === delimiter && !inQuotes) {
        result.push(cur.trim().replace(/^"|"$/g, '').replace(/""/g, '"'));
        cur = '';
      } else {
        cur += char;
      }
    }
    result.push(cur.trim().replace(/^"|"$/g, '').replace(/""/g, '"'));
    return result;
  };

  // Handle CSV file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');
    setSuccessResult(null);
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        if (!text) {
          setError('El archivo seleccionado está vacío.');
          return;
        }

        const lines = text.split(/\r?\n/).filter(line => line.trim().length > 0);
        if (lines.length <= 1) {
          setError('El archivo no contiene filas de productos para importar.');
          return;
        }

        // Header mapping
        const headerRow = parseCSVLine(lines[0]).map(h => h.toLowerCase().trim().replace(/[^a-z0-9]/g, ''));
        
        const products: Partial<CatalogProduct>[] = [];

        for (let i = 1; i < lines.length; i++) {
          const row = parseCSVLine(lines[i]);
          if (row.length === 0 || row.every(cell => !cell)) continue;

          // Default fallback indexing if headers match
          let code = '';
          let name = '';
          let brand = '';
          let category: ServiceCategory = 'camaras';
          let type: 'product' | 'service' | 'labor' | 'material' = 'product';
          let description = '';
          let unitPrice = 0;
          let costPrice = 0;
          let stock = 10;
          let unit = 'Unidad';

          row.forEach((val, idx) => {
            const h = headerRow[idx] || '';
            if (h.includes('cod') || idx === 0) code = val;
            else if (h.includes('nom') || idx === 1) name = val;
            else if (h.includes('mar') || idx === 2) brand = val;
            else if (h.includes('cat') || idx === 3) {
              const catLower = val.toLowerCase();
              if (['camaras', 'redes', 'motores', 'cerraduras', 'acceso', 'ponchadores', 'alarmas', 'intercom', 'otros'].includes(catLower)) {
                category = catLower as ServiceCategory;
              }
            } else if (h.includes('tip') || idx === 4) {
              const typeLower = val.toLowerCase();
              if (['product', 'service', 'labor', 'material'].includes(typeLower)) {
                type = typeLower as any;
              }
            } else if (h.includes('desc') || idx === 5) description = val;
            else if (h.includes('prec') || h.includes('vent') || idx === 6) {
              unitPrice = parseFloat(val.replace(/[^0-9.]/g, '')) || 0;
            } else if (h.includes('cost') || h.includes('comp') || idx === 7) {
              costPrice = parseFloat(val.replace(/[^0-9.]/g, '')) || 0;
            } else if (h.includes('stock') || idx === 8) {
              stock = parseInt(val.replace(/[^0-9]/g, ''), 10) || 0;
            } else if (h.includes('uni') || idx === 9) {
              unit = val || 'Unidad';
            }
          });

          if (name && unitPrice > 0) {
            products.push({
              code,
              name,
              brand,
              category,
              type,
              description,
              unitPrice,
              costPrice,
              stock,
              unit
            });
          }
        }

        if (products.length === 0) {
          setError('No se pudieron reconocer productos válidos. Revisa que las columnas de Nombre y Precio de Venta tengan datos.');
          return;
        }

        setParsedRows(products);
      } catch (err: any) {
        setError(`Error al procesar el archivo CSV: ${err.message || err}`);
      }
    };

    reader.readAsText(file);
  };

  // Confirm and save bulk import
  const handleConfirmImport = async () => {
    if (parsedRows.length === 0) return;
    setLoading(true);
    setError('');

    try {
      const res = await bulkUpsertCatalog(parsedRows);
      setSuccessResult({
        added: res.addedCount,
        updated: res.updatedCount,
        total: res.total
      });
      setParsedRows([]);
    } catch (err: any) {
      setError(`Error al guardar en el servidor: ${err.message || err}`);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setParsedRows([]);
    setFileName('');
    setError('');
    setSuccessResult(null);
    setIsBulkImportModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-brand-teal-500/10 border border-brand-teal-500/30 text-brand-teal-600 dark:text-brand-teal-400">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                Carga Masiva de Catálogo & Lista de Precios
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Importa cientos de productos, equipos, insumos y tarifas en segundos mediante archivo CSV / Excel.
              </p>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          
          {/* Instructions & Template Download Bar */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 text-xs">
                <Info className="w-4 h-4 text-brand-teal-600 dark:text-brand-teal-400" />
                <span>¿Primera vez importando? Descarga la plantilla oficial</span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400">
                El archivo incluye los encabezados correctos (`Codigo`, `Nombre_Producto`, `Marca`, `Categoria`, `Precio_Venta_DOP`, `Costo_Compra_DOP`, etc.).
              </p>
            </div>

            <button
              onClick={handleDownloadTemplate}
              className="flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs shadow-sm transition-all"
            >
              <Download className="w-4 h-4 text-brand-teal-600 dark:text-brand-teal-400" />
              <span>Descargar Plantilla CSV</span>
            </button>
          </div>

          {/* Success Message Banner */}
          {successResult && (
            <div className="p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-500/40 text-emerald-900 dark:text-emerald-300 space-y-2 animate-fadeIn">
              <div className="flex items-center gap-2 font-bold text-sm">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                <span>¡Catálogo actualizado con éxito!</span>
              </div>
              <div className="grid grid-cols-3 gap-2 pt-2 text-xs">
                <div className="p-2.5 rounded-xl bg-white/80 dark:bg-emerald-900/40 border border-emerald-200 dark:border-emerald-700">
                  <div className="text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-400">Nuevos Agregados</div>
                  <div className="text-base font-black text-emerald-900 dark:text-white">+{successResult.added}</div>
                </div>
                <div className="p-2.5 rounded-xl bg-white/80 dark:bg-emerald-900/40 border border-emerald-200 dark:border-emerald-700">
                  <div className="text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-400">Actualizados</div>
                  <div className="text-base font-black text-emerald-900 dark:text-white">🔄 {successResult.updated}</div>
                </div>
                <div className="p-2.5 rounded-xl bg-white/80 dark:bg-emerald-900/40 border border-emerald-200 dark:border-emerald-700">
                  <div className="text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-400">Total en Catálogo</div>
                  <div className="text-base font-black text-emerald-900 dark:text-white">📦 {successResult.total}</div>
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-500/40 text-rose-900 dark:text-rose-300 flex items-center gap-2 text-xs animate-fadeIn">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Upload Dropzone */}
          {parsedRows.length === 0 && !successResult && (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-brand-teal-500 rounded-3xl p-8 sm:p-12 text-center cursor-pointer transition-all bg-slate-50/50 dark:bg-slate-900/50 hover:bg-brand-teal-50/20 group space-y-3"
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".csv,text/csv,application/vnd.ms-excel"
                className="hidden"
              />
              <div className="w-14 h-14 rounded-2xl bg-brand-teal-500/10 border border-brand-teal-500/30 flex items-center justify-center mx-auto text-brand-teal-600 dark:text-brand-teal-400 group-hover:scale-110 transition-transform">
                <Upload className="w-7 h-7" />
              </div>
              <div>
                <div className="text-sm font-bold text-slate-900 dark:text-white">
                  Haz clic para seleccionar tu archivo CSV
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Formatos soportados: <span className="font-mono font-semibold">.CSV</span> (delimitado por comas o punto y coma)
                </div>
              </div>
            </div>
          )}

          {/* Parsed Rows Preview Table */}
          {parsedRows.length > 0 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 dark:text-white">
                    Vista Previa: <span className="text-brand-teal-600 dark:text-brand-teal-400">{parsedRows.length} productos detectados</span>
                  </span>
                  <span className="text-[11px] text-slate-500">({fileName})</span>
                </div>

                <button
                  onClick={() => {
                    setParsedRows([]);
                    setFileName('');
                  }}
                  className="text-xs text-rose-600 hover:underline flex items-center gap-1 font-medium"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Cargar otro archivo</span>
                </button>
              </div>

              <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden max-h-72 overflow-y-auto">
                <table className="w-full text-left border-collapse text-[11px]">
                  <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold sticky top-0 border-b border-slate-200 dark:border-slate-700">
                    <tr>
                      <th className="p-2.5">Acción</th>
                      <th className="p-2.5">Código</th>
                      <th className="p-2.5">Nombre</th>
                      <th className="p-2.5">Marca</th>
                      <th className="p-2.5">Categoría</th>
                      <th className="p-2.5 text-right">Costo Compra</th>
                      <th className="p-2.5 text-right">Precio Venta</th>
                      <th className="p-2.5 text-center">Stock</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                    {parsedRows.map((row, idx) => {
                      const exists = catalog.some(c => 
                        (row.code && c.code && c.code.toLowerCase() === row.code.toLowerCase())
                      );

                      return (
                        <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                          <td className="p-2.5 whitespace-nowrap">
                            {exists ? (
                              <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700">
                                🔄 Actualizar
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
                                ✨ Nuevo
                              </span>
                            )}
                          </td>
                          <td className="p-2.5 font-mono font-semibold text-slate-900 dark:text-white">
                            {row.code || '-'}
                          </td>
                          <td className="p-2.5 font-medium max-w-xs truncate">
                            {row.name}
                          </td>
                          <td className="p-2.5">{row.brand || '-'}</td>
                          <td className="p-2.5 capitalize">{row.category}</td>
                          <td className="p-2.5 text-right font-mono text-slate-500">
                            {formatCurrency(row.costPrice || 0)}
                          </td>
                          <td className="p-2.5 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                            {formatCurrency(row.unitPrice || 0)}
                          </td>
                          <td className="p-2.5 text-center font-mono">{row.stock}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex items-center justify-between">
          <button
            onClick={handleClose}
            className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-semibold"
          >
            {successResult ? 'Cerrar' : 'Cancelar'}
          </button>

          {parsedRows.length > 0 && (
            <button
              onClick={handleConfirmImport}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-brand-teal-500 to-brand-green-500 hover:from-brand-teal-400 hover:to-brand-green-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all"
            >
              {loading ? (
                <span>Importando productos...</span>
              ) : (
                <>
                  <span>Confirmar & Guardar {parsedRows.length} Ítems</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          )}
        </div>

      </div>
    </div>
  );
};

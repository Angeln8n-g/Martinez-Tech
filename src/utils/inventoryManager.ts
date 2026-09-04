import { CatalogProduct, QuoteItem, InventoryMovementType } from '../types';

export interface StockDeductionResult {
  updatedCatalog: CatalogProduct[];
  deductedItems: {
    productId: string;
    productName: string;
    quantityDeducted: number;
    previousStock: number;
    newStock: number;
  }[];
}

/**
 * Deduce del catálogo los productos incluidos en los ítems de una cotización u orden de trabajo.
 * Solo afecta ítems de tipo 'product' o 'material' que tengan existencia en el catálogo.
 */
export function deductStockFromItems(
  items: QuoteItem[],
  currentCatalog: CatalogProduct[]
): StockDeductionResult {
  const deductedItems: StockDeductionResult['deductedItems'] = [];
  
  const updatedCatalog = currentCatalog.map(product => {
    // Buscar si este producto fue incluido en la cotización (por productId, por id o por coincidencia de nombre/código)
    const matchingItem = items.find(item => 
      (item.productId && item.productId === product.id) ||
      (item.name && item.name.trim().toLowerCase() === product.name.trim().toLowerCase())
    );

    if (matchingItem && (matchingItem.type === 'product' || matchingItem.type === 'material') && matchingItem.quantity > 0) {
      const prevStock = typeof product.stock === 'number' ? product.stock : 0;
      const newStock = Math.max(0, prevStock - matchingItem.quantity);
      
      deductedItems.push({
        productId: product.id,
        productName: product.name,
        quantityDeducted: matchingItem.quantity,
        previousStock: prevStock,
        newStock
      });

      return {
        ...product,
        stock: newStock,
        lastStockUpdate: new Date().toISOString()
      };
    }

    return product;
  });

  return {
    updatedCatalog,
    deductedItems
  };
}

/**
 * Restituye el stock en caso de cancelación o ajuste de cotización.
 */
export function restoreStockFromItems(
  items: QuoteItem[],
  currentCatalog: CatalogProduct[]
): CatalogProduct[] {
  return currentCatalog.map(product => {
    const matchingItem = items.find(item => 
      (item.productId && item.productId === product.id) ||
      (item.name && item.name.trim().toLowerCase() === product.name.trim().toLowerCase())
    );

    if (matchingItem && (matchingItem.type === 'product' || matchingItem.type === 'material') && matchingItem.quantity > 0) {
      const prevStock = typeof product.stock === 'number' ? product.stock : 0;
      return {
        ...product,
        stock: prevStock + matchingItem.quantity,
        lastStockUpdate: new Date().toISOString()
      };
    }

    return product;
  });
}

/**
 * Helper para verificar el estado del stock de un producto con soporte para stock mínimo configurable.
 */
export function getProductStockStatus(stock: number | undefined, minStock: number = 3): {
  status: 'in_stock' | 'low_stock' | 'out_of_stock';
  label: string;
  badgeClass: string;
} {
  const qty = typeof stock === 'number' ? stock : 0;
  const threshold = typeof minStock === 'number' && minStock >= 0 ? minStock : 3;

  if (qty <= 0) {
    return {
      status: 'out_of_stock',
      label: 'Agotado (0)',
      badgeClass: 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border-rose-300 dark:border-rose-600/40'
    };
  }

  if (qty <= threshold) {
    return {
      status: 'low_stock',
      label: `Stock Crítico (${qty} / mín ${threshold})`,
      badgeClass: 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-600/40'
    };
  }

  return {
    status: 'in_stock',
    label: `En Stock (${qty})`,
    badgeClass: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-600/40'
  };
}

/**
 * Calcula métricas ejecutivas y valoración financiera del inventario activo.
 */
export function calculateInventoryValuation(catalog: CatalogProduct[]) {
  const physicalItems = catalog.filter(p => p.type === 'product' || p.type === 'material');

  let inStockCount = 0;
  let lowStockCount = 0;
  let outOfStockCount = 0;
  let totalUnits = 0;
  let totalCostValue = 0;
  let totalRetailValue = 0;

  physicalItems.forEach(p => {
    const qty = typeof p.stock === 'number' ? p.stock : 0;
    const min = typeof p.minStock === 'number' ? p.minStock : 3;
    const cost = typeof p.costPrice === 'number' ? p.costPrice : 0;
    const price = typeof p.unitPrice === 'number' ? p.unitPrice : 0;

    totalUnits += qty;
    totalCostValue += qty * cost;
    totalRetailValue += qty * price;

    if (qty <= 0) {
      outOfStockCount++;
    } else if (qty <= min) {
      lowStockCount++;
    } else {
      inStockCount++;
    }
  });

  const projectedGrossProfit = Math.max(0, totalRetailValue - totalCostValue);
  const projectedMarginPercent = totalRetailValue > 0 ? (projectedGrossProfit / totalRetailValue) * 100 : 0;

  return {
    totalItems: physicalItems.length,
    inStockCount,
    lowStockCount,
    outOfStockCount,
    totalUnits,
    totalCostValue,
    totalRetailValue,
    projectedGrossProfit,
    projectedMarginPercent
  };
}

/**
 * Informaciones de diseño, etiquetas y direcciones para cada tipo de movimiento de inventario.
 */
export function getMovementTypeInfo(type: InventoryMovementType): {
  label: string;
  badgeLabel: string;
  direction: 'in' | 'out' | 'neutral';
  badgeClass: string;
} {
  switch (type) {
    case 'purchase_entry':
      return {
        label: 'Entrada por Compra a Proveedor',
        badgeLabel: '+ Entrada',
        direction: 'in',
        badgeClass: 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-600/40'
      };
    case 'sale_deduction':
      return {
        label: 'Deducción por Cotización / Venta Aprobada',
        badgeLabel: '- Salida Venta',
        direction: 'out',
        badgeClass: 'bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 border-purple-300 dark:border-purple-600/40'
      };
    case 'manual_adjustment':
      return {
        label: 'Ajuste Manual / Conteo Físico',
        badgeLabel: '± Cuadre',
        direction: 'neutral',
        badgeClass: 'bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-600/40'
      };
    case 'damage_loss':
      return {
        label: 'Merma / Avería / Daño Físico',
        badgeLabel: '- Merma/Daño',
        direction: 'out',
        badgeClass: 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-600/40'
      };
    case 'return':
      return {
        label: 'Devolución a Inventario',
        badgeLabel: '+ Devolución',
        direction: 'in',
        badgeClass: 'bg-cyan-100 dark:bg-cyan-950/60 text-cyan-800 dark:text-cyan-300 border-cyan-300 dark:border-cyan-600/40'
      };
    case 'work_order_use':
      return {
        label: 'Uso en Orden de Trabajo Técnica',
        badgeLabel: '- Uso Técnico',
        direction: 'out',
        badgeClass: 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-600/40'
      };
    case 'initial':
    default:
      return {
        label: 'Stock Inicial / Alta',
        badgeLabel: 'Alta Inicial',
        direction: 'in',
        badgeClass: 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-300 border-slate-300 dark:border-slate-700'
      };
  }
}

/**
 * Motivos comunes estandarizados para auditoría de ajustes de stock.
 */
export const COMMON_ADJUSTMENT_REASONS = [
  { value: 'Conteo físico / Cuadre mensual de existencias', type: 'manual_adjustment' as const },
  { value: 'Compra a distribuidor / Reabastecimiento de bodega', type: 'purchase_entry' as const },
  { value: 'Corrección de error de digitación previo', type: 'manual_adjustment' as const },
  { value: 'Merma por avería, rotura o daño físico', type: 'damage_loss' as const },
  { value: 'Equipo enviado a garantía / RMA con fabricante', type: 'damage_loss' as const },
  { value: 'Devolución de cliente por excedente de proyecto', type: 'return' as const },
  { value: 'Uso en pruebas técnicas internas / Muestra comercial', type: 'work_order_use' as const }
];

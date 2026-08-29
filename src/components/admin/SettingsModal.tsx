import React, { useState, useRef } from 'react';
import { useAppState } from '../../context/AppStateContext';
import { 
  X, 
  Save, 
  Download, 
  Upload, 
  RotateCcw, 
  Plus, 
  Trash2,
  Sparkles
} from 'lucide-react';

export const SettingsModal: React.FC = () => {
  const { 
    isSettingsModalOpen, 
    setIsSettingsModalOpen, 
    companySettings, 
    updateCompanySettings, 
    exportDataBackup, 
    importDataBackup, 
    resetToDefaultData,
    clearTestDataForProduction
  } = useAppState();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [copiedSuccess, setCopiedSuccess] = useState(false);

  const [name, setName] = useState(companySettings.name);
  const [legalName, setLegalName] = useState(companySettings.legalName);
  const [slogan, setSlogan] = useState(companySettings.slogan);
  const [rnc, setRnc] = useState(companySettings.rnc);
  const [phone, setPhone] = useState(companySettings.phone);
  const [whatsapp, setWhatsapp] = useState(companySettings.whatsapp);
  const [email, setEmail] = useState(companySettings.email);
  const [address, setAddress] = useState(companySettings.address);
  const [city, setCity] = useState(companySettings.city);
  const [defaultTaxPercent, setDefaultTaxPercent] = useState(companySettings.defaultTaxPercent);
  const [defaultWarranty, setDefaultWarranty] = useState(companySettings.defaultWarranty);
  const [defaultTerms, setDefaultTerms] = useState(companySettings.defaultTerms);
  const [bankAccounts, setBankAccounts] = useState(companySettings.bankAccounts || []);

  if (!isSettingsModalOpen) return null;

  const handleAddBankAccount = () => {
    setBankAccounts(prev => [
      ...prev,
      {
        bank: 'Banco Nuevo',
        accountNumber: '0000000000',
        accountType: 'Corriente en Pesos (DOP)',
        holder: legalName
      }
    ]);
  };

  const handleUpdateAccount = (index: number, field: string, value: string) => {
    setBankAccounts(prev => prev.map((acc, i) => i === index ? { ...acc, [field]: value } : acc));
  };

  const handleDeleteAccount = (index: number) => {
    setBankAccounts(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateCompanySettings({
      name,
      legalName,
      slogan,
      rnc,
      phone,
      whatsapp,
      email,
      address,
      city,
      defaultTaxPercent: Number(defaultTaxPercent),
      defaultWarranty,
      defaultTerms,
      bankAccounts
    });
    setCopiedSuccess(true);
    setTimeout(() => {
      setCopiedSuccess(false);
      setIsSettingsModalOpen(false);
    }, 800);
  };

  const handleFileImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target?.result as string;
      if (content) {
        const ok = await importDataBackup(content);
        if (ok) {
          alert('¡Copia de seguridad restaurada con éxito!');
          setIsSettingsModalOpen(false);
        } else {
          alert('El archivo no tiene el formato JSON válido.');
        }
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-2xl max-w-3xl w-full p-6 relative max-h-[90vh] overflow-y-auto shadow-2xl space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-slate-200 dark:border-slate-800 pb-4">
          <div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white">
              Configuración de la Empresa & Sistema
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 font-medium">
              Ajusta los datos membretados para presupuestos formales, cuentas bancarias y respaldos.
            </p>
          </div>
          <button
            onClick={() => setIsSettingsModalOpen(false)}
            className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-black dark:hover:text-white border border-slate-300 dark:border-slate-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          
          {/* General Data */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              1. Identidad Corporativa & Datos Fiscales
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-300">Nombre Comercial</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-300">Razón Social / Titular</label>
                <input
                  type="text"
                  value={legalName}
                  onChange={(e) => setLegalName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-300">RNC o Cédula</label>
                <input
                  type="text"
                  value={rnc}
                  onChange={(e) => setRnc(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-300">Eslogan</label>
                <input
                  type="text"
                  value={slogan}
                  onChange={(e) => setSlogan(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-300">Teléfono</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-300">WhatsApp Oficial</label>
                <input
                  type="text"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-300">Correo Electrónico</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1 sm:col-span-2">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-300">Dirección</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-300">Ciudad / País</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Defaults for Quotes */}
          <div className="space-y-3 pt-3 border-t-2 border-slate-200 dark:border-slate-800">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              2. Valores por Defecto para Cotizaciones
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-300">Garantía Estándar</label>
                <input
                  type="text"
                  value={defaultWarranty}
                  onChange={(e) => setDefaultWarranty(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-300">Términos de Pago por Defecto</label>
                <input
                  type="text"
                  value={defaultTerms}
                  onChange={(e) => setDefaultTerms(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Bank Accounts for Invoices / Quotes */}
          <div className="space-y-3 pt-3 border-t-2 border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                3. Cuentas Bancarias para Transferencias
              </h4>
              <button
                type="button"
                onClick={handleAddBankAccount}
                className="text-xs text-brand-teal-700 dark:text-brand-teal-400 hover:underline font-bold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Agregar Cuenta</span>
              </button>
            </div>

            <div className="space-y-2">
              {bankAccounts.map((acc, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700/80 grid grid-cols-1 sm:grid-cols-12 gap-2 items-center shadow-sm">
                  <div className="sm:col-span-4">
                    <input
                      type="text"
                      placeholder="Banco"
                      value={acc.bank}
                      onChange={(e) => handleUpdateAccount(idx, 'bank', e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white font-bold"
                    />
                  </div>
                  <div className="sm:col-span-4">
                    <input
                      type="text"
                      placeholder="Número de Cuenta"
                      value={acc.accountNumber}
                      onChange={(e) => handleUpdateAccount(idx, 'accountNumber', e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white font-mono font-bold"
                    />
                  </div>
                  <div className="sm:col-span-3">
                    <input
                      type="text"
                      placeholder="Tipo de Cuenta"
                      value={acc.accountType}
                      onChange={(e) => handleUpdateAccount(idx, 'accountType', e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                    />
                  </div>
                  <div className="sm:col-span-1 text-right">
                    <button
                      type="button"
                      onClick={() => handleDeleteAccount(idx)}
                      className="p-1 text-slate-400 hover:text-rose-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Backup & Restore */}
          <div className="space-y-3 pt-3 border-t-2 border-slate-200 dark:border-slate-800">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              4. Respaldos de Datos & Seguridad
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <button
                type="button"
                onClick={exportDataBackup}
                className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 border border-slate-300 dark:border-slate-700 text-left transition-colors flex items-center justify-between shadow-sm"
              >
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">Exportar Respaldo</div>
                  <div className="text-[10px] text-slate-600 dark:text-slate-400">Descargar JSON completo</div>
                </div>
                <Download className="w-4 h-4 text-brand-teal-700 dark:text-brand-teal-400" />
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 border border-slate-300 dark:border-slate-700 text-left transition-colors flex items-center justify-between shadow-sm"
              >
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">Restaurar Datos</div>
                  <div className="text-[10px] text-slate-600 dark:text-slate-400">Importar archivo JSON</div>
                </div>
                <Upload className="w-4 h-4 text-blue-700 dark:text-blue-400" />
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileImport}
                accept=".json"
                className="hidden"
              />

              <button
                type="button"
                onClick={clearTestDataForProduction}
                className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 border border-emerald-300 dark:border-emerald-500/30 text-left transition-colors flex items-center justify-between shadow-sm"
              >
                <div>
                  <div className="text-xs font-bold text-emerald-800 dark:text-emerald-300">Limpiar para Producción</div>
                  <div className="text-[10px] text-emerald-600 dark:text-emerald-400">Vaciar cotizaciones y demo</div>
                </div>
                <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              </button>

              <button
                type="button"
                onClick={resetToDefaultData}
                className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 border border-rose-300 dark:border-rose-500/30 text-left transition-colors flex items-center justify-between shadow-sm"
              >
                <div>
                  <div className="text-xs font-bold text-rose-800 dark:text-rose-300">Restablecer Iniciales</div>
                  <div className="text-[10px] text-rose-600 dark:text-rose-400">Restaurar demo inicial</div>
                </div>
                <RotateCcw className="w-4 h-4 text-rose-600" />
              </button>
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-4 border-t-2 border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsSettingsModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-300 text-xs font-semibold border border-slate-300 dark:border-slate-700"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-brand-teal-600 hover:bg-brand-teal-500 text-white font-black text-xs shadow-md border border-brand-teal-700/20 flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>{copiedSuccess ? '¡Guardado con Éxito!' : 'Guardar Cambios'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};

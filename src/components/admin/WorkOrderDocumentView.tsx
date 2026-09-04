import React, { useRef, useState } from 'react';
import { useAppState } from '../../context/AppStateContext';
import { WorkOrder } from '../../types';
import { BrandLogo } from '../ui/BrandLogo';
import { SignaturePad } from '../ui/SignaturePad';
import { 
  Printer, 
  Download, 
  Edit, 
  X, 
  ShieldCheck, 
  Calendar,
  CheckCircle2,
  Wrench,
  Image as ImageIcon,
  MapPin,
  Phone,
  PenTool,
  Maximize2,
  Sparkles
} from 'lucide-react';
import { formatDate } from '../../utils/formatters';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useToast } from '../ui/ToastNotification';

export const WorkOrderDocumentView: React.FC = () => {
  const { 
    activeWorkOrderForView, 
    setActiveWorkOrderForView, 
    companySettings, 
    setActiveWorkOrderForEdit, 
    setIsWorkOrderModalOpen,
    signWorkOrder 
  } = useAppState();
  const { showToast } = useToast();

  const printRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);
  const [isSigningOpen, setIsSigningOpen] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<{ url: string; title: string; tag: string } | null>(null);

  if (!activeWorkOrderForView) return null;

  const order = activeWorkOrderForView;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    if (!printRef.current) return;
    setDownloading(true);
    try {
      const element = printRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const imgWidth = 210;
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`Acta_Entrega_${order.orderNumber}_${order.clientName.replace(/\s+/g, '_')}.pdf`);
      showToast('Acta de entrega descargada en PDF', 'success');
    } catch (err) {
      console.error('Error generating PDF', err);
      showToast('Hubo un inconveniente al generar el PDF. Puedes usar "Imprimir / Guardar como PDF".', 'error');
    } finally {
      setDownloading(false);
    }
  };

  const handleSaveSignature = async (signatureDataUrl: string) => {
    await signWorkOrder(order.id, signatureDataUrl, order.clientName);
    setIsSigningOpen(false);
  };

  const totalBefore = order.beforeImages?.length || 0;
  const totalAfter = order.afterImages?.length || 0;
  const hasPhotos = totalBefore > 0 || totalAfter > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/90 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div className="max-w-4xl w-full my-auto space-y-4">
        
        {/* Floating Top Toolbar */}
        <div className="no-print bg-slate-900 border border-slate-700/80 rounded-2xl p-3 sm:p-4 flex flex-wrap items-center justify-between gap-3 shadow-2xl">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-lg bg-emerald-950 text-emerald-300 font-mono font-bold text-xs border border-emerald-500/30">
              {order.orderNumber}
            </span>
            <span className="text-xs text-slate-400 font-medium">
              Acta de Entrega Técnica: <strong className="text-white">{order.clientName}</strong>
            </span>
            {order.clientSignature && (
              <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 text-[11px] font-bold border border-emerald-500/40 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                <span>Firmada Conforme</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {!order.clientSignature && (
              <button
                onClick={() => setIsSigningOpen(true)}
                className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-brand-teal-500 to-brand-green-500 hover:from-brand-teal-400 hover:to-brand-green-400 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-md border border-brand-teal-600/30"
              >
                <PenTool className="w-4 h-4" />
                <span>Firmar Acta de Conformidad</span>
              </button>
            )}

            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center gap-1.5 border border-slate-700"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir</span>
            </button>

            <button
              onClick={handleDownloadPDF}
              disabled={downloading}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center gap-1.5 border border-slate-700 disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>{downloading ? 'Generando...' : 'Descargar PDF'}</span>
            </button>

            <button
              onClick={() => {
                setActiveWorkOrderForEdit(order);
                setActiveWorkOrderForView(null);
                setIsWorkOrderModalOpen(true);
              }}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold text-xs flex items-center gap-1 border border-slate-700"
            >
              <Edit className="w-4 h-4" />
              <span>Editar</span>
            </button>

            <button
              onClick={() => setActiveWorkOrderForView(null)}
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal for Digital Signature on Work Order */}
        {isSigningOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
            <div className="max-w-lg w-full">
              <SignaturePad
                signerName={order.clientName}
                title={`Firma de Conformidad (${order.orderNumber})`}
                onSave={handleSaveSignature}
                onCancel={() => setIsSigningOpen(false)}
              />
            </div>
          </div>
        )}

        {/* Interactive Lightbox Zoom Modal */}
        {lightboxImage && (
          <div 
            onClick={() => setLightboxImage(null)}
            className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/95 backdrop-blur-md animate-fadeIn cursor-zoom-out"
          >
            <div className="relative max-w-4xl w-full max-h-[90vh] flex flex-col items-center gap-3">
              <div className="flex items-center justify-between w-full text-white px-2">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/20">
                  {lightboxImage.tag}
                </span>
                <button
                  onClick={() => setLightboxImage(null)}
                  className="p-2 rounded-full bg-white/10 hover:bg-white/30 text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <img
                src={lightboxImage.url}
                alt={lightboxImage.title}
                className="max-w-full max-h-[78vh] rounded-2xl object-contain border-2 border-slate-700 shadow-2xl bg-black"
              />
              <div className="text-center text-xs text-slate-300 font-medium">
                {lightboxImage.title} (Haz clic en cualquier parte para cerrar)
              </div>
            </div>
          </div>
        )}

        {/* Printable Sheet */}
        <div className="printable-container overflow-x-auto rounded-2xl shadow-2xl">
          <div 
            ref={printRef}
            className="w-full bg-white text-slate-900 p-8 sm:p-12 space-y-6 min-h-[1050px] flex flex-col justify-between"
            style={{ width: '100%', maxWidth: '850px', margin: '0 auto' }}
          >
            <div className="space-y-6">
              
              {/* Header */}
              <div className="flex items-start justify-between border-b-2 border-slate-800 pb-6">
                <div>
                  <BrandLogo size="lg" />
                  <p className="text-xs text-slate-600 mt-2 font-medium tracking-wide">
                    {companySettings.slogan}
                  </p>
                  <div className="text-[11px] text-slate-500 mt-1 space-y-0.5">
                    <div>RNC: <strong className="text-slate-800">{companySettings.rnc}</strong></div>
                    <div>Tel: {companySettings.phone} · WhatsApp: {companySettings.whatsapp}</div>
                    <div>{companySettings.address}, {companySettings.city}</div>
                  </div>
                </div>

                <div className="text-right space-y-1">
                  <div className="inline-block px-3 py-1 bg-emerald-700 text-white font-mono font-bold text-xs uppercase tracking-wider rounded">
                    Acta de Entrega & Conduce Técnico
                  </div>
                  <div className="text-2xl font-black text-slate-900 font-mono tracking-tight">
                    {order.orderNumber}
                  </div>
                  <div className="text-xs text-slate-500">
                    Fecha de Culminación: <strong>{formatDate(order.completedDate || order.scheduledDate)}</strong>
                  </div>
                  {order.quoteNumber && (
                    <div className="text-xs text-brand-teal-700 font-mono font-bold">
                      Ref. Presupuesto: {order.quoteNumber}
                    </div>
                  )}
                </div>
              </div>

              {/* Client & Technician Strip */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Cliente / Receptor:
                  </div>
                  <div className="text-sm font-black text-slate-900">{order.clientName}</div>
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <Phone className="w-3.5 h-3.5 text-slate-500" />
                    <span>{order.clientPhone}</span>
                  </div>
                  <div className="flex items-start gap-1.5 text-slate-600">
                    <MapPin className="w-3.5 h-3.5 text-slate-500 flex-shrink-0 mt-0.5" />
                    <span>{order.clientAddress}</span>
                  </div>
                </div>

                <div className="space-y-1 sm:text-right">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Ejecución Técnica:
                  </div>
                  <div className="text-xs font-bold text-slate-800">
                    Técnico Responsable: <strong>{order.assignedTechnician}</strong>
                  </div>
                  <div className="text-xs text-slate-600">
                    Categoría: <strong className="uppercase">{order.serviceCategory}</strong>
                  </div>
                  <div className="text-xs text-slate-600">
                    Estado: <strong className="text-emerald-700 uppercase font-bold">{order.status}</strong>
                  </div>
                </div>
              </div>

              {/* Scope of Work */}
              <div className="space-y-1.5">
                <div className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  1. Alcance de los Trabajos Realizados
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-800 leading-relaxed">
                  {order.scopeOfWork}
                </div>
              </div>

              {/* Checklist */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  2. Protocolo de Pruebas & Verificación de Calidad
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {order.checklist?.map((chk, i) => (
                    <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-800">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      <span className="font-medium">{chk.task}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* ULTRA POLISHED EVIDENCE GALLERY SECTION */}
              {hasPhotos && (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-1">
                    <div className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                      <ImageIcon className="w-4 h-4 text-emerald-700" />
                      <span>3. Evidencia Fotográfica Certificada (Antes vs Después)</span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-medium">
                      Total: {totalBefore + totalAfter} fotografías registradas
                    </span>
                  </div>

                  {/* 2-Column Side-by-Side Comparison Layout */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    
                    {/* Before Column */}
                    <div className="p-3 rounded-xl bg-amber-50/40 border border-amber-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded bg-amber-200/80 text-amber-900 text-[10px] font-black uppercase tracking-wide">
                          🔴 Estado Inicial (Antes)
                        </span>
                        <span className="text-[10px] text-amber-800 font-bold font-mono">
                          {totalBefore} fotos
                        </span>
                      </div>

                      {totalBefore === 0 ? (
                        <div className="h-24 flex items-center justify-center text-[11px] text-amber-700/60 italic">
                          Sin fotos previas
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 gap-2">
                          {order.beforeImages.map((img, i) => (
                            <div 
                              key={`b-${i}`} 
                              onClick={() => setLightboxImage({ url: img, title: `Foto Inicial #${i + 1}`, tag: 'ESTADO INICIAL (ANTES)' })}
                              className="group relative h-28 rounded-lg overflow-hidden border border-amber-300 bg-black cursor-pointer shadow-sm"
                            >
                              <img 
                                src={img} 
                                alt={`Antes ${i + 1}`} 
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                              />
                              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <Maximize2 className="w-4 h-4 text-white drop-shadow" />
                              </div>
                              <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-black/75 text-[9px] font-bold text-amber-300">
                                Antes #{i + 1}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* After Column */}
                    <div className="p-3 rounded-xl bg-emerald-50/60 border-2 border-emerald-300 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded bg-emerald-600 text-white text-[10px] font-black uppercase tracking-wide">
                          🟢 Trabajo Terminado (Después)
                        </span>
                        <span className="text-[10px] text-emerald-800 font-bold font-mono">
                          {totalAfter} fotos
                        </span>
                      </div>

                      {totalAfter === 0 ? (
                        <div className="h-24 flex items-center justify-center text-[11px] text-emerald-700/60 italic">
                          Sin fotos de entrega
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 gap-2">
                          {order.afterImages.map((img, i) => (
                            <div 
                              key={`a-${i}`} 
                              onClick={() => setLightboxImage({ url: img, title: `Foto Final #${i + 1}`, tag: 'TRABAJO CULMINADO (DESPUÉS)' })}
                              className="group relative h-28 rounded-lg overflow-hidden border-2 border-emerald-500 bg-black cursor-pointer shadow-sm"
                            >
                              <img 
                                src={img} 
                                alt={`Después ${i + 1}`} 
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                              />
                              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <Maximize2 className="w-4 h-4 text-white drop-shadow" />
                              </div>
                              <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-emerald-950 text-[9px] font-bold text-emerald-300">
                                Después #{i + 1}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                  </div>
                </div>
              )}

              {/* Technician Notes & Customer Comments */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {order.technicianNotes && (
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                    <strong className="text-slate-700 text-[11px] block">Notas del Técnico:</strong>
                    <p className="text-slate-600 italic leading-snug">{order.technicianNotes}</p>
                  </div>
                )}
                {order.clientFeedback && (
                  <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 space-y-1">
                    <strong className="text-emerald-800 text-[11px] block">Manifestación del Cliente:</strong>
                    <p className="text-emerald-950 italic leading-snug">"{order.clientFeedback}"</p>
                  </div>
                )}
              </div>

            </div>

            {/* Signature Block */}
            <div className="pt-8 border-t-2 border-slate-200 grid grid-cols-2 gap-8 text-center text-xs">
              <div className="space-y-2">
                <div className="h-16 flex items-end justify-center pb-1">
                  <div className="border-b border-slate-400 w-48 mx-auto" />
                </div>
                <div className="font-bold text-slate-900">{order.assignedTechnician}</div>
                <div className="text-[11px] text-slate-500">Técnico Instalador Certificado</div>
              </div>

              <div className="space-y-2">
                <div className="h-16 flex items-center justify-center">
                  {order.clientSignature ? (
                    <div className="space-y-1">
                      <img
                        src={order.clientSignature}
                        alt="Firma del cliente"
                        className="max-h-12 max-w-[180px] mx-auto object-contain"
                      />
                      <div className="text-[10px] font-bold text-emerald-700 flex items-center justify-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>Recibido Conforme: {order.signedAt ? formatDate(order.signedAt) : 'Conforme'}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="border-b border-slate-400 w-48 mx-auto pt-8">
                      <span className="text-[10px] text-slate-400 italic">Pendiente de firma de entrega</span>
                    </div>
                  )}
                </div>
                <div className="font-bold text-slate-900">{order.signedByName || order.clientName}</div>
                <div className="text-[11px] text-slate-500">Aceptado Conforme / Firma de Recepción</div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

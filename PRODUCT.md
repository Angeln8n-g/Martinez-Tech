# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Clientes y Prospectos**: Particulares y empresas que buscan servicios de seguridad electrónica, redes, telecomunicaciones e infraestructura técnica; consultan servicios, usan el estimador de presupuesto en línea y firman cotizaciones formalmente.
- **Equipo Comercial & Administradores**: Gestionan el catálogo de servicios, crean presupuestos y cotizaciones personalizadas con cálculo de margen en tiempo real, administran el pipeline CRM de negociaciones y coordinan cobranzas.
- **Técnicos e Instaladores en Campo**: Ejecutan levantamientos e instalaciones, completan checklists de calidad técnica y registran actas de entrega/conduces con evidencia fotográfica (antes y después) y firma del cliente en dispositivo móvil.

## Product Purpose

Plataforma unificada para **Martínez Tech** que combina una web corporativa de alta conversión con un sistema integral de CRM, administración de cotizaciones, órdenes de trabajo con evidencia fotográfica, firma digital en pantalla y control de cobranzas para empresas de integración tecnológica.

## Positioning

Solución integral adaptada al flujo de trabajo real de integración tecnológica en República Dominicana y Latinoamérica: elimina la desconexión entre la venta inicial, el cálculo de costos/márgenes, la firma formal del cliente y la entrega técnica verificable con evidencia fotográfica y certificación en conduces membretados.

## Operating Context

- **Entorno Web & Móvil**: Accesible desde navegador de escritorio para administración/ventas y desde smartphones/tablets para técnicos en campo y firma digital de clientes.
- **Modos Visuales**: Soporte para Modo Claro y Modo Oscuro con estética tecnológica y corporativa.
- **Documentación Legal/Comercial**: Generación de presupuestos y conduces oficiales en PDF listos para impresión y envío vía WhatsApp.

## Capabilities and Constraints

- **Stack**: React 18, TypeScript, Vite, Tailwind CSS, Express (Node.js backend), jsPDF / html2canvas.
- **Módulos Clave**:
  - Web pública con estimador de presupuestos interactivo y catálogo por categorías.
  - Portal web interactivo de propuestas para clientes con URL única y aprobación en línea.
  - Firma digital interactiva en pantalla (canvas táctil/mouse) con estampado en PDF.
  - Facturación fiscal con comprobantes NCF (B01, B02, B14, B15), validador algorítmico de RNC/Cédula y generador normativo DGII 606, 607 (TXT/CSV) y 608.
  - Control de inventario inteligente, bitácora Kardex, valuación de almacén y deducción automática de materiales.
  - Gestión de Órdenes de Trabajo y Conduces con comparador fotográfico Antes/Después, visor lightbox y geolocalización GPS.
  - CRM comercial con pipeline Kanban de 8 etapas, calculadora de rentabilidad confidencial y autoguardado de borradores.
  - Búsqueda global instantánea con Command Palette tipo Spotlight (Ctrl + K).
  - Bitácora inmutable de auditoría y trazabilidad (Audit Trail).
  - Arquitectura PWA instalable con soporte offline-first (sw.js) y sincronización con Supabase Cloud.
  - Integración de mensajería WhatsApp contextualizada a 1 clic.

## Brand Commitments

- **Nombre de Marca**: Martínez Tech
- **Lema**: *Soluciones - Servicios - Calidad*
- **Tono y Voz**: Profesional, confiable, técnico, moderno y transparente.
- **Colores de Marca**: Azul tecnológico corporativo (Primary / Cyan / Slate accents) con soporte completo para temas Dark/Light.

## Evidence on Hand

- Catálogo completo de servicios y componentes en src/components/ y src/context/.
- Presentación corporativa ejecutiva interactiva en presentacion_martinez_tech.html (15 diapositivas).
- Formatos membretados de presupuestos, conduces y facturas fiscales con firma digital en src/components/admin/ y src/components/public/.

## Product Principles

1. **Claridad y Confianza Total**: Toda cotización y acta de entrega debe ser impecable, transparente en sus partidas y formalmente respaldada con firma y evidencia visual.
2. **Eficiencia en Campo y Oficina**: Flujos optimizados a pocos clics tanto para el técnico en obra como para el administrador contable.
3. **Estética Profesional & Out-of-Distribution**: Interfaces modernas, accesibles, fluidas y sin saturación genérica, reflejando solidez técnica e innovación.

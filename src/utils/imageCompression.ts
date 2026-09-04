/**
 * Client-side Image Compression Utility for Mobile Field Operations
 * Resizes large smartphone camera photos (8MP - 48MP) to web-optimized sizes
 * (< 350 KB) before uploading to Supabase Storage.
 */

export interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  outputFormat?: 'image/webp' | 'image/jpeg';
}

export async function compressImage(
  file: File,
  options: CompressionOptions = {}
): Promise<File> {
  const {
    maxWidth = 1280,
    maxHeight = 1280,
    quality = 0.82,
    outputFormat = 'image/jpeg'
  } = options;

  // Si no es imagen o es SVG, no comprimir
  if (!file.type.startsWith('image/') || file.type === 'image/svg+xml') {
    return file;
  }

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;

      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Calcular nuevas dimensiones manteniendo aspect ratio
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(file); // Fallback al archivo original
          return;
        }

        // Suavizado de imagen
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              resolve(file);
              return;
            }

            const extension = outputFormat === 'image/webp' ? 'webp' : 'jpg';
            const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || 'photo';
            const compressedFileName = `${baseName}.${extension}`;

            const compressedFile = new File([blob], compressedFileName, {
              type: outputFormat,
              lastModified: Date.now()
            });

            resolve(compressedFile);
          },
          outputFormat,
          quality
        );
      };

      img.onerror = () => {
        resolve(file); // Fallback en caso de error
      };
    };

    reader.onerror = () => {
      resolve(file);
    };
  });
}

/**
 * Obtiene la geolocalización GPS actual del técnico como prueba de visita/instalación.
 */
export function getCurrentGpsLocation(): Promise<{
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: string;
  googleMapsUrl: string;
}> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('La geolocalización no es compatible con este navegador/dispositivo.'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        resolve({
          latitude: lat,
          longitude: lng,
          accuracy: pos.coords.accuracy,
          timestamp: new Date().toISOString(),
          googleMapsUrl: `https://www.google.com/maps?q=${lat},${lng}`
        });
      },
      (err) => {
        reject(new Error(`No se pudo obtener la ubicación GPS: ${err.message}`));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  });
}

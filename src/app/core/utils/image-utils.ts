// src/app/core/utils/image-utils.ts

export interface CompressedImageResult {
  fileName: string;
  contentType: string;
  imageBase64: string;
  blob: Blob;
  sizeBytes: number;
}

export interface ImageCompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  mimeType?: 'image/jpeg' | 'image/png' | 'image/webp';
}

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_RAW_FILE_SIZE_BYTES = 15 * 1024 * 1024; // 15MB

/**
 * Valida que el archivo o blob sea un formato de imagen permitido y no exceda el límite inicial.
 */
export function validateImageFile(file: File | Blob): { valid: boolean; error?: string } {
  const type = file.type?.toLowerCase();
  if (!type || !ALLOWED_MIME_TYPES.includes(type)) {
    return {
      valid: false,
      error: `Formato de archivo no soportado (${type || 'desconocido'}). Solo se permiten imágenes JPEG, PNG o WebP.`
    };
  }

  if (file.size > MAX_RAW_FILE_SIZE_BYTES) {
    return {
      valid: false,
      error: `La imagen excede el límite máximo de ${MAX_RAW_FILE_SIZE_BYTES / (1024 * 1024)}MB.`
    };
  }

  return { valid: true };
}

/**
 * Convierte un Blob o File a DataURL (Base64).
 */
export function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Fallo al convertir Blob a Base64 string'));
      }
    };
    reader.onerror = () => reject(new Error('Error de lectura en FileReader'));
    reader.readAsDataURL(blob);
  });
}

/**
 * Comprime una imagen (File o Blob) redimensionándola si sobrepasa las dimensiones máximas
 * y reduciendo la calidad a formato JPEG/WebP optimizado.
 */
export function compressImage(
  fileOrBlob: File | Blob,
  options: ImageCompressionOptions = {}
): Promise<{ blob: Blob; dataUrl: string }> {
  const {
    maxWidth = 1920,
    maxHeight = 1080,
    quality = 0.82,
    mimeType = 'image/jpeg'
  } = options;

  return new Promise((resolve, reject) => {
    const validation = validateImageFile(fileOrBlob);
    if (!validation.valid) {
      return reject(new Error(validation.error));
    }

    const img = new Image();
    const objectUrl = URL.createObjectURL(fileOrBlob);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      let width = img.width;
      let height = img.height;

      // Calcular proporción conservando aspect ratio
      if (width > maxWidth || height > maxHeight) {
        if (width / maxWidth > height / maxHeight) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        } else {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        return reject(new Error('No se pudo inicializar el contexto 2D del Canvas'));
      }

      // Dibujar fondo blanco en caso de transparencias PNG convertidas a JPEG
      if (mimeType === 'image/jpeg') {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);
      }

      ctx.drawImage(img, 0, 0, width, height);

      const dataUrl = canvas.toDataURL(mimeType, quality);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve({ blob, dataUrl });
          } else {
            reject(new Error('Fallo al generar Blob comprimido desde Canvas'));
          }
        },
        mimeType,
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Error al cargar la imagen en memoria para compresión'));
    };

    img.src = objectUrl;
  });
}

/**
 * Función principal: Comprime una imagen y devuelve el objeto listo para enviar en JSON Base64.
 */
export async function processImageForUpload(
  fileOrBlob: File | Blob,
  customFileName?: string,
  options?: ImageCompressionOptions
): Promise<CompressedImageResult> {
  const originalName = (fileOrBlob as File).name || customFileName || `evidencia_${Date.now()}.jpg`;
  const sanitizedName = originalName.replace(/\.[^/.]+$/, '') + '.jpg';

  const { blob, dataUrl } = await compressImage(fileOrBlob, {
    maxWidth: 1920,
    maxHeight: 1080,
    quality: 0.82,
    mimeType: 'image/jpeg',
    ...options
  });

  return {
    fileName: sanitizedName,
    contentType: 'image/jpeg',
    imageBase64: dataUrl,
    blob,
    sizeBytes: blob.size
  };
}

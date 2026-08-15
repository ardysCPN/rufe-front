// src/app/core/utils/error.utils.ts

/**
 * Extrae de forma exhaustiva y limpia los mensajes de error devueltos por el backend
 * (Spring Boot ProblemDetail, Validation errors, Map of details, o mensajes HTTP estándar).
 */
export function extractErrorMessage(err: any, fallback: string = 'Ha ocurrido un error inesperado'): string {
  if (!err) return fallback;
  if (typeof err === 'string') return err;

  const errBody = err.error || err;

  // 1. Si el backend devuelve un mapa de detalles por campo (Validation Handler)
  // Ej: { details: { nombreOrganizacion: "El nombre debe tener entre 3 y 255 caracteres." } }
  if (errBody.details && typeof errBody.details === 'object') {
    const detailEntries = Object.entries(errBody.details);
    if (detailEntries.length > 0) {
      const messages = detailEntries.map(([field, msg]) => `${msg || field}`);
      return messages.join(' • ');
    }
  }

  // 2. Si el backend devuelve "message"
  if (errBody.message && typeof errBody.message === 'string' && errBody.message.trim() !== '') {
    return errBody.message;
  }

  // 3. Si el backend devuelve "detail" (Spring ProblemDetail RFC 7807)
  if (errBody.detail && typeof errBody.detail === 'string' && errBody.detail.trim() !== '') {
    return errBody.detail;
  }

  // 4. Si el backend devuelve "error" como string
  if (errBody.error && typeof errBody.error === 'string' && errBody.error.trim() !== '') {
    return errBody.error;
  }

  // 5. Si err tiene statusText o message nativo de HttpErrorResponse
  if (err.statusText && err.statusText !== 'OK') {
    return `${err.statusText} (${err.status || 500})`;
  }

  return fallback;
}

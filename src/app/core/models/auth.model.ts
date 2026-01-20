// src/app/core/models/auth.model.ts

/**
 * Interface for the user data after successful login.
 * Adjusted to include the refresh token.
 */
export interface IUser {
  token: string;           // Access Token (as named by your backend)
  type: string;            // (e.g., "Bearer")
  userId: number;
  email: string;
  organizacionNombre: string;
  organizacionId: number;
  rolId: number;
  rolNombre: string;
  expiresAt?: number;
  permissions: string[];
}

/**
 * Interface for login credentials.
 */
export interface ILoginCredentials {
  email: string;
  password: string;
  organizacion: string;
}

/**
 * Interface for the API response after a successful catalog fetch.
 */
export interface ICatalogApiResponse {
  municipios: any[];
  departamentos: any[];
  tiposDocumento: any[];
  generos: any[];
  parentescos: any[];
  zonas: any[];
}

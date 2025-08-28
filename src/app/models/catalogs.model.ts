// src/app/core/models/catalogs.model.ts

/**
 * Generic interface for a catalog item response from the backend.
 * Matches CatalogoItemResponse structure.
 */
export interface ICatalogoItemResponse {
  id: number;
  nombre: string;
}

// Existing catalog interfaces (assuming they are already defined like this)
export interface ICatalogoMunicipio extends ICatalogoItemResponse {
  departamento_id: number; // Assuming this property exists
}

export interface ICatalogoDepartamento extends ICatalogoItemResponse {}

export interface ICatalogoTipoDocumento extends ICatalogoItemResponse {}

export interface ICatalogoGenero extends ICatalogoItemResponse {}

export interface ICatalogoParentesco extends ICatalogoItemResponse {}

export interface ICatalogoZona extends ICatalogoItemResponse {}

export interface ICatalogoTipoUbicacionBien extends ICatalogoItemResponse {}
export interface ICatalogoTipoAlojamientoActual extends ICatalogoItemResponse {}
export interface ICatalogoFormaTenenciaBien extends ICatalogoItemResponse {}
export interface ICatalogoEstadoBien extends ICatalogoItemResponse {}
export interface ICatalogoTipoBien extends ICatalogoItemResponse {}
export interface ICatalogoPertenenciaEtnica extends ICatalogoItemResponse {}
export interface ICatalogoEvento extends ICatalogoItemResponse {}


/**
 * Enum for synchronization status of local records.
 */
export type SyncStatus = 'sincronizado' | 'pendiente_crear' | 'pendiente_actualizar' | 'pendiente_eliminar';

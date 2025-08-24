import { SyncStatus } from './catalogs.model';

export interface IIntegranteLocal {
  cliente_id: string; // UUID for the integrant
  id?: number; // Server ID, optional
  registro_rufe_cliente_id: string; // Foreign key to the parent RUFE's client_id
  estado_sincronizacion: SyncStatus;
  // Other integrant fields
  nombre: string;
  apellido: string;
  tipo_documento_id: number;
  numero_documento: string;
  genero_id: number;
  fecha_nacimiento: string;
  parentesco_id: number;
  // Add more fields if any
}
import { SyncStatus } from './catalogs.model';

export interface IRufeLocal {
  cliente_id: string; // UUID generated on the client
  id?: number; // Server ID (bigserial), optional until synchronization
  estado_sincronizacion: SyncStatus;
  // Other RUFE form fields
  nombre_titular: string;
  apellido_titular: string;
  fecha_creacion_offline: Date; // Timestamp when created offline
  fecha_ultima_actualizacion_offline: Date; // Timestamp of the last offline modification
  tipo_documento_id: number;
  numero_documento: string;
  genero_id: number;
  fecha_nacimiento: string; // Or Date, depending on how you handle it
  direccion: string;
  municipio_id: number;
  departamento_id: number;
  zona_id: number; // Urban, rural, etc.
  ubicacion_lat: number;
  ubicacion_lon: number;
  telefono_contacto: string;
}
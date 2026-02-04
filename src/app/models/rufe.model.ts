import { SyncStatus } from './catalogs.model';

export interface IRufeLocal {
  cliente_id: string; // UUID generado en el cliente
  id?: number; // ID del servidor (bigserial), opcional hasta la sincronización
  estado_sincronizacion: SyncStatus;
  fecha_creacion_offline: Date;
  fecha_ultima_actualizacion_offline: Date;

  // Datos del Formulario
  departamentoId: number;
  municipioId: number;
  eventoId: number;
  tipoEventoId: number;
  fechaEvento: string;
  fechaRufe: string;
  ubicacionTipo: string; // 'urbano' o 'rural'
  corregimiento?: string | null;
  veredaSectorBarrio: string;
  direccion: string;
  alojamientoActual: string;
  formaTenencia: string;
  estadoBien: string;
  tipoBien: string;
  especie?: string | null;
  cantidadPecuaria?: number | null;
  observaciones?: string | null;
}

export interface IIntegranteLocal {
  id?: number; // Llave primaria autoincremental en IndexedDB
  rufe_cliente_id: string; // Llave foránea a IRufeLocal.cliente_id

  // Datos del integrante
  nombres: string;
  apellidos: string;
  tipoDocumento: number;
  numeroDocumento: string;
  fechaNacimiento: string;
  genero: number;
  parentesco: number;
  etnia: number | null;
  telefono: string;
}


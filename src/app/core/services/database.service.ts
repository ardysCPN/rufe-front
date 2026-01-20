// src/app/core/services/database.service.ts

import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import Dexie, { Table } from 'dexie';

import {
  ICatalogoMunicipio,
  ICatalogoDepartamento,
  ICatalogoTipoDocumento,
  ICatalogoGenero,
  ICatalogoParentesco,
  ICatalogoTipoUbicacionBien,
  ICatalogoTipoAlojamientoActual,
  ICatalogoFormaTenenciaBien,
  ICatalogoEstadoBien,
  ICatalogoTipoBien,
  ICatalogoPertenenciaEtnica,
  ICatalogoEvento,
  ICatalogoZona
} from '../../models/catalogs.model';
import { IRufeLocal } from '../../models/rufe.model';
import { IIntegranteLocal } from '../../models/integrant.model';

/**
 * Simple meta interface for storing small key/value metadata (e.g. lastSyncTimestamp)
 */
interface IMeta {
  key: string;
  value: any;
}

@Injectable({
  providedIn: 'root'
})
export class DatabaseService extends Dexie {
  // --- Tables ---
  rufes!: Table<IRufeLocal, string>; // Primary key is cliente_id (string/UUID)
  integrantes!: Table<IIntegranteLocal, string>; // Primary key is cliente_id (string/UUID)

  // Catalog tables
  catalogos_municipios!: Table<ICatalogoMunicipio, number>;
  catalogos_departamentos!: Table<ICatalogoDepartamento, number>;
  catalogos_tipos_documento!: Table<ICatalogoTipoDocumento, number>;
  catalogos_generos!: Table<ICatalogoGenero, number>;
  catalogos_parentescos!: Table<ICatalogoParentesco, number>;
  catalogos_zonas!: Table<ICatalogoZona, number>;
  catalogos_tipo_ubicacion_bien!: Table<ICatalogoTipoUbicacionBien, number>;
  catalogos_tipo_alojamiento_actual!: Table<ICatalogoTipoAlojamientoActual, number>;
  catalogos_forma_tenencia_bien!: Table<ICatalogoFormaTenenciaBien, number>;
  catalogos_estado_bien!: Table<ICatalogoEstadoBien, number>;
  catalogos_tipo_bien!: Table<ICatalogoTipoBien, number>;
  catalogos_pertenencia_etnica!: Table<ICatalogoPertenenciaEtnica, number>;
  catalogos_eventos!: Table<ICatalogoEvento, number>;

  // Meta table for small app metadata
  meta!: Table<IMeta, string>; // Primary key is key (string)

  private isBrowser: boolean;
  private dbReadyPromise: Promise<void>;
  private resolveDbReady!: () => void;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    super('RufeOfflineDB'); // Database name
    this.isBrowser = isPlatformBrowser(this.platformId);

    if (this.isBrowser) {
      this.dbReadyPromise = new Promise(resolve => {
        this.resolveDbReady = resolve;
      });
      this.defineSchema();
      this.openDatabase();
    } else {
      // In SSR, db is not available. Resolve promise immediately.
      this.dbReadyPromise = Promise.resolve();
      console.log('Skipping IndexedDB initialization on server (SSR).');
    }
  }

  private defineSchema(): void {
    // version 1 schema: add all tables (including meta)
    this.version(1).stores({
      rufes: '&cliente_id, id, estado_sincronizacion, fecha_creacion_offline',
      integrantes: '&cliente_id, id, registro_rufe_cliente_id, estado_sincronizacion',
      catalogos_municipios: '&id, nombre, departamento_id',
      catalogos_departamentos: '&id, nombre',
      catalogos_tipos_documento: '&id, nombre',
      catalogos_generos: '&id, nombre',
      catalogos_parentescos: '&id, nombre',
      catalogos_zonas: '&id, nombre',
      catalogos_tipo_ubicacion_bien: '&id, nombre',
      catalogos_tipo_alojamiento_actual: '&id, nombre',
      catalogos_forma_tenencia_bien: '&id, nombre',
      catalogos_estado_bien: '&id, nombre',
      catalogos_tipo_bien: '&id, nombre',
      catalogos_pertenencia_etnica: '&id, nombre',
      catalogos_eventos: '&id, nombre',
      meta: '&key'
    });
  }

  private async openDatabase(): Promise<void> {
    try {
      await this.open();
      console.log('IndexedDB database opened and ready.');
      this.resolveDbReady(); // Signal that the DB is ready
    } catch (error) {
      console.error('Error opening IndexedDB database:', error);
    }
  }

  // All public methods should await this promise to ensure the DB is open.
  public async ensureDbReady(): Promise<void> {
    if (!this.isBrowser) {
      return Promise.reject('Database operations are not available in SSR.');
    }
    return this.dbReadyPromise;
  }

  public closeDatabase(): void {
    if (this.isBrowser) {
      this.close();
      console.log('IndexedDB database closed.');
    }
  }

  // ---------- META (last sync, etc.) ----------
  // Keeping META here as it is very low level, but could also go to a MetaRepository.
  // For simplicity keeping it here for now as it doesn't clutter as much as the others.

  public async setMeta(key: string, value: any): Promise<void> {
    await this.ensureDbReady();
    try {
      await this.meta.put({ key, value });
    } catch (error) {
      console.error('Error al guardar meta:', error);
      throw error;
    }
  }

  public async getMeta<T = any>(key: string): Promise<T | undefined> {
    await this.ensureDbReady();
    try {
      const row = await this.meta.get(key);
      return row?.value as T;
    } catch (error) {
      console.error('Error al leer meta:', error);
      return undefined;
    }
  }

  public async setLastSyncTimestamp(date: Date): Promise<void> {
    return this.setMeta('lastSyncTimestamp', date.toISOString());
  }

  public async getLastSyncTimestamp(): Promise<Date | null> {
    const iso = await this.getMeta<string>('lastSyncTimestamp');
    return iso ? new Date(iso) : null;
  }

  // ---------- UTIL / CLEAR ----------

  public async clearAllTables(): Promise<void> {
    await this.ensureDbReady();
    try {
      await this.transaction('rw', this.tables, async () => {
        await this.rufes.clear();
        await this.integrantes.clear();
        await this.catalogos_municipios.clear();
        await this.catalogos_departamentos.clear();
        await this.catalogos_tipos_documento.clear();
        await this.catalogos_generos.clear();
        await this.catalogos_parentescos.clear();
        await this.catalogos_zonas.clear();
        await this.catalogos_tipo_ubicacion_bien.clear();
        await this.catalogos_tipo_alojamiento_actual.clear();
        await this.catalogos_forma_tenencia_bien.clear();
        await this.catalogos_estado_bien.clear();
        await this.catalogos_tipo_bien.clear();
        await this.catalogos_pertenencia_etnica.clear();
        await this.catalogos_eventos.clear();
        await this.meta.clear();
      });
      console.log('Todas las tablas de IndexedDB han sido limpiadas.');
    } catch (error) {
      console.error('Error al limpiar todas las tablas:', error);
    }
  }
}

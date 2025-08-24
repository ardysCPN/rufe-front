// src/app/core/services/database.service.ts

import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import Dexie, { Table } from 'dexie';
import { v4 as uuidv4 } from 'uuid';

import {
  SyncStatus,
  ICatalogoMunicipio,
  ICatalogoDepartamento,
  ICatalogoTipoDocumento,
  ICatalogoGenero,
  ICatalogoParentesco,
  ICatalogoZona,
  // NEW IMPORTS
  ICatalogoTipoUbicacionBien,
  ICatalogoTipoAlojamientoActual,
  ICatalogoFormaTenenciaBien,
  ICatalogoEstadoBien,
  ICatalogoTipoBien,
  ICatalogoPertenenciaEtnica
} from '../../models/catalogs.model';
import { IRufeLocal } from '../../models/rufe.model';
import { IIntegranteLocal } from '../../models/integrant.model';

export class AppDB extends Dexie {
  rufe!: Table<IRufeLocal, string>;
  integrantes!: Table<IIntegranteLocal, string>;
  catalogos_municipios!: Table<ICatalogoMunicipio, number>;
  catalogos_departamentos!: Table<ICatalogoDepartamento, number>;
  catalogos_tipos_documento!: Table<ICatalogoTipoDocumento, number>;
  catalogos_generos!: Table<ICatalogoGenero, number>;
  catalogos_parentescos!: Table<ICatalogoParentesco, number>;
  catalogos_zonas!: Table<ICatalogoZona, number>;

  // NEW TABLES FOR NEW CATALOGS
  catalogos_tipo_ubicacion_bien!: Table<ICatalogoTipoUbicacionBien, number>;
  catalogos_tipo_alojamiento_actual!: Table<ICatalogoTipoAlojamientoActual, number>;
  catalogos_forma_tenencia_bien!: Table<ICatalogoFormaTenenciaBien, number>;
  catalogos_estado_bien!: Table<ICatalogoEstadoBien, number>;
  catalogos_tipo_bien!: Table<ICatalogoTipoBien, number>;
  catalogos_pertenencia_etnica!: Table<ICatalogoPertenenciaEtnica, number>;


  constructor() {
    super('RufeOfflineDB');
    this.version(1).stores({
      rufe: '&cliente_id, id, estado_sincronizacion, fecha_creacion_offline',
      integrantes: '&cliente_id, id, registro_rufe_cliente_id, estado_sincronizacion',
      catalogos_municipios: '&id, nombre, departamento_id',
      catalogos_departamentos: '&id, nombre',
      catalogos_tipos_documento: '&id, nombre',
      catalogos_generos: '&id, nombre',
      catalogos_parentescos: '&id, nombre',
      catalogos_zonas: '&id, nombre',
      // NEW STORES
      catalogos_tipo_ubicacion_bien: '&id, nombre',
      catalogos_tipo_alojamiento_actual: '&id, nombre',
      catalogos_forma_tenencia_bien: '&id, nombre',
      catalogos_estado_bien: '&id, nombre',
      catalogos_tipo_bien: '&id, nombre',
      catalogos_pertenencia_etnica: '&id, nombre',
    });
  }
}

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {
  private db: AppDB;
  private isBrowser: boolean;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    this.db = new AppDB();
    if (this.isBrowser) {
      this.openDatabase();
    } else {
      console.log('Skipping IndexedDB initialization on server (SSR).');
    }
  }

  private async openDatabase(): Promise<void> {
    try {
      await this.db.open();
      console.log('IndexedDB database opened and ready.');
    } catch (error) {
      console.error('Error opening IndexedDB database:', error);
    }
  }

  public closeDatabase(): void {
    if (this.isBrowser) {
      this.db.close();
      console.log('IndexedDB database closed.');
    }
  }

  public async addRufe(rufe: Omit<IRufeLocal, 'cliente_id' | 'estado_sincronizacion' | 'fecha_creacion_offline' | 'fecha_ultima_actualizacion_offline'>): Promise<string> {
    if (!this.isBrowser) {
      console.warn('Attempted to add RUFE in non-browser environment. Operation skipped.');
      return Promise.resolve('');
    }
    const newRufe: IRufeLocal = {
      ...rufe,
      cliente_id: uuidv4(),
      estado_sincronizacion: 'pendiente_crear',
      fecha_creacion_offline: new Date(),
      fecha_ultima_actualizacion_offline: new Date()
    };
    try {
      const id = await this.db.rufe.add(newRufe);
      console.log('Registro RUFE añadido:', newRufe);
      return id;
    } catch (error) {
      console.error('Error al añadir registro RUFE:', error);
      throw error;
    }
  }

  public async getRufe(clienteId: string): Promise<IRufeLocal | undefined> {
    if (!this.isBrowser) return undefined;
    try {
      return await this.db.rufe.get(clienteId);
    } catch (error) {
      console.error('Error al obtener registro RUFE:', error);
      return undefined;
    }
  }

  public async getAllRufes(): Promise<IRufeLocal[]> {
    if (!this.isBrowser) return [];
    try {
      return await this.db.rufe.toArray();
    } catch (error) {
      console.error('Error al obtener todos los registros RUFE:', error);
      return [];
    }
  }

  public async updateRufe(clienteId: string, changes: Partial<IRufeLocal>): Promise<number> {
    if (!this.isBrowser) return 0;
    try {
      const existingRufe = await this.db.rufe.get(clienteId);
      if (existingRufe && existingRufe.estado_sincronizacion === 'sincronizado') {
        changes.estado_sincronizacion = 'pendiente_actualizar';
      }
      changes.fecha_ultima_actualizacion_offline = new Date();
      const updatedCount = await this.db.rufe.update(clienteId, changes);
      console.log(`Registro RUFE ${clienteId} actualizado: ${updatedCount} fila(s) afectadas.`, changes);
      return updatedCount;
    } catch (error) {
      console.error('Error al actualizar registro RUFE:', error);
      throw error;
    }
  }

  public async deleteRufe(clienteId: string): Promise<void> {
    if (!this.isBrowser) return;
    try {
      const existingRufe = await this.db.rufe.get(clienteId);
      if (existingRufe && existingRufe.estado_sincronizacion === 'sincronizado') {
        await this.db.rufe.update(clienteId, { estado_sincronizacion: 'pendiente_eliminar' });
        console.log(`Registro RUFE ${clienteId} marcado para eliminación.`);
      } else {
        await this.db.rufe.delete(clienteId);
        console.log(`Registro RUFE ${clienteId} eliminado directamente de IndexedDB.`);
      }
    } catch (error) {
      console.error('Error al eliminar registro RUFE:', error);
      throw error;
    }
  }

  public async getPendingSyncRufes(): Promise<IRufeLocal[]> {
    if (!this.isBrowser) return [];
    try {
      return await this.db.rufe
        .where('estado_sincronizacion')
        .anyOf(['pendiente_crear', 'pendiente_actualizar', 'pendiente_eliminar'])
        .toArray();
    } catch (error) {
      console.error('Error al obtener registros RUFE pendientes de sincronización:', error);
      return [];
    }
  }

  public async bulkPutMunicipios(municipios: ICatalogoMunicipio[]): Promise<void> {
    if (!this.isBrowser) return;
    try {
      await this.db.catalogos_municipios.bulkPut(municipios);
      console.log(`Se han guardado ${municipios.length} municipios.`);
    } catch (error) {
      console.error('Error al guardar municipios en bulk:', error);
      throw error;
    }
  }

  public async getAllMunicipios(): Promise<ICatalogoMunicipio[]> {
    if (!this.isBrowser) return [];
    try {
      return await this.db.catalogos_municipios.toArray();
    } catch (error) {
      console.error('Error al obtener todos los municipios:', error);
      return [];
    }
  }

  public async bulkPutDepartamentos(departamentos: ICatalogoDepartamento[]): Promise<void> {
    if (!this.isBrowser) return;
    try {
      await this.db.catalogos_departamentos.bulkPut(departamentos);
      console.log(`Se han guardado ${departamentos.length} departamentos.`);
    } catch (error) {
      console.error('Error al guardar departamentos en bulk:', error);
      throw error;
    }
  }

  public async getAllDepartamentos(): Promise<ICatalogoDepartamento[]> {
    if (!this.isBrowser) return [];
    try {
      return await this.db.catalogos_departamentos.toArray();
    } catch (error) {
      console.error('Error al obtener todos los departamentos:', error);
      return [];
    }
  }

  public async bulkPutTiposDocumento(tipos: ICatalogoTipoDocumento[]): Promise<void> {
    if (!this.isBrowser) return;
    try {
      await this.db.catalogos_tipos_documento.bulkPut(tipos);
      console.log(`Se han guardado ${tipos.length} tipos de documento.`);
    } catch (error) {
      console.error('Error al guardar tipos de documento en bulk:', error);
      throw error;
    }
  }

  public async getAllTiposDocumento(): Promise<ICatalogoTipoDocumento[]> {
    if (!this.isBrowser) return [];
    try {
      return await this.db.catalogos_tipos_documento.toArray();
    } catch (error) {
      console.error('Error al obtener todos los tipos de documento:', error);
      return [];
    }
  }

  public async bulkPutGeneros(generos: ICatalogoGenero[]): Promise<void> {
    if (!this.isBrowser) return;
    try {
      await this.db.catalogos_generos.bulkPut(generos);
      console.log(`Se han guardado ${generos.length} géneros.`);
    } catch (error) {
      console.error('Error al guardar géneros en bulk:', error);
      throw error;
    }
  }

  public async getAllGeneros(): Promise<ICatalogoGenero[]> {
    if (!this.isBrowser) return [];
    try {
      return await this.db.catalogos_generos.toArray();
    } catch (error) {
      console.error('Error al obtener todos los géneros:', error);
      return [];
    }
  }

  public async bulkPutParentescos(parentescos: ICatalogoParentesco[]): Promise<void> {
    if (!this.isBrowser) return;
    try {
      await this.db.catalogos_parentescos.bulkPut(parentescos);
      console.log(`Se han guardado ${parentescos.length} parentescos.`);
    } catch (error) {
      console.error('Error al guardar parentescos en bulk:', error);
      throw error;
    }
  }

  public async getAllParentescos(): Promise<ICatalogoParentesco[]> {
    if (!this.isBrowser) return [];
    try {
      return await this.db.catalogos_parentescos.toArray();
    } catch (error) {
      console.error('Error al obtener todos los parentescos:', error);
      return [];
    }
  }

  public async bulkPutZonas(zonas: ICatalogoZona[]): Promise<void> {
    if (!this.isBrowser) return;
    try {
      await this.db.catalogos_zonas.bulkPut(zonas);
      console.log(`Se han guardado ${zonas.length} zonas.`);
    } catch (error) {
      console.error('Error al guardar zonas en bulk:', error);
      throw error;
    }
  }

  public async getAllZonas(): Promise<ICatalogoZona[]> {
    if (!this.isBrowser) return [];
    try {
      return await this.db.catalogos_zonas.toArray();
    } catch (error) {
      console.error('Error al obtener todas las zonas:', error);
      return [];
    }
  }

  // NEW BULK PUT AND GET ALL METHODS FOR NEW CATALOGS
  public async bulkPutTipoUbicacionBien(items: ICatalogoTipoUbicacionBien[]): Promise<void> {
    if (!this.isBrowser) return;
    try {
      await this.db.catalogos_tipo_ubicacion_bien.bulkPut(items);
      console.log(`Se han guardado ${items.length} tipos de ubicación de bien.`);
    } catch (error) {
      console.error('Error al guardar tipos de ubicación de bien en bulk:', error);
      throw error;
    }
  }

  public async getAllTipoUbicacionBien(): Promise<ICatalogoTipoUbicacionBien[]> {
    if (!this.isBrowser) return [];
    try {
      return await this.db.catalogos_tipo_ubicacion_bien.toArray();
    } catch (error) {
      console.error('Error al obtener todos los tipos de ubicación de bien:', error);
      return [];
    }
  }

  public async bulkPutTipoAlojamientoActual(items: ICatalogoTipoAlojamientoActual[]): Promise<void> {
    if (!this.isBrowser) return;
    try {
      await this.db.catalogos_tipo_alojamiento_actual.bulkPut(items);
      console.log(`Se han guardado ${items.length} tipos de alojamiento actual.`);
    } catch (error) {
      console.error('Error al guardar tipos de alojamiento actual en bulk:', error);
      throw error;
    }
  }

  public async getAllTipoAlojamientoActual(): Promise<ICatalogoTipoAlojamientoActual[]> {
    if (!this.isBrowser) return [];
    try {
      return await this.db.catalogos_tipo_alojamiento_actual.toArray();
    } catch (error) {
      console.error('Error al obtener todos los tipos de alojamiento actual:', error);
      return [];
    }
  }

  public async bulkPutFormaTenenciaBien(items: ICatalogoFormaTenenciaBien[]): Promise<void> {
    if (!this.isBrowser) return;
    try {
      await this.db.catalogos_forma_tenencia_bien.bulkPut(items);
      console.log(`Se han guardado ${items.length} formas de tenencia de bien.`);
    } catch (error) {
      console.error('Error al guardar formas de tenencia de bien en bulk:', error);
      throw error;
    }
  }

  public async getAllFormaTenenciaBien(): Promise<ICatalogoFormaTenenciaBien[]> {
    if (!this.isBrowser) return [];
    try {
      return await this.db.catalogos_forma_tenencia_bien.toArray();
    } catch (error) {
      console.error('Error al obtener todas las formas de tenencia de bien:', error);
      return [];
    }
  }

  public async bulkPutEstadoBien(items: ICatalogoEstadoBien[]): Promise<void> {
    if (!this.isBrowser) return;
    try {
      await this.db.catalogos_estado_bien.bulkPut(items);
      console.log(`Se han guardado ${items.length} estados de bien.`);
    } catch (error) {
      console.error('Error al guardar estados de bien en bulk:', error);
      throw error;
    }
  }

  public async getAllEstadoBien(): Promise<ICatalogoEstadoBien[]> {
    if (!this.isBrowser) return [];
    try {
      return await this.db.catalogos_estado_bien.toArray();
    } catch (error) {
      console.error('Error al obtener todos los estados de bien:', error);
      return [];
    }
  }

  public async bulkPutTipoBien(items: ICatalogoTipoBien[]): Promise<void> {
    if (!this.isBrowser) return;
    try {
      await this.db.catalogos_tipo_bien.bulkPut(items);
      console.log(`Se han guardado ${items.length} tipos de bien.`);
    } catch (error) {
      console.error('Error al guardar tipos de bien en bulk:', error);
      throw error;
    }
  }

  public async getAllTipoBien(): Promise<ICatalogoTipoBien[]> {
    if (!this.isBrowser) return [];
    try {
      return await this.db.catalogos_tipo_bien.toArray();
    } catch (error) {
      console.error('Error al obtener todos los tipos de bien:', error);
      return [];
    }
  }

  public async bulkPutPertenenciaEtnica(items: ICatalogoPertenenciaEtnica[]): Promise<void> {
    if (!this.isBrowser) return;
    try {
      await this.db.catalogos_pertenencia_etnica.bulkPut(items);
      console.log(`Se han guardado ${items.length} pertenencias étnicas.`);
    } catch (error) {
      console.error('Error al guardar pertenencias étnicas en bulk:', error);
      throw error;
    }
  }

  public async getAllPertenenciaEtnica(): Promise<ICatalogoPertenenciaEtnica[]> {
    if (!this.isBrowser) return [];
    try {
      return await this.db.catalogos_pertenencia_etnica.toArray();
    } catch (error) {
      console.error('Error al obtener todas las pertenencias étnicas:', error);
      return [];
    }
  }


  public async clearAllTables(): Promise<void> {
    if (!this.isBrowser) return;
    try {
      await this.db.rufe.clear();
      await this.db.integrantes.clear();
      await this.db.catalogos_municipios.clear();
      await this.db.catalogos_departamentos.clear();
      await this.db.catalogos_tipos_documento.clear();
      await this.db.catalogos_generos.clear();
      await this.db.catalogos_parentescos.clear();
      await this.db.catalogos_zonas.clear();
      // NEW CLEAR FOR NEW CATALOGS
      await this.db.catalogos_tipo_ubicacion_bien.clear();
      await this.db.catalogos_tipo_alojamiento_actual.clear();
      await this.db.catalogos_forma_tenencia_bien.clear();
      await this.db.catalogos_estado_bien.clear();
      await this.db.catalogos_tipo_bien.clear();
      await this.db.catalogos_pertenencia_etnica.clear();

      console.log('Todas las tablas de IndexedDB han sido limpiadas.');
    } catch (error) {
      console.error('Error al limpiar todas las tablas:', error);
    }
  }
}

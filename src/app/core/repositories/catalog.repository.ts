import { Injectable } from '@angular/core';
import { DatabaseService } from '../services/database.service';
import {
    ICatalogoMunicipio,
    ICatalogoDepartamento,
    ICatalogoTipoDocumento,
    ICatalogoGenero,
    ICatalogoParentesco,
    ICatalogoZona,
    ICatalogoTipoUbicacionBien,
    ICatalogoTipoAlojamientoActual,
    ICatalogoFormaTenenciaBien,
    ICatalogoEstadoBien,
    ICatalogoTipoBien,
    ICatalogoPertenenciaEtnica,
    ICatalogoEvento
} from '../../models/catalogs.model';

@Injectable({
    providedIn: 'root'
})
export class CatalogRepository {

    constructor(private db: DatabaseService) { }

    public async bulkPutMunicipios(municipios: ICatalogoMunicipio[]): Promise<void> {
        try {
            await this.db.catalogos_municipios.bulkPut(municipios);
            console.log(`Se han guardado ${municipios.length} municipios.`);
        } catch (error) {
            console.error('Error al guardar municipios en bulk:', error);
            throw error;
        }
    }

    public async getAllMunicipios(): Promise<ICatalogoMunicipio[]> {
        try {
            return await this.db.catalogos_municipios.toArray();
        } catch (error) {
            console.error('Error al obtener todos los municipios:', error);
            return [];
        }
    }

    public async bulkPutDepartamentos(departamentos: ICatalogoDepartamento[]): Promise<void> {
        try {
            await this.db.catalogos_departamentos.bulkPut(departamentos);
            console.log(`Se han guardado ${departamentos.length} departamentos.`);
        } catch (error) {
            console.error('Error al guardar departamentos en bulk:', error);
            throw error;
        }
    }

    public async getAllDepartamentos(): Promise<ICatalogoDepartamento[]> {
        try {
            return await this.db.catalogos_departamentos.toArray();
        } catch (error) {
            console.error('Error al obtener todos los departamentos:', error);
            return [];
        }
    }

    public async countDepartamentos(): Promise<number> {
        try {
            const count = await this.db.catalogos_departamentos.count();
            console.log(`Hay ${count} departamentos en IndexedDB.`);
            return count;
        } catch (error) {
            console.error('Error al contar los departamentos:', error);
            return 0;
        }
    }

    public async bulkPutTiposDocumento(tipos: ICatalogoTipoDocumento[]): Promise<void> {
        try {
            await this.db.catalogos_tipos_documento.bulkPut(tipos);
            console.log(`Se han guardado ${tipos.length} tipos de documento.`);
        } catch (error) {
            console.error('Error al guardar tipos de documento en bulk:', error);
            throw error;
        }
    }

    public async getAllTiposDocumento(): Promise<ICatalogoTipoDocumento[]> {
        try {
            return await this.db.catalogos_tipos_documento.toArray();
        } catch (error) {
            console.error('Error al obtener todos los tipos de documento:', error);
            return [];
        }
    }

    public async bulkPutGeneros(generos: ICatalogoGenero[]): Promise<void> {
        try {
            await this.db.catalogos_generos.bulkPut(generos);
            console.log(`Se han guardado ${generos.length} géneros.`);
        } catch (error) {
            console.error('Error al guardar géneros en bulk:', error);
            throw error;
        }
    }

    public async getAllGeneros(): Promise<ICatalogoGenero[]> {
        try {
            return await this.db.catalogos_generos.toArray();
        } catch (error) {
            console.error('Error al obtener todos los géneros:', error);
            return [];
        }
    }

    public async bulkPutParentescos(parentescos: ICatalogoParentesco[]): Promise<void> {
        try {
            await this.db.catalogos_parentescos.bulkPut(parentescos);
            console.log(`Se han guardado ${parentescos.length} parentescos.`);
        } catch (error) {
            console.error('Error al guardar parentescos en bulk:', error);
            throw error;
        }
    }

    public async getAllParentescos(): Promise<ICatalogoParentesco[]> {
        try {
            return await this.db.catalogos_parentescos.toArray();
        } catch (error) {
            console.error('Error al obtener todos los parentescos:', error);
            return [];
        }
    }

    public async bulkPutZonas(zonas: ICatalogoZona[]): Promise<void> {
        try {
            await this.db.catalogos_zonas.bulkPut(zonas);
            console.log(`Se han guardado ${zonas.length} zonas.`);
        } catch (error) {
            console.error('Error al guardar zonas en bulk:', error);
            throw error;
        }
    }

    public async getAllZonas(): Promise<ICatalogoZona[]> {
        try {
            return await this.db.catalogos_zonas.toArray();
        } catch (error) {
            console.error('Error al obtener todas las zonas:', error);
            return [];
        }
    }

    public async bulkPutTipoUbicacionBien(items: ICatalogoTipoUbicacionBien[]): Promise<void> {
        try {
            await this.db.catalogos_tipo_ubicacion_bien.bulkPut(items);
            console.log(`Se han guardado ${items.length} tipos de ubicación de bien.`);
        } catch (error) {
            console.error('Error al guardar tipos de ubicación de bien en bulk:', error);
            throw error;
        }
    }

    public async getAllTipoUbicacionBien(): Promise<ICatalogoTipoUbicacionBien[]> {
        try {
            return await this.db.catalogos_tipo_ubicacion_bien.toArray();
        } catch (error) {
            console.error('Error al obtener todos los tipos de ubicación de bien:', error);
            return [];
        }
    }

    public async bulkPutTipoAlojamientoActual(items: ICatalogoTipoAlojamientoActual[]): Promise<void> {
        try {
            await this.db.catalogos_tipo_alojamiento_actual.bulkPut(items);
            console.log(`Se han guardado ${items.length} tipos de alojamiento actual.`);
        } catch (error) {
            console.error('Error al guardar tipos de alojamiento actual en bulk:', error);
            throw error;
        }
    }

    public async getAllTipoAlojamientoActual(): Promise<ICatalogoTipoAlojamientoActual[]> {
        try {
            return await this.db.catalogos_tipo_alojamiento_actual.toArray();
        } catch (error) {
            console.error('Error al obtener todos los tipos de alojamiento actual:', error);
            return [];
        }
    }

    public async bulkPutFormaTenenciaBien(items: ICatalogoFormaTenenciaBien[]): Promise<void> {
        try {
            await this.db.catalogos_forma_tenencia_bien.bulkPut(items);
            console.log(`Se han guardado ${items.length} formas de tenencia de bien.`);
        } catch (error) {
            console.error('Error al guardar formas de tenencia de bien en bulk:', error);
            throw error;
        }
    }

    public async getAllFormaTenenciaBien(): Promise<ICatalogoFormaTenenciaBien[]> {
        try {
            return await this.db.catalogos_forma_tenencia_bien.toArray();
        } catch (error) {
            console.error('Error al obtener todas las formas de tenencia de bien:', error);
            return [];
        }
    }

    public async bulkPutEstadoBien(items: ICatalogoEstadoBien[]): Promise<void> {
        try {
            await this.db.catalogos_estado_bien.bulkPut(items);
            console.log(`Se han guardado ${items.length} estados de bien.`);
        } catch (error) {
            console.error('Error al guardar estados de bien en bulk:', error);
            throw error;
        }
    }

    public async getAllEstadoBien(): Promise<ICatalogoEstadoBien[]> {
        try {
            return await this.db.catalogos_estado_bien.toArray();
        } catch (error) {
            console.error('Error al obtener todos los estados de bien:', error);
            return [];
        }
    }

    public async bulkPutTipoBien(items: ICatalogoTipoBien[]): Promise<void> {
        try {
            await this.db.catalogos_tipo_bien.bulkPut(items);
            console.log(`Se han guardado ${items.length} tipos de bien.`);
        } catch (error) {
            console.error('Error al guardar tipos de bien en bulk:', error);
            throw error;
        }
    }

    public async getAllTipoBien(): Promise<ICatalogoTipoBien[]> {
        try {
            return await this.db.catalogos_tipo_bien.toArray();
        } catch (error) {
            console.error('Error al obtener todos los tipos de bien:', error);
            return [];
        }
    }

    public async bulkPutPertenenciaEtnica(items: ICatalogoPertenenciaEtnica[]): Promise<void> {
        try {
            await this.db.catalogos_pertenencia_etnica.bulkPut(items);
            console.log(`Se han guardado ${items.length} pertenencias étnicas.`);
        } catch (error) {
            console.error('Error al guardar pertenencias étnicas en bulk:', error);
            throw error;
        }
    }

    public async getAllPertenenciaEtnica(): Promise<ICatalogoPertenenciaEtnica[]> {
        try {
            return await this.db.catalogos_pertenencia_etnica.toArray();
        } catch (error) {
            console.error('Error al obtener todas las pertenencias étnicas:', error);
            return [];
        }
    }

    public async bulkPutEventos(eventos: ICatalogoEvento[]): Promise<void> {
        try {
            await this.db.catalogos_eventos.bulkPut(eventos);
            console.log(`Se han guardado ${eventos.length} eventos.`);
        } catch (error) {
            console.error('Error al guardar eventos en bulk:', error);
            throw error;
        }
    }

    public async getAllEventos(): Promise<ICatalogoEvento[]> {
        try {
            return await this.db.catalogos_eventos.toArray();
        } catch (error) {
            console.error('Error al obtener todos los eventos:', error);
            return [];
        }
    }

    public async bulkPutTipoDocumento(items: ICatalogoTipoDocumento[]): Promise<void> {
        try {
            await this.db.catalogos_tipos_documento.bulkPut(items);
            console.log(`Se han guardado ${items.length} tipos de documento.`);
        } catch (error) {
            console.error('Error al guardar tipos de documento en bulk:', error);
            throw error;
        }
    }

    public async bulkPutParentesco(items: ICatalogoParentesco[]): Promise<void> {
        try {
            await this.db.catalogos_parentescos.bulkPut(items);
            console.log(`Se han guardado ${items.length} parentescos.`);
        } catch (error) {
            console.error('Error al guardar parentescos en bulk:', error);
            throw error;
        }
    }

    public async bulkPutGenero(items: ICatalogoGenero[]): Promise<void> {
        try {
            await this.db.catalogos_generos.bulkPut(items);
            console.log(`Se han guardado ${items.length} géneros.`);
        } catch (error) {
            console.error('Error al guardar géneros en bulk:', error);
            throw error;
        }
    }

    public async clearCatalogTables(): Promise<void> {
        try {
            await this.db.catalogos_municipios.clear();
            await this.db.catalogos_departamentos.clear();
            await this.db.catalogos_tipos_documento.clear();
            await this.db.catalogos_generos.clear();
            await this.db.catalogos_parentescos.clear();
            await this.db.catalogos_zonas.clear();
            await this.db.catalogos_tipo_ubicacion_bien.clear();
            await this.db.catalogos_tipo_alojamiento_actual.clear();
            await this.db.catalogos_forma_tenencia_bien.clear();
            await this.db.catalogos_estado_bien.clear();
            await this.db.catalogos_tipo_bien.clear();
            await this.db.catalogos_pertenencia_etnica.clear();
            await this.db.catalogos_eventos.clear();
            console.log('Tablas de catálogos de IndexedDB han sido limpiadas.');
        } catch (error) {
            console.error('Error al limpiar tablas de catálogos:', error);
        }
    }
}

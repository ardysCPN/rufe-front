import { Injectable } from '@angular/core';
import { v4 as uuidv4 } from 'uuid';
import { DatabaseService } from '../services/database.service';
import { IRufeLocal } from '../../models/rufe.model';
import { SyncStatus } from '../../models/catalogs.model';
import { IIntegranteLocal } from '../../models/integrant.model';

@Injectable({
    providedIn: 'root'
})
export class RufeRepository {

    constructor(private db: DatabaseService) { }

    /**
     * Add a RUFE record to the local DB. Generates cliente_id + sets pending sync status.
     * Returns the cliente_id (string).
     */
    public async addRufe(rufe: Omit<IRufeLocal, 'cliente_id' | 'estado_sincronizacion' | 'fecha_creacion_offline' | 'fecha_ultima_actualizacion_offline'>): Promise<string> {
        const newRufe: IRufeLocal = {
            ...rufe,
            cliente_id: uuidv4(),
            estado_sincronizacion: 'pendiente_crear' as SyncStatus,
            fecha_creacion_offline: new Date(),
            fecha_ultima_actualizacion_offline: new Date()
        };
        try {
            await this.db.rufes.add(newRufe);
            console.log('Registro RUFE añadido:', newRufe);
            return newRufe.cliente_id;
        } catch (error) {
            console.error('Error al añadir registro RUFE:', error);
            throw error;
        }
    }

    /**
     * Transactional save: RUFE + sus integrantes en una sola transacción.
     * Devuelve cliente_id del RUFE creado.
     */
    public async saveRufeWithIntegrantes(
        rufe: Omit<IRufeLocal, 'cliente_id' | 'estado_sincronizacion' | 'fecha_creacion_offline' | 'fecha_ultima_actualizacion_offline'>,
        integrantes: Omit<IIntegranteLocal, 'cliente_id' | 'estado_sincronizacion' | 'registro_rufe_cliente_id'>[]
    ): Promise<string> {

        const rufeId = await this.db.transaction('rw', this.db.rufes, this.db.integrantes, async () => {
            const generatedRufeId = uuidv4();

            const newRufe: IRufeLocal = {
                ...rufe,
                cliente_id: generatedRufeId,
                estado_sincronizacion: 'pendiente_crear' as SyncStatus,
                fecha_creacion_offline: new Date(),
                fecha_ultima_actualizacion_offline: new Date()
            };

            await this.db.rufes.add(newRufe);

            if (integrantes && integrantes.length > 0) {
                const integrantesToSave: IIntegranteLocal[] = integrantes.map(i => ({
                    ...i,
                    cliente_id: uuidv4(),
                    registro_rufe_cliente_id: generatedRufeId,
                    estado_sincronizacion: 'pendiente_crear' as SyncStatus
                }));
                await this.db.integrantes.bulkAdd(integrantesToSave);
            }

            return generatedRufeId;
        });

        console.log(`RUFE con cliente_id ${rufeId} guardado correctamente con ${integrantes.length} integrantes.`);
        return rufeId;
    }

    public async getRufe(clienteId: string): Promise<IRufeLocal | undefined> {
        try {
            return await this.db.rufes.get(clienteId);
        } catch (error) {
            console.error('Error al obtener registro RUFE:', error);
            return undefined;
        }
    }

    public async getAllRufes(): Promise<IRufeLocal[]> {
        try {
            return await this.db.rufes.toArray();
        } catch (error) {
            console.error('Error al obtener todos los registros RUFE:', error);
            return [];
        }
    }

    /**
     * Update RUFE and mark state accordingly:
     * - if was 'sincronizado' -> set 'pendiente_actualizar'
     * - always update fecha_ultima_actualizacion_offline
     */
    public async updateRufe(clienteId: string, changes: Partial<IRufeLocal>): Promise<number> {
        try {
            const existingRufe = await this.db.rufes.get(clienteId);
            if (existingRufe && existingRufe.estado_sincronizacion === 'sincronizado') {
                changes.estado_sincronizacion = 'pendiente_actualizar' as SyncStatus;
            }
            changes.fecha_ultima_actualizacion_offline = new Date();
            const updatedCount = await this.db.rufes.update(clienteId, changes);
            console.log(`Registro RUFE ${clienteId} actualizado: ${updatedCount} fila(s) afectadas.`, changes);
            return updatedCount;
        } catch (error) {
            console.error('Error al actualizar registro RUFE:', error);
            throw error;
        }
    }

    /**
     * Soft-delete or hard-delete RUFE depending on sync state:
     * - if already sincronizado -> marcar 'pendiente_eliminar'
     * - else -> eliminar localmente
     */
    public async deleteRufe(clienteId: string): Promise<void> {
        try {
            const existingRufe = await this.db.rufes.get(clienteId);
            if (existingRufe && existingRufe.estado_sincronizacion === 'sincronizado') {
                await this.db.rufes.update(clienteId, { estado_sincronizacion: 'pendiente_eliminar' as SyncStatus });
                console.log(`Registro RUFE ${clienteId} marcado para eliminación.`);
            } else {
                await this.db.rufes.delete(clienteId);
                // Also remove related integrantes
                await this.db.integrantes.where('registro_rufe_cliente_id').equals(clienteId).delete();
                console.log(`Registro RUFE ${clienteId} eliminado directamente de IndexedDB junto con sus integrantes.`);
            }
        } catch (error) {
            console.error('Error al eliminar registro RUFE:', error);
            throw error;
        }
    }

    /**
     * Query RUFE records pending synchronization (create/update/delete).
     */
    public async getPendingSyncRufes(): Promise<IRufeLocal[]> {
        try {
            return await this.db.rufes
                .where('estado_sincronizacion')
                .anyOf(['pendiente_crear', 'pendiente_actualizar', 'pendiente_eliminar'])
                .toArray();
        } catch (error) {
            console.error('Error al obtener registros RUFE pendientes de sincronización:', error);
            return [];
        }
    }

    // ---------- INTEGRANTES CRUD ----------

    public async addIntegrante(integrante: Omit<IIntegranteLocal, 'cliente_id' | 'estado_sincronizacion'>): Promise<string> {
        const toSave: IIntegranteLocal = {
            ...integrante,
            cliente_id: uuidv4(),
            estado_sincronizacion: 'pendiente_crear' as SyncStatus
        };
        try {
            await this.db.integrantes.add(toSave);
            return toSave.cliente_id;
        } catch (error) {
            console.error('Error al añadir integrante:', error);
            throw error;
        }
    }

    public async bulkAddIntegrantes(items: Omit<IIntegranteLocal, 'cliente_id' | 'estado_sincronizacion' | 'registro_rufe_cliente_id'>[], registro_rufe_cliente_id?: string): Promise<void> {
        try {
            const toSave: IIntegranteLocal[] = items.map(i => ({
                ...i,
                cliente_id: uuidv4(),
                registro_rufe_cliente_id: registro_rufe_cliente_id ?? (i as any).registro_rufe_cliente_id ?? null,
                estado_sincronizacion: 'pendiente_crear' as SyncStatus
            } as IIntegranteLocal));
            await this.db.integrantes.bulkAdd(toSave);
        } catch (error) {
            console.error('Error al añadir integrantes en bulk:', error);
            throw error;
        }
    }

    public async getIntegrantesByRufe(clienteIdRufe: string): Promise<IIntegranteLocal[]> {
        try {
            return await this.db.integrantes.where('registro_rufe_cliente_id').equals(clienteIdRufe).toArray();
        } catch (error) {
            console.error('Error al obtener integrantes por RUFE:', error);
            return [];
        }
    }

    public async updateIntegrante(clienteId: string, changes: Partial<IIntegranteLocal>): Promise<number> {
        try {
            const existing = await this.db.integrantes.get(clienteId);
            if (existing && existing.estado_sincronizacion === 'sincronizado') {
                changes.estado_sincronizacion = 'pendiente_actualizar' as SyncStatus;
            }
            const updated = await this.db.integrantes.update(clienteId, changes);
            console.log(`Integrante ${clienteId} actualizado: ${updated}`);
            return updated;
        } catch (error) {
            console.error('Error al actualizar integrante:', error);
            throw error;
        }
    }

    public async deleteIntegrante(clienteId: string): Promise<void> {
        try {
            const existing = await this.db.integrantes.get(clienteId);
            if (existing && existing.estado_sincronizacion === 'sincronizado') {
                await this.db.integrantes.update(clienteId, { estado_sincronizacion: 'pendiente_eliminar' as SyncStatus });
                console.log(`Integrante ${clienteId} marcado para eliminación.`);
            } else {
                await this.db.integrantes.delete(clienteId);
                console.log(`Integrante ${clienteId} eliminado localmente.`);
            }
        } catch (error) {
            console.error('Error al eliminar integrante:', error);
            throw error;
        }
    }

    public async getPendingSyncIntegrantes(): Promise<IIntegranteLocal[]> {
        try {
            return await this.db.integrantes
                .where('estado_sincronizacion')
                .anyOf(['pendiente_crear', 'pendiente_actualizar', 'pendiente_eliminar'])
                .toArray();
        } catch (error) {
            console.error('Error al obtener integrantes pendientes de sincronización:', error);
            return [];
        }
    }
}

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

        // Validar duplicados por hash simple o consulta compuesta (ej: evento + documento del primer integrante)
        // Por ahora, asumimos que el frontend controla el botón, pero aquí agregamos una defensa extra si cliente_id viniera del front.
        // Como cliente_id se genera aquí, la idempotencia debe basarse en el contenido.
        // E.g. Check if any RUFE with same fechaRufe & direccion & eventoId exists created in the last minute?
        // Or simpler: The frontend now blocks multiple clicks.

        // Simpler check: If we passed a specific ID from frontend (which we don't currently), we'd check that.
        // For strict idempotency without frontend ID, we'd need a unique business key.
        // Let's implement a quick check for identical recent entry to be safe.
        // (Skipping complex logic to avoid performance hit on slow devices, relying on UI block + below transaction)

        return this.db.transaction('rw', this.db.rufes, this.db.integrantes, () => {
            const generatedRufeId = uuidv4();

            const newRufe: IRufeLocal = {
                ...rufe,
                cliente_id: generatedRufeId,
                estado_sincronizacion: 'pendiente_crear' as SyncStatus,
                fecha_creacion_offline: new Date(),
                fecha_ultima_actualizacion_offline: new Date()
            };

            // Return the Promise chain explicitly
            return this.db.rufes.add(newRufe).then(() => {
                if (integrantes && integrantes.length > 0) {
                    const integrantesToSave: IIntegranteLocal[] = integrantes.map(i => ({
                        ...i,
                        cliente_id: uuidv4(),
                        registro_rufe_cliente_id: generatedRufeId,
                        estado_sincronizacion: 'pendiente_crear' as SyncStatus
                    }));
                    return this.db.integrantes.bulkAdd(integrantesToSave);
                }
                return; // Return void promise if no integrantes
            }).then(() => {
                return generatedRufeId; // Resolve with the ID
            });
        });

        // Note: The logging below will happen after the transaction promise resolves in the caller.
        // We can't log 'rufeId' here easily inside the method without awaiting the transaction result.
        // Removing the log or moving it to .then() of the transaction if needed, but for now we simplify.
        // console.log(`RUFE guardado...`); 
        // Returning the promise from transaction directly.
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

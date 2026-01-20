import { Injectable } from '@angular/core';
import { NetworkService } from './network.service';
import { RufeRepository } from '../repositories/rufe.repository';

@Injectable({ providedIn: 'root' })
export class SyncService {
  private syncing = false;

  constructor(
    private rufeRepository: RufeRepository,
    private network: NetworkService
  ) {
    // Auto sync cuando vuelva la conexión
    this.network.isOnline$.subscribe(isOnline => {
      if (isOnline) {
        this.syncPending();
      }
    });
  }

  async syncPending(): Promise<void> {
    if (this.syncing) return;
    this.syncing = true;

    try {
      const pendingRufes = await this.rufeRepository.getPendingSyncRufes();
      const pendingIntegrantes = await this.rufeRepository.getPendingSyncIntegrantes();

      console.log('⏫ Sincronizando...', { pendingRufes, pendingIntegrantes });

      // TODO: reemplazar con llamadas HTTP reales a tu API
      for (const r of pendingRufes) {
        try {
          await fakeApiCall(r); // ejemplo
          await this.rufeRepository.updateRufe(r.cliente_id, { estado_sincronizacion: 'sincronizado' });
        } catch (err) {
          console.error('Error al sincronizar RUFE', r, err);
        }
      }

      for (const i of pendingIntegrantes) {
        try {
          await fakeApiCall(i);
          await this.rufeRepository.updateIntegrante(i.cliente_id, { estado_sincronizacion: 'sincronizado' });
        } catch (err) {
          console.error('Error al sincronizar integrante', i, err);
        }
      }

      console.log('✅ Sincronización completada.');
    } finally {
      this.syncing = false;
    }
  }
}

// Simula un API (reemplazar por HttpClient)
function fakeApiCall(data: any): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, 1000));
}

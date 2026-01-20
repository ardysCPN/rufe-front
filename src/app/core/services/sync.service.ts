import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { firstValueFrom } from 'rxjs';
import { NetworkService } from './network.service';
import { RufeRepository } from '../repositories/rufe.repository';
// import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class SyncService {
  private syncing = false;
  // TODO: Use environment variable
  private apiUrl = 'http://localhost:8080/api';

  constructor(
    private rufeRepository: RufeRepository,
    private network: NetworkService,
    private http: HttpClient,
    private snackBar: MatSnackBar
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

    // Notify start (optional, maybe too noisy for auto-sync)
    // this.snackBar.open('Comenzando sincronización...', '', { duration: 2000 });

    try {
      const pendingRufes = await this.rufeRepository.getPendingSyncRufes();
      const pendingIntegrantes = await this.rufeRepository.getPendingSyncIntegrantes();

      if (pendingRufes.length === 0 && pendingIntegrantes.length === 0) {
        this.syncing = false;
        return;
      }

      console.log('⏫ Sincronizando...', { pendingRufes, pendingIntegrantes });
      let hasErrors = false;

      // Sync Rufes
      for (const r of pendingRufes) {
        try {
          // Replace with your real DTO mapping if needed
          await firstValueFrom(this.http.post(`${this.apiUrl}/rufe`, r));
          await this.rufeRepository.updateRufe(r.cliente_id, { estado_sincronizacion: 'sincronizado' });
        } catch (err) {
          console.error('Error al sincronizar RUFE', r, err);
          hasErrors = true;
        }
      }

      // Sync Integrantes
      for (const i of pendingIntegrantes) {
        try {
          await firstValueFrom(this.http.post(`${this.apiUrl}/integrantes`, i));
          await this.rufeRepository.updateIntegrante(i.cliente_id, { estado_sincronizacion: 'sincronizado' });
        } catch (err) {
          console.error('Error al sincronizar integrante', i, err);
          hasErrors = true;
        }
      }

      if (hasErrors) {
        this.snackBar.open('Sincronización completada con algunos errores.', 'Cerrar', {
          duration: 5000, panelClass: ['snackbar-warn']
        });
      } else {
        this.snackBar.open('Sincronización completada exitosamente.', 'Cerrar', {
          duration: 4000, panelClass: ['snackbar-success']
        });
        console.log('✅ Sincronización completada.');
      }

    } catch (e) {
      console.error('Error general de sincronización', e);
      this.snackBar.open('Error al intentar sincronizar. Revisa tu conexión.', 'Cerrar', {
        duration: 5000, panelClass: ['snackbar-error']
      });
    } finally {
      this.syncing = false;
    }
  }
}

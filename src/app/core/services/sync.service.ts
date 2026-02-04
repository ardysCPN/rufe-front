import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { firstValueFrom } from 'rxjs';
import { NetworkService } from './network.service';
import { RufeRepository } from '../repositories/rufe.repository';
import { environment } from '../../../environments/environment';
import { IRufeLocal, IIntegranteLocal } from '../../models/rufe.model';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class SyncService {
  private syncing = false;
  private apiUrl = `${environment.apiUrl}/api`;

  constructor(
    private rufeRepository: RufeRepository,
    private network: NetworkService,
    private http: HttpClient,
    private snackBar: MatSnackBar,
    private authService: AuthService
  ) {
    // Auto sync cuando vuelva la conexión
    this.network.isOnline$.subscribe(async isOnline => {
      if (isOnline) {
        console.log('📡 Red detectada. Verificando sesión antes de sincronizar...');
        // Verificar validez del token antes de intentar sincronizar para evitar 401
        const isValidSession = await firstValueFrom(this.authService.validateTokenAndKeepAlive());

        if (isValidSession) {
          console.log('✅ Sesión válida. Iniciando sincronización...');
          this.syncPending();
        } else {
          console.warn('⚠️ Sesión expirada o inválida al reconectar. No se puede sincronizar automáticamente. Se requiere re-autenticación.');
          // Opcional: Notificar al usuario o redirigir a login si es la política
          this.snackBar.open('Conexión detectada pero tu sesión ha expirado. Por favor inicia sesión nuevamente para sincronizar.', 'Cerrar', {
            duration: 8000,
            panelClass: ['snackbar-warn']
          });
        }
      }
    });
  }

  async syncPending(): Promise<void> {
    if (this.syncing) return;
    this.syncing = true;

    try {
      const pendingRufes = await this.rufeRepository.getPendingSyncRufes();

      // Note: We currently only sync full RUFE trees for simplicity and consistency
      // If there are standalone pending integrantes, logic might need to be added to find their parent and sync.

      if (pendingRufes.length === 0) {
        this.syncing = false;
        return;
      }

      console.log('⏫ Sincronizando...', { pendingRufes });
      let hasErrors = false;

      // Sync Rufes (and their children)
      for (const r of pendingRufes) {
        try {
          // 1. Fetch children
          const integrantes = await this.rufeRepository.getIntegrantesByRufe(r.cliente_id);

          // 2. Map to Backend Payload
          const payload = this.mapRufeToPayload(r, integrantes);
          console.log('Sending Payload:', payload);

          // 3. Send
          await firstValueFrom(this.http.post(`${this.apiUrl}/rufe`, payload));

          // 4. Update Status on success
          await this.rufeRepository.updateRufe(r.cliente_id, { estado_sincronizacion: 'sincronizado' });
          for (const int of integrantes) {
            await this.rufeRepository.updateIntegrante(int.cliente_id, { estado_sincronizacion: 'sincronizado' });
          }

        } catch (err) {
          console.error('Error al sincronizar RUFE', r, err);
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

  private mapRufeToPayload(rufe: IRufeLocal, integrantes: any[]): any {
    return {
      clienteId: rufe.cliente_id,
      eventoId: rufe.eventoId,
      tipoEventoId: rufe.tipoEventoId, // Mapped
      fechaRegistro: rufe.fechaRufe || new Date().toISOString(),
      // Mapping fields to match Postman expectations (Suffix 'Id' for foreign keys)
      // Assuming form stores IDs in these fields. 
      // If values are strings/objects, they need parsing. Assuming simple ID numbers/strings.
      tipoUbicacionBienId: rufe.ubicacionTipo === 'urbano' ? 1 : 2, // Correct mapping logic from form
      corregimiento: rufe.corregimiento,
      veredaSectorBarrio: rufe.veredaSectorBarrio,
      direccion: rufe.direccion,
      tipoAlojamientoActualId: Number(rufe.alojamientoActual),
      // formaTenenciaBienId: Number(rufe.formaTenencia), // Adjust based on actual Model vs Postman
      // estadoBienId: Number(rufe.estadoBien),
      // Mapped lists:
      integrantes: integrantes.map(i => ({
        clienteId: i.cliente_id,
        nombres: i.nombres,
        apellidos: i.apellidos,
        tipoDocumentoId: Number(i.tipoDocumento),
        numeroDocumento: i.numeroDocumento,
        fechaNacimiento: i.fechaNacimiento,
        parentescoId: Number(i.parentesco),
        generoId: Number(i.genero),
        pertenenciaEtnicaId: Number(i.etnia),
        telefono: i.telefono
      })),
      // Placeholder for other lists if they exist in DB but not yet in this sync logic
      bienesAfectados: [
        {
          clienteId: uuidv4(), // Generate or use if tracking bienes
          tipoBienId: Number(rufe.tipoBien),
          formaTenenciaBienId: Number(rufe.formaTenencia),
          estadoBienId: Number(rufe.estadoBien)
        }
      ],
      activosAgropecuarios: rufe.cantidadPecuaria ? [
        {
          clienteId: uuidv4(),
          sector: 'PECUARIO', // Infer based on form
          especieAnimal: rufe.especie,
          cantidadAnimal: rufe.cantidadPecuaria
        }
      ] : []
    };
  }
}

// Simple UUID generator for the placeholder items if needed, though they should ideally come from DB
function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

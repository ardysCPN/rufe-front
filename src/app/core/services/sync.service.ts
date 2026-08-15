import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { firstValueFrom } from 'rxjs';
import { NetworkService } from './network.service';
import { RufeRepository } from '../repositories/rufe.repository';
import { environment } from '../../../environments/environment';
import { IRufeLocal } from '../../models/rufe.model';
import { AuthService } from './auth.service';
import { EvidenceService } from './evidence.service';

@Injectable({ providedIn: 'root' })
export class SyncService {
  private syncing = false;
  private apiUrl = `${environment.apiUrl}/api`;

  constructor(
    private rufeRepository: RufeRepository,
    private network: NetworkService,
    private http: HttpClient,
    private snackBar: MatSnackBar,
    private authService: AuthService,
    private evidenceService: EvidenceService
  ) {
    // Auto sync cuando vuelva la conexión
    this.network.isOnline$.subscribe(async isOnline => {
      if (isOnline) {
        console.log('📡 Red detectada. Verificando sesión antes de sincronizar...');
        const isValidSession = await firstValueFrom(this.authService.validateTokenAndKeepAlive());

        if (isValidSession) {
          console.log('✅ Sesión válida. Iniciando sincronización...');
          this.syncPending();
        } else {
          console.warn('⚠️ Sesión expirada o inválida al reconectar. No se puede sincronizar automáticamente.');
          this.snackBar.open('Conexión detectada pero tu sesión ha expirado. Por favor inicia sesión nuevamente.', 'Cerrar', {
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

      if (pendingRufes.length === 0) {
        this.syncing = false;
        return;
      }

      console.log('⏫ Sincronizando registros RUFE pendientes...', { count: pendingRufes.length });
      let hasErrors = false;

      for (const r of pendingRufes) {
        try {
          // 1. Obtener integrantes del hogar local
          const integrantes = await this.rufeRepository.getIntegrantesByRufe(r.cliente_id);

          // 2. Mapear objeto a payload para backend
          const payload = this.mapRufeToPayload(r, integrantes);
          console.log('Enviando Payload RUFE:', payload);

          // 3. Enviar RUFE al servidor
          const response: any = await firstValueFrom(this.http.post(`${this.apiUrl}/rufe`, payload));
          const createdRufeId = response?.id;

          // 4. Actualizar estado local a sincronizado
          await this.rufeRepository.updateRufe(r.cliente_id, { estado_sincronizacion: 'sincronizado' });
          for (const int of integrantes) {
            await this.rufeRepository.updateIntegrante(int.cliente_id, { estado_sincronizacion: 'sincronizado' });
          }

          // 5. Sincronizar evidencias fotográficas locales
          if (createdRufeId) {
            const pendingEvidencias = await this.rufeRepository.getEvidenciasByRufe(r.cliente_id);
            for (const ev of pendingEvidencias) {
              if (ev.estado_sincronizacion !== 'sincronizado' && ev.blob) {
                try {
                  const uploadRes = await firstValueFrom(this.evidenceService.uploadFile(ev.blob, 'censos'));
                  if (uploadRes && uploadRes.url) {
                    await firstValueFrom(this.evidenceService.linkToRufe({
                      registroRufeId: createdRufeId,
                      fotoUrl: uploadRes.url,
                      tipoEvidencia: ev.tipo_evidencia || 'FOTO_CENSO'
                    }));
                    await this.rufeRepository.updateEvidenciaStatus(ev.cliente_id, 'sincronizado');
                    console.log('✅ Foto de evidencia sincronizada:', uploadRes.url);
                  }
                } catch (photoErr) {
                  console.error('Error sincronizando foto de evidencia:', photoErr);
                  hasErrors = true;
                }
              }
            }
          }

        } catch (err) {
          console.error('Error al sincronizar RUFE:', r, err);
          hasErrors = true;
        }
      }

      if (hasErrors) {
        this.snackBar.open('Sincronización completada con algunas observaciones.', 'Cerrar', {
          duration: 5000, panelClass: ['snackbar-warn']
        });
      } else {
        this.snackBar.open('Sincronización de datos y fotografías completada exitosamente.', 'Cerrar', {
          duration: 4000, panelClass: ['snackbar-success']
        });
        console.log('✅ Sincronización completada con éxito.');
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
      tipoEventoId: rufe.tipoEventoId,
      fechaRegistro: rufe.fechaRufe || new Date().toISOString(),
      tipoUbicacionBienId: rufe.ubicacionTipo === 'urbano' ? 1 : 2,
      corregimiento: rufe.corregimiento,
      veredaSectorBarrio: rufe.veredaSectorBarrio,
      direccion: rufe.direccion,
      tipoAlojamientoActualId: Number(rufe.alojamientoActual) || 1,
      integrantes: integrantes.map(i => ({
        clienteId: i.cliente_id,
        nombres: i.nombres,
        apellidos: i.apellidos,
        tipoDocumentoId: Number(i.tipoDocumento) || 1,
        numeroDocumento: i.numeroDocumento,
        fechaNacimiento: i.fechaNacimiento,
        parentescoId: Number(i.parentesco) || 1,
        generoId: Number(i.genero) || 1,
        pertenenciaEtnicaId: Number(i.etnia) || 1,
        estadoPersonaId: Number(i.estado_persona_id || i.estadoPersonaId) || 1,
        observacionSalud: i.observacion_salud || i.observacionSalud || '',
        telefono: i.telefono
      })),
      bienesAfectados: [
        {
          clienteId: uuidv4(),
          tipoBienId: Number(rufe.tipoBien) || 1,
          formaTenenciaBienId: Number(rufe.formaTenencia) || 1,
          estadoBienId: Number(rufe.estadoBien) || 1
        }
      ],
      activosAgropecuarios: rufe.cantidadPecuaria ? [
        {
          clienteId: uuidv4(),
          sector: 'PECUARIO',
          especieAnimal: rufe.especie,
          cantidadAnimal: rufe.cantidadPecuaria
        }
      ] : []
    };
  }
}

function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

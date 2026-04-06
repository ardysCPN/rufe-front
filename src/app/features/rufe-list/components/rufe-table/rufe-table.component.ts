import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router } from '@angular/router';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { RufeRepository } from '../../../../core/repositories/rufe.repository';
import { RufeService, IRufeRemote } from '../../../../core/services/rufe.service';
import { NetworkService } from '../../../../core/services/network.service';
import { RufeDetailDialogComponent } from '../rufe-detail-dialog/rufe-detail-dialog.component';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-rufe-list',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatDialogModule
  ],
  template: `
    <div class="p-8 animate-fade-in-up">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
           <h1 class="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
             Registros RUFE
           </h1>
           <p class="text-gray-500 dark:text-gray-400 mt-1">Consulta y gestiona los registros históricos y locales</p>
        </div>
        
        <button 
          mat-flat-button 
          color="primary" 
          (click)="createNew()"
          class="rounded-xl px-6 py-2 shadow-lg shadow-blue-500/20 hover:scale-105 transition-transform"
        >
          <mat-icon class="mr-2">add_circle</mat-icon> Nuevo Registro
        </button>
      </div>
      <div class="bg-white/80 dark:bg-gray-900/40 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-gray-800 overflow-hidden">
        <div class="table-container">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-gray-50/50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
                <th class="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Fecha</th>
                <th class="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Folio / Cliente ID</th>
                <th class="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Ubicación</th>
                <th class="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Estado Sync</th>
                <th class="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Acciones</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
              <tr *ngFor="let item of rufes" class="group hover:bg-blue-50/30 dark:hover:bg-gray-800/50 transition-all duration-200">
                <td class="p-4">
                  <span class="text-sm font-medium text-gray-900 dark:text-gray-200">{{ item.fecha }}</span>
                </td>
                <td class="p-4 font-mono text-xs text-gray-500">
                  {{ item.folio }}
                </td>
                <td class="p-4">
                   <p class="text-sm text-gray-700 dark:text-gray-300 font-medium">{{ item.ubicacion }}</p>
                   <p class="text-xs text-gray-500 italic">{{ item.corregimiento }}</p>
                </td>
                <td class="p-4">
                   <div class="flex flex-col items-center gap-1">
                      <div class="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider"
                           [ngClass]="{
                             'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400': item.sync,
                             'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400': !item.sync
                           }">
                        <mat-icon class="text-sm w-4 h-4">{{ item.sync ? 'cloud_done' : 'cloud_off' }}</mat-icon>
                        {{ item.sync ? 'Sincronizado' : 'Solo Local' }}
                      </div>
                      <span *ngIf="item.isRemoteOnly" class="text-[9px] text-gray-400">Desde Servidor</span>
                      <span *ngIf="!item.sync" class="text-[9px] text-orange-500 font-bold">Pendiente subir</span>
                   </div>
                </td>
                <td class="p-4 text-right">
                  <div class="flex items-center justify-end gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all">
                    <button mat-icon-button color="primary" matTooltip="Ver detalles" (click)="viewDetail(item)" class="hover:bg-blue-100 dark:hover:bg-blue-900/40">
                      <mat-icon>visibility</mat-icon>
                    </button>
                    <button *ngIf="!item.isRemoteOnly" mat-icon-button color="accent" matTooltip="Editar" class="hover:bg-amber-100 dark:hover:bg-amber-900/40">
                      <mat-icon>edit</mat-icon>
                    </button>
                  </div>
                </td>
              </tr>
              
              <tr *ngIf="rufes.length === 0">
                <td colspan="5" class="p-20 text-center">
                  <div class="flex flex-col items-center gap-4 text-gray-400">
                    <mat-icon class="text-6xl h-16 w-16">folder_open</mat-icon>
                    <p class="text-lg font-medium">No se encontraron registros</p>
                    <button mat-stroked-button (click)="loadRufes()">Reintentar carga</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  `
})
export class RufeListComponent implements OnInit {
  rufes: any[] = [];
  loading = false;

  constructor(
    private router: Router,
    private rufeRepository: RufeRepository,
    private rufeService: RufeService,
    private networkService: NetworkService,
    private dialog: MatDialog
  ) { }

  async ngOnInit(): Promise<void> {
    await this.loadRufes();

    // Re-cargar cuando vuelva la conexión
    this.networkService.isOnline$.subscribe(online => {
      if (online && this.rufes.length === 0) {
        this.loadRufes();
      }
    });
  }

  async loadRufes(): Promise<void> {
    this.loading = true;
    try {
      // 1. Cargar locales (pendientes y sincronizados localmente)
      const localRufes = await this.rufeRepository.getAllRufes();

      let remoteRufes: IRufeRemote[] = [];

      // 2. Intentar cargar remotos si estamos online
      const isOfflineSession = localStorage.getItem('isOfflineSession') === 'true';
      if (this.networkService.isOnline && !isOfflineSession) {
        try {
          remoteRufes = await firstValueFrom(this.rufeService.getAllRufes());
        } catch (e) {
          console.error('Error fetching remote rufes', e);
        }
      }

      // 3. Fusionar y Mapear
      // Usamos un Map para evitar duplicados si el clienteId ya está en ambos (priorizamos local)
      const mergedMap = new Map<string, any>();

      // Primero remotos (como base)
      remoteRufes.forEach(r => {
        mergedMap.set(r.clienteId, {
          fecha: r.fechaRegistro.split('T')[0],
          folio: r.clienteId.substring(0, 8).toUpperCase(),
          ubicacion: r.direccion || r.veredaSectorBarrio || 'Ver detalle',
          corregimiento: r.corregimiento || '',
          sync: true,
          isRemoteOnly: true,
          clienteId: r.clienteId,
          raw: r
        });
      });

      // Luego locales (sobrescriben o añaden)
      localRufes.forEach(l => {
        mergedMap.set(l.cliente_id, {
          fecha: l.fechaRufe ? l.fechaRufe.split('T')[0] : l.fecha_creacion_offline.toISOString().split('T')[0],
          folio: l.cliente_id.substring(0, 8).toUpperCase(),
          ubicacion: l.direccion || l.veredaSectorBarrio || 'Solo local',
          corregimiento: l.corregimiento || '',
          sync: l.estado_sincronizacion === 'sincronizado',
          isRemoteOnly: false,
          clienteId: l.cliente_id,
          raw: {
            id: -1,
            clienteId: l.cliente_id,
            eventoId: l.eventoId,
            tipoEventoId: -1,
            fechaRegistro: l.fecha_creacion_offline.toISOString(),
            tipoUbicacionBienId: -1,
            corregimiento: l.corregimiento,
            veredaSectorBarrio: l.veredaSectorBarrio,
            direccion: l.direccion
          } as IRufeRemote
        });
      });

      this.rufes = Array.from(mergedMap.values()).sort((a, b) => b.fecha.localeCompare(a.fecha));

    } catch (err) {
      console.error('Error loading rufes:', err);
    } finally {
      this.loading = false;
    }
  }

  viewDetail(item: any) {
    this.dialog.open(RufeDetailDialogComponent, {
      width: '100%',
      maxWidth: '800px',
      data: item.raw,
      panelClass: 'glass-dialog'
    });
  }

  createNew() {
    this.router.navigate(['/rufe/capture']);
  }
}

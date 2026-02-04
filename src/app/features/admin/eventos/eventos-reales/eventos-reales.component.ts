import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { PermissionService } from '../../../../core/services/permission.service';
import { EventosRepository, EventoReal } from '../../../../core/repositories/eventos.repository';
import { EventoFormDialogComponent } from './evento-form-dialog.component';

@Component({
  selector: 'app-eventos-reales',
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
           <h1 class="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
             Eventos Reales
           </h1>
           <p class="text-gray-500 dark:text-gray-400 mt-1">Gestión de emergencias y eventos activos</p>
        </div>
        
        <button 
          mat-flat-button 
          class="bg-orange-600 text-white rounded-lg px-6 py-2 shadow-lg shadow-orange-500/20"
          *ngIf="canCreate"
          (click)="openDialog()"
        >
          <mat-icon class="mr-2">warning</mat-icon> Nuevo Evento
        </button>
      </div>

      <div class="bg-white/80 dark:bg-gray-900/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-gray-50/50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
                <th class="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Evento</th>
                <th class="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Tipo</th>
                <th class="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Fecha</th>
                <th class="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Ubicación</th>
                <th class="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Acciones</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
              <tr *ngFor="let evento of eventos" class="group hover:bg-orange-50/50 dark:hover:bg-gray-800/50 transition-colors duration-200">
                <td class="p-4">
                  <div class="flex flex-col">
                    <span class="font-bold text-gray-900 dark:text-white">{{ evento.nombreEvento }}</span>
                    <span class="text-xs text-gray-500 truncate max-w-[200px]">{{ evento.descripcion }}</span>
                  </div>
                </td>
                <td class="p-4">
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                    {{ evento.tipoEvento }}
                  </span>
                </td>
                <td class="p-4 text-sm text-gray-600 dark:text-gray-300">
                  {{ evento.fechaEvento | date:'mediumDate' }}
                </td>
                <td class="p-4 text-sm text-gray-600 dark:text-gray-300">
                  {{ evento.municipio }}, {{ evento.departamento }}
                </td>
                <td class="p-4 text-right">
                  <div class="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button mat-icon-button color="primary" *ngIf="canEdit" matTooltip="Editar" (click)="openDialog(evento)">
                      <mat-icon>edit</mat-icon>
                    </button>
                    <button mat-icon-button color="warn" *ngIf="canDelete" matTooltip="Cerrar/Eliminar" (click)="deleteEvento(evento)">
                      <mat-icon>delete</mat-icon>
                    </button>
                  </div>
                </td>
              </tr>
              
              <tr *ngIf="eventos.length === 0">
                 <td colspan="5" class="p-12 text-center text-gray-500">
                   <mat-icon class="text-4xl mb-2 text-gray-300">event_busy</mat-icon>
                   <p>No hay eventos registrados</p>
                 </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class EventosRealesComponent implements OnInit {
  eventos: EventoReal[] = [];
  canCreate = false;
  canEdit = false;
  canDelete = false;

  constructor(
    private permissionService: PermissionService,
    private eventosRepository: EventosRepository,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.checkPermissions();
    this.loadEventos();
  }

  checkPermissions() {
    this.canCreate = this.permissionService.hasPermission('eventos:crear');
    this.canEdit = this.permissionService.hasPermission('eventos:actualizar');
    this.canDelete = this.permissionService.hasPermission('eventos:eliminar');
  }

  loadEventos() {
    this.eventosRepository.getAll().subscribe({
      next: (data) => this.eventos = data,
      error: (err) => console.error('Error loading events', err)
    });
  }

  deleteEvento(evento: EventoReal) {
    if (confirm(`¿Está seguro de eliminar/cerrar el evento ${evento.nombreEvento}?`)) {
      this.eventosRepository.delete(evento.id!).subscribe({
        next: () => this.loadEventos(),
        error: (err) => console.error('Error deleting event', err)
      });
    }
  }

  openDialog(evento?: EventoReal) {
    const dialogRef = this.dialog.open(EventoFormDialogComponent, {
      width: '600px',
      data: evento || null
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadEventos();
      }
    });
  }
}

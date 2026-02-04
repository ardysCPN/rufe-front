import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { PermissionService } from '../../../core/services/permission.service';
import { EventosRepository, EventoReal } from '../../../core/repositories/eventos.repository';
// Reusing our existing dialog
import { EventoFormDialogComponent } from '../../admin/eventos/eventos-reales/evento-form-dialog.component';

@Component({
  selector: 'app-events-list',
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
             Gestión de Eventos
           </h1>
           <p class="text-gray-500 dark:text-gray-400 mt-1">Listado de eventos activos y configurados en el sistema</p>
        </div>
        
        <button 
          mat-flat-button 
          class="bg-indigo-600 text-white rounded-lg px-6 py-2 shadow-lg shadow-indigo-500/20"
          (click)="navigateToNew()"
        >
          <mat-icon class="mr-2">add</mat-icon> Configurar Evento
        </button>
      </div>

      <div class="bg-white/80 dark:bg-gray-900/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-gray-50/50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
                <th class="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Nombre del Evento</th>
                <th class="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Tipo</th>
                <th class="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Ubicación</th>
                <th class="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Acciones</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
              <tr *ngFor="let evento of eventos" class="group hover:bg-blue-50/30 dark:hover:bg-gray-800/50 transition-colors">
                <td class="p-4">
                  <div class="flex flex-col">
                    <span class="font-bold text-gray-900 dark:text-white">{{ evento.nombreEvento }}</span>
                    <span class="text-xs text-gray-400">{{ evento.id }} - {{ evento.fechaEvento | date:'shortDate' }}</span>
                  </div>
                </td>
                <td class="p-4">
                   <span class="px-2 py-1 rounded-full text-[10px] font-bold" [ngClass]="evento.tipoEvento === 'REAL' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'">
                     {{ evento.tipoEvento }}
                   </span>
                </td>
                <td class="p-4 text-sm text-gray-600 dark:text-gray-400">
                  {{ evento.municipio }}, {{ evento.departamento }}
                </td>
                <td class="p-4 text-right">
                   <div class="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button mat-icon-button color="primary" (click)="editEvento(evento)">
                        <mat-icon>edit</mat-icon>
                      </button>
                      <button mat-icon-button color="warn" (click)="deleteEvento(evento)">
                        <mat-icon>delete</mat-icon>
                      </button>
                   </div>
                </td>
              </tr>
              <tr *ngIf="eventos.length === 0">
                 <td colspan="4" class="p-12 text-center text-gray-500">No hay eventos disponibles.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class EventsListComponent implements OnInit {
  eventos: EventoReal[] = [];

  constructor(
    private eventosRepository: EventosRepository,
    private dialog: MatDialog,
    private router: Router
  ) { }

  ngOnInit() {
    this.loadEventos();
  }

  loadEventos() {
    this.eventosRepository.getAll().subscribe(data => this.eventos = data);
  }

  navigateToNew() {
    this.router.navigate(['/events/new']);
  }

  editEvento(evento: EventoReal) {
    const dialogRef = this.dialog.open(EventoFormDialogComponent, {
      width: '600px',
      data: evento
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) this.loadEventos();
    });
  }

  deleteEvento(evento: EventoReal) {
    if (confirm('¿Deseas eliminar este evento?')) {
      this.eventosRepository.delete(evento.id!).subscribe(() => this.loadEventos());
    }
  }
}

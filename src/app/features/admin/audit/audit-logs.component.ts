import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AdminRepository, AuditLog } from '../../../core/repositories/admin.repository';

@Component({
  selector: 'app-audit-logs',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatIconModule, MatTooltipModule],
  template: `
    <div class="p-8 animate-fade-in-up min-h-screen bg-gradient-to-br from-gray-50/50 to-emerald-50/20 dark:from-transparent dark:to-transparent">
      <div class="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h1 class="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
             Logs de Auditoría
           </h1>
           <p class="text-gray-500 dark:text-gray-400 mt-1 font-medium italic">Seguimiento de acciones y cambios realizados en la plataforma</p>
        </div>
        <div class="bg-white/80 dark:bg-emerald-900/40 backdrop-blur-xl px-5 py-2.5 rounded-2xl text-emerald-600 dark:text-emerald-400 border border-emerald-100/50 dark:border-emerald-800 flex items-center gap-3 shadow-xl">
           <mat-icon class="scale-110">verified_user</mat-icon>
           <span class="font-bold tracking-tight text-sm">Cumplimiento al día</span>
        </div>
      </div>

      <!-- Glass Table Card -->
      <div class="bg-white/80 dark:bg-gray-900/40 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-gray-800 overflow-hidden">
        <div class="table-container">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-gray-50/50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
                <th class="p-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Fecha</th>
                <th class="p-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Recurso</th>
                <th class="p-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Acción</th>
                <th class="p-4 text-xs font-bold text-gray-400 uppercase tracking-widest">IP Address</th>
                <th class="p-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Detalle</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
              <tr *ngFor="let log of logs" class="hover:bg-teal-50/30 dark:hover:bg-emerald-900/10 transition-colors group">
                <td class="p-4 text-xs font-mono text-gray-500">
                  {{ formatDate(log.fechaCreacion) }}
                </td>
                <td class="p-4">
                   <span class="px-2 py-1 rounded bg-gray-100 dark:bg-gray-800 text-[10px] uppercase font-bold text-gray-600 dark:text-gray-400">
                     {{ log.recurso }}
                   </span>
                </td>
                <td class="p-4">
                   <span class="font-bold text-sm" [ngClass]="getActionClass(log.accion)">
                     {{ log.accion }}
                   </span>
                </td>
                <td class="p-4 text-xs text-gray-400 font-mono">
                  {{ log.ipAddress }}
                </td>
                <td class="p-4 text-sm text-gray-600 dark:text-gray-300">
                  {{ log.detalle }}
                </td>
              </tr>
              
              <!-- Empty State -->
              <tr *ngIf="logs.length === 0">
                <td colspan="5" class="p-16 text-center text-gray-400">
                   <mat-icon class="text-5xl mb-2 opacity-20">history</mat-icon>
                   <p class="italic">No se han registrado acciones aún</p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <!-- Footer Info -->
        <div class="p-4 bg-gray-50/30 dark:bg-gray-800/30 border-t border-gray-100 dark:border-gray-700 text-center text-xs text-gray-400 italic">
           Mostrando últimos {{ logs.length }} registros de auditoría almacenados en este nodo.
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class AuditLogsComponent implements OnInit {
  logs: AuditLog[] = [];

  constructor(private adminRepo: AdminRepository) { }

  ngOnInit(): void {
    this.loadLogs();
  }

  loadLogs() {
    this.adminRepo.getAuditLogs().subscribe({
      next: (data) => this.logs = data,
      error: (err) => console.error('Error loading audit logs', err)
    });
  }

  formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleString();
  }

  getActionClass(accion: string): string {
    const a = accion.toUpperCase();
    if (a.includes('CREATE')) return 'text-emerald-600';
    if (a.includes('UPDATE')) return 'text-blue-600';
    if (a.includes('DELETE')) return 'text-red-500';
    if (a.includes('LOGIN')) return 'text-indigo-600';
    return 'text-gray-600';
  }
}

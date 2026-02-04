import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';

@Component({
    selector: 'app-audit-logs',
    standalone: true,
    imports: [CommonModule, MatTableModule, MatIconModule],
    template: `
    <div class="p-8 animate-fade-in-up">
      <div class="mb-8 flex items-center justify-between">
        <div>
           <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Logs de Auditoría</h1>
           <p class="text-gray-500">Seguimiento de acciones y cambios realizados en la plataforma</p>
        </div>
        <div class="bg-blue-50 dark:bg-blue-900/20 px-4 py-2 rounded-lg text-blue-600 dark:text-blue-400 flex items-center gap-2">
           <mat-icon>verified_user</mat-icon>
           <span class="font-bold">Cumplimiento al día</span>
        </div>
      </div>

      <div class="bg-white/80 dark:bg-gray-900/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
         <table class="w-full text-left">
            <thead>
               <tr class="bg-gray-50/50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800 text-xs text-gray-400 uppercase font-bold tracking-widest">
                  <th class="p-4">Timestamp</th>
                  <th class="p-4">Usuario</th>
                  <th class="p-4">Acción</th>
                  <th class="p-4">Módulo</th>
                  <th class="p-4">Detalle</th>
               </tr>
            </thead>
            <tbody class="text-sm">
               <tr class="border-b border-gray-100 dark:border-gray-800 text-gray-600 dark:text-gray-400">
                  <td class="p-4 italic">2026-01-25 22:50</td>
                  <td class="p-4 font-bold text-blue-500">admin&#64;sistema.com</td>
                  <td class="p-4 font-bold">LOGIN</td>
                  <td class="p-4"><span class="bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded uppercase text-[10px]">AUTH</span></td>
                  <td class="p-4 truncate max-w-xs">Inicio de sesión exitoso desde 127.0.0.1</td>
               </tr>
               <tr class="border-b border-gray-100 dark:border-gray-800 text-gray-600 dark:text-gray-400">
                  <td class="p-4 italic">2026-01-25 21:15</td>
                  <td class="p-4 font-bold text-blue-500">gestor&#64;rufe.com</td>
                  <td class="p-4 font-bold text-green-500">CREATE</td>
                  <td class="p-4"><span class="bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded uppercase text-[10px]">RUFE</span></td>
                  <td class="p-4 truncate max-w-xs">Nuevo RUFE creado ID: RUFE-8892</td>
               </tr>
               <!-- Mock rows -->
            </tbody>
         </table>
         <div class="p-4 text-center text-gray-400 italic text-xs">Mostrando últimos 2 registros de auditoría (Histórico completo en servidor)</div>
      </div>
    </div>
  `
})
export class AuditLogsComponent { }

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { SyncService } from '../../../core/services/sync.service';
import { RufeRepository } from '../../../core/repositories/rufe.repository';

@Component({
   selector: 'app-sync-status',
   standalone: true,
   imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, MatProgressBarModule],
   template: `
    <div class="p-8 animate-fade-in-up">
      <div class="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h1 class="text-3xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">Estado de Sincronización</h1>
           <p class="text-gray-500 mt-1">Supervisión de datos locales pendientes de envío al servidor</p>
        </div>
        <button mat-flat-button class="bg-orange-600 text-white rounded-xl px-10 py-3 shadow-xl shadow-orange-500/20 font-bold" (click)="syncNow()">
           <mat-icon class="mr-2">sync</mat-icon> Sincronizar Ahora
        </button>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
         <div class="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 p-8">
            <h2 class="text-xl font-bold mb-6 flex items-center gap-2">
               <mat-icon class="text-orange-500">cloud_off</mat-icon> Registros Pendientes
            </h2>
            
            <div class="space-y-6">
               <div>
                  <div class="flex items-center justify-between mb-2">
                     <span class="text-gray-600 dark:text-gray-400 font-medium">RUFEs Locales</span>
                     <span class="bg-orange-100 text-orange-700 px-3 py-1 rounded-lg font-bold">{{ pendingRufesCount }}</span>
                  </div>
                  <mat-progress-bar mode="determinate" [value]="pendingRufesCount > 0 ? 30 : 100" color="accent"></mat-progress-bar>
               </div>

               <div class="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-xl border border-gray-100 dark:border-gray-700">
                  <div class="flex items-start gap-4">
                     <div class="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-xl">
                        <mat-icon>info</mat-icon>
                     </div>
                     <p class="text-sm text-gray-500 leading-relaxed">
                        Los registros creados sin conexión a internet se almacenan de forma segura en tu navegador. 
                        Serán enviados automáticamente cuando recuperes la conexión.
                     </p>
                  </div>
               </div>
            </div>
         </div>

         <div class="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 p-8 flex flex-col">
             <h2 class="text-xl font-bold mb-6 flex items-center gap-2">
               <mat-icon class="text-green-500">history</mat-icon> Última Sincronización
            </h2>
            <div class="flex-1 flex flex-col items-center justify-center space-y-4">
               <div class="w-24 h-24 bg-green-50 dark:bg-green-900/20 rounded-full flex items-center justify-center text-green-500">
                  <mat-icon class="scale-[2.5]">cloud_done</mat-icon>
               </div>
               <div class="text-center">
                  <p class="text-2xl font-bold text-gray-800 dark:text-white">HACE 15 MINUTOS</p>
                  <p class="text-gray-400">Total sincronizados hoy: 45 registros</p>
               </div>
            </div>
         </div>
      </div>
    </div>
  `
})
export class SyncStatusComponent implements OnInit {
   pendingRufesCount = 0;

   constructor(
      private syncService: SyncService,
      private rufeRepo: RufeRepository
   ) { }

   ngOnInit() {
      this.checkPending();
   }

   async checkPending() {
      const pending = await this.rufeRepo.getPendingSyncRufes();
      this.pendingRufesCount = pending.length;
   }

   syncNow() {
      this.syncService.syncPending().then(() => this.checkPending());
   }
}

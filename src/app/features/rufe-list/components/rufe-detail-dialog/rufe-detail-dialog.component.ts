import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDividerModule } from '@angular/material/divider';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { RufeService, IRufeRemote } from '../../../../core/services/rufe.service';

@Component({
    selector: 'app-rufe-detail-dialog',
    standalone: true,
    imports: [
        CommonModule,
        MatDialogModule,
        MatIconModule,
        MatTabsModule,
        MatDividerModule,
        ButtonComponent
    ],
    template: `
    <div class="bg-white dark:bg-gray-900 rounded-3xl overflow-hidden shadow-2xl border border-gray-100 dark:border-gray-800 flex flex-col max-h-[90vh]">
      <!-- Header -->
      <header class="p-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex justify-between items-center shrink-0">
        <div>
          <h2 class="text-2xl font-bold flex items-center gap-2">
            <mat-icon>visibility</mat-icon>
            Detalle de Registro RUFE
          </h2>
          <p class="text-blue-100 text-sm mt-1">Folio: {{ data.clienteId }}</p>
        </div>
        <button (click)="close()" class="p-2 hover:bg-white/20 rounded-full transition-colors">
          <mat-icon>close</mat-icon>
        </button>
      </header>

      <!-- Content -->
      <div class="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
        <mat-tab-group color="primary" class="detail-tabs">
          <mat-tab label="General">
            <div class="pt-6 grid grid-cols-1 md:grid-cols-2 gap-8">
              <section class="space-y-4">
                <h3 class="text-lg font-bold text-gray-800 dark:text-gray-200 border-b pb-2">Información Básica</h3>
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <p class="text-xs text-gray-400 uppercase font-bold tracking-wider">Fecha Registro</p>
                    <p class="text-sm font-medium">{{ data.fechaRegistro | date:'dd/MM/yyyy HH:mm' }}</p>
                  </div>
                  <div>
                    <p class="text-xs text-gray-400 uppercase font-bold tracking-wider">Evento ID</p>
                    <p class="text-sm font-medium">{{ data.eventoId }}</p>
                  </div>
                </div>
              </section>

              <section class="space-y-4">
                <h3 class="text-lg font-bold text-gray-800 dark:text-gray-200 border-b pb-2">Ubicación</h3>
                <div class="space-y-3">
                  <div>
                    <p class="text-xs text-gray-400 uppercase font-bold tracking-wider">Corregimiento</p>
                    <p class="text-sm font-medium">{{ data.corregimiento || 'N/A' }}</p>
                  </div>
                  <div>
                    <p class="text-xs text-gray-400 uppercase font-bold tracking-wider">Vereda / Sector</p>
                    <p class="text-sm font-medium">{{ data.veredaSectorBarrio || 'N/A' }}</p>
                  </div>
                  <div>
                    <p class="text-xs text-gray-400 uppercase font-bold tracking-wider">Dirección</p>
                    <p class="text-sm font-medium">{{ data.direccion || 'N/A' }}</p>
                  </div>
                </div>
              </section>
            </div>
          </mat-tab>
          
          <mat-tab label="Integrantes">
            <div class="pt-6">
              <div class="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-2xl mb-6 flex items-center gap-3">
                <mat-icon class="text-blue-600">group</mat-icon>
                <p class="text-sm text-blue-700 dark:text-blue-300 font-medium">Información de miembros del hogar</p>
              </div>
              <p class="text-gray-500 italic text-center p-10">Cargando detalles adicionales de integrantes...</p>
            </div>
          </mat-tab>
        </mat-tab-group>
      </div>

      <!-- Footer -->
      <footer class="p-6 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/80 shrink-0 flex justify-end gap-3">
        <app-button variant="basic" (click)="close()">Cerrar</app-button>
        <app-button variant="primary" (click)="print()" class="hidden md:block">
          <mat-icon class="mr-2">print</mat-icon> Imprimir
        </app-button>
      </footer>
    </div>
  `,
    styles: [`
    :host { display: block; }
    .detail-tabs ::ng-deep .mat-mdc-tab-body-wrapper { margin-top: 0; }
    .custom-scrollbar::-webkit-scrollbar { width: 6px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 10px; }
  `]
})
export class RufeDetailDialogComponent {
    constructor(
        public dialogRef: MatDialogRef<RufeDetailDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: IRufeRemote
    ) { }

    close(): void {
        this.dialogRef.close();
    }

    print(): void {
        window.print();
    }
}

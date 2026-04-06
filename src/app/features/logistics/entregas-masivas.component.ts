// src/app/features/logistics/planeacion-entregas.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BodegaService, BodegaInventario } from '../../core/services/bodega.service';
import { RufeService, IRufeRemote } from '../../core/services/rufe.service';
import { AuthService } from '../../core/services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { SelectComponent } from '../../shared/components/select/select.component';
import { HasPermissionDirective } from '../../shared/directives/has-permission.directive';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-entregas-masivas',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonComponent, SelectComponent, HasPermissionDirective],
  template: `
    <div class="p-6 max-w-7xl mx-auto">
      <div class="mb-8">
        <h2 class="text-3xl font-bold text-gray-900 dark:text-white">Entrega Masiva de Ayudas</h2>
        <p class="text-gray-500 mt-2">Ejecución de despachos basados en la planificación previa por evento.</p>
      </div>

      <!-- Step 1: Filter -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div class="lg:col-span-1 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 class="text-lg font-semibold mb-4 flex items-center gap-2">
            <span class="material-icons text-blue-600">event</span>
            1. Seleccionar Evento
          </h3>
          <app-select 
            label="Evento en Distribución" 
            [options]="eventOptions" 
            [(ngModel)]="selectedEventId"
            (ngModelChange)="onEventChange()">
          </app-select>
          
          <div class="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800 text-xs text-blue-700 dark:text-blue-300">
             Solo se muestran beneficiarios con planificación PENDIENTE.
          </div>
        </div>

        <div class="lg:col-span-2 bg-gradient-to-br from-green-600 to-teal-700 p-6 rounded-2xl shadow-lg text-white">
          <div class="flex flex-col h-full justify-between">
             <div>
               <h3 class="text-xl font-bold mb-2">Despacho Masivo</h3>
               <p class="text-green-100 text-sm">Se registrará la entrega física de los artículos planificados para los beneficiarios seleccionados.</p>
             </div>
             <div class="grid grid-cols-2 gap-4 mt-6">
                <div class="bg-white/10 p-3 rounded-xl backdrop-blur-sm">
                   <div class="text-xs uppercase opacity-70">RUFEs a Despachar</div>
                   <div class="text-2xl font-bold">{{ selectedPlans.length }}</div>
                </div>
                <div class="bg-white/10 p-3 rounded-xl backdrop-blur-sm">
                   <div class="text-xs uppercase opacity-70">Total Artículos</div>
                   <div class="text-2xl font-bold">{{ totalItemsToDeliver }}</div>
                </div>
             </div>
             <div class="mt-6">
                <app-button 
                  *appHasPermission="'bodega:entregar'"
                  variant="primary" 
                  [disabled]="selectedPlans.length === 0 || isProcessing"
                  customClasses="w-full py-4 text-lg font-bold shadow-lg border-2 border-white/20 text-white bg-green-500 hover:bg-green-400"
                  (click)="startProcessing()">
                  {{ isProcessing ? 'PROCESANDO...' : 'EJECUTAR ENTREGAS' }}
                </app-button>
             </div>
          </div>
        </div>
      </div>

      <!-- Step 2: Planned Records Table -->
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div class="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-700/50">
           <h3 class="text-lg font-semibold">2. Beneficiarios con Planificación Pendiente</h3>
           <div class="flex gap-4">
              <button (click)="selectAll()" class="text-sm text-blue-600 hover:underline">Seleccionar Todos</button>
              <button (click)="selectedPlans = []" class="text-sm text-gray-500 hover:underline">Limpiar</button>
           </div>
        </div>
        
        <div class="overflow-x-auto max-h-[500px]">
          <table class="w-full text-left border-collapse">
            <thead class="bg-gray-50 dark:bg-gray-700/50 text-gray-500 uppercase text-xs font-medium sticky top-0 z-10">
              <tr>
                <th class="p-4 w-10"></th>
                <th class="p-4">Beneficiario / RUFE</th>
                <th class="p-4">Artículo Planificado</th>
                <th class="p-4 text-center">Cantidad</th>
                <th class="p-4">Estado</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 dark:divide-gray-700">
              <tr *ngFor="let plan of pendingPlans" class="hover:bg-blue-50/20 transition-colors" [class.bg-blue-50/30]="isSelected(plan.id)">
                <td class="p-4">
                  <input type="checkbox" [checked]="isSelected(plan.id)" (change)="toggleSelection(plan.id)">
                </td>
                <td class="p-4">
                  <div class="font-bold text-gray-900 dark:text-white">{{ plan.nombreBeneficiario }}</div>
                  <div class="text-[10px] text-gray-400">RUFE #{{ plan.registroRufeId }}</div>
                </td>
                <td class="p-4">
                  <div class="text-sm font-semibold text-blue-600 dark:text-blue-400">{{ plan.nombreArticulo }}</div>
                </td>
                <td class="p-4 text-center font-black">
                  {{ plan.cantidad }}
                </td>
                <td class="p-4">
                  <span *ngIf="processingStatus[plan.id!] === 'processing'" class="text-blue-500 text-xs animate-pulse">Entregando...</span>
                  <span *ngIf="processingStatus[plan.id!] === 'completed'" class="text-green-600 text-xs font-bold">✅ Entregado</span>
                  <span *ngIf="processingStatus[plan.id!] === 'error'" class="text-red-500 text-xs font-bold">❌ Error</span>
                  <span *ngIf="!processingStatus[plan.id!]" class="text-gray-400 text-xs">Pendiente</span>
                </td>
              </tr>
              <tr *ngIf="pendingPlans.length === 0">
                <td colspan="5" class="p-12 text-center text-gray-500">
                  {{ selectedEventId ? 'No hay planificaciones pendientes para este evento.' : 'Selecciona un evento.' }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class EntregasMasivasComponent implements OnInit {
  eventOptions: any[] = [];
  selectedEventId: number | null = null;
  pendingPlans: any[] = [];
  selectedPlans: number[] = [];
  processingStatus: { [id: number]: string } = {};
  isProcessing = false;

  constructor(
    private bodegaService: BodegaService,
    public authService: AuthService,
    private snackBar: MatSnackBar,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.loadEvents();
  }

  loadEvents() {
    this.http.get<any[]>(`${environment.apiUrl}/api/eventos`).subscribe(data => {
       this.eventOptions = data.map(e => ({ id: e.id, nombre: e.nombreEvento }));
    });
  }

  onEventChange() {
    if (!this.selectedEventId) {
      this.pendingPlans = [];
      return;
    }
    this.bodegaService.getPlanificacionEvento(Number(this.selectedEventId)).subscribe(plans => {
       this.pendingPlans = plans.filter(p => p.estado === 'PENDIENTE');
       this.selectedPlans = [];
    });
  }

  get totalItemsToDeliver(): number {
    return this.pendingPlans
      .filter(p => this.isSelected(p.id))
      .reduce((acc, curr) => acc + curr.cantidad, 0);
  }

  isSelected(id?: number) { return id ? this.selectedPlans.includes(id) : false; }

  toggleSelection(id?: number) {
    if (!id) return;
    const idx = this.selectedPlans.indexOf(id);
    if (idx > -1) this.selectedPlans.splice(idx, 1);
    else this.selectedPlans.push(id);
  }

  selectAll() {
    this.selectedPlans = this.pendingPlans.map(p => p.id!).filter(id => !!id);
  }

  async startProcessing() {
    if (this.isProcessing) return;
    this.isProcessing = true;
    
    let successCount = 0;

    for (const planId of this.selectedPlans) {
      const plan = this.pendingPlans.find(p => p.id === planId);
      if (!plan) continue;

      this.processingStatus[planId] = 'processing';
      try {
        await this.bodegaService.realizarEntrega({
          registroRufeId: plan.registroRufeId,
          ayudaCatalogoId: plan.ayudaCatalogoId,
          cantidad: plan.cantidad
        }).toPromise();
        
        this.processingStatus[planId] = 'completed';
        successCount++;
      } catch (err) {
        this.processingStatus[planId] = 'error';
      }
    }

    this.isProcessing = false;
    this.snackBar.open(`✅ Entrega masiva finalizada: ${successCount} despachos registrados.`, 'OK');
    this.onEventChange();
  }
}

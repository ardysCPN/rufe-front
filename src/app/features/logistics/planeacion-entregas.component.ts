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
  selector: 'app-planeacion-entregas',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonComponent, SelectComponent, HasPermissionDirective],
  template: `
    <div class="p-6 max-w-7xl mx-auto">
      <div class="mb-8">
        <h2 class="text-3xl font-bold text-gray-900 dark:text-white">Planificación de Entregas Masivas</h2>
        <p class="text-gray-500 mt-2">Gestión logística para distribución a gran escala basada en eventos y censos RUFE.</p>
      </div>

      <!-- Step 1: Filter & Settings -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div class="lg:col-span-1 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 class="text-lg font-semibold mb-4 flex items-center gap-2">
            <span class="material-icons text-blue-600">event</span>
            1. Definir Origen
          </h3>
          <app-select 
            label="Seleccionar Evento" 
            [options]="eventOptions" 
            [(ngModel)]="selectedEventId"
            (ngModelChange)="onEventChange()">
          </app-select>
          
          <div class="mt-4">
            <app-select 
              label="Artículo a Entregar" 
              [options]="inventoryOptions" 
              [(ngModel)]="selectedInventoryId">
            </app-select>
          </div>
        </div>

        <div class="lg:col-span-2 bg-gradient-to-br from-blue-600 to-indigo-700 p-6 rounded-2xl shadow-lg text-white">
          <div class="flex flex-col h-full justify-between">
             <div>
               <h3 class="text-xl font-bold mb-2">Resumen de Planificación</h3>
               <p class="text-blue-100 text-sm">Selecciona beneficiarios de la tabla para iniciar el proceso de despacho masivo.</p>
             </div>
             <div class="grid grid-cols-3 gap-4 mt-6">
                <div class="bg-white/10 p-3 rounded-xl backdrop-blur-sm">
                   <div class="text-xs uppercase opacity-70">Seleccionados</div>
                   <div class="text-2xl font-bold">{{ selectedRufes.length }}</div>
                </div>
                <div class="bg-white/10 p-3 rounded-xl backdrop-blur-sm">
                   <div class="text-xs uppercase opacity-70">Total Personas</div>
                   <div class="text-2xl font-bold">{{ totalPeopleInSelection }}</div>
                </div>
                <div class="bg-white/10 p-3 rounded-xl backdrop-blur-sm">
                   <div class="text-xs uppercase opacity-70">Stock Artículos</div>
                   <div class="text-2xl font-bold">{{ selectedItemStock || 0 }}</div>
                </div>
             </div>
             <div class="mt-6">
                <app-button 
                  *appHasPermission="'bodega:planear'"
                  variant="basic" 
                  [disabled]="selectedRufes.length === 0 || !selectedInventoryId || isProcessing"
                  customClasses="w-full py-4 text-lg font-bold shadow-lg border-2 border-white/20 text-white hover:bg-white/10"
                  (click)="startProcessing()">
                  {{ isProcessing ? 'PROCESANDO...' : 'INICIAR DESPACHO MASIVO' }}
                </app-button>

                <div *ngIf="!authService.hasPermission('bodega:planear')" class="text-xs text-blue-200 mt-2 italic text-center">
                   Solo personal autorizado puede ejecutar despachos masivos.
                </div>
             </div>
          </div>
        </div>
      </div>

      <!-- Step 2: Beneficiary Table -->
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div class="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
           <h3 class="text-lg font-semibold">2. Seleccionar Beneficiarios</h3>
           <div class="flex gap-2">
              <button (click)="selectAll()" class="text-sm text-blue-600 hover:underline">Seleccionar Todos</button>
              <span class="text-gray-300">|</span>
              <button (click)="deselectAll()" class="text-sm text-gray-500 hover:underline">Limpiar</button>
           </div>
        </div>
        
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead class="bg-gray-50 dark:bg-gray-700/50 text-gray-500 uppercase text-xs font-medium">
              <tr>
                <th class="p-4 w-10"></th>
                <th class="p-4">ID RUFE</th>
                <th class="p-4">Ubicación</th>
                <th class="p-4 text-center">Integrantes</th>
                <th class="p-4">Estado</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 dark:divide-gray-700">
              <tr *ngFor="let rufe of filteredRufes" class="hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors" [class.bg-blue-50/30]="isSelected(rufe.id)">
                <td class="p-4">
                  <input type="checkbox" [checked]="isSelected(rufe.id)" (change)="toggleSelection(rufe.id)" class="rounded border-gray-300 text-blue-600 focus:ring-blue-500">
                </td>
                <td class="p-4 font-medium text-gray-900 dark:text-white">#{{ rufe.id }}</td>
                <td class="p-4">
                  <div class="text-sm">{{ rufe.direccion || 'Sin dirección' }}</div>
                  <div class="text-xs text-gray-500">{{ rufe.corregimiento }} - {{ rufe.veredaSectorBarrio }}</div>
                </td>
                <td class="p-4 text-center">
                  <span class="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-xs font-bold">
                    {{ rufe.totalIntegrantes || 1 }}
                  </span>
                </td>
                <td class="p-4">
                  <span *ngIf="processingStatus[rufe.id] === 'pending'" class="text-gray-400 italic text-xs">En espera</span>
                  <span *ngIf="processingStatus[rufe.id] === 'processing'" class="text-blue-500 font-bold text-xs animate-pulse">Procesando...</span>
                  <span *ngIf="processingStatus[rufe.id] === 'completed'" class="text-green-600 flex items-center gap-1 text-xs font-bold">
                    <span class="material-icons text-sm">check_circle</span> Entregado
                  </span>
                  <span *ngIf="processingStatus[rufe.id] === 'error'" class="text-red-500 text-xs font-bold">Error</span>
                </td>
              </tr>
              <tr *ngIf="filteredRufes.length === 0">
                <td colspan="5" class="p-12 text-center text-gray-500">
                  <span class="material-icons text-4xl block mb-2 opacity-20">inventory</span>
                  {{ selectedEventId ? 'No hay registros RUFE para este evento.' : 'Selecciona un evento para visualizar beneficiarios.' }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class PlaneacionEntregasComponent implements OnInit {
  eventOptions: { id: number; nombre: string }[] = [];
  inventoryOptions: { id: number; nombre: string }[] = [];
  
  selectedEventId: number | null = null;
  selectedInventoryId: number | null = null;
  
  allRufes: IRufeRemote[] = [];
  filteredRufes: IRufeRemote[] = [];
  selectedRufes: number[] = [];
  
  processingStatus: { [id: number]: string } = {};
  isProcessing = false;

  constructor(
    private rufeService: RufeService,
    private bodegaService: BodegaService,
    public authService: AuthService,
    private snackBar: MatSnackBar,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.loadEvents();
    this.loadInventory();
  }

  loadEvents() {
    this.http.get<any[]>(`${environment.apiUrl}/api/eventos`).subscribe(data => {
      this.eventOptions = data.map(e => ({ id: e.id, nombre: e.nombreEvento }));
    });
  }

  loadInventory() {
    // Fetch both catalog and current organization inventory to show all options with their stock levels
    this.bodegaService.getCatalogo().subscribe(catalog => {
      this.bodegaService.getInventario().subscribe(inventory => {
        this.inventoryOptions = catalog.map(item => {
          const invItem = inventory.find(inv => inv.ayudaCatalogo?.id === item.id);
          const stock = invItem ? invItem.stockActual : 0;
          return {
            id: item.id || 0,
            nombre: `${item.nombre} (${stock} ${item.unidadMedida || 'UND'} disponibles)`
          };
        });
      });
    });
  }

  onEventChange() {
    this.selectedRufes = [];
    if (!this.selectedEventId) {
      this.filteredRufes = [];
      return;
    }
    
    this.rufeService.getAllRufes().subscribe(data => {
      this.allRufes = data;
      this.filteredRufes = data.filter(r => r.eventoId === Number(this.selectedEventId));
      this.filteredRufes.forEach(r => this.processingStatus[r.id] = 'pending');
    });
  }

  get selectedItemStock(): number {
    if (!this.selectedInventoryId) return 0;
    // Logic to find stock by catalysis ID
    return 0; // Simplified for now
  }

  get totalPeopleInSelection(): number {
    return this.filteredRufes
      .filter(r => this.selectedRufes.includes(r.id))
      .reduce((acc, curr) => acc + (curr.totalIntegrantes || 1), 0);
  }

  isSelected(id: number): boolean {
    return this.selectedRufes.includes(id);
  }

  toggleSelection(id: number) {
    const idx = this.selectedRufes.indexOf(id);
    if (idx > -1) this.selectedRufes.splice(idx, 1);
    else this.selectedRufes.push(id);
  }

  selectAll() {
    this.selectedRufes = this.filteredRufes.map(r => r.id);
  }

  deselectAll() {
    this.selectedRufes = [];
  }

  async startProcessing() {
    if (this.isProcessing) return;
    this.isProcessing = true;
    
    const count = this.selectedRufes.length;
    let successful = 0;

    for (const rufeId of this.selectedRufes) {
      this.processingStatus[rufeId] = 'processing';
      try {
        await this.bodegaService.realizarEntrega({
          registroRufeId: rufeId,
          ayudaCatalogoId: Number(this.selectedInventoryId),
          cantidad: 1 // Default 1 unit per family record for bulk processing
        }).toPromise();
        
        this.processingStatus[rufeId] = 'completed';
        successful++;
      } catch (err) {
        console.error(`Error delivering to RUFE ${rufeId}:`, err);
        this.processingStatus[rufeId] = 'error';
      }
    }

    this.isProcessing = false;
    this.snackBar.open(`✅ Proceso finalizado: ${successful} de ${count} entregas registradas.`, 'OK', { duration: 5000 });
    this.loadInventory(); // Refresh stock
  }
}

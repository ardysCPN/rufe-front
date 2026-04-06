import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BodegaService, AyudaCatalogo, PlanificacionEntrega } from '../../core/services/bodega.service';
import { RufeService, IRufeRemote } from '../../core/services/rufe.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { SelectComponent } from '../../shared/components/select/select.component';
import { InputComponent } from '../../shared/components/input/input.component';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-planificacion-evento',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonComponent, SelectComponent, InputComponent],
  template: `
    <div class="p-6 max-w-7xl mx-auto">
      <div class="mb-8">
        <h2 class="text-3xl font-bold text-gray-900 dark:text-white">Planificación de Ayudas por Evento</h2>
        <p class="text-gray-500 mt-2">Asigna artículos del catálogo a los beneficiarios censados en un evento específico.</p>
      </div>

      <!-- Filters -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
        <app-select 
          label="1. Seleccionar Evento (Solo Cerrados)" 
          [options]="eventOptions" 
          [(ngModel)]="selectedEventId"
          (ngModelChange)="onEventChange()">
        </app-select>

        <div class="flex flex-col gap-2">
          <label class="text-xs font-bold text-gray-500 uppercase ml-1">2. Añadir Artículos a Planificar</label>
          <div class="flex gap-2">
            <select [(ngModel)]="currentCatalogId" class="flex-1 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2 text-sm outline-none">
              <option [value]="null">Seleccionar...</option>
              <option *ngFor="let opt of catalogOptions" [value]="opt.id">{{ opt.nombre }}</option>
            </select>
            <app-button variant="primary" (click)="addToBasket()" [disabled]="!currentCatalogId">
              Añadir
            </app-button>
          </div>
        </div>

        <div class="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-xl border border-blue-100 dark:border-blue-900/20">
           <div class="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase mb-2">Artículos en Canasta</div>
           <div class="flex flex-wrap gap-2">
              <span *ngFor="let item of basket" class="bg-white dark:bg-gray-800 px-2 py-1 rounded-lg text-[10px] font-bold border border-blue-200 flex items-center gap-1">
                {{ item.nombre }}
                <button (click)="removeFromBasket(item.id)" class="text-red-500 hover:text-red-700">×</button>
              </span>
              <span *ngIf="basket.length === 0" class="text-xs text-gray-400 italic">No hay artículos seleccionados</span>
           </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <!-- Sidebar: Selection Summary -->
        <div class="lg:col-span-1 space-y-6">
          <div class="bg-gray-900 text-white p-6 rounded-2xl shadow-xl">
            <h3 class="font-bold mb-4 flex items-center gap-2">
              <span class="material-icons text-blue-400">assignment</span>
              Resumen
            </h3>
            <div class="space-y-4">
              <div class="flex justify-between border-b border-gray-700 pb-2">
                <span class="text-gray-400">Seleccionados</span>
                <span class="font-bold">{{ selectedIds.length }}</span>
              </div>
              <div class="flex justify-between border-b border-gray-700 pb-2">
                <span class="text-gray-400">Total Personas</span>
                <span class="font-bold">{{ totalPeopleInSelection }}</span>
              </div>
            </div>

            <div class="mt-8">
              <app-input 
                label="Cantidad x Artículo" 
                type="number" 
                [(ngModel)]="bulkQuantity">
              </app-input>
              
              <app-button 
                variant="primary" 
                customClasses="w-full mt-4 py-4 font-bold bg-orange-600 hover:bg-orange-700"
                [disabled]="selectedIds.length === 0 || basket.length === 0 || bulkQuantity <= 0 || isSaving"
                (click)="saveBulkPlanning()">
                {{ isSaving ? 'GUARDANDO...' : 'GUARDAR PLANIFICACIÓN' }}
              </app-button>
            </div>
          </div>
          
          <div class="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-xl border border-blue-100 dark:border-blue-900/30 text-xs text-blue-800 dark:text-blue-300">
             <span class="material-icons text-sm align-middle mr-1">info</span>
             <strong>Regla:</strong> Si el artículo es <em>Individual</em>, la cantidad no puede superar el nro. de integrantes del RUFE.
          </div>
        </div>

        <!-- Main Table -->
        <div class="lg:col-span-3 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div class="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-700/50">
             <h3 class="font-bold">Listado de Beneficiarios (Censo)</h3>
             <div class="flex gap-4 text-sm">
                <button (click)="selectAll()" class="text-blue-600 hover:underline">Seleccionar Todos</button>
                <button (click)="selectedIds = []" class="text-gray-500 hover:underline">Limpiar</button>
             </div>
          </div>

          <div class="table-container max-h-[600px]">
            <table class="w-full text-left border-collapse">
              <thead class="bg-gray-50 dark:bg-gray-700/50 sticky top-0 z-10">
                <tr>
                  <th class="p-4 w-10"></th>
                  <th class="p-4 text-xs font-bold uppercase text-gray-500">ID / Ubicación</th>
                  <th class="p-4 text-center text-xs font-bold uppercase text-gray-500">Integrantes</th>
                  <th class="p-4 text-xs font-bold uppercase text-gray-500">Alertas</th>
                  <th class="p-4 text-xs font-bold uppercase text-gray-500">Estado Plan. / Historial</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100 dark:divide-gray-700">
                <tr *ngFor="let rufe of beneficiaries" class="hover:bg-blue-50/20 transition-colors" [class.bg-blue-50/30]="isSelected(rufe.id)">
                  <td class="p-4">
                    <input type="checkbox" [checked]="isSelected(rufe.id)" (change)="toggleSelection(rufe.id)">
                  </td>
                  <td class="p-4">
                    <div class="font-bold text-gray-900 dark:text-white">#{{ rufe.id }}</div>
                    <div class="text-xs text-gray-500">{{ rufe.direccion }}</div>
                    <div class="text-[10px] text-gray-400">{{ rufe.corregimiento }} - {{ rufe.veredaSectorBarrio }}</div>
                  </td>
                  <td class="p-4 text-center">
                    <span class="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-xs font-black">
                      {{ rufe.totalIntegrantes || 1 }}
                    </span>
                  </td>
                  <td class="p-4">
                    <!-- Duplicate check alert -->
                    <div *ngIf="hasPriorDeliveries(rufe.id)" class="flex items-center gap-1 text-orange-600 bg-orange-50 px-2 py-1 rounded border border-orange-200">
                      <span class="material-icons text-sm">warning</span>
                      <span class="text-[9px] font-bold">YA RECIBIÓ AYUDA</span>
                    </div>
                  </td>
                  <td class="p-4">
                     <div class="flex flex-wrap gap-2 items-center">
                        <div *ngFor="let plan of getPlansForRufe(rufe.id)" class="flex items-center gap-1 group/chip">
                          <span class="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold rounded">
                            {{ plan.nombreArticulo }}: {{ plan.cantidad }}
                          </span>
                          <button (click)="deletePlan(plan.id)" class="text-red-400 hover:text-red-600 opacity-0 group-hover/chip:opacity-100 transition-opacity">
                            <span class="material-icons text-[12px]">delete</span>
                          </button>
                        </div>
                        
                        <button (click)="viewRufeHistory(rufe.id)" class="text-blue-500 hover:text-blue-700" matTooltip="Ver historial completo">
                          <span class="material-icons text-sm">visibility</span>
                        </button>

                        <span *ngIf="getPlansForRufe(rufe.id).length === 0" class="text-gray-300 italic text-[10px]">Sin planificar</span>
                     </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `
})
export class PlanificacionEventoComponent implements OnInit {
  eventOptions: any[] = [];
  catalogOptions: any[] = [];
  selectedEventId: number | null = null;
  selectedCatalogId: number | null = null;
  
  beneficiaries: IRufeRemote[] = [];
  existingPlans: PlanificacionEntrega[] = [];
  deliveryHistory: any[] = [];
  selectedIds: number[] = [];
  bulkQuantity: number = 1;
  isSaving = false;
  
  // Basket logic
  basket: { id: number, nombre: string, tipoAyuda: string }[] = [];
  currentCatalogId: number | null = null;
  rawCatalog: AyudaCatalogo[] = [];

  constructor(
    private rufeService: RufeService,
    private bodegaService: BodegaService,
    private snackBar: MatSnackBar,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.loadEvents();
    this.loadCatalog();
  }

  loadEvents() {
    this.http.get<any[]>(`${environment.apiUrl}/api/eventos`).subscribe(data => {
      // SOLO EVENTOS CERRADOS
      this.eventOptions = data
        .filter(e => e.estado === 'CERRADO')
        .map(e => ({ id: e.id, nombre: e.nombreEvento }));
    });
  }

  loadCatalog() {
    this.bodegaService.getCatalogo().subscribe(data => {
      this.rawCatalog = data;
      this.catalogOptions = data.map(c => ({ id: c.id, nombre: c.nombre }));
    });
  }

  onEventChange() {
    if (!this.selectedEventId) return;
    this.beneficiaries = [];
    this.selectedIds = [];
    
    // Load CENSO (RUFE Records)
    this.rufeService.getAllRufes().subscribe(data => {
      this.beneficiaries = data.filter(r => r.eventoId === Number(this.selectedEventId));
    });

    // Load existing planning for this event
    this.loadExistingPlans();
    
    // Load delivery history to check for duplicates
    this.bodegaService.getHistorialEntregas().subscribe(data => {
      this.deliveryHistory = data;
    });
  }

  loadExistingPlans() {
    if (!this.selectedEventId) return;
    this.bodegaService.getPlanificacionEvento(Number(this.selectedEventId)).subscribe(data => {
      this.existingPlans = data;
    });
  }

  addToBasket() {
    if (!this.currentCatalogId) return;
    const item = this.rawCatalog.find(c => c.id === Number(this.currentCatalogId));
    if (item && !this.basket.some(i => i.id === item.id)) {
      this.basket.push({ id: item.id!, nombre: item.nombre, tipoAyuda: item.tipoAyuda || 'INDIVIDUAL' });
    }
    this.currentCatalogId = null;
  }

  removeFromBasket(id: number) {
    this.basket = this.basket.filter(i => i.id !== id);
  }

  isSelected(id: number) { return this.selectedIds.includes(id); }

  toggleSelection(id: number) {
    const idx = this.selectedIds.indexOf(id);
    if (idx > -1) this.selectedIds.splice(idx, 1);
    else this.selectedIds.push(id);
  }

  selectAll() { this.selectedIds = this.beneficiaries.map(b => b.id); }

  get totalPeopleInSelection(): number {
    return this.beneficiaries
      .filter(b => this.isSelected(b.id))
      .reduce((acc, curr) => acc + (curr.totalIntegrantes || 1), 0);
  }

  getPlansForRufe(rufeId: number) {
    return this.existingPlans.filter(p => p.registroRufeId === rufeId && p.estado === 'PENDIENTE');
  }

  hasPriorDeliveries(rufeId: number): boolean {
    // Check in history across all events (or just current one? usually all for humanitarian aid)
    return this.deliveryHistory.some(d => d.registroRufeId === rufeId);
  }

  viewRufeHistory(rufeId: number) {
    const historical = this.deliveryHistory.filter(d => d.registroRufeId === rufeId);
    if (historical.length === 0) {
      this.snackBar.open('Este beneficiario no tiene entregas previas.', 'Cerrar');
      return;
    }
    const list = historical.map(h => `- ${h.ayudaCatalogo?.nombre} (${h.cantidad})`).join('\n');
    alert(`Historial de Entregas para RUFE #${rufeId}:\n\n${list}`);
  }

  async saveBulkPlanning() {
    if (this.isSaving) return;
    this.isSaving = true;
    
    let successCount = 0;
    let errorCount = 0;

    for (const rufeId of this.selectedIds) {
      const rufe = this.beneficiaries.find(b => b.id === rufeId);
      const integrantes = rufe?.totalIntegrantes || 1;

      for (const item of this.basket) {
        // Validation logic
        if (item.tipoAyuda === 'INDIVIDUAL' && this.bulkQuantity > integrantes) {
           console.warn(`RUFE ${rufeId} excede nro integrantes para ${item.nombre}`);
           errorCount++;
           continue;
        }

        try {
          await this.bodegaService.planificarEntrega({
            eventoId: Number(this.selectedEventId),
            registroRufeId: rufeId,
            ayudaCatalogoId: item.id,
            cantidad: this.bulkQuantity
          }).toPromise();
          successCount++;
        } catch (e) {
          errorCount++;
        }
      }
    }

    this.isSaving = false;
    this.snackBar.open(`✅ ${successCount} planificaciones guardadas. ❌ ${errorCount} errores.`, 'OK', { duration: 5000 });
    this.selectedIds = [];
    this.loadExistingPlans();
  }

  deletePlan(id?: number) {
    if (!id) return;
    this.bodegaService.eliminarPlanificacion(id).subscribe(() => {
      this.snackBar.open('Planificación eliminada', 'OK');
      this.loadExistingPlans();
    });
  }
}

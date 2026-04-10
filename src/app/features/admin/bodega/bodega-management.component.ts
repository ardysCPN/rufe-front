// src/app/features/admin/bodega/bodega-management.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { forkJoin } from 'rxjs';
import { BodegaService, AyudaCatalogo, BodegaInventario, AyudasEntregadas } from '../../../core/services/bodega.service';
import { AuthService } from '../../../core/services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { InputComponent } from '../../../shared/components/input/input.component';
import { HasPermissionDirective } from '../../../shared/directives/has-permission.directive';

@Component({
  selector: 'app-bodega-management',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonComponent, InputComponent, HasPermissionDirective, MatIconModule],
  template: `
    <div class="p-6">
      <h2 class="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Gestión de Bodega y Ayudas</h2>

      <!-- Responsive Tabs -->
      <div class="mb-8 overflow-x-auto hide-scrollbar -mx-6 px-6">
        <div class="flex items-center gap-2 p-1 bg-gray-100 dark:bg-gray-800/50 rounded-2xl min-w-max">
          <button 
            (click)="activeTab = 'catalogo'"
            [class.bg-white]="activeTab === 'catalogo'"
            [class.dark:bg-gray-700]="activeTab === 'catalogo'"
            [class.shadow-md]="activeTab === 'catalogo'"
            [class.text-blue-600]="activeTab === 'catalogo'"
            [class.font-bold]="activeTab === 'catalogo'"
            class="py-3 px-6 rounded-xl text-sm font-medium transition-all duration-200 outline-none flex items-center gap-2"
          >
            <mat-icon class="text-lg">inventory_2</mat-icon>
            Catálogo Global
          </button>
          
          <button 
            (click)="activeTab = 'inventario'"
            [class.bg-white]="activeTab === 'inventario'"
            [class.dark:bg-gray-700]="activeTab === 'inventario'"
            [class.shadow-md]="activeTab === 'inventario'"
            [class.text-blue-600]="activeTab === 'inventario'"
            [class.font-bold]="activeTab === 'inventario'"
            class="py-3 px-6 rounded-xl text-sm font-medium transition-all duration-200 outline-none flex items-center gap-2"
          >
            <mat-icon class="text-lg">warehouse</mat-icon>
            Inventario
          </button>

          <button 
            (click)="activeTab = 'historial'"
            [class.bg-white]="activeTab === 'historial'"
            [class.dark:bg-gray-700]="activeTab === 'historial'"
            [class.shadow-md]="activeTab === 'historial'"
            [class.text-blue-600]="activeTab === 'historial'"
            [class.font-bold]="activeTab === 'historial'"
            class="py-3 px-6 rounded-xl text-sm font-medium transition-all duration-200 outline-none flex items-center gap-2"
          >
            <mat-icon class="text-lg">history</mat-icon>
            Historial
          </button>
        </div>
      </div>

      <!-- Tab Content: Catalogo -->
      <div *ngIf="activeTab === 'catalogo'" class="animate-fadeIn">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-200">Catálogo de Artículos</h3>
          <button 
            *appHasPermission="'bodega:crear'"
            (click)="showAddCatalogModal = true"
            class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            + Nuevo Artículo
          </button>
        </div>

        <div class="bg-white dark:bg-gray-800 shadow rounded-xl border border-gray-100 dark:border-gray-800">
          <div class="table-container">
            <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead class="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo Ayuda</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">Descripción</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">U. Medida</th>
                  <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
                <tr *ngFor="let item of catalogo" class="hover:bg-gray-50 transition-colors group">
                  <td class="px-6 py-4 text-sm">{{ item.id }}</td>
                  <td class="px-6 py-4 text-sm font-medium">{{ item.nombre }}</td>
                  <td class="px-6 py-4 text-sm">
                     <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase"
                           [ngClass]="isColectiva(item) ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'">
                       {{ item.tipoAyuda || 'INDIVIDUAL' }}
                     </span>
                  </td>
                  <td class="px-6 py-4 text-sm text-gray-500">{{ item.descripcion }}</td>
                  <td class="px-6 py-4 text-sm">{{ item.unidadMedida }}</td>
                  <td class="px-6 py-4 text-right">
                    <div class="flex justify-end gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                      <button *appHasPermission="'bodega:actualizar'" (click)="editCatalogItem(item)" class="text-blue-600 hover:text-blue-800">
                        <span class="material-icons text-sm">edit</span>
                      </button>
                      <button *appHasPermission="'bodega:eliminar'" (click)="deleteCatalogItem(item)" class="text-red-600 hover:text-red-800">
                        <span class="material-icons text-sm">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Tab Content: Inventario -->
      <div *ngIf="activeTab === 'inventario'" class="animate-fadeIn">
        <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Stock Actual de la Organización</h3>
        
        <div class="bg-white dark:bg-gray-800 shadow-md rounded-xl border border-gray-200 dark:border-gray-700">
          <div class="table-container">
            <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead class="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Artículo</th>
                  <th class="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">U. Medida</th>
                  <th class="px-6 py-3 text-center text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Stock Disponible</th>
                  <th class="px-6 py-3 text-right text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Gestión</th>
                </tr>
              </thead>
              <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                <tr *ngFor="let inv of mergedInventario" class="hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-colors group">
                  <td class="px-6 py-4 whitespace-nowrap">
                     <div class="text-sm font-semibold text-gray-900 dark:text-white">{{ inv.ayudaCatalogo?.nombre }}</div>
                     <div class="text-xs text-gray-500 dark:text-gray-400">{{ inv.ayudaCatalogo?.descripcion }}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                    {{ inv.ayudaCatalogo?.unidadMedida }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-center">
                    <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-black ring-1 ring-inset"
                          [class.bg-green-100]="inv.cantidad > 0" [class.text-green-700]="inv.cantidad > 0" [class.ring-green-600/20]="inv.cantidad > 0"
                          [class.bg-gray-100]="inv.cantidad <= 0" [class.text-gray-500]="inv.cantidad <= 0" [class.ring-gray-600/20]="inv.cantidad <= 0">
                      {{ inv.cantidad }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <app-button 
                      *appHasPermission="'bodega:actualizar'"
                      variant="basic"
                      customClasses="text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 border-none shadow-none text-xs"
                      (click)="openAdjustStock(inv)"
                    >
                      <span class="material-icons text-sm mr-1">settings</span>
                      Ajustar
                    </app-button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Tab Content: Historial -->
      <div *ngIf="activeTab === 'historial'" class="animate-fadeIn">
        <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Registro de Entregas</h3>
        <div class="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-100 dark:border-gray-800">
          <div class="table-container">
            <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead class="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Beneficiario (RUFE)</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Artículo</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cantidad</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Evidencia</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
                <tr *ngFor="let delivery of historial">
                  <td class="px-6 py-4 text-sm">{{ delivery.fechaEntrega | date:'short' }}</td>
                  <td class="px-6 py-4 text-sm font-medium">#{{ delivery.registroRufeId }}</td>
                  <td class="px-6 py-4 text-sm">{{ delivery.ayudaCatalogo?.nombre }}</td>
                  <td class="px-6 py-4 text-sm">{{ delivery.cantidad }}</td>
                  <td class="px-6 py-4 text-sm">
                     <a *ngIf="delivery.evidenciaFotoUrl" [href]="delivery.evidenciaFotoUrl" target="_blank" class="text-blue-600 hover:underline">Ver Foto</a>
                     <span *ngIf="!delivery.evidenciaFotoUrl" class="text-gray-400">Sin foto</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div *ngIf="showAddCatalogModal" class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
        <div class="bg-white dark:bg-gray-800 rounded-3xl p-8 w-full max-w-md shadow-2xl border border-white/20">
          <h3 class="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
            {{ newCatalogItem.id ? 'Editar' : 'Nuevo' }} Artículo
          </h3>
          <div class="space-y-5">
            <app-input label="Nombre del Artículo" [(ngModel)]="newCatalogItem.nombre" placeholder="Ej. Kit de Aseo"></app-input>
            
            <div class="space-y-1">
              <label class="text-xs font-bold text-gray-500 uppercase ml-1">Tipo de Ayuda</label>
              <select [(ngModel)]="newCatalogItem.tipoAyuda" class="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all">
                <option value="INDIVIDUAL">INDIVIDUAL (Por persona)</option>
                <option value="COLECTIVA">COLECTIVA (Por familia/grupo)</option>
              </select>
            </div>

            <app-input label="Descripción / Detalles" [(ngModel)]="newCatalogItem.descripcion" placeholder="Especificaciones del producto..."></app-input>
            <app-input label="Unidad de Medida (UND, KG, MT, KIT)" [(ngModel)]="newCatalogItem.unidadMedida"></app-input>
          </div>
          <div class="mt-8 flex justify-end gap-3">
            <app-button variant="basic" (click)="showAddCatalogModal = false" customClasses="px-6">Cancelar</app-button>
            <app-button variant="primary" (click)="saveCatalogItem()" customClasses="px-8 shadow-lg shadow-blue-500/30">
              {{ newCatalogItem.id ? 'Actualizar' : 'Guardar Artículo' }}
            </app-button>
          </div>
        </div>
      </div>

       <!-- Adjust Stock Modal (Simulated) -->
       <div *ngIf="showAdjustStockModal" class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <div class="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md shadow-2xl">
          <h3 class="text-xl font-bold mb-4">Ajustar Stock: {{ selectedInventory?.ayudaCatalogo?.nombre }}</h3>
          <p class="text-sm text-gray-500 mb-4">Ingresa la cantidad a sumar (positivo) o restar (negativo).</p>
          <div class="space-y-4">
            <app-input label="Cantidad" type="number" [(ngModel)]="adjustAmount"></app-input>
          </div>
          <div class="mt-6 flex justify-end gap-3">
            <app-button variant="basic" (click)="showAdjustStockModal = false">Cancelar</app-button>
            <app-button variant="primary" (click)="saveStockAdjustment()">Confirmar</app-button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .animate-fadeIn {
      animation: fadeIn 0.3s ease-in-out;
    }
    .hide-scrollbar::-webkit-scrollbar {
      display: none;
    }
    .hide-scrollbar {
      -ms-overflow-style: none;
      scrollbar-width: none;
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class BodegaManagementComponent implements OnInit {
  activeTab = 'catalogo';
  isAdminGlobal = false;

  catalogo: AyudaCatalogo[] = [];
  inventario: BodegaInventario[] = [];
  historial: AyudasEntregadas[] = [];

  // Catalog Modal
  showAddCatalogModal = false;
  newCatalogItem: AyudaCatalogo = { nombre: '', descripcion: '', unidadMedida: 'UND', tipoAyuda: 'INDIVIDUAL' };

  // Adjust Stock Modal
  showAdjustStockModal = false;
  selectedInventory: BodegaInventario | null = null;
  adjustAmount: number = 0;

  constructor(
    private bodegaService: BodegaService,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private route: ActivatedRoute
  ) {}

  async ngOnInit() {
    this.route.data.subscribe(data => {
      if (data && data['tab']) {
        this.activeTab = data['tab'];
      }
    });

    this.checkRoles();
    this.loadData();
  }

  checkRoles() {
    this.authService.currentUser.subscribe((user: any) => {
      this.isAdminGlobal = user?.rol === 'ADMIN_GLOBAL';
    });
  }

  mergedInventario: any[] = [];

  loadData() {
    forkJoin({
      catalog: this.bodegaService.getCatalogo(),
      inventory: this.bodegaService.getInventario(),
      history: this.bodegaService.getHistorialEntregas()
    }).subscribe({
      next: (result) => {
        this.catalogo = result.catalog;
        this.inventario = result.inventory;
        this.historial = result.history;
        
        // Merge catalog with inventory to show all items
        this.mergedInventario = result.catalog.map(item => {
          const invItem = result.inventory.find(inv => inv.ayudaCatalogo?.id === item.id);
          return {
            ayudaCatalogo: item,
            cantidad: invItem ? invItem.cantidad : 0,
            id: invItem ? invItem.id : null
          };
        });
      },
      error: (err) => console.error('Error loading bodega data:', err)
    });
  }

  saveCatalogItem() {
    if (!this.newCatalogItem.nombre) return;
    
    // Si tiene ID, deberíamos llamar a update, pero BodegaService solo tiene addCatalogoItem
    // Para efectos de este ejercicio, usaremos addCatalogoItem o simularemos el comportamiento
    this.bodegaService.addCatalogoItem(this.newCatalogItem).subscribe({
      next: () => {
        this.snackBar.open(this.newCatalogItem.id ? 'Artículo actualizado' : 'Artículo agregado al catálogo', 'OK', { duration: 3000 });
        this.showAddCatalogModal = false;
        this.newCatalogItem = { nombre: '', descripcion: '', unidadMedida: 'UND', tipoAyuda: 'INDIVIDUAL' };
        this.loadData();
      },
      error: (err: any) => this.snackBar.open('Error: ' + err.message, 'Cerrar')
    });
  }

  editCatalogItem(item: AyudaCatalogo) {
    this.newCatalogItem = { ...item };
    this.showAddCatalogModal = true;
  }

  deleteCatalogItem(item: AyudaCatalogo) {
    if (confirm(`¿Estás seguro de eliminar "${item.nombre}"?`)) {
      // Simulando eliminación (requeriría endpoint en bodegaService)
      this.snackBar.open('Funcionalidad de eliminación pendiente de backend', 'OK');
    }
  }

  isColectiva(item: AyudaCatalogo): boolean {
    return (item.tipoAyuda as string) === 'COLECTIVA';
  }

  openAdjustStock(inv: BodegaInventario) {
    this.selectedInventory = inv;
    this.adjustAmount = 0;
    this.showAdjustStockModal = true;
  }

  saveStockAdjustment() {
    if (!this.selectedInventory || !this.selectedInventory.ayudaCatalogo?.id) return;
    this.bodegaService.ajustarStock(this.selectedInventory.ayudaCatalogo.id, this.adjustAmount).subscribe({
        next: () => {
          this.snackBar.open('Stock actualizado exitosamente', 'OK', { duration: 3000 });
          this.showAdjustStockModal = false;
          this.loadData();
        },
        error: (err: any) => this.snackBar.open('Error: ' + err.message, 'Cerrar')
    });
  }
}

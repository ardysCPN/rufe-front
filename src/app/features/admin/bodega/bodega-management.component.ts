// src/app/features/admin/bodega/bodega-management.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { BodegaService, AyudaCatalogo, BodegaInventario, AyudasEntregadas } from '../../../core/services/bodega.service';
import { AuthService } from '../../../core/services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { InputComponent } from '../../../shared/components/input/input.component';
import { HasPermissionDirective } from '../../../shared/directives/has-permission.directive';

@Component({
  selector: 'app-bodega-management',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonComponent, InputComponent, HasPermissionDirective],
  template: `
    <div class="p-6">
      <h2 class="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Gestión de Bodega y Ayudas</h2>

      <!-- Tabs -->
      <div class="flex border-b border-gray-200 dark:border-gray-700 mb-6">
        <button 
          (click)="activeTab = 'catalogo'"
          [class.border-blue-600]="activeTab === 'catalogo'"
          [class.text-blue-600]="activeTab === 'catalogo'"
          class="py-2 px-4 border-b-2 font-medium transition-colors"
        >
          Catálogo Global
        </button>
        <button 
          (click)="activeTab = 'inventario'"
          [class.border-blue-600]="activeTab === 'inventario'"
          [class.text-blue-600]="activeTab === 'inventario'"
          class="py-2 px-4 border-b-2 font-medium transition-colors"
        >
          Inventario de Organización
        </button>
        <button 
          (click)="activeTab = 'historial'"
          [class.border-blue-600]="activeTab === 'historial'"
          [class.text-blue-600]="activeTab === 'historial'"
          class="py-2 px-4 border-b-2 font-medium transition-colors"
        >
          Historial de Entregas
        </button>
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

        <div class="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
          <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead class="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Descripción</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">U. Medida</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
              <tr *ngFor="let item of catalogo">
                <td class="px-6 py-4 text-sm">{{ item.id }}</td>
                <td class="px-6 py-4 text-sm font-medium">{{ item.nombre }}</td>
                <td class="px-6 py-4 text-sm text-gray-500">{{ item.descripcion }}</td>
                <td class="px-6 py-4 text-sm">{{ item.unidadMedida }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Tab Content: Inventario -->
      <div *ngIf="activeTab === 'inventario'" class="animate-fadeIn">
        <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Stock Actual de la Organización</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div *ngFor="let inv of mergedInventario" class="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div class="flex justify-between items-start mb-4">
              <div>
                <h4 class="text-xl font-bold">{{ inv.ayudaCatalogo?.nombre }}</h4>
                <p class="text-sm text-gray-500">{{ inv.ayudaCatalogo?.unidadMedida }}</p>
              </div>
              <span class="text-3xl font-black" [class.text-blue-600]="inv.stockActual > 0" [class.text-gray-400]="inv.stockActual === 0">
                {{ inv.stockActual }}
              </span>
            </div>
            
            <div class="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 flex gap-2">
               <button 
                 *appHasPermission="'bodega:actualizar'"
                 (click)="openAdjustStock(inv)" 
                 class="text-sm text-blue-600 hover:underline flex items-center gap-1"
               >
                 <span class="material-icons text-sm">add_box</span>
                 Ajustar Stock
               </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Tab Content: Historial -->
      <div *ngIf="activeTab === 'historial'" class="animate-fadeIn">
        <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Registro de Entregas</h3>
        <div class="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
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

      <!-- Add Catalog Modal (Simulated) -->
      <div *ngIf="showAddCatalogModal" class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <div class="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md shadow-2xl">
          <h3 class="text-xl font-bold mb-4">Agregar Nuevo Artículo al Catálogo</h3>
          <div class="space-y-4">
            <app-input label="Nombre" [(ngModel)]="newCatalogItem.nombre"></app-input>
            <app-input label="Descripción" [(ngModel)]="newCatalogItem.descripcion"></app-input>
            <app-input label="Unidad de Medida (UND, KG, MT)" [(ngModel)]="newCatalogItem.unidadMedida"></app-input>
          </div>
          <div class="mt-6 flex justify-end gap-3">
            <app-button variant="basic" (click)="showAddCatalogModal = false">Cancelar</app-button>
            <app-button variant="primary" (click)="saveCatalogItem()">Guardar</app-button>
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
  newCatalogItem: AyudaCatalogo = { nombre: '', descripcion: '', unidadMedida: 'UND' };

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
    this.bodegaService.getCatalogo().subscribe((catalog: AyudaCatalogo[]) => {
      this.catalogo = catalog;
      this.bodegaService.getInventario().subscribe((inventory: BodegaInventario[]) => {
        this.inventario = inventory;
        // Merge catalog with inventory to show all items
        this.mergedInventario = catalog.map(item => {
          const invItem = inventory.find(inv => inv.ayudaCatalogo?.id === item.id);
          return {
            ayudaCatalogo: item,
            stockActual: invItem ? invItem.stockActual : 0,
            id: invItem ? invItem.id : null
          };
        });
      });
    });
    this.bodegaService.getHistorialEntregas().subscribe((data: AyudasEntregadas[]) => this.historial = data);
  }

  saveCatalogItem() {
    if (!this.newCatalogItem.nombre) return;
    this.bodegaService.addCatalogoItem(this.newCatalogItem).subscribe({
      next: () => {
        this.snackBar.open('Artículo agregado al catálogo', 'OK', { duration: 3000 });
        this.showAddCatalogModal = false;
        this.newCatalogItem = { nombre: '', descripcion: '', unidadMedida: 'UND' };
        this.loadData();
      },
      error: (err: any) => this.snackBar.open('Error: ' + err.message, 'Cerrar')
    });
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

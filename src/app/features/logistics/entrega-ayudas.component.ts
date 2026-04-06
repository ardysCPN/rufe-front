// src/app/features/logistics/entrega-ayudas.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BodegaService, AyudaCatalogo, BodegaInventario } from '../../core/services/bodega.service';
import { RufeService, IRufeRemote } from '../../core/services/rufe.service';
import { EvidenceService } from '../../core/services/evidence.service';
import { AuthService } from '../../core/services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MediaCaptureComponent } from '../../shared/components/media-capture/media-capture.component';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { SelectComponent } from '../../shared/components/select/select.component';
import { InputComponent } from '../../shared/components/input/input.component';

@Component({
  selector: 'app-entrega-ayudas',
  standalone: true,
  imports: [CommonModule, FormsModule, MediaCaptureComponent, ButtonComponent, SelectComponent, InputComponent],
  template: `
    <div class="p-6 max-w-4xl mx-auto">
      <h2 class="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Entrega de Ayudas Humanitarias</h2>
      <p class="text-gray-500 mb-8 font-light italic">Distribución oficial de recursos desde bodega a damnificados registrados.</p>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        <!-- Form Section -->
        <div class="space-y-6">
          <div class="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
            <h3 class="text-lg font-semibold mb-4 flex items-center gap-2">
               <span class="material-icons text-blue-600">person_search</span>
               Beneficiario (RUFE)
            </h3>
            
            <app-select 
              label="Seleccione Registro RUFE" 
              [options]="rufeOptions" 
              [(ngModel)]="selectedRufeId"
              (ngModelChange)="onRufeSelected()">
            </app-select>
            
            <div *ngIf="rufeInfo" class="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-sm">
                <p><strong>Ubicación:</strong> {{ rufeInfo.direccion }}</p>
                <p><strong>Evento:</strong> ID #{{ rufeInfo.eventoId }}</p>
                <p><strong>Fecha Censo:</strong> {{ rufeInfo.fechaRegistro | date:'short' }}</p>
            </div>
          </div>

          <div class="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
            <h3 class="text-lg font-semibold mb-4 flex items-center gap-2">
               <span class="material-icons text-green-600">inventory_2</span>
               Artículo a Entregar
            </h3>
            
            <app-select 
              label="Seleccione Ayuda disponible" 
              [options]="inventoryOptions" 
              [(ngModel)]="selectedInventoryId"
              (ngModelChange)="onItemChange()">
            </app-select>

            <div *ngIf="inventoryOptions.length === 0" class="mt-2 text-xs text-amber-600 bg-amber-50 p-2 rounded border border-amber-100 flex items-center gap-1">
               <span class="material-icons text-sm">warning</span>
               No hay stock disponible en tu organización. Debes añadir stock desde el Gestor de Bodega.
            </div>

            <div *ngIf="selectedItemStock !== null && inventoryOptions.length > 0" class="mt-2 text-sm">
               Stock disponible: <span class="font-bold underline" [class.text-red-500]="selectedItemStock <= 0">{{ selectedItemStock }}</span>
            </div>

            <div class="mt-4">
               <app-input label="Cantidad a Entregar" type="number" [(ngModel)]="deliveryAmount" [required]="true"></app-input>
            </div>
          </div>
        </div>

        <!-- Evidence Section -->
        <div class="space-y-6">
           <div class="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
              <h3 class="text-lg font-semibold mb-4 flex items-center gap-2">
                 <span class="material-icons text-purple-600">photo_library</span>
                 Evidencia de Entrega
              </h3>
              
              <app-media-capture (onCapture)="onCapture($event)" (onReset)="onReset()"></app-media-capture>
              
              <p class="text-[10px] text-gray-500 mt-2 text-center">Capture una foto del beneficiario recibiendo la ayuda o el acta firmada.</p>
           </div>

           <div class="flex justify-end pt-4">
              <app-button 
                variant="primary" 
                [disabled]="!isValid || isSubmitting" 
                customClasses="w-full py-4 text-lg font-bold shadow-lg"
                (click)="submitDelivery()">
                {{ isSubmitting ? 'Procesando...' : 'REGISTRAR ENTREGA' }}
              </app-button>
           </div>
        </div>
      </div>
    </div>
  `
})
export class EntregaAyudasComponent implements OnInit {
  // Options
  rufeOptions: { id: number; nombre: string }[] = [];
  inventoryOptions: { id: number; nombre: string }[] = [];

  isAdminGlobal = false;

  // Selections
  selectedRufeId: number | null = null;
  selectedInventoryId: number | null = null;
  deliveryAmount: number = 1;
  capturedFile: File | null = null;

  // Auxiliary
  rufeInfo: IRufeRemote | null = null;
  selectedItemStock: number | null = null;
  isSubmitting = false;

  constructor(
    private rufeService: RufeService,
    private bodegaService: BodegaService,
    private evidenceService: EvidenceService,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.loadRufes();
    this.loadInventory();
  }

  checkRoles() {
    this.authService.currentUser.subscribe((user: any) => {
      this.isAdminGlobal = user?.rol === 'ADMIN_GLOBAL';
    });
  }

  loadRufes() {
    this.rufeService.getAllRufes().subscribe((data: IRufeRemote[]) => {
      this.rufeOptions = data.map(r => ({
        id: r.id,
        nombre: `RUFE #${r.id} - ${r.direccion || 'Sin dirección'}`
      }));
    });
  }

  loadInventory() {
    this.bodegaService.getInventario().subscribe((data: BodegaInventario[]) => {
      this.inventoryOptions = data
        .filter(inv => inv.cantidad > 0)
        .map(inv => ({
          id: inv.ayudaCatalogo?.id || 0,
          nombre: `${inv.ayudaCatalogo?.nombre} (${inv.cantidad} ${inv.ayudaCatalogo?.unidadMedida})`
        }));
    });
  }

  onRufeSelected() {
    if (this.selectedRufeId) {
       this.rufeService.getRufe(this.selectedRufeId).subscribe((data: IRufeRemote) => this.rufeInfo = data);
    }
  }

  onItemChange() {
    this.bodegaService.getInventario().subscribe((data: BodegaInventario[]) => {
       const inv = data.find(i => i.ayudaCatalogo?.id === this.selectedInventoryId);
       this.selectedItemStock = inv ? inv.cantidad : 0;
    });
  }

  onCapture(file: File) {
    this.capturedFile = file;
  }

  onReset() {
    this.capturedFile = null;
  }

  get isValid(): boolean {
    return !!(this.selectedRufeId && this.selectedInventoryId && this.deliveryAmount > 0 && this.selectedItemStock && this.deliveryAmount <= this.selectedItemStock);
  }

  async submitDelivery() {
    if (!this.isValid || this.isSubmitting) return;

    this.isSubmitting = true;
    try {
      let photoUrl = '';
      if (this.capturedFile) {
        const uploadRes = await this.evidenceService.uploadFile(this.capturedFile, 'entregas').toPromise();
        photoUrl = uploadRes.url;
      }

      await this.bodegaService.realizarEntrega({
        registroRufeId: this.selectedRufeId!,
        ayudaCatalogoId: this.selectedInventoryId!,
        cantidad: this.deliveryAmount,
        evidenciaFotoUrl: photoUrl
      }).toPromise();

      this.snackBar.open('✅ Entrega registrada exitosamente', 'OK', { duration: 5000 });
      this.resetForm();
    } catch (err) {
      console.error(err);
      this.snackBar.open('❌ Error al registrar entrega', 'Cerrar');
    } finally {
      this.isSubmitting = false;
    }
  }

  resetForm() {
     this.selectedRufeId = null;
     this.selectedInventoryId = null;
     this.deliveryAmount = 1;
     this.capturedFile = null;
     this.rufeInfo = null;
     this.selectedItemStock = null;
     this.loadInventory(); // Refresh stock levels
  }
}

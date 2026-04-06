import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { EventosRepository, EventoReal } from '../../../../core/repositories/eventos.repository';
import { CatalogRepository } from '../../../../core/repositories/catalog.repository';
import { PermissionService } from '../../../../core/services/permission.service';
import { InputComponent } from '../../../../shared/components/input/input.component';
import { SelectComponent } from '../../../../shared/components/select/select.component';
import { ButtonComponent } from '../../../../shared/components/button/button.component';

@Component({
  selector: 'app-evento-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatIconModule,
    InputComponent,
    SelectComponent,
    ButtonComponent
  ],
  template: `
    <div class="h-full flex flex-col bg-white dark:bg-gray-900 rounded-[2rem] overflow-hidden shadow-2xl border border-white/10">
      <!-- Header -->
      <div class="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-white/50 dark:bg-gray-900/50 backdrop-blur-md">
        <div class="flex items-center gap-4">
          <div class="p-3 rounded-2xl bg-orange-100/50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400">
            <mat-icon class="leading-none flex items-center justify-center">{{ isEditing ? 'edit_note' : 'add_circle' }}</mat-icon>
          </div>
          <div>
            <h2 class="text-2xl font-bold text-gray-800 dark:text-white leading-tight">
              {{ isEditing ? 'Editar' : 'Nuevo' }} Evento
            </h2>
            <p class="text-xs text-gray-500 dark:text-gray-400">Detalles de la emergencia o simulacro</p>
          </div>
        </div>
        <button mat-icon-button mat-dialog-close class="text-gray-400 hover:text-red-500 transition-colors">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <mat-dialog-content class="p-8 custom-scrollbar bg-slate-50/30 dark:bg-gray-900/50">
        <form [formGroup]="form" class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
            
            <div class="col-span-full">
              <app-input 
                label="Nombre del Evento" 
                formControlName="nombreEvento" 
                [required]="true"
                placeholder="Ej. Desbordamiento Río Atrato">
              </app-input>
            </div>

            <app-select 
              label="Tipo de Evento" 
              [options]="tiposEvento"
              formControlName="tipoId" 
              [required]="true">
            </app-select>

            <app-input 
              label="Fecha del Evento" 
              type="date"
              formControlName="fechaEventoStr" 
              [required]="true">
            </app-input>

            <app-select 
              label="Estado" 
              [options]="estadosEvento"
              formControlName="estadoId" 
              [required]="true">
            </app-select>

            <app-input 
              label="Departamento" 
              formControlName="departamento" 
              [required]="true"
              placeholder="Ej. CHOCÓ">
            </app-input>

            <app-input 
              label="Municipio" 
              formControlName="municipio" 
              [required]="true"
              placeholder="Ej. Quibdó">
            </app-input>

            <div class="col-span-full">
              <app-input 
                label="Descripción / Detalles adicionales" 
                formControlName="descripcion" 
                placeholder="Información relevante para la logística...">
              </app-input>
            </div>
          </div>
        </form>
      </mat-dialog-content>

      <!-- Footer Actions -->
      <div class="p-6 border-t border-gray-100 dark:border-gray-800 bg-white/50 dark:bg-gray-900/50 backdrop-blur-md flex justify-end gap-3">
        <app-button variant="basic" (click)="dialogRef.close()">
          Cancelar
        </app-button>
        <app-button 
          variant="primary"
          [disabled]="form.invalid || loading" 
          (click)="save()"
          customClasses="px-10"
        >
          <div class="flex items-center gap-2">
            <mat-icon *ngIf="!loading" class="text-lg">check_circle</mat-icon>
            <span *ngIf="loading" class="animate-spin border-2 border-white/30 border-t-white rounded-full w-4 h-4 mr-2"></span>
            {{ loading ? 'Sincronizando...' : (isEditing ? 'Confirmar Cambios' : 'Crear Evento') }}
          </div>
        </app-button>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; border-radius: 2rem; overflow: hidden; }
    .custom-scrollbar::-webkit-scrollbar { width: 5px; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
    
    /* Premium Look Overrides */
    ::ng-deep .mat-mdc-dialog-container .mdc-dialog__surface { border-radius: 2rem !important; background: transparent !important; box-shadow: none !important; }
    ::ng-deep .mat-mdc-form-field-outline { opacity: 1 !important; color: #e2e8f0 !important; }
    ::ng-deep .mat-mdc-text-field-wrapper { background-color: white !important; border-radius: 1.25rem !important; }
    
    .dark ::ng-deep .mat-mdc-text-field-wrapper { background-color: #1e293b !important; }
    .dark ::ng-deep .mat-mdc-form-field-outline { color: #334155 !important; }

    mat-dialog-content { max-height: 75vh !important; margin: 0 !important; }
  `]
})
export class EventoFormDialogComponent implements OnInit {
  form: FormGroup;
  isEditing = false;
  loading = false;

  tiposEvento = [
    { id: 1, nombre: 'REAL' },
    { id: 2, nombre: 'SIMULACRO' }
  ];

  estadosEvento = [
    { id: 1, nombre: 'ABIERTO' },
    { id: 2, nombre: 'CERRADO' }
  ];

  constructor(
    private fb: FormBuilder,
    private eventosRepository: EventosRepository,
    private permissionService: PermissionService,
    public dialogRef: MatDialogRef<EventoFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: EventoReal | null
  ) {
    this.isEditing = !!data;
    const canClose = this.permissionService.hasPermission('eventos:cerrar');

    this.form = this.fb.group({
      nombreEvento: [data?.nombreEvento || '', Validators.required],
      tipoId: [data?.tipoEvento?.trim().toUpperCase() === 'SIMULACRO' ? 2 : 1, Validators.required],
      fechaEventoStr: [data?.fechaEvento ? new Date(data.fechaEvento).toISOString().split('T')[0] : new Date().toISOString().split('T')[0], Validators.required],
      departamento: [data?.departamento || '', Validators.required],
      municipio: [data?.municipio || '', Validators.required],
      descripcion: [data?.descripcion || ''],
      estadoId: [data?.estado?.trim().toUpperCase() === 'CERRADO' ? 2 : 1]
    });
  }

  ngOnInit(): void {
  }

  save() {
    if (this.form.invalid) return;
    this.loading = true;

    const formValue = this.form.getRawValue();
    const tipo = this.tiposEvento.find(t => t.id === formValue.tipoId);
    const estado = this.estadosEvento.find(e => e.id === formValue.estadoId);

    const evento: EventoReal = {
      ...this.data,
      nombreEvento: formValue.nombreEvento,
      tipoEvento: tipo?.nombre || 'REAL',
      departamento: formValue.departamento,
      municipio: formValue.municipio,
      descripcion: formValue.descripcion,
      estado: estado?.nombre || 'ABIERTO',
      fechaEvento: new Date(formValue.fechaEventoStr || new Date()).toISOString()
    };

    const request$ = this.isEditing && this.data?.id
      ? this.eventosRepository.update(this.data.id, evento)
      : this.eventosRepository.create(evento);

    request$.subscribe({
      next: (result) => {
        this.dialogRef.close(result);
      },
      error: (err) => {
        console.error('Error saving event', err);
        this.loading = false;
        alert('Error al guardar: ' + (err.error?.message || 'Revisa la conexión'));
      }
    });
  }
}

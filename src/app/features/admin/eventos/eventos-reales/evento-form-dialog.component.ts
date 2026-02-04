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
import { EventosRepository, EventoReal } from '../../../../core/repositories/eventos.repository';
import { CatalogRepository } from '../../../../core/repositories/catalog.repository';

@Component({
    selector: 'app-evento-form-dialog',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatDialogModule,
        MatButtonModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatDatepickerModule,
        MatNativeDateModule
    ],
    template: `
    <h2 mat-dialog-title>{{ isEditing ? 'Editar' : 'Nuevo' }} Evento Real</h2>
    <mat-dialog-content>
      <form [formGroup]="form" class="flex flex-col gap-4 mt-2">
        
        <mat-form-field appearance="outline">
          <mat-label>Nombre del Evento</mat-label>
          <input matInput formControlName="nombreEvento" placeholder="Ej. Inundación Barrio X">
          <mat-error *ngIf="form.get('nombreEvento')?.hasError('required')">Requerido</mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Tipo de Evento</mat-label>
          <mat-select formControlName="tipoEvento">
            <mat-option value="REAL">REAL</mat-option>
            <mat-option value="SIMULACRO">SIMULACRO</mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Fecha del Evento</mat-label>
          <input matInput [matDatepicker]="picker" formControlName="fechaEvento">
          <mat-datepicker-toggle matIconSuffix [for]="picker"></mat-datepicker-toggle>
          <mat-datepicker #picker></mat-datepicker>
        </mat-form-field>

        <div class="grid grid-cols-2 gap-4">
             <!-- TODO: Populate with Catalog Data -->
            <mat-form-field appearance="outline">
              <mat-label>Departamento</mat-label>
              <input matInput formControlName="departamento" placeholder="Nombre Depto">
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Municipio</mat-label>
              <input matInput formControlName="municipio" placeholder="Nombre Mcipio">
            </mat-form-field>
        </div>

        <mat-form-field appearance="outline">
          <mat-label>Descripción</mat-label>
          <textarea matInput formControlName="descripcion" rows="3"></textarea>
        </mat-form-field>

      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancelar</button>
      <button mat-flat-button color="primary" [disabled]="form.invalid || loading" (click)="save()">
        {{ loading ? 'Guardando...' : 'Guardar' }}
      </button>
    </mat-dialog-actions>
  `
})
export class EventoFormDialogComponent implements OnInit {
    form: FormGroup;
    isEditing = false;
    loading = false;

    constructor(
        private fb: FormBuilder,
        private eventosRepository: EventosRepository,
        public dialogRef: MatDialogRef<EventoFormDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: EventoReal | null
    ) {
        this.isEditing = !!data;
        this.form = this.fb.group({
            nombreEvento: [data?.nombreEvento || '', Validators.required],
            tipoEvento: [data?.tipoEvento || 'REAL', Validators.required],
            fechaEvento: [data?.fechaEvento ? new Date(data.fechaEvento) : new Date(), Validators.required],
            // For Phase 2 simplicity, keeping inputs text, but should be catalogs ideally
            departamento: [data?.departamento || '', Validators.required],
            municipio: [data?.municipio || '', Validators.required],
            descripcion: [data?.descripcion || '']
        });
    }

    ngOnInit(): void {
    }

    save() {
        if (this.form.invalid) return;
        this.loading = true;

        const formValue = this.form.value;
        const evento: EventoReal = {
            ...this.data, // Keep ID if editing
            ...formValue,
            fechaEvento: formValue.fechaEvento.toISOString() // Ensure ISO format
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
                alert('Error al guardar. Revise consola.');
            }
        });
    }
}

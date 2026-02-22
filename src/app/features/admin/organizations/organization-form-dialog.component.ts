import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { AdminRepository, Organization } from '../../../core/repositories/admin.repository';

@Component({
    selector: 'app-organization-form-dialog',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatDialogModule,
        MatButtonModule,
        MatFormFieldModule,
        MatInputModule,
        MatSlideToggleModule
    ],
    template: `
    <h2 mat-dialog-title>{{ isEditing ? 'Editar' : 'Nueva' }} Organización</h2>
    <mat-dialog-content>
      <form [formGroup]="form" class="flex flex-col gap-4 mt-2 min-w-[350px]">
        
        <mat-form-field appearance="outline">
          <mat-label>Nombre de la Organización</mat-label>
          <input matInput formControlName="nombreOrganizacion" placeholder="Ej. Alcaldía de Envigado">
          <mat-error *ngIf="form.get('nombreOrganizacion')?.hasError('required')">Requerido</mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>NIT</mat-label>
          <input matInput formControlName="nit" placeholder="900.000.000-1">
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Dirección</mat-label>
          <input matInput formControlName="direccion">
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Teléfono</mat-label>
          <input matInput formControlName="telefono">
        </mat-form-field>

        <div class="py-2">
          <mat-slide-toggle formControlName="activa" color="primary">
            Organización Activa
          </mat-slide-toggle>
        </div>

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
export class OrganizationFormDialogComponent implements OnInit {
    form: FormGroup;
    isEditing = false;
    loading = false;

    constructor(
        private fb: FormBuilder,
        private adminRepository: AdminRepository,
        public dialogRef: MatDialogRef<OrganizationFormDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: Organization | null
    ) {
        this.isEditing = !!data;
        this.form = this.fb.group({
            nombreOrganizacion: [data?.nombreOrganizacion || '', Validators.required],
            nit: [data?.nit || ''],
            direccion: [data?.direccion || ''],
            telefono: [data?.telefono || ''],
            activa: [data?.activa ?? true]
        });
    }

    ngOnInit(): void {
    }

    save() {
        if (this.form.invalid) return;
        this.loading = true;

        const org: Organization = {
            ...this.data,
            ...this.form.value
        };

        const request$ = this.isEditing && this.data?.id
            ? this.adminRepository.updateOrganization(this.data.id, org)
            : this.adminRepository.createOrganization(org);

        request$.subscribe({
            next: (result) => this.dialogRef.close(result),
            error: (err) => {
                console.error('Error saving organization', err);
                this.loading = false;
                alert('Error al guardar la organización.');
            }
        });
    }
}

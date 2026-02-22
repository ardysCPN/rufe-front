import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { AdminRepository, Organization } from '../../../core/repositories/admin.repository';

@Component({
  selector: 'app-organization-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSlideToggleModule
  ],
  template: `
    <div class="glass-dialog p-6 min-w-[400px]">
      <h2 mat-dialog-title class="text-2xl font-bold mb-4 bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
        {{ data ? 'Editar Organización' : 'Nueva Organización' }}
      </h2>
      
      <form [formGroup]="orgForm" (ngSubmit)="onSubmit()">
        <mat-dialog-content class="flex flex-col gap-4">
          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Nombre de la Organización</mat-label>
            <input matInput formControlName="nombreOrganizacion" placeholder="Ej. Alcaldía de Quibdó">
            <mat-error *ngIf="orgForm.get('nombreOrganizacion')?.hasError('required')">El nombre es obligatorio</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="w-full">
            <mat-label>NIT</mat-label>
            <input matInput formControlName="nit" placeholder="Ej. 800.123.456-7">
          </mat-form-field>

          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Dirección</mat-label>
            <input matInput formControlName="direccion">
          </mat-form-field>

          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Teléfono</mat-label>
            <input matInput formControlName="telefono">
          </mat-form-field>

          <div class="py-2">
            <mat-slide-toggle formControlName="activa" color="primary">
              Organización Activa
            </mat-slide-toggle>
          </div>
        </mat-dialog-content>

        <mat-dialog-actions align="end" class="mt-6 gap-2">
          <button mat-button (click)="onCancel()" type="button" class="rounded-lg">Cancelar</button>
          <button mat-flat-button color="primary" type="submit" [disabled]="orgForm.invalid" class="rounded-lg bg-emerald-600 text-white shadow-lg shadow-emerald-500/20">
            {{ data ? 'Actualizar' : 'Crear' }}
          </button>
        </mat-dialog-actions>
      </form>
    </div>
  `,
  styles: [`
    .glass-dialog {
      background: rgba(255, 255, 255, 0.8);
      backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.3);
      border-radius: 20px;
    }
  `]
})
export class OrganizationFormDialogComponent {
  orgForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<OrganizationFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Organization | null,
    private adminRepository: AdminRepository
  ) {
    this.orgForm = this.fb.group({
      nombreOrganizacion: [data?.nombreOrganizacion || '', Validators.required],
      nit: [data?.nit || ''],
      direccion: [data?.direccion || ''],
      telefono: [data?.telefono || ''],
      activa: [data?.activa !== false]
    });
  }

  onSubmit() {
    if (this.orgForm.valid) {
      const orgData = this.orgForm.value;
      const obs = this.data
        ? this.adminRepository.updateOrganization(this.data.id!, orgData)
        : this.adminRepository.createOrganization(orgData);

      obs.subscribe({
        next: () => this.dialogRef.close(true),
        error: (err) => console.error('Error saving organization', err)
      });
    }
  }

  onCancel() {
    this.dialogRef.close();
  }
}

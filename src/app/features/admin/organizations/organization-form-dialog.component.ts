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
    <div class="glass-card p-8 min-w-[450px] rounded-3xl border border-white/20">
      <h2 mat-dialog-title class="text-2xl font-bold mb-6 bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
        {{ data ? 'Editar Organización' : 'Nueva Organización' }}
      </h2>
      
      <form [formGroup]="orgForm" (ngSubmit)="onSubmit()">
        <mat-dialog-content class="flex flex-col gap-6 !p-0 overflow-visible">
          <mat-form-field appearance="outline">
            <mat-label>Nombre de la Organización</mat-label>
            <input matInput formControlName="nombreOrganizacion" placeholder="Ej. Alcaldía de Quibdó">
            <mat-icon matSuffix class="text-emerald-500">business</mat-icon>
            <mat-error *ngIf="orgForm.get('nombreOrganizacion')?.hasError('required')">El nombre es obligatorio</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>NIT</mat-label>
            <input matInput formControlName="nit" placeholder="Ej. 800.123.456-7">
            <mat-icon matSuffix class="text-teal-500">fingerprint</mat-icon>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Dirección</mat-label>
            <input matInput formControlName="direccion">
            <mat-icon matSuffix class="text-indigo-500">place</mat-icon>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Teléfono</mat-label>
            <input matInput formControlName="telefono">
            <mat-icon matSuffix class="text-blue-500">phone</mat-icon>
          </mat-form-field>

          <div class="py-2 flex items-center justify-between bg-emerald-50/30 dark:bg-emerald-900/10 p-4 rounded-xl border border-emerald-100/20">
            <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Organización Activa</span>
            <mat-slide-toggle formControlName="activa" color="primary"></mat-slide-toggle>
          </div>
        </mat-dialog-content>

        <mat-dialog-actions align="end" class="mt-8 gap-3 !p-0">
          <button mat-button (click)="onCancel()" type="button" class="px-6 rounded-xl font-medium">Cancelar</button>
          <button mat-flat-button color="primary" type="submit" [disabled]="orgForm.invalid" 
                  class="px-10 py-2 rounded-xl bg-emerald-600 shadow-lg shadow-emerald-500/20 font-bold transition-all hover:scale-[1.02]">
            {{ data ? 'Actualizar' : 'Crear' }}
          </button>
        </mat-dialog-actions>
      </form>
    </div>
  `,
  styles: [`
    :host { display: block; }
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

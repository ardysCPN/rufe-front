import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { AdminRepository, Role } from '../../../core/repositories/admin.repository';

@Component({
  selector: 'app-role-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  template: `
    <div class="glass-dialog p-6 min-w-[400px]">
      <h2 mat-dialog-title class="text-2xl font-bold mb-4 bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
        {{ data ? 'Editar Rol' : 'Nuevo Rol' }}
      </h2>
      
      <form [formGroup]="roleForm" (ngSubmit)="onSubmit()">
        <mat-dialog-content class="flex flex-col gap-4">
          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Nombre del Rol</mat-label>
            <input matInput formControlName="nombreRol" placeholder="Ej. COORDINADOR_ZONAL">
            <mat-error *ngIf="roleForm.get('nombreRol')?.hasError('required')">El nombre es obligatorio</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Descripción</mat-label>
            <textarea matInput formControlName="descripcion" rows="3" placeholder="Descripción detallada del rol"></textarea>
          </mat-form-field>
        </mat-dialog-content>

        <mat-dialog-actions align="end" class="mt-6 gap-2">
          <button mat-button (click)="onCancel()" type="button" class="rounded-lg">Cancelar</button>
          <button mat-flat-button color="primary" type="submit" [disabled]="roleForm.invalid" class="rounded-lg bg-emerald-600 text-white shadow-lg shadow-emerald-500/20">
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
export class RoleFormDialogComponent {
  roleForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<RoleFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Role | null,
    private adminRepository: AdminRepository
  ) {
    this.roleForm = this.fb.group({
      nombreRol: [data?.nombreRol || '', Validators.required],
      descripcion: [data?.descripcion || '']
    });
  }

  onSubmit() {
    if (this.roleForm.valid) {
      const roleData = this.roleForm.value;
      const obs = this.data
        ? this.adminRepository.updateRole(this.data.id!, roleData)
        : this.adminRepository.createRole(roleData);

      obs.subscribe({
        next: () => this.dialogRef.close(true),
        error: (err) => console.error('Error saving role', err)
      });
    }
  }

  onCancel() {
    this.dialogRef.close();
  }
}

import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { AdminRepository, Role } from '../../../core/repositories/admin.repository';

@Component({
    selector: 'app-role-form-dialog',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatDialogModule,
        MatButtonModule,
        MatFormFieldModule,
        MatInputModule
    ],
    template: `
    <h2 mat-dialog-title>{{ isEditing ? 'Editar' : 'Nuevo' }} Rol</h2>
    <mat-dialog-content>
      <form [formGroup]="form" class="flex flex-col gap-4 mt-2 min-w-[350px]">
        
        <mat-form-field appearance="outline">
          <mat-label>Nombre del Rol</mat-label>
          <input matInput formControlName="nombreRol" placeholder="Ej. COORDINADOR_ZONAL">
          <mat-error *ngIf="form.get('nombreRol')?.hasError('required')">Requerido</mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Descripción</mat-label>
          <textarea matInput formControlName="descripcion" rows="3" placeholder="Describe las responsabilidades del rol..."></textarea>
          <mat-error *ngIf="form.get('descripcion')?.hasError('required')">Requerido</mat-error>
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
export class RoleFormDialogComponent implements OnInit {
    form: FormGroup;
    isEditing = false;
    loading = false;

    constructor(
        private fb: FormBuilder,
        private adminRepository: AdminRepository,
        public dialogRef: MatDialogRef<RoleFormDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: Role | null
    ) {
        this.isEditing = !!data;
        this.form = this.fb.group({
            nombreRol: [data?.nombreRol || '', Validators.required],
            descripcion: [data?.descripcion || '', Validators.required]
        });
    }

    ngOnInit(): void {
    }

    save() {
        if (this.form.invalid) return;
        this.loading = true;

        const role: Role = {
            ...this.data,
            ...this.form.value
        };

        const request$ = this.isEditing && this.data?.id
            ? this.adminRepository.updateRole(this.data.id, role)
            : this.adminRepository.createRole(role);

        request$.subscribe({
            next: (result) => this.dialogRef.close(result),
            error: (err) => {
                console.error('Error saving role', err);
                this.loading = false;
                alert('Error al guardar el rol.');
            }
        });
    }
}

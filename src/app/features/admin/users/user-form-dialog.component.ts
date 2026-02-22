import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { AdminRepository, User, Role } from '../../../core/repositories/admin.repository';

@Component({
    selector: 'app-user-form-dialog',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatDialogModule,
        MatButtonModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatSlideToggleModule
    ],
    template: `
    <h2 mat-dialog-title>{{ isEditing ? 'Editar' : 'Nuevo' }} Usuario</h2>
    <mat-dialog-content>
      <form [formGroup]="form" class="flex flex-col gap-4 mt-2 min-w-[350px]">
        
        <mat-form-field appearance="outline">
          <mat-label>Nombre Completo</mat-label>
          <input matInput formControlName="nombreCompleto" placeholder="Ej. Juan Pérez">
          <mat-error *ngIf="form.get('nombreCompleto')?.hasError('required')">Requerido</mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Email</mat-label>
          <input matInput formControlName="email" type="email" placeholder="email@ejemplo.com">
          <mat-error *ngIf="form.get('email')?.hasError('required')">Requerido</mat-error>
          <mat-error *ngIf="form.get('email')?.hasError('email')">Email inválido</mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" *ngIf="!isEditing">
          <mat-label>Contraseña</mat-label>
          <input matInput formControlName="password" type="password">
          <mat-error *ngIf="form.get('password')?.hasError('required')">Requerido</mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Rol</mat-label>
          <mat-select formControlName="rolId">
            <mat-option *ngFor="let role of roles" [value]="role.id">
              {{ role.nombreRol }}
            </mat-option>
          </mat-select>
          <mat-error *ngIf="form.get('rolId')?.hasError('required')">Seleccione un rol</mat-error>
        </mat-form-field>

        <div class="py-2">
          <mat-slide-toggle formControlName="activo" color="primary">
            Usuario Activo
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
export class UserFormDialogComponent implements OnInit {
    form: FormGroup;
    isEditing = false;
    loading = false;
    roles: Role[] = [];

    constructor(
        private fb: FormBuilder,
        private adminRepository: AdminRepository,
        public dialogRef: MatDialogRef<UserFormDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: User | null
    ) {
        this.isEditing = !!data;
        this.form = this.fb.group({
            nombreCompleto: [data?.nombreCompleto || '', Validators.required],
            email: [data?.email || '', [Validators.required, Validators.email]],
            password: ['', this.isEditing ? [] : [Validators.required]],
            rolId: [data?.rolId || null, Validators.required],
            activo: [data?.activo ?? true]
        });
    }

    ngOnInit(): void {
        this.loadRoles();
    }

    loadRoles() {
        this.adminRepository.getRoles().subscribe({
            next: (roles) => this.roles = roles,
            error: (err) => console.error('Error loading roles', err)
        });
    }

    save() {
        if (this.form.invalid) return;
        this.loading = true;

        const user: User = {
            ...this.data,
            ...this.form.value
        };

        const request$ = this.isEditing && this.data?.id
            ? this.adminRepository.updateUser(this.data.id, user)
            : this.adminRepository.createUser(user);

        request$.subscribe({
            next: (result) => this.dialogRef.close(result),
            error: (err) => {
                console.error('Error saving user', err);
                this.loading = false;
                alert('Error al guardar el usuario.');
            }
        });
    }
}

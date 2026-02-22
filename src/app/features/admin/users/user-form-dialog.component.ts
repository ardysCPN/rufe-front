import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
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
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatSlideToggleModule
  ],
  template: `
    <div class="glass-dialog p-6 min-w-[400px]">
      <h2 mat-dialog-title class="text-2xl font-bold mb-4 bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
        {{ data ? 'Editar Usuario' : 'Nuevo Usuario' }}
      </h2>
      
      <form [formGroup]="userForm" (ngSubmit)="onSubmit()">
        <mat-dialog-content class="flex flex-col gap-4">
          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Nombre Completo</mat-label>
            <input matInput formControlName="nombreCompleto" placeholder="Ej. Juan Pérez">
            <mat-error *ngIf="userForm.get('nombreCompleto')?.hasError('required')">El nombre es obligatorio</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Correo Electrónico</mat-label>
            <input matInput formControlName="email" type="email" placeholder="email@ejemplo.com">
            <mat-error *ngIf="userForm.get('email')?.hasError('required')">El correo es obligatorio</mat-error>
            <mat-error *ngIf="userForm.get('email')?.hasError('email')">Correo inválido</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="w-full" *ngIf="!data">
            <mat-label>Contraseña</mat-label>
            <input matInput formControlName="password" type="password">
            <mat-error *ngIf="userForm.get('password')?.hasError('required')">La contraseña es obligatoria</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Rol</mat-label>
            <mat-select formControlName="rolId">
              <mat-option *ngFor="let rol of roles" [value]="rol.id">
                {{ rol.nombreRol }}
              </mat-option>
            </mat-select>
            <mat-error *ngIf="userForm.get('rolId')?.hasError('required')">El rol es obligatorio</mat-error>
          </mat-form-field>

          <div class="py-2">
            <mat-slide-toggle formControlName="activo" color="primary">
              Usuario Activo
            </mat-slide-toggle>
          </div>
        </mat-dialog-content>

        <mat-dialog-actions align="end" class="mt-6 gap-2">
          <button mat-button (click)="onCancel()" type="button" class="rounded-lg">Cancelar</button>
          <button mat-flat-button color="primary" type="submit" [disabled]="userForm.invalid" class="rounded-lg bg-emerald-600 text-white shadow-lg shadow-emerald-500/20">
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
export class UserFormDialogComponent implements OnInit {
  userForm: FormGroup;
  roles: Role[] = [];

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<UserFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: User | null,
    private adminRepository: AdminRepository
  ) {
    this.userForm = this.fb.group({
      nombreCompleto: [data?.nombreCompleto || '', Validators.required],
      email: [data?.email || '', [Validators.required, Validators.email]],
      password: ['', data ? [] : [Validators.required]],
      rolId: [data?.rolId || '', Validators.required],
      activo: [data?.activo !== false] // Default true
    });
  }

  ngOnInit(): void {
    this.loadRoles();
  }

  loadRoles() {
    this.adminRepository.getRoles().subscribe({
      next: (data) => this.roles = data,
      error: (err) => console.error('Error loading roles', err)
    });
  }

  onSubmit() {
    if (this.userForm.valid) {
      const userData = this.userForm.value;
      const obs = this.data
        ? this.adminRepository.updateUser(this.data.id!, userData)
        : this.adminRepository.createUser(userData);

      obs.subscribe({
        next: () => this.dialogRef.close(true),
        error: (err) => console.error('Error saving user', err)
      });
    }
  }

  onCancel() {
    this.dialogRef.close();
  }
}

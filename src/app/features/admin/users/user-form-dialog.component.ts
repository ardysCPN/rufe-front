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
    <div class="glass-card p-8 min-w-[450px] rounded-3xl border border-white/20">
      <h2 mat-dialog-title class="text-2xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
        {{ data ? 'Editar Usuario' : 'Nuevo Usuario' }}
      </h2>
      
      <form [formGroup]="userForm" (ngSubmit)="onSubmit()">
        <mat-dialog-content class="flex flex-col gap-6 !p-0 overflow-visible">
          <mat-form-field appearance="outline">
            <mat-label>Nombre Completo</mat-label>
            <input matInput formControlName="nombreCompleto" placeholder="Ej. Juan Pérez">
            <mat-icon matSuffix class="text-blue-500">person</mat-icon>
            <mat-error *ngIf="userForm.get('nombreCompleto')?.hasError('required')">El nombre es obligatorio</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Correo Electrónico</mat-label>
            <input matInput formControlName="email" type="email" placeholder="email@ejemplo.com">
            <mat-icon matSuffix class="text-indigo-500">email</mat-icon>
            <mat-error *ngIf="userForm.get('email')?.hasError('required')">El correo es obligatorio</mat-error>
            <mat-error *ngIf="userForm.get('email')?.hasError('email')">Correo inválido</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" *ngIf="!data">
            <mat-label>Contraseña</mat-label>
            <input matInput formControlName="password" type="password">
            <mat-icon matSuffix class="text-purple-500">lock</mat-icon>
            <mat-error *ngIf="userForm.get('password')?.hasError('required')">La contraseña es obligatoria</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Rol</mat-label>
            <mat-select formControlName="rolId">
              <mat-option *ngFor="let rol of roles" [value]="rol.id">
                {{ rol.nombreRol }}
              </mat-option>
            </mat-select>
            <mat-icon matSuffix class="text-emerald-500">admin_panel_settings</mat-icon>
            <mat-error *ngIf="userForm.get('rolId')?.hasError('required')">El rol es obligatorio</mat-error>
          </mat-form-field>

          <div class="py-2 flex items-center justify-between bg-blue-50/30 dark:bg-blue-900/10 p-4 rounded-xl border border-blue-100/20">
            <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Usuario Activo</span>
            <mat-slide-toggle formControlName="activo" color="primary"></mat-slide-toggle>
          </div>
        </mat-dialog-content>

        <mat-dialog-actions align="end" class="mt-8 gap-3 !p-0">
          <button mat-button (click)="onCancel()" type="button" class="px-6 rounded-xl font-medium">Cancelar</button>
          <button mat-flat-button color="primary" type="submit" [disabled]="userForm.invalid" 
                  class="px-10 py-2 rounded-xl bg-blue-600 shadow-lg shadow-blue-500/20 font-bold transition-all hover:scale-[1.02]">
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

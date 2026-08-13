import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AdminRepository, User, Role, Organization } from '../../../core/repositories/admin.repository';
import { AuthService } from '../../../core/services/auth.service';
import { InputComponent } from '../../../shared/components/input/input.component';
import { SelectComponent } from '../../../shared/components/select/select.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { ICatalogoItemResponse } from '../../../models/catalogs.model';

@Component({
  selector: 'app-user-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatSnackBarModule,
    InputComponent,
    SelectComponent,
    ButtonComponent
  ],
  template: `
    <div class="bg-white dark:bg-gray-800 p-6 md:p-8 w-full max-w-xl mx-auto rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700">
      <h2 mat-dialog-title class="text-2xl font-bold mb-4 text-gray-900 dark:text-white !p-0">
        {{ data ? 'Editar Usuario' : 'Nuevo Usuario' }}
      </h2>
      
      <form [formGroup]="userForm" (ngSubmit)="onSubmit()">
        <mat-dialog-content class="flex flex-col gap-6 !p-0 overflow-visible mt-4">
          <app-input 
            label="Nombre Completo" 
            id="nombreCompleto" 
            name="nombreCompleto" 
            formControlName="nombreCompleto" 
            [required]="true"
            placeholder="Ej. Juan Pérez">
          </app-input>

          <app-input 
            label="Correo Electrónico" 
            id="email" 
            name="email" 
            type="email"
            formControlName="email" 
            [required]="true"
            placeholder="email@ejemplo.com">
          </app-input>

          <app-input 
            *ngIf="!data"
            label="Contraseña" 
            id="password" 
            name="password" 
            type="password"
            formControlName="password" 
            [required]="true">
          </app-input>

          <!-- Organization Selector for SuperAdmin -->
          <app-select 
            *ngIf="isGlobalAdmin"
            label="Organización / Entidad" 
            id="organizacionId" 
            name="organizacionId" 
            [options]="orgsForSelect"
            formControlName="organizacionId" 
            [required]="true">
          </app-select>

          <app-select 
            label="Rol" 
            id="rolId" 
            name="rolId" 
            [options]="rolesForSelect"
            formControlName="rolId" 
            [required]="true">
          </app-select>

          <div class="py-4 px-4 flex items-center justify-between bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-100 dark:border-gray-700">
            <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Usuario Activo</span>
            <input type="checkbox" formControlName="activo" class="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600">
          </div>
        </mat-dialog-content>

        <mat-dialog-actions align="end" class="mt-8 gap-3 !p-0">
          <app-button variant="basic" (click)="onCancel()" type="button">
            Cancelar
          </app-button>
          <app-button type="submit" [disabled]="userForm.invalid" variant="primary" customClasses="px-8">
            {{ data ? 'Actualizar' : 'Crear' }}
          </app-button>
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
  rolesForSelect: ICatalogoItemResponse[] = [];
  orgsForSelect: ICatalogoItemResponse[] = [];
  isGlobalAdmin = false;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<UserFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: User | null,
    private adminRepository: AdminRepository,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {
    const currentUser = this.authService.currentUserValue;
    this.isGlobalAdmin = currentUser?.rolNombre === 'ADMIN_GLOBAL';

    this.userForm = this.fb.group({
      nombreCompleto: [data?.nombreCompleto || '', Validators.required],
      email: [data?.email || '', [Validators.required, Validators.email]],
      password: ['', data ? [] : [Validators.required]],
      organizacionId: [data?.organizacionId || '', this.isGlobalAdmin ? [Validators.required] : []],
      rolId: [data?.rolId || '', Validators.required],
      activo: [data?.activo !== false]
    });
  }

  ngOnInit(): void {
    this.loadRoles();
    if (this.isGlobalAdmin) {
      this.loadOrganizations();
    }
  }

  loadRoles() {
    this.adminRepository.getRoles().subscribe({
      next: (data) => {
        this.roles = data;
        this.rolesForSelect = data.map(r => ({ id: r.id!, nombre: r.nombreRol }));
      },
      error: (err) => console.error('Error loading roles', err)
    });
  }

  loadOrganizations() {
    this.adminRepository.getOrganizations().subscribe({
      next: (data) => {
        this.orgsForSelect = data.map(o => ({ id: o.id!, nombre: o.nombreOrganizacion }));
      },
      error: (err) => console.error('Error loading organizations', err)
    });
  }

  onSubmit() {
    if (this.userForm.valid) {
      const userData = { ...this.userForm.value };
      if (userData.organizacionId) {
        userData.organizacionId = Number(userData.organizacionId);
      }
      
      const obs = this.data
        ? this.adminRepository.updateUser(this.data.id!, userData)
        : this.adminRepository.createUser(userData);

      obs.subscribe({
        next: () => {
          this.snackBar.open(
            `Usuario ${this.data ? 'actualizado' : 'creado'} con éxito`,
            'Cerrar',
            { duration: 3000, panelClass: ['snackbar-success'] }
          );
          this.dialogRef.close(true);
        },
        error: (err) => {
          console.error('Error saving user', err);
          this.snackBar.open('Error al guardar el usuario', 'Cerrar', {
            duration: 5000,
            panelClass: ['snackbar-error']
          });
        }
      });
    }
  }

  onCancel() {
    this.dialogRef.close();
  }
}

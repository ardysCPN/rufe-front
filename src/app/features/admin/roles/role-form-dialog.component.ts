import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AdminRepository, Role } from '../../../core/repositories/admin.repository';
import { InputComponent } from '../../../shared/components/input/input.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';

@Component({
  selector: 'app-role-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatSnackBarModule,
    InputComponent,
    ButtonComponent
  ],
  template: `
    <div class="bg-white dark:bg-gray-800 p-6 md:p-8 w-full max-w-lg mx-auto rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700">
      <h2 mat-dialog-title class="text-2xl font-bold mb-6 text-gray-900 dark:text-white !p-0">
        {{ data ? 'Editar Rol' : 'Nuevo Rol' }}
      </h2>
      
      <form [formGroup]="roleForm" (ngSubmit)="onSubmit()">
        <mat-dialog-content class="flex flex-col gap-6 !p-0 overflow-visible mt-4">
          <app-input 
            label="Nombre del Rol" 
            id="nombreRol" 
            name="nombreRol" 
            formControlName="nombreRol" 
            [required]="true"
            placeholder="Ej. COORDINADOR_ZONAL">
          </app-input>

          <div class="flex flex-col gap-2">
            <label class="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-200">
              Descripción
            </label>
            <textarea 
              formControlName="descripcion" 
              rows="3" 
              class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 dark:bg-gray-800 dark:text-white dark:ring-gray-700 dark:focus:ring-indigo-500"
              placeholder="Descripción detallada del rol">
            </textarea>
          </div>
        </mat-dialog-content>

        <mat-dialog-actions align="end" class="mt-8 gap-3 !p-0">
          <app-button variant="basic" (click)="onCancel()" type="button">
            Cancelar
          </app-button>
          <app-button type="submit" [disabled]="roleForm.invalid" variant="primary" customClasses="px-8">
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
export class RoleFormDialogComponent {
  roleForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<RoleFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Role | null,
    private adminRepository: AdminRepository,
    private snackBar: MatSnackBar
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
        next: () => {
          this.snackBar.open(
            `Rol ${this.data ? 'actualizado' : 'creado'} con éxito`,
            'Cerrar',
            { duration: 3000, panelClass: ['snackbar-success'] }
          );
          this.dialogRef.close(true);
        },
        error: (err) => {
          console.error('Error saving role', err);
          this.snackBar.open('Error al guardar el rol', 'Cerrar', {
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

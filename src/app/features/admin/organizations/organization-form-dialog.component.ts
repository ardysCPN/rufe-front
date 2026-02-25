import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AdminRepository, Organization } from '../../../core/repositories/admin.repository';
import { InputComponent } from '../../../shared/components/input/input.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';

@Component({
  selector: 'app-organization-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatSnackBarModule,
    InputComponent,
    ButtonComponent
  ],
  // ... rest of template same ...
  template: `
    <div class="bg-white dark:bg-gray-800 p-6 md:p-8 w-full max-w-lg mx-auto rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700">
      <h2 mat-dialog-title class="text-2xl font-bold mb-6 text-gray-900 dark:text-white !p-0">
        {{ data ? 'Editar Organización' : 'Nueva Organización' }}
      </h2>
      
      <form [formGroup]="orgForm" (ngSubmit)="onSubmit()">
        <mat-dialog-content class="flex flex-col gap-6 !p-0 overflow-visible mt-4">
          <app-input 
            label="Nombre de la Organización" 
            id="nombreOrganizacion" 
            name="nombreOrganizacion" 
            formControlName="nombreOrganizacion" 
            [required]="true"
            placeholder="Ej. Alcaldía de Quibdó">
          </app-input>

          <app-input 
            label="NIT" 
            id="nit" 
            name="nit" 
            formControlName="nit" 
            placeholder="Ej. 800.123.456-7">
          </app-input>

          <app-input 
            label="Dirección" 
            id="direccion" 
            name="direccion" 
            formControlName="direccion">
          </app-input>

          <app-input 
            label="Teléfono" 
            id="telefono" 
            name="telefono" 
            formControlName="telefono">
          </app-input>

          <div class="py-4 px-4 flex items-center justify-between bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-100 dark:border-gray-700">
            <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Organización Activa</span>
            <input type="checkbox" formControlName="activa" class="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600">
          </div>
        </mat-dialog-content>

        <mat-dialog-actions align="end" class="mt-8 gap-3 !p-0">
          <app-button variant="basic" (click)="onCancel()" type="button">
            Cancelar
          </app-button>
          <app-button type="submit" [disabled]="orgForm.invalid" variant="primary" customClasses="px-8">
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
export class OrganizationFormDialogComponent {
  orgForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<OrganizationFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Organization | null,
    private adminRepository: AdminRepository,
    private snackBar: MatSnackBar
  ) {
    console.log('OrganizationFormDialogComponent initialized with data:', data);
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
        next: () => {
          this.snackBar.open(
            `Organización ${this.data ? 'actualizada' : 'creada'} con éxito`,
            'Cerrar',
            { duration: 3000, panelClass: ['snackbar-success'] }
          );
          this.dialogRef.close(true);
        },
        error: (err) => {
          console.error('Error saving organization', err);
          this.snackBar.open('Error al guardar la organización', 'Cerrar', {
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

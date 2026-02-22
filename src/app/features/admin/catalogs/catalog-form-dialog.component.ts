import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { InputComponent } from '../../../shared/components/input/input.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';

export interface CatalogDialogData {
  title: string;
  item?: { id?: number; nombre: string };
}

@Component({
  selector: 'app-catalog-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    InputComponent,
    ButtonComponent
  ],
  template: `
    <div class="bg-white dark:bg-gray-800 p-6 md:p-8 w-full max-w-sm mx-auto rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700">
      <h2 mat-dialog-title class="text-2xl font-bold mb-6 text-gray-900 dark:text-white !p-0">
        {{ data.title }}
      </h2>
      
      <form [formGroup]="catalogForm" (ngSubmit)="onSubmit()">
        <mat-dialog-content class="flex flex-col gap-6 !p-0 overflow-visible mt-4">
          <app-input 
            label="Nombre" 
            id="nombre" 
            name="nombre" 
            formControlName="nombre" 
            [required]="true"
            placeholder="Ej. Nuevo Item"
            cdkFocusInitial>
          </app-input>
        </mat-dialog-content>

        <mat-dialog-actions align="end" class="mt-8 gap-3 !p-0">
          <app-button variant="basic" (click)="onCancel()" type="button">
            Cancelar
          </app-button>
          <app-button type="submit" [disabled]="catalogForm.invalid" variant="primary" customClasses="px-8">
            {{ data.item ? 'Actualizar' : 'Crear' }}
          </app-button>
        </mat-dialog-actions>
      </form>
    </div>
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class CatalogFormDialogComponent {
  catalogForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<CatalogFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: CatalogDialogData
  ) {
    this.catalogForm = this.fb.group({
      nombre: [data.item?.nombre || '', Validators.required]
    });
  }

  onSubmit() {
    if (this.catalogForm.valid) {
      this.dialogRef.close(this.catalogForm.value);
    }
  }

  onCancel() {
    this.dialogRef.close();
  }
}

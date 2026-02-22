import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

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
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  template: `
    <div class="glass-card p-8 min-w-[450px] rounded-3xl border border-white/20">
      <h2 mat-dialog-title class="text-2xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
        {{ data.title }}
      </h2>
      
      <form [formGroup]="catalogForm" (ngSubmit)="onSubmit()">
        <mat-dialog-content class="flex flex-col gap-6 !p-0 overflow-visible">
          <mat-form-field appearance="outline">
            <mat-label>Nombre</mat-label>
            <input matInput formControlName="nombre" placeholder="Ej. Nuevo Item" cdkFocusInitial>
            <mat-icon matSuffix class="text-blue-500">label</mat-icon>
            <mat-error *ngIf="catalogForm.get('nombre')?.hasError('required')">El nombre es obligatorio</mat-error>
          </mat-form-field>
        </mat-dialog-content>

        <mat-dialog-actions align="end" class="mt-8 gap-3 !p-0">
          <button mat-button (click)="onCancel()" type="button" class="px-6 rounded-xl font-medium">Cancelar</button>
          <button mat-flat-button color="primary" type="submit" [disabled]="catalogForm.invalid" 
                  class="px-10 py-2 rounded-xl bg-blue-600 shadow-lg shadow-blue-500/20 font-bold transition-all hover:scale-[1.02]">
            {{ data.item ? 'Actualizar' : 'Crear' }}
          </button>
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

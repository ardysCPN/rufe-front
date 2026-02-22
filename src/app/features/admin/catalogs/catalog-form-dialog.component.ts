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
    <div class="glass-dialog p-6 min-w-[400px]">
      <h2 mat-dialog-title class="text-2xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
        {{ data.title }}
      </h2>
      
      <form [formGroup]="catalogForm" (ngSubmit)="onSubmit()">
        <mat-dialog-content class="flex flex-col gap-4">
          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Nombre</mat-label>
            <input matInput formControlName="nombre" placeholder="Ej. Nuevo Item" cdkFocusInitial>
            <mat-error *ngIf="catalogForm.get('nombre')?.hasError('required')">El nombre es obligatorio</mat-error>
          </mat-form-field>
        </mat-dialog-content>

        <mat-dialog-actions align="end" class="mt-6 gap-2">
          <button mat-button (click)="onCancel()" type="button" class="rounded-lg">Cancelar</button>
          <button mat-flat-button color="primary" type="submit" [disabled]="catalogForm.invalid" class="rounded-lg bg-blue-600 text-white shadow-lg shadow-blue-500/20">
            {{ data.item ? 'Actualizar' : 'Crear' }}
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

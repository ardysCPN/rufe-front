import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { EventosRepository } from '../../../core/repositories/eventos.repository';

@Component({
  selector: 'app-event-config',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule
  ],
  template: `
    <div class="p-8 max-w-4xl mx-auto animate-fade-in-up">
      <div class="mb-8 flex items-center gap-4">
        <button mat-icon-button (click)="goBack()">
           <mat-icon>arrow_back</mat-icon>
        </button>
        <div>
           <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Configurar Nuevo Evento</h1>
           <p class="text-gray-500">Define los detalles del evento o emergencia</p>
        </div>
      </div>

      <div class="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-gray-800">
        <form [formGroup]="eventForm" (ngSubmit)="onSubmit()" class="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          <mat-form-field appearance="outline" class="md:col-span-2">
            <mat-label>Nombre del Evento</mat-label>
            <input matInput formControlName="nombreEvento" placeholder="Ej: Inundación Zona Norte 2026">
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Tipo de Evento</mat-label>
            <mat-select formControlName="tipoEvento">
              <mat-option value="REAL">REAL</mat-option>
              <mat-option value="SIMULACRO">SIMULACRO</mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Fecha del Evento</mat-label>
            <input matInput [matDatepicker]="picker" formControlName="fechaEvento">
            <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
            <mat-datepicker #picker></mat-datepicker>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Departamento</mat-label>
            <input matInput formControlName="departamento">
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Municipio</mat-label>
            <input matInput formControlName="municipio">
          </mat-form-field>

          <mat-form-field appearance="outline" class="md:col-span-2">
            <mat-label>Descripción / Observaciones</mat-label>
            <textarea matInput formControlName="descripcion" rows="4"></textarea>
          </mat-form-field>

          <div class="md:col-span-2 flex justify-end gap-3 mt-4">
            <button mat-button type="button" (click)="goBack()">Cancelar</button>
            <button mat-flat-button color="primary" [disabled]="eventForm.invalid" class="px-8">
               Guardar Configuración
            </button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class EventConfigComponent {
  eventForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private repo: EventosRepository
  ) {
    this.eventForm = this.fb.group({
      nombreEvento: ['', Validators.required],
      tipoEvento: ['REAL', Validators.required],
      fechaEvento: [new Date(), Validators.required],
      departamento: ['', Validators.required],
      municipio: ['', Validators.required],
      descripcion: ['']
    });
  }

  onSubmit() {
    if (this.eventForm.valid) {
      this.repo.create(this.eventForm.value).subscribe(() => {
        this.router.navigate(['/events/list']);
      });
    }
  }

  goBack() {
    this.router.navigate(['/events/list']);
  }
}

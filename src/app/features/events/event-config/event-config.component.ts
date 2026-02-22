import { Component, OnInit } from '@angular/core';
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
import { CatalogRepository } from '../../../core/repositories/catalog.repository';
import { ICatalogoDepartamento, ICatalogoMunicipio } from '../../../models/catalogs.model';

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
    <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-950 dark:to-blue-950 p-4 md:p-8 animate-fade-in">
      <div class="max-w-4xl mx-auto">
        
        <!-- Header -->
        <div class="mb-8 flex items-center gap-4">
          <button mat-icon-button (click)="goBack()" class="bg-white/50 dark:bg-gray-800/50 backdrop-blur-md shadow-sm">
             <mat-icon>arrow_back</mat-icon>
          </button>
          <div>
             <h1 class="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
               Configurar Nuevo Evento
             </h1>
             <p class="text-gray-500 dark:text-gray-400">Define los detalles del evento o emergencia</p>
          </div>
        </div>

        <!-- Glass Card -->
        <div class="bg-white/70 dark:bg-gray-900/40 backdrop-blur-xl rounded-3xl shadow-2xl p-6 md:p-10 border border-white/20 dark:border-gray-800 animate-fade-in-up">
          <form [formGroup]="eventForm" (ngSubmit)="onSubmit()" class="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <mat-form-field appearance="outline" class="md:col-span-2">
              <mat-label>Nombre del Evento</mat-label>
              <input matInput formControlName="nombreEvento" placeholder="Ej: Inundación Zona Norte 2026">
              <mat-icon matPrefix class="mr-2 text-blue-500">campaign</mat-icon>
              <mat-error *ngIf="eventForm.get('nombreEvento')?.hasError('required')">Requerido</mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Tipo de Evento</mat-label>
              <mat-select formControlName="tipoEvento">
                <mat-option value="REAL">REAL</mat-option>
                <mat-option value="SIMULACRO">SIMULACRO</mat-option>
              </mat-select>
              <mat-icon matPrefix class="mr-2 text-indigo-500">category</mat-icon>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Fecha del Evento</mat-label>
              <input matInput [matDatepicker]="picker" formControlName="fechaEvento">
              <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
              <mat-datepicker #picker></mat-datepicker>
              <mat-icon matPrefix class="mr-2 text-purple-500">event</mat-icon>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Departamento</mat-label>
              <mat-select formControlName="departamento" (selectionChange)="onDeptoChange($event.value)">
                <mat-option *ngFor="let depto of departamentos" [value]="depto.nombre">
                  {{ depto.nombre }}
                </mat-option>
              </mat-select>
              <mat-icon matPrefix class="mr-2 text-emerald-500">map</mat-icon>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Municipio</mat-label>
              <mat-select formControlName="municipio">
                <mat-option *ngFor="let muni of municipiosFiltered" [value]="muni.nombre">
                  {{ muni.nombre }}
                </mat-option>
              </mat-select>
              <mat-icon matPrefix class="mr-2 text-teal-500">location_on</mat-icon>
              <mat-hint *ngIf="!eventForm.get('departamento')?.value">Seleccione primero un departamento</mat-hint>
            </mat-form-field>

            <mat-form-field appearance="outline" class="md:col-span-2">
              <mat-label>Descripción / Observaciones</mat-label>
              <textarea matInput formControlName="descripcion" rows="4"></textarea>
              <mat-icon matPrefix class="mr-2 text-gray-400">notes</mat-icon>
            </mat-form-field>

            <div class="md:col-span-2 flex justify-end gap-3 mt-4">
              <button mat-button type="button" (click)="goBack()" class="px-6 rounded-xl">Cancelar</button>
              <button mat-flat-button color="primary" [disabled]="eventForm.invalid" class="px-10 py-2 rounded-xl shadow-lg shadow-blue-500/30">
                 Guardar Configuración
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `
})
export class EventConfigComponent implements OnInit {
  eventForm: FormGroup;
  departamentos: ICatalogoDepartamento[] = [];
  municipiosFiltered: ICatalogoMunicipio[] = [];
  allMunicipios: ICatalogoMunicipio[] = [];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private repo: EventosRepository,
    private catalogRepo: CatalogRepository
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

  ngOnInit(): void {
    this.loadCatalogs();
  }

  async loadCatalogs() {
    this.departamentos = await this.catalogRepo.getAllDepartamentos();
    this.allMunicipios = await this.catalogRepo.getAllMunicipios();
  }

  onDeptoChange(deptoNombre: string) {
    const depto = this.departamentos.find(d => d.nombre === deptoNombre);
    if (depto) {
      this.municipiosFiltered = this.allMunicipios.filter(m => m.departamentoId === depto.id);
      this.eventForm.patchValue({ municipio: '' });
    }
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

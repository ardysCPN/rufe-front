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
import { ICatalogoDepartamento, ICatalogoMunicipio, ICatalogoItemResponse } from '../../../models/catalogs.model';
import { InputComponent } from '../../../shared/components/input/input.component';
import { SelectComponent } from '../../../shared/components/select/select.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';

@Component({
  selector: 'app-event-config',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputComponent,
    SelectComponent,
    ButtonComponent
  ],
  template: `
    <div class="min-h-screen bg-gray-50 dark:bg-gray-950 p-4 md:p-8">
      <div class="max-w-4xl mx-auto">
        
        <!-- Header -->
        <div class="mb-8 flex items-center justify-between">
          <div class="flex items-center gap-4">
            <button (click)="goBack()" class="p-2 rounded-full bg-white dark:bg-gray-800 shadow hover:bg-gray-100 transition-colors">
              <span class="text-xl">←</span>
            </button>
            <div>
              <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
                Configurar Nuevo Evento
              </h1>
              <p class="text-sm text-gray-500 dark:text-gray-400">Define los detalles del evento o emergencia</p>
            </div>
          </div>
        </div>

        <!-- Form Card (Matching RUFE style) -->
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 md:p-10 animate-fade-in-up">
          <form [formGroup]="eventForm" (ngSubmit)="onSubmit()" class="space-y-8">
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="md:col-span-2">
                <app-input 
                  label="Nombre del Evento" 
                  id="nombreEvento" 
                  name="nombreEvento" 
                  formControlName="nombreEvento" 
                  [required]="true"
                  placeholder="Ej: Inundación Zona Norte 2026">
                </app-input>
              </div>

              <app-select 
                label="Tipo de Evento" 
                id="tipoEvento" 
                name="tipoEvento" 
                [options]="tiposEvento"
                formControlName="tipoEvento" 
                [required]="true">
              </app-select>

              <app-input 
                label="Fecha del Evento" 
                id="fechaEvento" 
                name="fechaEvento" 
                type="date"
                formControlName="fechaEvento" 
                [required]="true">
              </app-input>

              <app-select 
                label="Departamento" 
                id="departamento" 
                name="departamento" 
                [options]="departamentosForSelect"
                formControlName="departamento" 
                [required]="true">
              </app-select>

              <app-select 
                label="Municipio" 
                id="municipio" 
                name="municipio" 
                [options]="municipiosFilteredForSelect"
                formControlName="municipio" 
                [required]="true">
              </app-select>

              <div class="md:col-span-2">
                <label class="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-200 mb-2">
                  Descripción / Observaciones
                </label>
                <textarea 
                  formControlName="descripcion" 
                  rows="4"
                  class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 dark:bg-gray-800 dark:text-white dark:ring-gray-700 dark:focus:ring-indigo-500">
                </textarea>
              </div>
            </div>

            <div class="flex justify-end gap-3 pt-6 border-t border-gray-100 dark:border-gray-700">
              <app-button variant="basic" (click)="goBack()">
                Cancelar
              </app-button>
              <app-button type="submit" [disabled]="eventForm.invalid" variant="primary" customClasses="px-8">
                Guardar Configuración
              </app-button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
})
export class EventConfigComponent implements OnInit {
  eventForm: FormGroup;
  departamentos: ICatalogoDepartamento[] = [];
  municipiosFiltered: ICatalogoMunicipio[] = [];
  allMunicipios: ICatalogoMunicipio[] = [];

  // Adapter properties for app-select
  tiposEvento: ICatalogoItemResponse[] = [
    { id: 1, nombre: 'REAL' },
    { id: 2, nombre: 'SIMULACRO' }
  ];
  departamentosForSelect: ICatalogoItemResponse[] = [];
  municipiosFilteredForSelect: ICatalogoItemResponse[] = [];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private repo: EventosRepository,
    private catalogRepo: CatalogRepository
  ) {
    this.eventForm = this.fb.group({
      nombreEvento: ['', Validators.required],
      tipoEvento: [1, Validators.required], // Using ID instead of string
      fechaEvento: [new Date().toISOString().split('T')[0], Validators.required], // HTML Date format
      departamento: [null, Validators.required],
      municipio: [null, Validators.required],
      descripcion: ['']
    });

    // Handle department change for select
    this.eventForm.get('departamento')?.valueChanges.subscribe(id => {
      this.onDeptoChange(id);
    });
  }

  ngOnInit(): void {
    this.loadCatalogs();
  }

  async loadCatalogs() {
    this.departamentos = await this.catalogRepo.getAllDepartamentos();
    this.allMunicipios = await this.catalogRepo.getAllMunicipios();

    this.departamentosForSelect = this.departamentos.map(d => ({
      id: d.id,
      nombre: d.nombre
    }));
  }

  onDeptoChange(deptoId: number) {
    if (deptoId) {
      this.municipiosFiltered = this.allMunicipios.filter(m => m.departamentoId === deptoId);
      this.municipiosFilteredForSelect = this.municipiosFiltered.map(m => ({
        id: m.id,
        nombre: m.nombre
      }));
      this.eventForm.patchValue({ municipio: null });
    }
  }

  onSubmit() {
    if (this.eventForm.valid) {
      const formVal = this.eventForm.getRawValue();

      // Map IDs back to what the backend/repo expects (strings if needed)
      const depto = this.departamentos.find(d => d.id === formVal.departamento);
      const muni = this.allMunicipios.find(m => m.id === formVal.municipio);
      const tipo = this.tiposEvento.find(t => t.id === formVal.tipoEvento);

      const payload = {
        ...formVal,
        tipoEvento: tipo?.nombre || 'REAL',
        departamento: depto?.nombre || '',
        municipio: muni?.nombre || ''
      };

      this.repo.create(payload).subscribe(() => {
        this.router.navigate(['/events/list']);
      });
    }
  }

  goBack() {
    this.router.navigate(['/events/list']);
  }
}

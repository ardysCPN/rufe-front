// src/app/features/rufe-capture/components/rufe-form/rufe-form.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormArray, AbstractControl } from '@angular/forms';
import { ICatalogoItemResponse } from '../../../../models/catalogs.model'; // Correct interface import

// Import reusable components
import { InputComponent } from '../../../../shared/components/input/input.component';
import { SelectComponent } from '../../../../shared/components/select/select.component';
import { ButtonComponent } from '../../../../shared/components/button/button.component';

// Custom validator for unique document numbers within the FormArray
function uniqueDocumentValidator(control: AbstractControl): { [key: string]: any } | null {
  if (!control.parent) {
    return null;
  }
  const formArray = control.parent.parent as FormArray;
  if (!formArray) {
    return null;
  }

  const duplicates = formArray.controls
    .filter(
      (c, index) => c !== control && c.get('numeroDocumento')?.value === control.value
    );

  return duplicates.length > 0 ? { uniqueDocument: true } : null;
}

@Component({
  selector: 'app-rufe-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputComponent,
    SelectComponent,
    ButtonComponent
  ],
  template: `
    <div class="p-6 bg-white rounded-lg shadow-md dark:bg-gray-800">
      <h2 class="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
        Registro Unifamiliar de Emergencias (RUFE)
      </h2>
      <p class="text-xs text-gray-500 dark:text-gray-400 mb-6">
        Código: FR-1703-SMD-69 · Versión: 01 · F.A: 11/04/2025
      </p>

      <form [formGroup]="rufeForm" (ngSubmit)="onSubmit()">

        <!-- Sección: Datos Generales -->
        <div class="mb-6">
          <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Datos Generales
          </h3>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-6">
            <app-select
              label="Departamento"
              id="departamento"
              name="departamento"
              [options]="mockDepartments"
              formControlName="departamento"
              (selectionChange)="onDepartmentChange($event)"
              [required]="true">
            </app-select>
            <app-select
              label="Municipio"
              id="municipio"
              name="municipio"
              [options]="filteredMunicipalities"
              formControlName="municipio"
              [required]="true">
            </app-select>
            <app-select
              label="Evento"
              id="evento"
              name="evento"
              [options]="mockEvents"
              formControlName="evento"
              [required]="true">
            </app-select>
            <app-input
              label="Fecha Evento"
              id="fecha-evento"
              name="fecha-evento"
              type="date"
              [required]="true"
              formControlName="fechaEvento">
            </app-input>
            <app-input
              label="Fecha RUFE"
              id="fecha-rufe"
              name="fecha-rufe"
              type="date"
              [required]="true"
              formControlName="fechaRufe">
            </app-input>
          </div>
        </div>

        <div class="border-t border-gray-200 dark:border-gray-700 my-8"></div>

        <!-- Sección: Ubicación del Bien -->
        <div class="mb-6">
          <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Ubicación del Bien
          </h3>
          <div class="flex items-center space-x-6 mb-4">
            <div class="flex items-center">
              <input type="radio" id="ubicacion-urbano" value="urbano" formControlName="ubicacionTipo" class="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-600 dark:bg-gray-700 dark:border-gray-600">
              <label for="ubicacion-urbano" class="ml-2 block text-sm font-medium text-gray-900 dark:text-gray-200">URBANO</label>
            </div>
            <div class="flex items-center">
              <input type="radio" id="ubicacion-rural" value="rural" formControlName="ubicacionTipo" class="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-600 dark:bg-gray-700 dark:border-gray-600">
              <label for="ubicacion-rural" class="ml-2 block text-sm font-medium text-gray-900 dark:text-gray-200">RURAL</label>
            </div>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-6">
            <app-input
              *ngIf="rufeForm.get('ubicacionTipo')?.value === 'rural'"
              label="Corregimiento"
              id="corregimiento"
              name="corregimiento"
              formControlName="corregimiento">
            </app-input>
            <app-input
              *ngIf="rufeForm.get('ubicacionTipo')?.value === 'rural'"
              label="Vereda / Sector / Barrio"
              id="vereda"
              name="vereda"
              formControlName="veredaSectorBarrio">
            </app-input>
            <app-input
              *ngIf="rufeForm.get('ubicacionTipo')?.value === 'urbano'"
              label="Vereda / Sector / Barrio"
              id="barrio"
              name="barrio"
              formControlName="veredaSectorBarrio">
            </app-input>
            <app-input
              label="Dirección"
              id="direccion"
              name="direccion"
              formControlName="direccion"
              [required]="true">
            </app-input>
          </div>
        </div>

        <div class="border-t border-gray-200 dark:border-gray-700 my-8"></div>

        <!-- Sección: Más Campos -->
        <div class="mb-6">
          <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Características del Bien
          </h3>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-6">
            <app-select
              label="Forma de Tenencia"
              id="forma-tenencia"
              name="forma-tenencia"
              [options]="mockTenencia"
              formControlName="formaTenencia"
              [required]="true">
            </app-select>
            <app-select
              label="Estado del Bien"
              id="estado-bien"
              name="estado-bien"
              [options]="mockEstadoBien"
              formControlName="estadoBien"
              [required]="true">
            </app-select>
            <app-select
              label="Tipo de Bien"
              id="tipo-bien"
              name="tipo-bien"
              [options]="mockTipoBien"
              formControlName="tipoBien"
              [required]="true">
            </app-select>
          </div>
        </div>

        <div class="border-t border-gray-200 dark:border-gray-700 my-8"></div>

        <!-- Section: Alojamiento Actual -->
        <div class="mb-6">
          <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Alojamiento Actual
          </h3>
          <app-select
            label="Alojamiento Actual"
            id="alojamiento-actual"
            name="alojamiento-actual"
            [options]="mockAlojamiento"
            formControlName="alojamientoActual"
            [required]="true">
          </app-select>
        </div>

        <div class="border-t border-gray-200 dark:border-gray-700 my-8"></div>

        <!-- Section: Personas (Dynamic Table) -->
        <div class="mb-6">
          <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Personas
          </h3>
          <div formArrayName="personas" class="space-y-6">
            <div *ngFor="let personaGroup of personas.controls; let i = index" [formGroupName]="i" class="p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 relative">
              <h4 class="font-medium text-gray-700 dark:text-gray-300 mb-4">Persona #{{ i + 1 }}</h4>

              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-6">
                <app-input label="Nombre(s)" id="nombre-{{i}}" name="nombre-{{i}}" formControlName="nombres" [required]="true"></app-input>
                <app-input label="Apellido(s)" id="apellido-{{i}}" name="apellido-{{i}}" formControlName="apellidos" [required]="true"></app-input>

                <app-select
                  label="Tipo documento"
                  id="tipo-doc-{{i}}"
                  name="tipo-doc-{{i}}"
                  [options]="mockDocumentTypes"
                  formControlName="tipoDocumento"
                  [required]="true">
                </app-select>

                <app-input
                  label="Número documento"
                  id="num-doc-{{i}}"
                  name="num-doc-{{i}}"
                  type="number"
                  placeholder="Sin puntos ni comas"
                  formControlName="numeroDocumento"
                  [required]="true">
                  <ng-template #customError>
                    <p *ngIf="personaGroup.get('numeroDocumento')?.errors?.['uniqueDocument']" class="mt-2 text-sm text-red-600">
                      Este número de documento ya existe.
                    </p>
                  </ng-template>
                </app-input>

                <app-input label="Fecha de nacimiento" id="fecha-nac-{{i}}" name="fecha-nac-{{i}}" type="date" formControlName="fechaNacimiento"></app-input>

                <app-select
                  label="Género"
                  id="genero-{{i}}"
                  name="genero-{{i}}"
                  [options]="mockGenders"
                  formControlName="genero"
                  [required]="true">
                </app-select>

                <app-select
                  label="Parentesco"
                  id="parentesco-{{i}}"
                  name="parentesco-{{i}}"
                  [options]="mockRelationships"
                  formControlName="parentesco"
                  [required]="true">
                </app-select>

                <app-select
                  label="Etnia"
                  id="etnia-{{i}}"
                  name="etnia-{{i}}"
                  [options]="mockEthnicities"
                  formControlName="etnia">
                </app-select>

                <app-input label="Teléfono" id="tel-{{i}}" name="tel-{{i}}" type="tel" formControlName="telefono"></app-input>
              </div>

              <div class="absolute top-2 right-2">
                <app-button *ngIf="personas.length > 1" type="button" variant="danger" customClasses="px-2 py-1 text-xs" (click)="removePersona(i)">
                  Eliminar
                </app-button>
              </div>
            </div>
          </div>
          <div class="mt-4 flex justify-end">
            <app-button type="button" variant="secondary" customClasses="px-4 py-2" (click)="addPersona()">
              Agregar Persona
            </app-button>
          </div>
        </div>

        <div class="border-t border-gray-200 dark:border-gray-700 my-8"></div>

        <!-- Section: Agropecuario (Dynamic Table) -->
        <div class="mb-6">
          <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Agropecuario
          </h3>
          <div formArrayName="agropecuario" class="space-y-6">
            <div *ngFor="let agroGroup of agropecuario.controls; let i = index" [formGroupName]="i" class="p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 relative">
              <h4 class="font-medium text-gray-700 dark:text-gray-300 mb-4">Ítem #{{ i + 1 }}</h4>
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-6">
                <app-input label="Tipo de cultivo" id="cultivo-{{i}}" name="cultivo-{{i}}" formControlName="tipoCultivo"></app-input>
                <app-select label="Unidad de medida" id="medida-{{i}}" name="medida-{{i}}" [options]="mockMeasureUnits" formControlName="unidadMedida"></app-select>
                <app-input label="Área" id="area-{{i}}" name="area-{{i}}" type="number" formControlName="area"></app-input>
                <app-input label="Cantidad" id="cantidad-{{i}}" name="cantidad-{{i}}" type="number" formControlName="cantidad"></app-input>
              </div>
              <div class="absolute top-2 right-2">
                <app-button *ngIf="agropecuario.length > 1" type="button" variant="danger" customClasses="px-2 py-1 text-xs" (click)="removeAgropecuario(i)">
                  Eliminar
                </app-button>
              </div>
            </div>
          </div>
          <div class="mt-4 flex justify-end">
            <app-button type="button" variant="secondary" customClasses="px-4 py-2" (click)="addAgropecuario()">
              Agregar Ítem
            </app-button>
          </div>
        </div>

        <div class="border-t border-gray-200 dark:border-gray-700 my-8"></div>

        <!-- Section: Sector Pecuario -->
        <div class="mb-6">
          <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Sector Pecuario
          </h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
            <app-input label="Especie" id="especie" name="especie" formControlName="especie"></app-input>
            <app-input label="Cantidad" id="cantidad-pecuaria" name="cantidad-pecuaria" type="number" formControlName="cantidadPecuaria"></app-input>
          </div>
        </div>

        <div class="border-t border-gray-200 dark:border-gray-700 my-8"></div>

        <!-- Section: Observaciones -->
        <div class="mb-6">
          <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Observaciones
          </h3>
          <textarea formControlName="observaciones" rows="4" class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 dark:bg-gray-800 dark:text-white dark:ring-gray-700 dark:focus:ring-indigo-500"></textarea>
        </div>

        <!-- Section: Form Actions -->
        <div class="flex items-center justify-end space-x-4 mt-8">
          <app-button type="button" variant="basic" (click)="onClear()">
            Limpiar
          </app-button>
          <app-button type="submit" variant="primary">
            Guardar
          </app-button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    /* Any specific styles for this component if needed */
  `]
})
export class RufeFormComponent implements OnInit {
  rufeForm: FormGroup;
  filteredMunicipalities: ICatalogoItemResponse[] = [];

  // Mock data with 'id' strictly as number
  mockDepartments: ICatalogoItemResponse[] = [
    { id: 1, nombre: 'Antioquia' },
    { id: 2, nombre: 'Cundinamarca' },
    { id: 3, nombre: 'Valle del Cauca' },
  ];
  mockMunicipalities: { departamentoId: number, id: number, nombre: string }[] = [
    { departamentoId: 1, id: 101, nombre: 'Medellín' },
    { departamentoId: 1, id: 102, nombre: 'Envigado' },
    { departamentoId: 2, id: 201, nombre: 'Bogotá D.C.' },
    { departamentoId: 2, id: 202, nombre: 'Soacha' },
    { departamentoId: 3, id: 301, nombre: 'Cali' },
    { departamentoId: 3, id: 302, nombre: 'Palmira' },
  ];
  mockEvents: ICatalogoItemResponse[] = [
    { id: 1, nombre: 'Inundación' },
    { id: 2, nombre: 'Terremoto' },
    { id: 3, nombre: 'Incendio' },
    { id: 4, nombre: 'Avalancha' },
  ];
  mockDocumentTypes: ICatalogoItemResponse[] = [
    { id: 1, nombre: 'Cédula de Ciudadanía' },
    { id: 2, nombre: 'Tarjeta de Identidad' },
    { id: 3, nombre: 'Cédula de Extranjería' },
    { id: 4, nombre: 'Pasaporte' },
    { id: 5, nombre: 'Sin Documento' },
  ];
  mockGenders: ICatalogoItemResponse[] = [
    { id: 1, nombre: 'Masculino' },
    { id: 2, nombre: 'Femenino' },
    { id: 3, nombre: 'Trans' },
  ];
  mockRelationships: ICatalogoItemResponse[] = [
    { id: 1, nombre: 'Padre' },
    { id: 2, nombre: 'Madre' },
    { id: 3, nombre: 'Hijo/a' },
    { id: 4, nombre: 'Cónyuge' },
    { id: 5, nombre: 'Otro' },
  ];
  mockEthnicities: ICatalogoItemResponse[] = [
    { id: 1, nombre: 'Indígena' },
    { id: 2, nombre: 'Afrodescendiente' },
    { id: 3, nombre: 'Raizal' },
    { id: 4, nombre: 'Palenquero' },
    { id: 5, nombre: 'Rrom' },
    { id: 6, nombre: 'Ninguna' },
  ];
  mockMeasureUnits: ICatalogoItemResponse[] = [
    { id: 1, nombre: 'Hectárea' },
    { id: 2, nombre: 'Fanegada' },
    { id: 3, nombre: 'm²' },
    { id: 4, nombre: 'Unidades' },
  ];
  mockAlojamiento: ICatalogoItemResponse[] = [
    { id: 1, nombre: 'Lugar habitual de su residencia' },
    { id: 2, nombre: 'Evacuado fuera de su residencia' },
  ];
  mockTenencia: ICatalogoItemResponse[] = [
    { id: 1, nombre: 'Propietario' },
    { id: 2, nombre: 'Arrendatario' },
    { id: 3, nombre: 'Ocupante' },
  ];
  mockEstadoBien: ICatalogoItemResponse[] = [
    { id: 1, nombre: 'Destruido' },
    { id: 2, nombre: 'Afectado' },
    { id: 3, nombre: 'Inhabitable' },
  ];
  mockTipoBien: ICatalogoItemResponse[] = [
    { id: 1, nombre: 'Vivienda' },
    { id: 2, nombre: 'Negocio' },
    { id: 3, nombre: 'Terreno' },
  ];

  constructor(private fb: FormBuilder) {
    this.rufeForm = this.fb.group({
      departamento: ['', Validators.required],
      municipio: [{ value: '', disabled: true }, Validators.required],
      evento: ['', Validators.required],
      fechaEvento: ['', Validators.required],
      fechaRufe: ['', Validators.required],
      ubicacionTipo: [''], // 'urbano' or 'rural'
      corregimiento: [''],
      veredaSectorBarrio: [''],
      direccion: ['', Validators.required],
      alojamientoActual: ['', Validators.required],
      formaTenencia: ['', Validators.required],
      estadoBien: ['', Validators.required],
      tipoBien: ['', Validators.required],
      personas: this.fb.array([this.createPersonaFormGroup()]),
      agropecuario: this.fb.array([this.createAgropecuarioFormGroup()]),
      especie: [''],
      cantidadPecuaria: [null, Validators.min(0)],
      observaciones: ['']
    });
  }

  ngOnInit(): void {
    // Escucha cambios en el tipo de ubicación para manejar validaciones condicionales
    this.rufeForm.get('ubicacionTipo')?.valueChanges.subscribe(value => {
      const corregimientoControl = this.rufeForm.get('corregimiento');
      const veredaControl = this.rufeForm.get('veredaSectorBarrio');

      if (value === 'rural') {
        corregimientoControl?.setValidators(Validators.required);
        veredaControl?.setValidators(Validators.required);
      } else {
        corregimientoControl?.clearValidators();
        veredaControl?.clearValidators();
      }
      corregimientoControl?.updateValueAndValidity();
      veredaControl?.updateValueAndValidity();
    });
  }

  // Getters for FormArrays
  get personas(): FormArray {
    return this.rufeForm.get('personas') as FormArray;
  }

  get agropecuario(): FormArray {
    return this.rufeForm.get('agropecuario') as FormArray;
  }

  // Form Group Creation Methods
  createPersonaFormGroup(): FormGroup {
    return this.fb.group({
      nombres: ['', Validators.required],
      apellidos: ['', Validators.required],
      tipoDocumento: ['', Validators.required],
      numeroDocumento: ['', [Validators.required, uniqueDocumentValidator]],
      fechaNacimiento: [''],
      genero: ['', Validators.required],
      parentesco: ['', Validators.required],
      etnia: [''],
      telefono: ['']
    });
  }

  createAgropecuarioFormGroup(): FormGroup {
    return this.fb.group({
      tipoCultivo: [''],
      unidadMedida: [''],
      area: [null, Validators.min(0)],
      cantidad: [null, Validators.min(0)],
    });
  }

  // FormArray Manipulation Methods
  addPersona(): void {
    this.personas.push(this.createPersonaFormGroup());
  }

  removePersona(index: number): void {
    if (this.personas.length > 1) {
      this.personas.removeAt(index);
    }
  }

  addAgropecuario(): void {
    this.agropecuario.push(this.createAgropecuarioFormGroup());
  }

  removeAgropecuario(index: number): void {
    if (this.agropecuario.length > 1) {
      this.agropecuario.removeAt(index);
    }
  }

  // Dependent Select Logic
  onDepartmentChange(selectedDepartmentId: any): void {
    this.filteredMunicipalities = this.mockMunicipalities
      .filter(m => m.departamentoId === selectedDepartmentId);
    this.rufeForm.get('municipio')?.reset();
    if (this.filteredMunicipalities.length > 0) {
      this.rufeForm.get('municipio')?.enable();
    } else {
      this.rufeForm.get('municipio')?.disable();
    }
  }

  // Form Actions
  onSubmit(): void {
    if (this.rufeForm.valid) {
      console.log('Formulario RUFE válido. Datos a enviar:', this.rufeForm.value);
      // Aquí se implementaría la lógica para enviar los datos a la API REST.
      alert('Formulario guardado exitosamente!');
    } else {
      this.rufeForm.markAllAsTouched();
      console.warn('Formulario inválido. Por favor, revisa los campos.');
      alert('Formulario inválido. Por favor, revisa los campos.');
    }
  }

  onClear(): void {
    this.rufeForm.reset();
    // Reset FormArrays to their initial state (one item each)
    while (this.personas.length !== 0) {
      this.personas.removeAt(0);
    }
    this.personas.push(this.createPersonaFormGroup());

    while (this.agropecuario.length !== 0) {
      this.agropecuario.removeAt(0);
    }
    this.agropecuario.push(this.createAgropecuarioFormGroup());
    this.rufeForm.get('municipio')?.disable();
  }
}

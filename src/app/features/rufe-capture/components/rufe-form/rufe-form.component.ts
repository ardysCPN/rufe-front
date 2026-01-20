// src/app/features/rufe-capture/components/rufe-form/rufe-form.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormArray, AbstractControl } from '@angular/forms';
import { ICatalogoItemResponse, ICatalogoMunicipio } from '../../../../models/catalogs.model';

// Import reusable components
import { InputComponent } from '../../../../shared/components/input/input.component';
import { SelectComponent } from '../../../../shared/components/select/select.component';
import { ButtonComponent } from '../../../../shared/components/button/button.component';

// Import services and repositories
import { RufeRepository } from '../../../../core/repositories/rufe.repository';
import { CatalogRepository } from '../../../../core/repositories/catalog.repository';
import { NetworkService } from '../../../../core/services/network.service';

// Custom validator for unique document numbers within the FormArray
function uniqueDocumentValidator(control: AbstractControl): { [key: string]: any } | null {
  // The control is the 'numeroDocumento' FormControl.
  // Its parent is the FormGroup for a person.
  // Its parent's parent is the 'personas' FormArray.
  if (!control.parent || !control.parent.parent) {
    return null;
  }
  const formArray = control.parent.parent as FormArray;

  // Don't validate if the value is empty, let the `required` validator handle it.
  if (!control.value) {
    return null;
  }

  const duplicates = formArray.controls
    // We need to compare against other FormGroups in the FormArray, not against our own.
    .filter(group => group !== control.parent && group.get('numeroDocumento')?.value === control.value);

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
  templateUrl: './rufe-form.component.html',
})
export class RufeFormComponent implements OnInit {
  rufeForm: FormGroup;

  // Catalog properties
  departments: ICatalogoItemResponse[] = [];
  allMunicipalities: ICatalogoMunicipio[] = []; // To store all municipalities from DB
  filteredMunicipalities: ICatalogoItemResponse[] = [];
  events: ICatalogoItemResponse[] = [];
  documentTypes: ICatalogoItemResponse[] = [];
  genders: ICatalogoItemResponse[] = [];
  relationships: ICatalogoItemResponse[] = [];
  ethnicities: ICatalogoItemResponse[] = [];
  measureUnits: ICatalogoItemResponse[] = [];
  alojamiento: ICatalogoItemResponse[] = [];
  tenencia: ICatalogoItemResponse[] = [];
  estadoBien: ICatalogoItemResponse[] = [];
  tipoBien: ICatalogoItemResponse[] = [];

  constructor(
    private fb: FormBuilder,
    private rufeRepository: RufeRepository,
    private catalogRepository: CatalogRepository,
    private network: NetworkService
  ) {
    this.rufeForm = this.fb.group({
      departamento: [null, Validators.required],
      municipio: [{ value: null, disabled: true }, Validators.required],
      evento: [null, Validators.required],
      fechaEvento: [''],
      fechaRufe: [''],
      ubicacionTipo: [null], // 'urbano' or 'rural'
      corregimiento: [''],
      veredaSectorBarrio: [''],
      direccion: [''],
      alojamientoActual: [null, Validators.required],
      formaTenencia: [null, Validators.required],
      estadoBien: [null, Validators.required],
      tipoBien: [null, Validators.required],
      personas: this.fb.array([this.createPersonaFormGroup()]),
      agropecuario: this.fb.array([this.createAgropecuarioFormGroup()]),
      especie: [''],
      cantidadPecuaria: [null, Validators.min(0)],
      observaciones: ['']
    });
  }

  async ngOnInit(): Promise<void> {
    await this.loadCatalogs();

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

    // Listen for department changes to filter municipalities
    this.rufeForm.get('departamento')?.valueChanges.subscribe(departmentId => {
      // Logic for department change
      if (departmentId) {
        this.onDepartmentChange(departmentId);
      }
    });
  }

  async loadCatalogs(): Promise<void> {
    try {
      this.departments = await this.catalogRepository.getAllDepartamentos();
      this.allMunicipalities = await this.catalogRepository.getAllMunicipios();
      this.events = await this.catalogRepository.getAllEventos();
      this.documentTypes = await this.catalogRepository.getAllTiposDocumento();
      this.genders = await this.catalogRepository.getAllGeneros();
      this.relationships = await this.catalogRepository.getAllParentescos();
      this.ethnicities = await this.catalogRepository.getAllPertenenciaEtnica();
      this.alojamiento = await this.catalogRepository.getAllTipoAlojamientoActual();
      this.tenencia = await this.catalogRepository.getAllFormaTenenciaBien();
      this.estadoBien = await this.catalogRepository.getAllEstadoBien();
      this.tipoBien = await this.catalogRepository.getAllTipoBien();
      // TODO: Cargar el catálogo de unidades de medida si existe en el repositorio.
    } catch (error) {
      // Silent catch for production log or use a logger service
    }
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
      nombres: [''],
      apellidos: [''],
      tipoDocumento: [null, Validators.required],
      numeroDocumento: ['', [Validators.required, uniqueDocumentValidator]],
      fechaNacimiento: [''],
      genero: [null, Validators.required],
      parentesco: [null, Validators.required],
      etnia: [null],
      telefono: ['']
    });
  }

  createAgropecuarioFormGroup(): FormGroup {
    return this.fb.group({
      tipoCultivo: [''],
      unidadMedida: [null],
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
  onDepartmentChange(selectedDepartmentId: string | number): void {
    const depId = typeof selectedDepartmentId === 'string' ? parseInt(selectedDepartmentId, 10) : selectedDepartmentId;
    this.filteredMunicipalities = this.allMunicipalities.filter(m => m.departamentoId === depId);
    const municipioControl = this.rufeForm.get('municipio');
    municipioControl?.reset();
    if (this.filteredMunicipalities.length > 0) {
      municipioControl?.enable();
    } else {
      municipioControl?.disable();
    }
  }

  // Form Actions
  private logValidationErrors(group: FormGroup | FormArray, parentPath: string[] = []) {
    Object.keys(group.controls).forEach(key => {
      const control = group.get(key);
      const path = [...parentPath, key];
      if (control instanceof FormGroup || control instanceof FormArray) {
        if (control.invalid) {
          this.logValidationErrors(control, path);
        }
      } else {
        if (control && control.invalid) {
          // Should use a logger service
        }
      }
    });
  }

  async onSubmit(): Promise<void> {
    if (this.rufeForm.valid) {
      // Usar getRawValue() para incluir los valores de campos deshabilitados (como el municipio).
      const rufeValue = this.rufeForm.getRawValue();

      try {
        // Guardar RUFE + personas en DB local
        const rufeId = await this.rufeRepository.saveRufeWithIntegrantes(
          {
            departamentoId: rufeValue.departamento,
            municipioId: rufeValue.municipio,
            eventoId: rufeValue.evento,
            fechaEvento: rufeValue.fechaEvento,
            fechaRufe: rufeValue.fechaRufe,
            ubicacionTipo: rufeValue.ubicacionTipo,
            corregimiento: rufeValue.corregimiento,
            veredaSectorBarrio: rufeValue.veredaSectorBarrio,
            direccion: rufeValue.direccion,
            alojamientoActual: rufeValue.alojamientoActual,
            formaTenencia: rufeValue.formaTenencia,
            estadoBien: rufeValue.estadoBien,
            tipoBien: rufeValue.tipoBien,
            especie: rufeValue.especie,
            cantidadPecuaria: rufeValue.cantidadPecuaria,
            observaciones: rufeValue.observaciones
          },
          rufeValue.personas.map((p: any) => ({
            nombres: p.nombres,
            apellidos: p.apellidos,
            tipoDocumento: p.tipoDocumento,
            numeroDocumento: p.numeroDocumento,
            fechaNacimiento: p.fechaNacimiento,
            genero: p.genero,
            parentesco: p.parentesco,
            etnia: p.etnia,
            telefono: p.telefono
          }))
        );

        // TODO: Replace with Toast Notification
        const message = this.network.isOnline
          ? 'Formulario guardado localmente y pendiente de sincronizar.'
          : 'Formulario guardado offline. Se sincronizará cuando vuelva la conexión.';

        // Temporarily using console instead of alert
        // console.log(message); 

        this.onClear();

      } catch (error) {
        // console.error('Error al guardar en IndexedDB:', error);
        // TODO: Show Error Toast
      }

    } else {
      this.rufeForm.markAllAsTouched();
      this.logValidationErrors(this.rufeForm);
      // TODO: Show Warning Toast
    }
  }

  onClear(): void {
    this.rufeForm.reset();
    // Reestablece los FormArray a su estado inicial
    this.personas.clear();
    this.personas.push(this.createPersonaFormGroup());

    this.agropecuario.clear();
    this.agropecuario.push(this.createAgropecuarioFormGroup());

    // Limpia la lista de municipios filtrados
    this.filteredMunicipalities = [];
    this.rufeForm.get('municipio')?.disable();
  }
}

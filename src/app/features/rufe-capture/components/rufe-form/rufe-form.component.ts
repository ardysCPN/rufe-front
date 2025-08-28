// src/app/features/rufe-capture/components/rufe-form/rufe-form.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormArray, AbstractControl } from '@angular/forms';
import { ICatalogoItemResponse, ICatalogoMunicipio } from '../../../../models/catalogs.model';

// Import reusable components
import { InputComponent } from '../../../../shared/components/input/input.component';
import { SelectComponent } from '../../../../shared/components/select/select.component';
import { ButtonComponent } from '../../../../shared/components/button/button.component';

// Import services
import { DatabaseService } from '../../../../core/services/database.service';

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

  constructor(private fb: FormBuilder, private dbService: DatabaseService) {
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
      console.log('Departamento seleccionado:', departmentId);
      if (departmentId) {
        this.onDepartmentChange(departmentId);
      }
    });
  }

  async loadCatalogs(): Promise<void> {
    try {
      this.departments = await this.dbService.getAllDepartamentos();
      this.allMunicipalities = await this.dbService.getAllMunicipios();
      this.events = await this.dbService.getAllEventos();
      this.documentTypes = await this.dbService.getAllTiposDocumento();
      this.genders = await this.dbService.getAllGeneros();
      this.relationships = await this.dbService.getAllParentescos();
      this.ethnicities = await this.dbService.getAllPertenenciaEtnica();
      this.alojamiento = await this.dbService.getAllTipoAlojamientoActual();
      this.tenencia = await this.dbService.getAllFormaTenenciaBien();
      this.estadoBien = await this.dbService.getAllEstadoBien();
      this.tipoBien = await this.dbService.getAllTipoBien();
      // TODO: Cargar el catálogo de unidades de medida si existe en el servicio.
      console.log('Catálogos cargados desde IndexedDB');
    } catch (error) {
      console.error('Error al cargar los catálogos desde IndexedDB:', error);
      // Opcional: Manejar el error, por ejemplo, mostrando un mensaje al usuario.
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
  onSubmit(): void {
    if (this.rufeForm.valid) {
      console.log('Formulario RUFE válido. Datos a enviar:', this.rufeForm.value);
      alert('Formulario guardado exitosamente!');
    } else {
      this.rufeForm.markAllAsTouched();
      console.warn('Formulario inválido. Por favor, revisa los campos.');
      alert('Formulario inválido. Por favor, revisa los campos.');
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

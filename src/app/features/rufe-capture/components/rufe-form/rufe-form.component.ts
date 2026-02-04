// src/app/features/rufe-capture/components/rufe-form/rufe-form.component.ts

import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormArray, AbstractControl } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { SuccessModalComponent } from '../../../../shared/components/modals/success-modal.component';
import { ICatalogoItemResponse, ICatalogoMunicipio } from '../../../../models/catalogs.model';
import { environment } from '../../../../../environments/environment';
import { DateUtils } from '../../../../core/utils/date.utils';
import { v4 as uuidv4 } from 'uuid';

import { InputComponent } from '../../../../shared/components/input/input.component';
import { SelectComponent } from '../../../../shared/components/select/select.component';
import { ButtonComponent } from '../../../../shared/components/button/button.component';



// Import services and repositories
import { RufeRepository } from '../../../../core/repositories/rufe.repository';
import { CatalogRepository } from '../../../../core/repositories/catalog.repository';
import { EventosRepository, EventoReal } from '../../../../core/repositories/eventos.repository';
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
    ButtonComponent,
    MatDialogModule
  ],
  templateUrl: './rufe-form.component.html',
})
export class RufeFormComponent implements OnInit {
  rufeForm!: FormGroup;
  isSubmitting = false; // Control de bloqueo botón guardar


  isViewActive = true; // Control para Soft Reload

  // Catalog properties
  departments: ICatalogoItemResponse[] = [];
  allMunicipalities: ICatalogoMunicipio[] = [];
  filteredMunicipalities: ICatalogoItemResponse[] = [];
  tiposEvento: ICatalogoItemResponse[] = []; // Catálogo de tipos (tabla evento)
  events: EventoReal[] = []; // Eventos REALES (tabla eventos)
  eventsForSelect: ICatalogoItemResponse[] = []; // Adaptador para el select
  selectedEvent: EventoReal | null = null; // Evento seleccionado para mostrar info
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
    private eventosRepository: EventosRepository,
    private network: NetworkService,
    private http: HttpClient,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef,
    private dialog: MatDialog
  ) {
    this.createForm();
  }

  ngOnInit(): void {
    this.initForm();
  }

  createForm(): void {
    this.rufeForm = this.fb.group({
      evento: [null, Validators.required], // Evento Real (Contexto)
      tipoEvento: [null, Validators.required], // Tipo de Evento (Observado en sitio)
      departamento: [null, Validators.required],
      municipio: [{ value: null, disabled: true }, Validators.required],
      fechaEvento: [''],
      fechaRufe: [''],
      ubicacionTipo: [null],
      corregimiento: [''],
      veredaSectorBarrio: [''],
      direccion: [''],
      alojamientoActual: [null, Validators.required],
      formaTenencia: [null, Validators.required],
      estadoBien: [null, Validators.required],
      tipoBien: [null, Validators.required],
      lugarHabitualResidencia: [''],
      evacuadoFueraResidencia: [false],
      voBoCmgrd: [''],
      personas: this.fb.array([this.createPersonaFormGroup()]),
      agropecuario: this.fb.array([this.createAgropecuarioFormGroup()]),
      especie: [''],
      cantidadPecuaria: [null, Validators.min(0)],
      observaciones: ['']
    });
  }

  async initForm(): Promise<void> {
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

    // Listener para mostrar información del evento seleccionado
    this.rufeForm.get('evento')?.valueChanges.subscribe(eventoId => {
      if (eventoId) {
        this.selectedEvent = this.events.find(e => e.id === eventoId) || null;
      } else {
        this.selectedEvent = null;
      }
    });
  }

  async loadCatalogs(): Promise<void> {
    try {
      this.departments = await this.catalogRepository.getAllDepartamentos();
      this.allMunicipalities = await this.catalogRepository.getAllMunicipios();
      // Cargar TIPOS de eventos desde catálogo (tabla evento)
      this.tiposEvento = await this.catalogRepository.getAllEventos();

      // 1. Cargar eventos REALES desde cache (IndexedDB) para visualización inmediata
      this.events = await this.eventosRepository.getAllFromCache();
      this.updateEventsSelect();

      // Asegurar que si la lista está vacía pero hay conexión, no se bloquee el usuario esperando
      if (this.events.length === 0 && this.network.isOnline) {
        // El sync de abajo llenará la lista
      }

      // 2. Si hay conexión, sincronizar en segundo plano y actualizar vista
      if (this.network.isOnline) {
        this.eventosRepository.sync().then(async () => {
          this.events = await this.eventosRepository.getAllFromCache();
          this.updateEventsSelect();
          console.log('Eventos actualizados desde el servidor.');
        }).catch(err => console.error('Fallo sync eventos fondo', err));
      }

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
      console.error('Error loading catalogs', error);
      // Silent catch for production log or use a logger service
    }
  }

  private updateEventsSelect(): void {
    this.eventsForSelect = this.events.map(e => ({
      id: e.id!,
      nombre: e.nombreEvento
    }));
    this.cdr.detectChanges(); // Forzar actualización de vista
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
    if (this.isSubmitting) return; // Prevenir múltiples clics

    if (this.rufeForm.valid) {
      this.isSubmitting = true; // Bloquear botón
      this.rufeForm.disable(); // Deshabilitar formulario visualmente

      try {
        const rufeValue = this.rufeForm.getRawValue();
        const payload = this.buildBackendPayload(rufeValue);
        let sentToServer = false;

        // Intentar enviar al backend si hay red
        if (this.network.isOnline) {
          try {
            await this.http.post(`${environment.apiUrl}/api/rufe`, payload).toPromise();
            sentToServer = true;
            this.showSuccessModal('Enviado Exitosamente', 'La información se ha cargado correctamente en el servidor.');
          } catch (error) {
            console.error('Error al enviar al backend (HTTP o Red), procediendo a guardar localmente:', error);
            // Fallthrough to local save
          }
        }

        if (!sentToServer) {
          try {
            await this.rufeRepository.saveRufeWithIntegrantes(
              {
                departamentoId: rufeValue.departamento,
                municipioId: rufeValue.municipio,
                eventoId: rufeValue.evento,
                tipoEventoId: rufeValue.tipoEvento,
                fechaEvento: rufeValue.fechaEvento,
                fechaRufe: DateUtils.toLocalDateTime(rufeValue.fechaRufe) || DateUtils.currentLocalDateTime(),
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

            this.showSuccessModal('Guardado Offline', 'No hay conexión o el servidor no respondió. El formulario se guardó localmente y se sincronizará luego.');

          } catch (error) {
            console.error('Error crítico al guardar en IndexedDB:', error);
            if (error instanceof Error && (error.message.includes('Duplicado') || error.name === 'PrematureCommitError')) {
              // Hack: Si es PrematureCommitError pero los datos están (según reporte usuario), podríamos asumir éxito
              // O si arreglamos el repo, esto no debería pasar.
              // Si sigue pasando, avisar al usuario.
              this.snackBar.open('⚠️ Error al guardar (DB Local). Intente de nuevo.', 'Cerrar', { duration: 5000 });
            } else {
              this.snackBar.open('❌ Error crítico al guardar el formulario localmente.', 'Cerrar', {
                duration: 5000,
                panelClass: ['snackbar-error']
              });
            }
          }
        }
      } finally {
        this.isSubmitting = false;
        // Don't enable form here if successful, because fullReset() will handle state.
        // Check if form is still disabled (implying failure/still on same page without reset)
        if (this.rufeForm.disabled && !this.isSubmitting) {
          this.rufeForm.enable();
        }
      }

    } else {
      this.rufeForm.markAllAsTouched();
      this.logValidationErrors(this.rufeForm);
      this.snackBar.open('⚠️ Por favor completa todos los campos requeridos', 'Cerrar', {
        duration: 3000,
        panelClass: ['snackbar-warn']
      });
    }
  }

  private showSuccessModal(title: string, message: string): void {
    const dialogRef = this.dialog.open(SuccessModalComponent, {
      data: {
        title: title,
        message: message,
        buttonText: 'Aceptar y Nuevo Registro'
      },
      disableClose: true // Force user to click button
    });

    dialogRef.afterClosed().subscribe(() => {
      this.fullReset();
    });
  }

  private buildBackendPayload(formValue: any): any {
    const fechaRegistro = formValue.fechaRufe
      ? DateUtils.toLocalDateTime(formValue.fechaRufe) || DateUtils.currentLocalDateTime()
      : new Date().toISOString();

    return {
      tipoEventoId: formValue.tipoEvento, // Seleccionado manualmente
      eventoId: formValue.evento,
      clienteId: uuidv4(),
      fechaRegistro: fechaRegistro,
      tipoUbicacionBienId: formValue.ubicacionTipo === 'urbano' ? 1 : 2,
      corregimiento: formValue.corregimiento || null,
      veredaSectorBarrio: formValue.veredaSectorBarrio || null,
      direccion: formValue.direccion,
      tipoAlojamientoActualId: formValue.alojamientoActual,
      lugarHabitualResidencia: formValue.lugarHabitualResidencia || formValue.direccion,
      evacuadoFueraResidencia: formValue.evacuadoFueraResidencia || false,
      observaciones: formValue.observaciones || null,
      voBoCmgrd: formValue.voBoCmgrd || 'Pendiente',
      integrantes: formValue.personas.map((p: any) => ({
        clienteId: uuidv4(),
        nombres: p.nombres,
        apellidos: p.apellidos,
        tipoDocumentoId: p.tipoDocumento,
        numeroDocumento: p.numeroDocumento,
        fechaNacimiento: p.fechaNacimiento,
        parentescoId: p.parentesco,
        generoId: p.genero,
        pertenenciaEtnicaId: p.etnia || null,
        telefono: p.telefono || null
      })),
      bienesAfectados: [
        {
          clienteId: uuidv4(),
          tipoBienId: formValue.tipoBien,
          formaTenenciaBienId: formValue.formaTenencia,
          estadoBienId: formValue.estadoBien
        }
      ],
      activosAgropecuarios: formValue.cantidadPecuaria ? [
        {
          clienteId: uuidv4(),
          sector: 'PECUARIO',
          especieAnimal: formValue.especie || 'No especificado',
          cantidadAnimal: Number(formValue.cantidadPecuaria)
        }
      ] : []
    };
  }

  onClear(): void {
    this.fullReset();
  }

  fullReset(): void {
    // Soft Reload Strategy:
    // 1. Destroy the view immediately
    this.isViewActive = false;
    this.isSubmitting = false;

    // 2. Re-create the form object in memory (fresh state)
    this.createForm();

    // 3. Reset auxiliary states
    this.filteredMunicipalities = [];
    this.selectedEvent = null;

    // 4. Force view destruction cycle
    this.cdr.detectChanges();

    // 5. Re-create view and re-initialize logic
    setTimeout(() => {
      this.isViewActive = true;
      this.cdr.markForCheck(); // Ensure the *ngIf update is detected
      this.initForm(); // Re-bind listeners and re-load catalogs

      // Scroll to top
      window.scrollTo(0, 0);
    }, 50); // Small delay to guarantee DOM teardown/rebuild
  }
}

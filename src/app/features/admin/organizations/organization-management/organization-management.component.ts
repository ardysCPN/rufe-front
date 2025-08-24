// src/app/features/admin/organizations/organization-management/organization-management.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

// Import reusable components (Tailwind-only versions)
import { InputComponent } from '../../../../shared/components/input/input.component';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { SelectComponent } from '../../../../shared/components/select/select.component';
import { TableComponent, TableColumn } from '../../../../shared/components/table/table.component';
import { ICatalogoItemResponse } from '../../../../models/catalogs.model';

// Example data interfaces (you'll replace with your actual API models)
interface Organization {
  id: number;
  name: string;
  email: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
}

@Component({
  selector: 'app-organization-management',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputComponent,
    ButtonComponent,
    SelectComponent,
    TableComponent
  ],
  template: `
    <div class="p-6 bg-white rounded-lg shadow-md dark:bg-gray-800">
      <h2 class="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
        Gestión de Organizaciones
      </h2>

      <!-- Form for Create/Edit -->
      <form [formGroup]="organizationForm" (ngSubmit)="onSubmit()" class="mb-8">
        <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          {{ isEditMode ? 'Editar Organización' : 'Crear Nueva Organización' }}
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-6">
          <app-input
            label="Nombre de Organización"
            id="org-name"
            name="org-name"
            type="text"
            placeholder="Nombre de la empresa"
            [required]="true"
            formControlName="name"
          ></app-input>

          <app-input
            label="Correo Electrónico"
            id="org-email"
            name="org-email"
            type="email"
            placeholder="contacto@empresa.com"
            [required]="true"
            formControlName="email"
          ></app-input>

          <app-input
            label="Dirección"
            id="org-address"
            name="org-address"
            type="text"
            placeholder="Calle Principal 123"
            formControlName="address"
          ></app-input>

          <app-input
            label="Ciudad"
            id="org-city"
            name="org-city"
            type="text"
            placeholder="Ciudad"
            formControlName="city"
          ></app-input>

          <app-input
            label="Estado/Provincia"
            id="org-state"
            name="org-state"
            type="text"
            placeholder="Estado"
            formControlName="state"
          ></app-input>

          <app-input
            label="Código Postal"
            id="org-postal-code"
            name="org-postal-code"
            type="text"
            placeholder="00000"
            formControlName="postalCode"
          ></app-input>

          <app-select
            label="Tipo de Organización"
            id="org-type"
            name="org-type"
            [options]="organizationTypes"
            [required]="true"
            [loadingOptions]="selectLoading"
            formControlName="organizationTypeId"
          ></app-select>
        </div>

        <div class="flex items-center justify-end space-x-4 mt-8">
          <app-button type="button" variant="basic" (click)="onCancelEdit()">
            {{ isEditMode ? 'Cancelar Edición' : 'Limpiar Formulario' }}
          </app-button>
          <app-button type="submit" variant="primary" [loading]="loading" [disabled]="organizationForm.invalid">
            {{ isEditMode ? 'Actualizar Organización' : 'Guardar Organización' }}
          </app-button>
        </div>
      </form>

      <!-- Divider -->
      <div class="border-t border-gray-200 dark:border-gray-700 my-8"></div>

      <!-- Section for Table -->
      <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">
        Listado de Organizaciones
      </h3>
      <app-table
        [columns]="organizationTableColumns"
        [data]="organizations"
        [selectable]="true"
        [selectedRow]="selectedOrganization"
        [loading]="tableLoading"
        (rowSelected)="onOrganizationSelected($event)"
        [showActions]="true"
      >
        <!-- Custom actions slot for the table -->
        <ng-template #tableActions let-row>
          <div class="flex justify-center space-x-2">
            <app-button type="button" variant="secondary" customClasses="px-2 py-1 text-xs" (click)="onEditOrganization(row)">
              Editar
            </app-button>
            <app-button type="button" variant="danger" customClasses="px-2 py-1 text-xs" (click)="onDeleteOrganization(row)">
              Eliminar
            </app-button>
          </div>
        </ng-template>
      </app-table>
    </div>
  `,
  styles: [`
    /* Any specific styles for this component if needed */
  `]
})
export class OrganizationManagementComponent implements OnInit {
  organizationForm: FormGroup;
  loading: boolean = false;
  tableLoading: boolean = false;
  selectLoading: boolean = false; // NEW: Loading state for the select
  isEditMode: boolean = false;
  selectedOrganization: Organization | null = null;

  organizations: Organization[] = []; // Initialize as empty array to simulate API fetch

  organizationTableColumns: TableColumn[] = [
    { key: 'id', label: 'ID', width: 'w-16', align: 'center' },
    { key: 'name', label: 'Nombre', width: 'w-1/4' },
    { key: 'email', label: 'Email', width: 'w-1/4' },
    { key: 'city', label: 'Ciudad' },
    { key: 'state', label: 'Estado' },
  ];

  organizationTypes: ICatalogoItemResponse[] = []; // Initialize as empty
  private mockOrganizationTypes: ICatalogoItemResponse[] = [
    { id: 1, nombre: 'Corporación' },
    { id: 2, nombre: 'ONG' },
    { id: 3, nombre: 'Startup' },
  ];

  constructor(private fb: FormBuilder) {
    this.organizationForm = this.fb.group({
      id: [null],
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      address: [''],
      city: [''],
      state: [''],
      postalCode: [''],
      organizationTypeId: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    // Load data when the component initializes
    this.loadOrganizations();
    this.loadOrganizationTypes();
  }

  loadOrganizations(): void {
    this.tableLoading = true;
    console.log('Fetching organizations from microservice...');
    setTimeout(() => {
      this.organizations = [
        { id: 1, name: 'GlobalCorp', email: 'info@global.com', address: '123 Main St', city: 'Anytown', state: 'CA', postalCode: '90210' },
        { id: 2, name: 'Tech Solutions', email: 'contact@tech.com', address: '456 Tech Ave', city: 'Techville', state: 'NY', postalCode: '10001' },
        { id: 3, name: 'Innovate Co.', email: 'hello@innovate.com', address: '789 Innovation Dr', city: 'Newburg', state: 'TX', postalCode: '73301' },
      ];
      this.tableLoading = false;
      console.log('Organizations loaded successfully.');
    }, 2000); // Simulate 2-second API delay
  }

  loadOrganizationTypes(): void {
    this.selectLoading = true;
    console.log('Fetching organization types from microservice...');
    setTimeout(() => {
      this.organizationTypes = this.mockOrganizationTypes;
      this.selectLoading = false;
      console.log('Organization types loaded successfully.');
    }, 1000); // Simulate 1-second API delay
  }

  onSubmit(): void {
    if (this.organizationForm.valid) {
      this.loading = true;
      const formData = this.organizationForm.value;
      console.log('Formulario enviado:', formData);
      setTimeout(() => {
        this.loading = false;
        if (this.isEditMode) {
          const index = this.organizations.findIndex(org => org.id === formData.id);
          if (index !== -1) {
            this.organizations[index] = { ...formData };
          }
        } else {
          const newId = Math.max(...this.organizations.map(o => o.id)) + 1;
          const newOrg = { ...formData, id: newId };
          this.organizations.push(newOrg);
        }
        this.onCancelEdit();
      }, 1500);
    } else {
      this.organizationForm.markAllAsTouched();
      console.warn('Formulario inválido. Por favor, revisa los campos.');
    }
  }

  onOrganizationSelected(organization: Organization | null): void {
    this.selectedOrganization = organization;
    if (organization) {
      this.onEditOrganization(organization);
    } else {
      this.onCancelEdit();
    }
  }

  onEditOrganization(organization: Organization): void {
    this.isEditMode = true;
    this.selectedOrganization = organization;
    this.organizationForm.patchValue(organization);
    this.organizationForm.get('organizationTypeId')?.setValue(this.organizationTypes[0].id);
  }

  onDeleteOrganization(organization: Organization): void {
    if (confirm(`¿Estás seguro de que quieres eliminar la organización "${organization.name}"?`)) {
      this.organizations = this.organizations.filter(org => org.id !== organization.id);
      this.onCancelEdit();
    }
  }

  onCancelEdit(): void {
    this.isEditMode = false;
    this.selectedOrganization = null;
    this.organizationForm.reset();
    this.organizationForm.get('organizationTypeId')?.setValue('');
  }
}

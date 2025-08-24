// rufe-list.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-rufe-list',
  standalone: true,
  imports: [CommonModule, MatCardModule],
  template: `
    <mat-card class="p-4 shadow-md">
      <h2 class="text-2xl font-bold text-blue-700 mb-2">Listado de Registros RUFE</h2>
      <p class="text-gray-700">Aquí se mostrará el listado de todos los registros RUFE almacenados localmente.</p>
    </mat-card>
  `
})
export class RufeListComponent {}
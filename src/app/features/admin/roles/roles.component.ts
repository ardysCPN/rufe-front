import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-roles',
  standalone: true,
  imports: [CommonModule],
  template: `
    <h2 class="text-2xl font-bold">Gestión de Roles</h2>
    <p>Contenido de la gestión de Roles.</p>
  `,
  styles: []
})
export class RolesComponent {}
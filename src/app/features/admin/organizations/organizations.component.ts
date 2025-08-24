import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-organizations',
  standalone: true,
  imports: [CommonModule],
  template: `
    <h2 class="text-2xl font-bold">Gestión de organizations</h2>
    <p>Contenido de la gestión de organizations.</p>
  `,
  styles: []
})
export class OrganizationsComponent {}
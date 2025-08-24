// src/app/features/admin/users/users.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule],
  template: `
    <h2 class="text-2xl font-bold">Gestión de Usuarios</h2>
    <p>Contenido de la gestión de usuarios.</p>
  `,
  styles: []
})
export class UsersComponent {}
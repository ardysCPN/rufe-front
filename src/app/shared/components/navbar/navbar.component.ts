// src/app/shared/components/navbar/navbar.component.ts

import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { ThemeToggleButtonComponent } from '../layout/theme-toggle-button.component';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, ThemeToggleButtonComponent],
  templateUrl: './navbar.component.html',
})
export default class NavbarComponent {
  @Output() toggleSidenav = new EventEmitter<void>();
  menuOpen = false;

  constructor(public authService: AuthService) {}

  get userInitial(): string {
    const user = this.authService.currentUserValue;
    return user?.email?.charAt(0)?.toUpperCase() || '?';
  }

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }
}

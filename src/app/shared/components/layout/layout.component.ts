// src/app/shared/components/layout/layout.component.ts

import { Component, ViewChild, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import  NavbarComponent  from '../navbar/navbar.component';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { MatSidenavModule, MatSidenav } from '@angular/material/sidenav'; // Keep MatSidenavModule for potential future use or if other components rely on it.

import { AuthService } from '../../../core/services/auth.service';
import { MenuService } from '../../../core/services/menu.service';
import { NetworkService } from '../../../core/services/network.service';
import { Subject, filter, takeUntil } from 'rxjs';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    NavbarComponent,
    SidebarComponent,
    MatSidenavModule // Keep this import even if not directly used for the custom sidebar, as other components might need it.
  ],
  template: `
    <div class="h-screen flex flex-col">
      <app-navbar (toggleSidenav)="toggleSidebar()"></app-navbar>
      <div class="flex flex-1 overflow-hidden">
        <aside
          [ngClass]="{
            'w-64': !isCollapsed,
            'w-16 hover:w-64': isCollapsed
          }"
          class="transition-all duration-300 bg-white dark:bg-gray-900 shadow-lg h-full overflow-y-auto"
        >
          <app-sidebar [collapsed]="isCollapsed"></app-sidebar>
        </aside>

        <main class="flex-1 bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white overflow-y-auto p-6">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `,
  styles: [`
    /* No specific styles for MatSidenav here, as the template uses custom HTML */
    /* Ensure the main content area adjusts correctly if the navbar has a fixed height */
    /* The h-[calc(100vh-64px)] should be applied to the main content if the navbar is fixed height */
  `]
})
export class LayoutComponent implements OnInit, OnDestroy {
  // @ViewChild('sidenav') sidenav!: MatSidenav; // Removed as you're using a custom sidebar
  isCollapsed = false; // For your custom sidebar collapse logic
  private destroy$ = new Subject<void>();

  constructor(
    private authService: AuthService,
    private menuService: MenuService,
    private networkService: NetworkService
  ) {}

  ngOnInit(): void {
    // Subscribe to currentUser changes to trigger menu loading when user logs in
    this.authService.currentUser
      .pipe(
        filter(user => !!user), // Only proceed if user is not null (logged in)
        takeUntil(this.destroy$) // Unsubscribe when component is destroyed
      )
      .subscribe(user => {
        if (user && user.organizacionId !== undefined) {
          console.log('LayoutComponent: User logged in, fetching dynamic menu...');
          this.menuService.getDynamicMenu(user).subscribe({
            next: () => console.log('LayoutComponent: Dynamic menu loaded successfully.'),
            error: (err) => console.error('LayoutComponent: Error loading dynamic menu:', err)
          });
        }
      });

    // Subscribe to network status changes to fetch catalogs when online
    this.networkService.isOnline$
      .pipe(
        filter(isOnline => isOnline), // Only react when going online
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        const currentUser = this.authService.currentUserValue;
        if (currentUser && currentUser.token) { // Only fetch if user is logged in
          console.log('LayoutComponent: App is online and user is logged in. Attempting to fetch and store catalogs...');
          this.authService.fetchAndStoreCatalogs().subscribe({
            next: () => console.log('LayoutComponent: Catalogs updated successfully.'),
            error: (err) => console.error('LayoutComponent: Failed to update catalogs:', err)
          });
        }
      });

    // Also check on initial load if already online and logged in
    // This handles cases where the user is already logged in and the app starts online.
    if (this.networkService.isOnline && this.authService.currentUserValue) {
      console.log('LayoutComponent: App started online and user logged in. Initial catalog fetch...');
      this.authService.fetchAndStoreCatalogs().subscribe({
        next: () => console.log('LayoutComponent: Initial catalogs loaded successfully.'),
        error: (err) => console.error('LayoutComponent: Failed initial catalog load:', err)
      });
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  toggleSidebar() {
    this.isCollapsed = !this.isCollapsed;
  }
}

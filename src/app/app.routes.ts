// src/app/app.routes.ts

import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard'; // Import AuthGuard
import { authRoutes } from './features/auth/auth.routes';
import { LayoutComponent } from './shared/components/layout/layout.component';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },

  ...authRoutes, // Public routes (e.g., /login)

  {
    path: '', // This path is empty, meaning it will match any path that doesn't match above
    component: LayoutComponent, // This component will provide the layout (navbar + sidebar + content)
    canActivate: [AuthGuard], // Apply AuthGuard here to protect all child routes
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'rufe-list',
        loadComponent: () => import('./features/rufe-list/components/rufe-table/rufe-table.component').then(m => m.RufeListComponent)
      },
      {
        path: 'rufe/new',
        loadComponent: () => import('./features/rufe-capture/components/rufe-form/rufe-form.component').then(m => m.RufeFormComponent)
      },
      // Admin routes
      {
        path: 'admin/users',
        loadComponent: () => import('./features/admin/users/users.component').then(m => m.UsersComponent)
      },
      {
        path: 'admin/roles',
        loadComponent: () => import('./features/admin/roles/roles.component').then(m => m.RolesComponent)
      },
      {
        path: 'admin/organizations',
        loadComponent: () => import('./features/admin/organizations/organization-management/organization-management.component').then(m => m.OrganizationManagementComponent)
      },
      // Fallback for any path within the protected area that doesn't match
      { path: '**', redirectTo: '/dashboard' } // Redirect to dashboard if in protected area and path not found
    ]
  },

  { path: '**', redirectTo: '/login' } // Catch-all route for unauthenticated paths
];

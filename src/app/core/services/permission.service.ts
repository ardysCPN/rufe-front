import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';

@Injectable({
    providedIn: 'root'
})
export class PermissionService {

    constructor(private authService: AuthService) { }

    /**
     * Checks if the current user has a specific permission.
     * @param permission The permission string to check (e.g., 'rufe:crear').
     */
    hasPermission(permission: string): boolean {
        const user = this.authService.currentUserValue;
        if (!user || !user.permissions) {
            return false;
        }
        // Admin roles bypass all granular permission checks
        const adminRoles = ['ROLE_ADMIN_GLOBAL', 'ADMIN_GLOBAL', 'ROLE_ADMIN', 'ADMIN'];
        if (user.rolNombre && adminRoles.includes(user.rolNombre)) {
            return true;
        }
        return user.permissions.includes(permission);
    }

    /**
     * Checks if the current user has ANY of the provided permissions.
     * @param permissions Array of permission strings.
     */
    hasAnyPermission(permissions: string[]): boolean {
        const user = this.authService.currentUserValue;
        if (!user || !user.permissions) {
            return false;
        }
        const adminRoles = ['ROLE_ADMIN_GLOBAL', 'ADMIN_GLOBAL', 'ROLE_ADMIN', 'ADMIN'];
        if (user.rolNombre && adminRoles.includes(user.rolNombre)) {
            return true;
        }
        return permissions.some(p => user.permissions.includes(p));
    }
}

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
        // Admin global usually has all, or specific wildcard logic could go here.
        if (user.permissions.includes('ROLE_ADMIN_GLOBAL')) {
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
        if (user.permissions.includes('ROLE_ADMIN_GLOBAL')) {
            return true;
        }
        return permissions.some(p => user.permissions.includes(p));
    }
}

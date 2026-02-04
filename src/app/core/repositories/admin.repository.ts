import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface User {
    id?: number;
    nombreCompleto: string;
    email: string;
    password?: string;
    rolId: number;
    rolNombre?: string;
    activo: boolean;
    organizacionId?: number;
}

export interface Role {
    id?: number;
    nombreRol: string;
    descripcion: string;
    activo?: boolean;
}

export interface Organization {
    id?: number;
    nombreOrganizacion: string;
    nit?: string;
    direccion?: string;
    telefono?: string;
    activa: boolean;
}

@Injectable({
    providedIn: 'root'
})
export class AdminRepository {
    private apiUrl = `${environment.apiUrl}/api`;

    constructor(private http: HttpClient) { }

    // --- Users ---
    getUsers(): Observable<User[]> {
        return this.http.get<User[]>(`${this.apiUrl}/usuarios`);
    }

    getUser(id: number): Observable<User> {
        return this.http.get<User>(`${this.apiUrl}/usuarios/${id}`);
    }

    createUser(user: User): Observable<User> {
        return this.http.post<User>(`${this.apiUrl}/usuarios`, user);
    }

    updateUser(id: number, user: User): Observable<User> {
        return this.http.put<User>(`${this.apiUrl}/usuarios/${id}`, user);
    }

    deleteUser(id: number): Observable<void> {
        // Note: If backend supports soft delete via DELETE verb or a PATCH field update.
        // Assuming standard DELETE for now as per "canDelete" UI logic.
        return this.http.delete<void>(`${this.apiUrl}/usuarios/${id}`);
    }

    // --- Roles ---
    getRoles(): Observable<Role[]> {
        return this.http.get<Role[]>(`${this.apiUrl}/roles`);
    }

    createRole(role: Role): Observable<Role> {
        return this.http.post<Role>(`${this.apiUrl}/roles`, role);
    }

    updateRole(id: number, role: Role): Observable<Role> {
        return this.http.put<Role>(`${this.apiUrl}/roles/${id}`, role);
    }

    deleteRole(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/roles/${id}`);
    }

    // --- Organizations ---
    getOrganizations(): Observable<Organization[]> {
        return this.http.get<Organization[]>(`${this.apiUrl}/organizaciones`);
    }

    getOrganization(id: number): Observable<Organization> {
        return this.http.get<Organization>(`${this.apiUrl}/organizaciones/${id}`);
    }

    createOrganization(org: Organization): Observable<Organization> {
        return this.http.post<Organization>(`${this.apiUrl}/organizaciones`, org);
    }

    updateOrganization(id: number, org: Organization): Observable<Organization> {
        return this.http.put<Organization>(`${this.apiUrl}/organizaciones/${id}`, org);
    }

    deleteOrganization(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/organizaciones/${id}`);
    }
}

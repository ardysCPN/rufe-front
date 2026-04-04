// src/app/core/services/rufe.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface IRufeRemote {
    id: number;
    clienteId: string;
    eventoId: number;
    tipoEventoId: number;
    fechaRegistro: string;
    tipoUbicacionBienId: number;
    corregimiento?: string;
    veredaSectorBarrio?: string;
    direccion?: string;
    totalIntegrantes?: number;
    // ... other fields could be added
}

@Injectable({
    providedIn: 'root'
})
export class RufeService {
    private apiUrl = `${environment.apiUrl}/api/rufe`;

    constructor(private http: HttpClient) { }

    /**
     * Get all RUFE records from the server for the current organization
     */
    getAllRufes(): Observable<IRufeRemote[]> {
        return this.http.get<IRufeRemote[]>(this.apiUrl);
    }

    /**
     * Get a specific RUFE record by its ID
     */
    getRufe(id: number): Observable<IRufeRemote> {
        return this.http.get<IRufeRemote>(`${this.apiUrl}/${id}`);
    }

    /**
     * Create a new RUFE record on the server
     */
    createRufe(payload: any): Observable<IRufeRemote> {
        return this.http.post<IRufeRemote>(this.apiUrl, payload);
    }

    /**
     * Export RUFE records to Excel using backend JasperReports
     */
    exportToExcel(params: any = {}): Observable<Blob> {
        return this.http.get(`${this.apiUrl}/excel`, {
            params,
            responseType: 'blob'
        });
    }

    /**
     * Export RUFE records to PDF using backend JasperReports
     */
    exportToPdf(params: any = {}): Observable<Blob> {
        return this.http.get(`${this.apiUrl}/pdf`, {
            params,
            responseType: 'blob'
        });
    }
}

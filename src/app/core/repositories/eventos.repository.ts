import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { DatabaseService } from '../services/database.service';

export interface EventoReal {
    id?: number;
    clienteId?: number;
    nombreEvento: string;
    tipoEvento: string; // 'SIMULACRO' | 'REAL' etc.
    fechaEvento: string;
    departamentoId?: number;
    departamento?: string; // name
    municipioId?: number;
    municipio?: string; // name
    descripcion?: string;
}

@Injectable({
    providedIn: 'root'
})
export class EventosRepository {
    private apiUrl = `${environment.apiUrl}/api`;

    constructor(
        private http: HttpClient,
        private db: DatabaseService
    ) { }

    getAll(): Observable<EventoReal[]> {
        return this.http.get<EventoReal[]>(`${this.apiUrl}/eventos`);
    }

    // NUEVO: Cargar desde IndexedDB para modo offline
    async getAllFromCache(): Promise<EventoReal[]> {
        try {
            return await this.db.eventos_reales.toArray();
        } catch (error) {
            console.error('Error al cargar eventos desde IndexedDB:', error);
            return [];
        }
    }

    getById(id: number): Observable<EventoReal> {
        return this.http.get<EventoReal>(`${this.apiUrl}/eventos/${id}`);
    }

    create(evento: EventoReal): Observable<EventoReal> {
        return this.http.post<EventoReal>(`${this.apiUrl}/eventos`, evento);
    }

    update(id: number, evento: EventoReal): Observable<EventoReal> {
        return this.http.put<EventoReal>(`${this.apiUrl}/eventos/${id}`, evento);
    }

    delete(id: number): Observable<void> {
        // This performs a soft delete on backend as per requirements
        return this.http.delete<void>(`${this.apiUrl}/eventos/${id}`);
    }

    // NUEVO: Sincronizar eventos (API -> IndexedDB)
    async sync(): Promise<void> {
        try {
            const events = await this.getAll().toPromise();
            if (events) {
                await this.db.transaction('rw', this.db.eventos_reales, async () => {
                    await this.db.eventos_reales.clear();
                    await this.db.eventos_reales.bulkPut(events);
                });
            }
        } catch (error) {
            console.error('Error syncing events:', error);
            // Fallo silencioso o log, para no interrumpir el flujo si no hay red
        }
    }
}

// src/app/core/services/bodega.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface AyudaCatalogo {
  id?: number;
  nombre: string;
  descripcion?: string;
  unidadMedida?: string;
  tipoAyuda?: 'INDIVIDUAL' | 'COLECTIVA';
  activo?: boolean;
}

export interface PlanificacionEntrega {
  id?: number;
  organizacionId: number;
  eventoId: number;
  registroRufeId: number;
  ayudaCatalogoId: number;
  cantidad: number;
  estado: 'PENDIENTE' | 'ENTREGADO' | 'CANCELADO';
  fechaCreacion?: string;
  nombreBeneficiario?: string;
  nombreArticulo?: string;
}

export interface BodegaInventario {
  id?: number;
  ayudaCatalogo?: AyudaCatalogo;
  organizacionId: number;
  cantidad: number;
  ultimaActualizacion?: string;
}

export interface AyudasEntregadas {
  id?: number;
  registroRufeId: number;
  ayudaCatalogo?: AyudaCatalogo;
  cantidad: number;
  fechaEntrega?: string;
  firmaDigital?: string;
  evidenciaFotoUrl?: string;
}

@Injectable({
  providedIn: 'root',
})
export class BodegaService {
  private apiUrl = `${environment.apiUrl}/api/bodega`;

  constructor(private http: HttpClient) {}

  /**
   * Get global catalog of aid items.
   */
  getCatalogo(): Observable<AyudaCatalogo[]> {
    return this.http.get<AyudaCatalogo[]>(`${this.apiUrl}/catalogo`);
  }

  /**
   * Add item to the global catalog (Global Admin).
   */
  addCatalogoItem(item: AyudaCatalogo): Observable<AyudaCatalogo> {
    return this.http.post<AyudaCatalogo>(`${this.apiUrl}/catalogo`, item);
  }

  /**
   * Get current inventory for the user's organization.
   */
  getInventario(): Observable<BodegaInventario[]> {
    return this.http.get<BodegaInventario[]>(`${this.apiUrl}/inventario`);
  }

  /**
   * Adjust stock levels (Organization).
   */
  ajustarStock(ayudaCatalogoId: number, cantidad: number): Observable<BodegaInventario> {
    return this.http.post<BodegaInventario>(`${this.apiUrl}/inventario`, {
      ayudaCatalogoId,
      cantidad,
    });
  }

  /**
   * Realize a delivery of aids.
   */
  realizarEntrega(payload: {
    registroRufeId: number;
    ayudaCatalogoId: number;
    cantidad: number;
    firmaDigital?: string;
    evidenciaFotoUrl?: string;
  }): Observable<AyudasEntregadas> {
    return this.http.post<AyudasEntregadas>(`${this.apiUrl}/entregas`, payload);
  }

  /**
   * Get history of aid deliveries for the user's organization.
   */
  getHistorialEntregas(): Observable<AyudasEntregadas[]> {
    return this.http.get<AyudasEntregadas[]>(`${this.apiUrl}/entregas`);
  }

  // --- Planning Endpoints ---

  getPlanificacionEvento(eventoId: number): Observable<PlanificacionEntrega[]> {
    return this.http.get<PlanificacionEntrega[]>(`${environment.apiUrl}/api/planificacion/evento/${eventoId}`);
  }

  getPendientesPlanificacion(): Observable<PlanificacionEntrega[]> {
    return this.http.get<PlanificacionEntrega[]>(`${environment.apiUrl}/api/planificacion/pendientes`);
  }

  planificarEntrega(payload: {
    eventoId: number;
    registroRufeId: number;
    ayudaCatalogoId: number;
    cantidad: number;
  }): Observable<PlanificacionEntrega> {
    return this.http.post<PlanificacionEntrega>(`${environment.apiUrl}/api/planificacion`, payload);
  }

  eliminarPlanificacion(id: number): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/api/planificacion/${id}`);
  }
}

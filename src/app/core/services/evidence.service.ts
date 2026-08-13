// src/app/core/services/evidence.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface IEvidenciaRufe {
  id?: number;
  registroRufeId: number;
  tipoEvidencia: string;
  fotoUrl: string;
  fechaCarga?: string;
}

@Injectable({
  providedIn: 'root'
})
export class EvidenceService {
  private baseApiUrl = `${environment.apiUrl}/api/evidences`;
  private rufeEvidenciasUrl = `${environment.apiUrl}/api/rufe/evidencias`;

  constructor(private http: HttpClient) {}

  /**
   * Sube un archivo de evidencia al servidor.
   * Envía FormData con el archivo y el subdirectorio de destino.
   */
  uploadFile(file: File | Blob, subFolder: string = 'censos'): Observable<any> {
    const formData = new FormData();
    const fileName = (file as File).name || `evidencia_${Date.now()}.jpg`;
    formData.append('file', file, fileName);
    formData.append('subFolder', subFolder);

    return this.http.post<any>(`${this.baseApiUrl}/upload`, formData);
  }

  /**
   * Vincula la URL de la foto ya subida con el registro RUFE.
   */
  linkToRufe(payload: { registroRufeId: number; fotoUrl: string; tipoEvidencia?: string }): Observable<IEvidenciaRufe> {
    return this.http.post<IEvidenciaRufe>(this.rufeEvidenciasUrl, payload);
  }

  /**
   * Obtiene todas las evidencias de un registro RUFE.
   */
  getEvidenciasByRufe(registroRufeId: number): Observable<IEvidenciaRufe[]> {
    return this.http.get<IEvidenciaRufe[]>(`${this.rufeEvidenciasUrl}/${registroRufeId}`);
  }

  /**
   * Elimina el vínculo de una evidencia.
   */
  deleteEvidence(id: number): Observable<void> {
    return this.http.delete<void>(`${this.rufeEvidenciasUrl}/${id}`);
  }
}

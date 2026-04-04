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
   * Upload a file to the server. 
   * Returns a JSON with the URL and filename.
   */
  uploadFile(file: File, subFolder: string = 'censos'): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('subFolder', subFolder);

    return this.http.post<any>(`${this.baseApiUrl}/upload`, formData);
  }

  /**
   * Link an existing photo URL to a RUFE record.
   */
  linkToRufe(payload: { registroRufeId: number; fotoUrl: string; tipoEvidencia?: string }): Observable<IEvidenciaRufe> {
    return this.http.post<IEvidenciaRufe>(this.rufeEvidenciasUrl, payload);
  }

  /**
   * Get all evidences for a RUFE record.
   */
  getEvidenciasByRufe(registroRufeId: number): Observable<IEvidenciaRufe[]> {
    return this.http.get<IEvidenciaRufe[]>(`${this.rufeEvidenciasUrl}/${registroRufeId}`);
  }

  /**
   * Delete an evidence link.
   */
  deleteEvidence(id: number): Observable<void> {
    return this.http.delete<void>(`${this.rufeEvidenciasUrl}/${id}`);
  }
}

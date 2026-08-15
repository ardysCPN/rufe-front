// src/app/core/services/evidence.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, from } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { processImageForUpload, ImageCompressionOptions } from '../utils/image-utils';

export interface IEvidenceUploadRequest {
  fileName: string;
  contentType: string;
  imageBase64: string;
  subFolder?: string;
}

export interface IEvidenceUploadResponse {
  status: string;
  filename: string;
  url: string;
}

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
   * Sube una imagen codificada en Base64 mediante JSON (POST /api/evidences/upload).
   */
  uploadBase64(payload: IEvidenceUploadRequest): Observable<IEvidenceUploadResponse> {
    return this.http.post<IEvidenceUploadResponse>(`${this.baseApiUrl}/upload`, {
      fileName: payload.fileName,
      contentType: payload.contentType || 'image/jpeg',
      imageBase64: payload.imageBase64,
      subFolder: payload.subFolder || 'censos'
    });
  }

  /**
   * Comprime y sube un archivo File o Blob como JSON Base64 al servidor.
   */
  uploadFile(
    fileOrBlob: File | Blob,
    subFolder: string = 'censos',
    options?: ImageCompressionOptions
  ): Observable<IEvidenceUploadResponse> {
    return from(processImageForUpload(fileOrBlob, undefined, options)).pipe(
      switchMap(processed => {
        return this.uploadBase64({
          fileName: processed.fileName,
          contentType: processed.contentType,
          imageBase64: processed.imageBase64,
          subFolder
        });
      })
    );
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


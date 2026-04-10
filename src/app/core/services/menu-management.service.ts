// src/app/core/services/menu-management.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MenuManagementService {
  private apiUrl = `${environment.apiUrl}/api/admin/menu`;

  constructor(private http: HttpClient) { }

  getAllMenus(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/all`);
  }

  updateOfflineStatus(id: number, offlineCompatible: boolean): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${id}/offline`, null, {
      params: { offlineCompatible: offlineCompatible.toString() }
    });
  }
}

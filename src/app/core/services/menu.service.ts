// src/app/core/services/menu.service.ts

import { Injectable } from '@angular/core'; // Removed 'inject' as it's no longer needed here
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { IMenuItem } from '../models/menu.model';
import { environment } from '../../../environments/environment';
import { IUser } from '../models/auth.model'; // Import IUser
import { NetworkService } from './network.service'; // Importa el servicio de red
import localForage from 'localforage';

@Injectable({
  providedIn: 'root'
})
export class MenuService {
  private menuItemsSubject = new BehaviorSubject<IMenuItem[]>([]);
  public menuItems$: Observable<IMenuItem[]> = this.menuItemsSubject.asObservable();

  constructor(
    private http: HttpClient,
    private networkService: NetworkService // Inyecta el servicio de red
  ) {}

  /**
   * Fetches the dynamic menu items for the authenticated organization.
   * Updates the menuItemsSubject with the fetched data.
   * Now accepts `currentUser` as an argument to avoid `inject()` issues.
   * @param currentUser The currently authenticated user object.
   * @returns An Observable of the menu items.
   */
  getDynamicMenu(currentUser: IUser | null): Observable<IMenuItem[]> {
    const isOfflineSession = localStorage.getItem('isOfflineSession') === 'true';
    if (!this.networkService.isOnline  || isOfflineSession) {
      // Intenta recuperar el menú dinámico guardado en local
      return new Observable<IMenuItem[]>(observer => {
        localForage.getItem<IMenuItem[]>('dynamicMenu').then(menu => {
          if (menu && menu.length > 0) {
            this.menuItemsSubject.next(menu);
            observer.next(menu);
          } else {
            // Si no hay menú guardado, muestra solo el menú mínimo
            const offlineMenu: IMenuItem[] = [
              {
                id: 1,
                parentId: null,
                nombreItem: 'Nuevo RUFE',
                ruta: '/rufe/new',
                icono: 'add',
                orden: 1,
                subItems: null
              }
            ];
            this.menuItemsSubject.next(offlineMenu);
            observer.next(offlineMenu);
          }
          observer.complete();
        });
      });
    }

    if (!currentUser || currentUser.organizacionId === undefined) {
      console.error('MenuService: User not authenticated or organization ID missing.');
      return throwError(() => new Error('No se pudo cargar el menú: Usuario no autenticado o ID de organización no disponible.'));
    }

    const organizacionId = currentUser.organizacionId;

    return this.http.get<IMenuItem[]>(`${environment.apiUrl}/api/organizaciones/${organizacionId}/menu-items/dynamic-menu`)
      .pipe(
        tap(menuItems => {
          const sortedMenuItems = this.sortMenuItems(menuItems);
          this.menuItemsSubject.next(sortedMenuItems);
          // Guarda el menú dinámico en local para uso offline
          localForage.setItem('dynamicMenu', sortedMenuItems);
          console.log('Dynamic menu loaded:', sortedMenuItems);
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Clears the current menu items.
   */
  clearMenu(): void {
    this.menuItemsSubject.next([]);
    console.log('Menu items cleared.');
  }

  /**
   * Recursively sorts menu items and their sub-items by the 'orden' property.
   * @param items The array of menu items to sort.
   * @returns The sorted array of menu items.
   */
  private sortMenuItems(items: IMenuItem[]): IMenuItem[] {
    if (!items) {
      return [];
    }
    const sorted = [...items].sort((a, b) => a.orden - b.orden);
    sorted.forEach(item => {
      if (item.subItems && item.subItems.length > 0) {
        item.subItems = this.sortMenuItems(item.subItems);
      }
    });
    return sorted;
  }

  /**
   * Handles HTTP errors.
   */
  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An unknown error occurred!';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      const backendError = error.error;
      if (typeof backendError === 'string') {
        errorMessage = `Error Code: ${error.status}\nMessage: ${backendError}`;
      } else if (backendError && backendError.message) {
        errorMessage = `Error Code: ${error.status}\nMessage: ${backendError.message}`;
      } else {
        errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
      }

      if (error.status === 401) {
        errorMessage = 'Acceso no autorizado al menú. Credenciales inválidas o sesión expirada.';
      } else if (error.status === 403) {
        errorMessage = 'No tiene permisos para acceder a este menú.';
      }
    }
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}

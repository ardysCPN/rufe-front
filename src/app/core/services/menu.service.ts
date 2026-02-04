// src/app/core/services/menu.service.ts

import { Injectable } from '@angular/core'; // Removed 'inject' as it's no longer needed here
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { IMenuItem } from '../models/menu.model';
import { environment } from '../../../environments/environment';
import { IUser } from '../models/auth.model';
import { NetworkService } from './network.service';
import { DatabaseService } from './database.service';

@Injectable({
  providedIn: 'root'
})
export class MenuService {
  private menuItemsSubject = new BehaviorSubject<IMenuItem[]>([]);
  public menuItems$: Observable<IMenuItem[]> = this.menuItemsSubject.asObservable();

  constructor(
    private http: HttpClient,
    private networkService: NetworkService,
    private db: DatabaseService
  ) { }

  /**
   * Fetches the dynamic menu items for the authenticated organization.
   * Updates the menuItemsSubject with the fetched data.
   * Now accepts `currentUser` as an argument to avoid `inject()` issues.
   * @param currentUser The currently authenticated user object.
   * @returns An Observable of the menu items.
   */
  getDynamicMenu(currentUser: IUser | null): Observable<IMenuItem[]> {
    const isOfflineSession = localStorage.getItem('isOfflineSession') === 'true';

    // Check if offline or forcing offline session
    if (!this.networkService.isOnline || isOfflineSession) {
      return new Observable<IMenuItem[]>(observer => {
        // Use DatabaseService instead of localForage
        this.db.getMeta<IMenuItem[]>('dynamicMenu').then(menu => {
          if (menu && menu.length > 0) {
            this.menuItemsSubject.next(menu);
            observer.next(menu);
          } else {
            // Minimal offline fallback
            const offlineMenu: IMenuItem[] = [
              {
                id: 1,
                nombre: 'Nuevo RUFE',
                ruta: '/rufe/new',
                icono: 'add',
                orden: 1,
                children: null
              }
            ];
            this.menuItemsSubject.next(offlineMenu);
            observer.next(offlineMenu);
          }
          observer.complete();
        }).catch(err => {
          console.error('Error recovering menu from DB:', err);
          observer.error(err);
        });
      });
    }

    if (!currentUser || currentUser.rolId === undefined) {
      console.error('MenuService: User not authenticated or Role ID missing.');
      return throwError(() => new Error('No se pudo cargar el menú: Usuario no autenticado o ID de Rol no disponible.'));
    }

    const rolId = currentUser.rolId;

    return this.http.get<IMenuItem[]>(`${environment.apiUrl}/api/menu/rol/${rolId}`)
      .pipe(
        tap(menuItems => {
          const sortedMenuItems = this.sortMenuItems(menuItems);
          this.menuItemsSubject.next(sortedMenuItems);
          // Persist to DatabaseService for offline use
          this.db.setMeta('dynamicMenu', sortedMenuItems).then(() => {
            console.log('Dynamic menu saved to IndexedDB.');
          }).catch(err => console.error('Failed to save menu to DB', err));

          console.log('Dynamic menu loaded from API:', sortedMenuItems);
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Clears the current menu items.
   */
  clearMenu(): void {
    this.menuItemsSubject.next([]);
    // Optionally clear from DB too if security requires it, but for offline support we often keep it.
    // this.db.setMeta('dynamicMenu', []).catch(...); 
    console.log('Menu items cleared from state.');
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
      if (item.children && item.children.length > 0) {
        item.children = this.sortMenuItems(item.children);
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

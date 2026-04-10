// src/app/core/services/menu.service.ts

import { Injectable } from '@angular/core'; // Removed 'inject' as it's no longer needed here
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError, from, of } from 'rxjs';
import { catchError, tap, switchMap, map } from 'rxjs/operators';
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
   * Fetches the dynamic menu items. Uses IndexedDB for offline access.
   */
  getDynamicMenu(currentUser: IUser | null): Observable<IMenuItem[]> {
    // Check if offline or forcing offline session
    if (!this.networkService.isOnline || this.networkService.isOfflineSession) {
      return from(this.loadMenuFromLocal()).pipe(
        tap((menu: IMenuItem[]) => {
          if (menu && menu.length > 0) {
            this.menuItemsSubject.next(menu);
          } else {
            const fallback = this.getOfflineFallback();
            this.menuItemsSubject.next(fallback);
          }
        }),
        catchError(err => {
          console.error('Error recovering menu from DB:', err);
          const fallback = this.getOfflineFallback();
          this.menuItemsSubject.next(fallback);
          return of(fallback);
        })
      );
    }

    if (!currentUser || currentUser.rolId === undefined) {
      return throwError(() => new Error('Usuario no autenticado para cargar el menú.'));
    }

    return this.http.get<IMenuItem[]>(`${environment.apiUrl}/api/menu/rol/${currentUser.rolId}`)
      .pipe(
        switchMap(menuItems => {
          const sorted = this.sortMenuItems(menuItems);
          this.menuItemsSubject.next(sorted);
          
          // Use concatMap to ensure persistence finishes before emitting
          return from(this.saveMenuToLocal(sorted)).pipe(
            map(() => {
              console.log('Dynamic menu stored in IndexedDB table.');
              return sorted;
            }),
            catchError(err => {
              console.error('Error saving menu to IndexedDB:', err);
              return of(sorted); // Still emit current menu even if persistence fails
            })
          );
        }),
        catchError(this.handleError)
      );
  }

  private async saveMenuToLocal(menuTree: IMenuItem[]): Promise<void> {
    await this.db.ensureDbReady();
    const flatItems: any[] = [];
    
    const flatten = (items: IMenuItem[], parentId: number | null = null) => {
      items.forEach(item => {
        // Now using the dynamic property from backend (mapped to offlineCompatible or offline)
        // We ensure backward compatibility by checking both
        const isOffline = (item as any).offlineCompatible !== undefined ? 
                          (item as any).offlineCompatible : 
                          (item.offline || false);

        flatItems.push({
          id: item.id,
          nombre: item.nombre,
          ruta: item.ruta,
          icono: item.icono,
          orden: item.orden,
          offline: isOffline,
          parentId: parentId
        });
        if (item.children && item.children.length > 0) {
          flatten(item.children, item.id);
        }
      });
    };

    flatten(menuTree);

    // Use transaction but return the promise chain correctly
    return this.db.transaction('rw', this.db.menus, async () => {
      await this.db.menus.clear();
      await this.db.menus.bulkPut(flatItems);
    });
  }

  private async loadMenuFromLocal(): Promise<IMenuItem[]> {
    await this.db.ensureDbReady();
    const flatItems = await this.db.menus.toArray();
    if (flatItems.length === 0) return [];

    return this.rebuildTree(flatItems);
  }

  private rebuildTree(flatItems: any[]): IMenuItem[] {
    const itemMap: { [key: number]: IMenuItem } = {};
    const roots: IMenuItem[] = [];

    // Create objects for all items
    flatItems.forEach(item => {
      itemMap[item.id] = { ...item, children: [] };
    });

    // Link children to parents
    flatItems.forEach(item => {
      const current = itemMap[item.id];
      if (item.parentId !== null && itemMap[item.parentId]) {
        itemMap[item.parentId].children?.push(current);
      } else {
        roots.push(current);
      }
    });

    return this.sortMenuItems(roots);
  }

  private getOfflineFallback(): IMenuItem[] {
     return [
      { id: 101, nombre: 'Inicio (Panel)', ruta: '/dashboard', icono: 'dashboard', orden: 0, children: [], offline: true },
      { id: 102, nombre: 'Listado RUFE', ruta: '/rufe/list', icono: 'list_alt', orden: 1, children: [], offline: true },
      { id: 103, nombre: 'Nuevo Registro', ruta: '/rufe/new', icono: 'add_circle', orden: 2, children: [], offline: true },
      { id: 104, nombre: 'Gestión Bodega', ruta: '/admin/bodega', icono: 'inventory_2', orden: 3, children: [], offline: true },
      { id: 105, nombre: 'Herramientas', ruta: '/tools/sub-tools', icono: 'build', orden: 4, children: [], offline: true }
    ];
  }

  clearMenu(): void {
    this.menuItemsSubject.next([]);
  }

  private sortMenuItems(items: IMenuItem[]): IMenuItem[] {
    if (!items) return [];
    const sorted = [...items].sort((a, b) => a.orden - b.orden);
    sorted.forEach(item => {
      if (item.children && item.children.length > 0) {
        item.children = this.sortMenuItems(item.children);
      }
    });
    return sorted;
  }

  private handleError(error: HttpErrorResponse) {
    console.error('MenuService Error:', error);
    return throwError(() => new Error('Error al cargar el menú dinámico.'));
  }
}

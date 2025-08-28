// src/app/core/services/auth.service.ts

import { Injectable, PLATFORM_ID, Inject, forwardRef, NgZone } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, throwError, of, timer, Subject, forkJoin } from 'rxjs'; // Added forkJoin
import { catchError, tap, takeUntil, switchMap, finalize } from 'rxjs/operators';
import { ILoginCredentials, IUser, ICatalogApiResponse } from '../models/auth.model';
import { environment } from '../../../environments/environment';
import { DatabaseService } from './database.service';
import {
  ICatalogoMunicipio, ICatalogoDepartamento, ICatalogoTipoDocumento,
  ICatalogoGenero, ICatalogoParentesco, ICatalogoZona,
  // NEW IMPORTS
  ICatalogoTipoUbicacionBien, ICatalogoTipoAlojamientoActual,
  ICatalogoFormaTenenciaBien, ICatalogoEstadoBien,
  ICatalogoTipoBien, ICatalogoPertenenciaEtnica,
  ICatalogoEvento
} from '../../models/catalogs.model';
import { MenuService } from './menu.service';

// Helper function to decode JWT (simple version, for 'exp' claim)
function decodeJwt(token: string): any | null {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error('Error decoding JWT:', e);
    return null;
  }
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject: BehaviorSubject<IUser | null>;
  public currentUser: Observable<IUser | null>;
  private isBrowser: boolean;

  // Session management properties
  private readonly INACTIVITY_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes of inactivity
  private inactivityTimer: any;
  private userActivity$ = new Subject<void>();
  private destroy$ = new Subject<void>(); // For unsubscribing from long-lived observables

  constructor(
    private http: HttpClient,
    private router: Router,
    private dbService: DatabaseService,
    @Inject(forwardRef(() => MenuService)) private menuService: MenuService,
    @Inject(PLATFORM_ID) private platformId: Object,
    private ngZone: NgZone
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);

    let storedUser: IUser | null = null;
    if (this.isBrowser) {
      const userJson = localStorage.getItem('currentUser');
      if (userJson) {
        try {
          storedUser = JSON.parse(userJson);
          // Check if token is expired on app start
          if (storedUser && this.isTokenExpired(storedUser.token)) {
            console.log('Stored token is expired on startup. Logging out.');
            this.logout(false); // Logout without navigating to avoid loop if already on login
            storedUser = null;
          }
        } catch (e) {
          console.error('Error parsing stored user from localStorage', e);
          localStorage.removeItem('currentUser'); // Clear corrupt data
        }
      }
    }
    this.currentUserSubject = new BehaviorSubject<IUser | null>(storedUser);
    this.currentUser = this.currentUserSubject.asObservable();

    if (this.isBrowser) {
      this.setupInactivityTimer();
      this.listenForUserActivity();
    }
  }

  public get currentUserValue(): IUser | null {
    return this.currentUserSubject.value;
  }

  public getAccessToken(): string | null {
    return this.currentUserValue?.token || null;
  }

  isTokenExpired(token: string): boolean {
    if (!token) {
      return true;
    }
    const decodedToken = decodeJwt(token);
    if (!decodedToken || !decodedToken.exp) {
      // If no 'exp' claim, assume it's always valid or handle as an error
      return false; // Or true, depending on your security policy for malformed tokens
    }
    const expirationDate = new Date(0);
    expirationDate.setUTCSeconds(decodedToken.exp);
    return expirationDate.valueOf() < new Date().valueOf();
  }

  login(credentials: ILoginCredentials): Observable<any> {
    const loginPayload = {
      email: credentials.email,
      password: credentials.password,
      organizacion: credentials.organizacion
    };

    return this.http.post<any>(`${environment.apiUrl}/auth/login`, loginPayload)
      .pipe(
        tap(response => {
          console.log('Backend Login Response:', response);

          if (!response || !response.token || !response.type ||
              response.userId === undefined || !response.email ||
              !response.organizacionNombre || response.organizacionId === undefined ||
              response.rolId === undefined || !response.rolNombre) {
            console.error('Unexpected login response structure or missing data:', response);
            throw new Error('La respuesta del servidor no tiene el formato esperado o faltan datos esenciales.');
          }

          const decodedToken = decodeJwt(response.token);
          const expiresAt = decodedToken?.exp;

          const user: IUser = {
            token: response.token,
            type: response.type,
            userId: response.userId,
            email: response.email,
            organizacionId: response.organizacionId,
            organizacionNombre: response.organizacionNombre,
            rolId: response.rolId,
            rolNombre: response.rolNombre,
            expiresAt: expiresAt,
            permissions: response.permissions || []
          };

          if (this.isBrowser) {
            localStorage.setItem('currentUser', JSON.stringify(user));
            this.resetInactivityTimer();
          }
          this.currentUserSubject.next(user);

          if (this.isBrowser) {
            // Catalogs and menu loading will be handled by LayoutComponent or specific guards
            this.menuService.getDynamicMenu(this.currentUserSubject.value).subscribe({
              next: () => console.log('Menú dinámico cargado.'),
              error: (err) => console.error('Error al cargar el menú dinámico:', err)
            });
          } else {
            console.log('Skipping catalog fetch/store and menu fetch on server (SSR).');
          }
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Validates the current token by making a lightweight API call.
   * If expired or invalid, forces logout.
   * @returns Observable<boolean> - true if token is valid, false otherwise.
   */
  validateTokenAndKeepAlive(): Observable<boolean> {
    const currentUser = this.currentUserValue;
    if (!currentUser || !currentUser.token) {
      console.log('No current user or token found. Forcing logout.');
      this.logout();
      return of(false);
    }

    if (this.isTokenExpired(currentUser.token)) {
      console.log('Token is expired. Forcing logout.');
      this.logout();
      return of(false);
    }

    // Make a lightweight API call to ensure the session is still active on the backend.
    return this.http.get<any>(`${environment.apiUrl}/api/users/validate-session`) // Example endpoint
      .pipe(
        tap(() => {
          console.log('Session validated with backend. Token is still active.');
          this.resetInactivityTimer(); // Reset timer on successful validation/activity
        }),
        catchError(error => {
          console.error('Backend session validation failed:', error);
          if (error.status === 401) {
            console.log('Token invalid on backend. Forcing logout.');
            this.logout();
          }
          return of(false);
        }),
        switchMap(() => of(true))
      );
  }

  /**
   * Logs out the user. Clears all session data.
   * @param navigateToLogin Whether to navigate to the login page after logout. Defaults to true.
   */
  logout(navigateToLogin: boolean = true): void {
    console.log('Logging out user...');
    if (this.isBrowser) {
      localStorage.removeItem('currentUser');
      // Clear all IndexedDB tables on logout for complete data removal
      this.dbService.clearAllTables().then(() => {
        console.log('IndexedDB tables cleared on logout.');
      }).catch(err => {
        console.error('Error clearing IndexedDB tables on logout:', err);
      });
      this.clearInactivityTimer();
      this.destroy$.next();
      this.destroy$.complete();
    }
    this.currentUserSubject.next(null);
    this.menuService.clearMenu();
    if (navigateToLogin) {
      this.router.navigate(['/login']);
    }
  }

  // --- Inactivity Timer Logic ---
  private setupInactivityTimer(): void {
    this.ngZone.runOutsideAngular(() => {
      this.inactivityTimer = setTimeout(() => {
        this.ngZone.run(() => {
          console.log('Inactivity detected. Logging out.');
          this.logout();
        });
      }, this.INACTIVITY_TIMEOUT_MS);
    });
  }

  private resetInactivityTimer(): void {
    if (this.isBrowser) {
      this.clearInactivityTimer();
      this.setupInactivityTimer();
    }
  }

  private clearInactivityTimer(): void {
    if (this.inactivityTimer) {
      clearTimeout(this.inactivityTimer);
      this.inactivityTimer = null;
    }
  }

  private listenForUserActivity(): void {
    this.ngZone.runOutsideAngular(() => {
      const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll'];
      events.forEach(event => {
        window.addEventListener(event, () => this.userActivity$.next(), { passive: true });
      });
    });

    this.userActivity$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.resetInactivityTimer();
      });
  }
  // --- End Inactivity Timer Logic ---

  /**
   * Fetches all catalog data from the backend and stores it in IndexedDB.
   * This method is designed to be called when the app is online.
   * @returns An Observable that completes when all catalogs are fetched and stored.
   */
  fetchAndStoreCatalogs(): Observable<boolean> {
    if (!this.isBrowser) {
      console.log('Skipping catalog fetch/store on server (SSR).');
      return of(false);
    }

    const user = this.currentUserValue;
    if (!user || user.rolId === undefined) {
      console.warn('Cannot fetch catalogs: User not authenticated or role information missing.');
      return throwError(() => new Error('Usuario no autenticado o información de rol no disponible para catálogos.'));
    }

    // Define all catalog requests
    const catalogRequests = {
      departamentos: this.http.get<ICatalogoDepartamento[]>(`${environment.apiUrl}/api/catalogos/departamentos`),
      municipios: this.http.get<ICatalogoMunicipio[]>(`${environment.apiUrl}/api/catalogos/municipios`),
      eventos: this.http.get<ICatalogoEvento[]>(`${environment.apiUrl}/api/catalogos/eventos`),
      tipoUbicacionBien: this.http.get<ICatalogoTipoUbicacionBien[]>(`${environment.apiUrl}/api/catalogos/tipo-ubicacion-bien`),
      tipoAlojamientoActual: this.http.get<ICatalogoTipoAlojamientoActual[]>(`${environment.apiUrl}/api/catalogos/tipo-alojamiento-actual`),
      formaTenenciaBien: this.http.get<ICatalogoFormaTenenciaBien[]>(`${environment.apiUrl}/api/catalogos/forma-tenencia-bien`),
      estadoBien: this.http.get<ICatalogoEstadoBien[]>(`${environment.apiUrl}/api/catalogos/estado-bien`),
      tipoBien: this.http.get<ICatalogoTipoBien[]>(`${environment.apiUrl}/api/catalogos/tipo-bien`),
      tipoDocumento: this.http.get<ICatalogoTipoDocumento[]>(`${environment.apiUrl}/api/catalogos/tipo-documento`),
      parentesco: this.http.get<ICatalogoParentesco[]>(`${environment.apiUrl}/api/catalogos/parentesco`),
      genero: this.http.get<ICatalogoGenero[]>(`${environment.apiUrl}/api/catalogos/genero`),
      pertenenciaEtnica: this.http.get<ICatalogoPertenenciaEtnica[]>(`${environment.apiUrl}/api/catalogos/pertenencia-etnica`)
    };

    // Use forkJoin to wait for all catalog requests to complete
    return forkJoin(catalogRequests).pipe(
      tap(results => {
        this.dbService.bulkPutDepartamentos(results.departamentos);
        this.dbService.bulkPutMunicipios(results.municipios);
        this.dbService.bulkPutEventos(results.eventos);
        this.dbService.bulkPutTipoUbicacionBien(results.tipoUbicacionBien);
        this.dbService.bulkPutTipoAlojamientoActual(results.tipoAlojamientoActual);
        this.dbService.bulkPutFormaTenenciaBien(results.formaTenenciaBien);
        this.dbService.bulkPutEstadoBien(results.estadoBien);
        this.dbService.bulkPutTipoBien(results.tipoBien);
        this.dbService.bulkPutTipoDocumento(results.tipoDocumento);
        this.dbService.bulkPutParentesco(results.parentesco);
        this.dbService.bulkPutGenero(results.genero);
        this.dbService.bulkPutPertenenciaEtnica(results.pertenenciaEtnica);

        console.log('All catalogs stored in IndexedDB.');
      }),
      catchError(error => {
        console.error('Error fetching and storing catalogs:', error);
        return throwError(() => new Error('Fallo al cargar y almacenar catálogos.'));
      }),
      switchMap(() => of(true)) // Emit true on successful completion
    );
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = '¡Ocurrió un error inesperado!';
    let userMessage = 'Error al iniciar sesión.';

    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error de cliente: ${error.error.message}`;
      userMessage = 'Error de red o del navegador. Verifica tu conexión.';
    } else {
      if (error.status === 0) {
        errorMessage = `Error Code: 0\nMessage: No se pudo conectar con el servidor (${error.url}).`;
        userMessage = 'No se pudo conectar con el servidor. Puedes trabajar en modo offline si ya has iniciado sesión antes.';
      } else if (error.status === 401) {
        errorMessage = `Error Code: 401\nMessage: Credenciales inválidas o sesión expirada.`;
        userMessage = 'Credenciales incorrectas. Por favor, verifica tu correo y contraseña.';
      } else if (error.status === 403) {
        errorMessage = `Error Code: 403\nMessage: No tiene permisos para realizar esta acción.`;
        userMessage = 'No tienes permisos para acceder.';
      } else if (error.error && error.error.message) {
        errorMessage = `Error Code: ${error.status}\nMessage: ${error.error.message}`;
        userMessage = error.error.message;
      } else {
        errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
        userMessage = 'Error inesperado. Intenta nuevamente.';
      }
    }

    // Imprime el error técnico en consola para desarrolladores
    console.error(errorMessage);

    // Retorna un error con el mensaje para el usuario
    return throwError(() => ({ technical: errorMessage, user: userMessage, status: error.status }));
  }
}

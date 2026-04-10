// src/app/core/services/network.service.ts

import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, Observable, fromEvent, merge } from 'rxjs';
import { mapTo } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class NetworkService {
  private isBrowser: boolean;
  private onlineStatusSubject = new BehaviorSubject<boolean>(true); // Assume online by default
  private offlineSessionSubject = new BehaviorSubject<boolean>(false);

  /**
   * Observable that emits the current online/offline status.
   */
  public isOnline$: Observable<boolean> = this.onlineStatusSubject.asObservable();
  
  /**
   * Observable that emits if we are in an enforced offline session.
   */
  public isOfflineSession$: Observable<boolean> = this.offlineSessionSubject.asObservable();

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);

    if (this.isBrowser) {
      // Initialize with current online status
      this.onlineStatusSubject.next(navigator.onLine);
      
      // Initialize offline session from localStorage (migration path)
      const storedOffline = localStorage.getItem('isOfflineSession') === 'true';
      this.offlineSessionSubject.next(storedOffline);

      // Listen for online/offline events
      merge(
        fromEvent(window, 'online').pipe(mapTo(true)),
        fromEvent(window, 'offline').pipe(mapTo(false))
      ).subscribe(isOnline => {
        this.onlineStatusSubject.next(isOnline);
        console.log(`Network status changed: ${isOnline ? 'Online' : 'Offline'}`);
      });
    } else {
      // On server, always assume online or handle based on SSR needs
      this.onlineStatusSubject.next(true);
    }
  }

  /**
   * Returns the current online status synchronously.
   */
  public get isOnline(): boolean {
    return this.onlineStatusSubject.value;
  }

  /**
   * Returns if we are in an enforced offline session.
   */
  public get isOfflineSession(): boolean {
    return this.offlineSessionSubject.value;
  }

  /**
   * Sets the offline session state and persists it.
   */
  public setOfflineSession(value: boolean): void {
    this.offlineSessionSubject.next(value);
    if (this.isBrowser) {
      localStorage.setItem('isOfflineSession', value.toString());
    }
  }
}

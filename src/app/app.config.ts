// src/app/app.config.ts

import { ApplicationConfig, provideZoneChangeDetection, isDevMode, APP_INITIALIZER } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient, withInterceptors, withFetch } from '@angular/common/http'; // For HTTP client and interceptors
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';

import { routes } from './app.routes';
import { TokenInterceptor } from './core/interceptors/token.interceptor';
import { provideServiceWorker } from '@angular/service-worker'; // Import the functional interceptor
import { ConfigService } from './core/services/config.service';

export function initializeApp(configService: ConfigService) {
  return () => configService.loadConfig();
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideAnimations(),
    // Configure HttpClient and add the functional TokenInterceptor
    provideHttpClient(withInterceptors([
      TokenInterceptor // Register your functional token interceptor here
    ]), withFetch()),
    {
      provide: APP_INITIALIZER,
      useFactory: initializeApp,
      deps: [ConfigService],
      multi: true
    },
    // NgRx Store and Effects basic setup
    provideStore(), // Empty for now, will add reducers later
    provideEffects(),
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000'
    }), // Empty for now, will add effects later
    // Add other global providers here like DatabaseService (already providedIn: 'root')
  ]
};

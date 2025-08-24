// src/app/app.config.ts

import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient, withInterceptors } from '@angular/common/http'; // For HTTP client and interceptors
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';

import { routes } from './app.routes';
import { TokenInterceptor } from './core/interceptors/token.interceptor'; // Import the functional interceptor

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideAnimations(),
    // Configure HttpClient and add the functional TokenInterceptor
    provideHttpClient(withInterceptors([
      TokenInterceptor // Register your functional token interceptor here
    ])),
    // NgRx Store and Effects basic setup
    provideStore(), // Empty for now, will add reducers later
    provideEffects(), // Empty for now, will add effects later
    // Add other global providers here like DatabaseService (already providedIn: 'root')
  ]
};

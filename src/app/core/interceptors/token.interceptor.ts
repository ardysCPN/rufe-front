// src/app/core/interceptors/token.interceptor.ts

import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../../environments/environment';

/**
 * Functional HTTP Interceptor to add JWT token to outgoing requests.
 * It now retrieves the token directly from localStorage to avoid circular dependencies.
 */
export const TokenInterceptor: HttpInterceptorFn = (req, next) => {
  let authToken: string | null = null;

  // Check if running in browser before accessing localStorage
  // This interceptor will run on both client (browser) and server (SSR)
  // On the server, localStorage is not defined, so we must guard this access.
  if (typeof localStorage !== 'undefined') {
    const currentUserJson = localStorage.getItem('currentUser');
    if (currentUserJson) {
      try {
        const currentUser = JSON.parse(currentUserJson);
        // Assuming the token property is 'token' as per latest backend response
        authToken = currentUser.token;
      } catch (e) {
        console.error('Error parsing currentUser from localStorage in TokenInterceptor:', e);
      }
    }
  }

  const isApiUrl = req.url.startsWith(environment.apiUrl);

  // Clone the request and add the authorization header if a token is available and it's an API request
  if (authToken && isApiUrl) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${authToken}`
      }
    });
  }

  return next(req); // Continue with the request
};

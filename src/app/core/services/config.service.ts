import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface AppConfig {
    apiUrl: string;
}

@Injectable({
    providedIn: 'root'
})
export class ConfigService {
    private http = inject(HttpClient);
    private config: AppConfig | null = null;

    async loadConfig(): Promise<void> {
        try {
            // Fetch from the Express server endpoint
            const config = await firstValueFrom(this.http.get<AppConfig>('/api/config'));
            this.config = config;

            // Override environment for consistency (optional, but good for legacy code)
            if (this.config.apiUrl) {
                environment.apiUrl = this.config.apiUrl;
            }
        } catch (err) {
            console.error('Could not load configuration, using defaults', err);
        }
    }

    get apiUrl(): string {
        return this.config?.apiUrl || environment.apiUrl;
    }
}

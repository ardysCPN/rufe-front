import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class PwaService {
    private deferredPrompt: any;
    private canInstallSubject = new BehaviorSubject<boolean>(false);
    public canInstall$ = this.canInstallSubject.asObservable();

    constructor(@Inject(PLATFORM_ID) private platformId: Object) {
        if (isPlatformBrowser(this.platformId)) {
            window.addEventListener('beforeinstallprompt', (e) => {
                // Prevent Chrome 67 and earlier from automatically showing the prompt
                e.preventDefault();
                // Stash the event so it can be triggered later.
                this.deferredPrompt = e;
                this.canInstallSubject.next(true);
            });

            window.addEventListener('appinstalled', () => {
                this.deferredPrompt = null;
                this.canInstallSubject.next(false);
            });
        }
    }

    public installPwa(): void {
        if (this.deferredPrompt) {
            this.deferredPrompt.prompt();
            this.deferredPrompt.userChoice.then((choiceResult: { outcome: string }) => {
                if (choiceResult.outcome === 'accepted') {
                    console.log('User accepted the A2HS prompt');
                } else {
                    console.log('User dismissed the A2HS prompt');
                }
                this.deferredPrompt = null;
                this.canInstallSubject.next(false);
            });
        }
    }

    public isIos(): boolean {
        if (!isPlatformBrowser(this.platformId)) return false;

        return /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    }

    public isStandalone(): boolean {
        if (!isPlatformBrowser(this.platformId)) return false;

        return window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone;
    }
}

// src/app/shared/directives/has-permission.directive.ts

import { Directive, Input, TemplateRef, ViewContainerRef, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { Subscription } from 'rxjs';

@Directive({
  selector: '[appHasPermission]',
  standalone: true
})
export class HasPermissionDirective implements OnInit, OnDestroy {
  private permission: string = '';
  private subscription: Subscription | null = null;
  private hasView = false;

  @Input() set appHasPermission(val: string) {
    this.permission = val;
    this.updateView();
  }

  constructor(
    private templateRef: TemplateRef<any>,
    private vcr: ViewContainerRef,
    private authService: AuthService
  ) {}

  ngOnInit() {
    // Listen for user changes to re-evaluate permissions (e.g., after login/logout)
    this.subscription = this.authService.currentUser.subscribe(() => {
      this.updateView();
    });
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  private updateView() {
    const isAuthorized = this.authService.hasPermission(this.permission);

    if (isAuthorized && !this.hasView) {
      this.vcr.createEmbeddedView(this.templateRef);
      this.hasView = true;
    } else if (!isAuthorized && this.hasView) {
      this.vcr.clear();
      this.hasView = false;
    }
  }
}

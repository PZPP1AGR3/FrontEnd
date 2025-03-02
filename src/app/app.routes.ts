import { Routes } from '@angular/router';
import {authGuard} from "./core/guards/auth.guard";
import {notAuthGuard} from "./core/guards/not-auth.guard";

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    canActivate: [
      authGuard
    ],
    loadComponent: () => import('./layout/layout.component').then(c => c.LayoutComponent),
    loadChildren: () => import('./layout/layout.routes').then(r => r.routes)
  },
  {
    path: 'auth',
    canActivate: [
      notAuthGuard
    ],
    loadComponent: () => import('./auth/auth.component').then(c => c.AuthComponent),
    loadChildren: () => import('./auth/auth.routes').then(r => r.routes)
  },
  {
    path: '**',
    loadComponent: () => import('./not-found/not-found.component').then(c => c.NotFoundComponent)
  }
];

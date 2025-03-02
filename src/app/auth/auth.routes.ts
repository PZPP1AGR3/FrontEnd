import {Routes} from "@angular/router";

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () => import('./views/login-view/login-view.component').then(c => c.LoginViewComponent)
  },
  {
    path: 'register',
    pathMatch: 'full',
    loadComponent: () => import('./views/register-view/register-view.component').then(c => c.RegisterViewComponent)
  }
];

import { CanActivateFn } from '@angular/router';
import {AuthService} from "../services/auth/auth.service";
import {inject} from "@angular/core";

export const isAdminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  return authService.user()?.role === 'Admin';
};

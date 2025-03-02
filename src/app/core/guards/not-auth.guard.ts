import { CanActivateFn } from '@angular/router';
import {inject} from "@angular/core";
import {AuthService} from "../services/auth/auth.service";

export const notAuthGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  return !authService.isAuthorized;
};

import {CanActivateFn, Router} from '@angular/router';
import {inject} from "@angular/core";
import {AuthService} from "../services/auth/auth.service";

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  if (authService.isAuthorized) return true;
  const router = inject(Router);
  router.navigate(
    ['/auth'],
    {
      queryParams: {
        next: state.url
      }
    }
  );
  return false;
};

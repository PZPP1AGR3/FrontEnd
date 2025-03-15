import {HttpInterceptorFn, HttpRequest} from '@angular/common/http';
import {inject} from "@angular/core";
import {AuthService} from "../services/auth/auth.service";
import {Router} from "@angular/router";

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  if (
    req.url.includes('/login')
    || req.url.includes('/register')
  )
    return next(req);
  if (
    !authService.isAuthorized
  ) {
    const router = inject(Router);
    router.navigate(['/auth']);
    throw new Error(`Unauthorized.`);
  }
  return next(
    addAuthHeader(
      req,
      authService.token
    )
  );
};

function addAuthHeader(
  req: HttpRequest<any>,
  token: string
): HttpRequest<any> {
  return req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`
    }
  });
}

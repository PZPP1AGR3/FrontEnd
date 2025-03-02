import {inject, Injectable, signal} from '@angular/core';
import {Role, User, UserRegister, UserUpdate} from "../api/TEMP/user";
import {UserLogin} from "../interfaces/auth-util";
import {map, Observable, tap, timer} from "rxjs";
import {Router} from "@angular/router";

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  user = signal<User | null>(null);

  protected readonly router = inject(Router);

  constructor() { }

  get isAuthorized(): boolean {
    return this.user() !== null;
  }

  login(userLogin: UserLogin): Observable<void> {
    return timer(1000).pipe(
      tap(() => {
        this.user.set({
          id: 1,
          name: 'John Doe',
          role: Role.USER
        });
        this.router.navigate(['/']);
      }),
      map(v => {})
    )
  }

  register(userRegister: UserRegister) {
    return timer(1000).pipe(
      tap(() => {
        this.user.set({
          id: 1,
          name: userRegister.name,
          role: Role.USER
        });
        this.router.navigate(['/']);
      }),
      map(v => {})
    )

  }

  logout() {
    this.router.navigate(['/auth']);
    this.user.set(null);
  }

  update(userUpdate: UserUpdate) {

  }

  removeAccount() {

  }
}

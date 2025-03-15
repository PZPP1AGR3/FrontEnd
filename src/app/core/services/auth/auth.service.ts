import {DestroyRef, inject, Injectable, signal} from '@angular/core';
import {Role, User, UserRegister, UserUpdate} from "../../api/TEMP/user";
import {UserLogin} from "../../interfaces/auth-util";
import {map, Observable, takeUntil, tap, timer} from "rxjs";
import {Router} from "@angular/router";
import {AuthenticationService, UserResource, UserService} from "../../swagger";
import {cancelReplaySubject} from "../../utils/rx-util";
import {
  getLocalStorageConfigBool, getLocalStorageConfigString,
  setLocalStorageConfigBool,
  setLocalStorageConfigJSON, setLocalStorageConfigString
} from "../../utils/local-storage-utils";

// LocalStorage Key Remember Me
const LSK_REMEMBER_ME = 'rememberMe';
// LocalStorage Key Token
const LSK_TOKEN = 'token';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  user = signal<UserResource | null>(null);

  protected readonly authApiService = inject(AuthenticationService);
  protected readonly userApiService = inject(UserService);
  protected readonly router = inject(Router);
  protected readonly destroyRef = inject(DestroyRef);
  protected readonly cancelPipe = cancelReplaySubject(
    this.destroyRef
  );

  private _token: string = getLocalStorageConfigString(LSK_TOKEN, '');

  constructor() {
    if (
      this.rememberMe
    ) {
      this.loginViaSavedToken()
        .subscribe(() => this.router.navigate(['/']));
    }
  }

  get isAuthorized(): boolean {
    return this.user() !== null;
  }

  get token(): string {
    return this._token;
  }

  private get rememberMe(): boolean {
    return getLocalStorageConfigBool(LSK_REMEMBER_ME, false);
  }

  private set rememberMe(value: boolean) {
    setLocalStorageConfigBool(LSK_REMEMBER_ME, value);
  }

  private get savedToken(): string {
    return getLocalStorageConfigString(LSK_TOKEN, '');
  }

  private set savedToken(value: string) {
    setLocalStorageConfigString(LSK_TOKEN, value);
  }

  private loginViaSavedToken(): Observable<boolean> {
    return new Observable<boolean>(sub => {
      if (
        !this.rememberMe
        || !this.savedToken
      ) {
        sub.next(false);
        sub.complete();
        return;
      }
      this.authApiService.info()
        .pipe(
          takeUntil(
            this.cancelPipe.newSubject()
          )
        )
        .subscribe({
          next: infoResult => {
            this.user.set(infoResult.data);
            sub.next(true);
            sub.complete();
          },
          error: () => {
            this.rememberMe = false;
            this.savedToken = '';
            sub.next(false);
            sub.complete();
          }
        })
    });
  }

  login(userLogin: UserLogin): Observable<boolean> {
    return new Observable<boolean>(sub => {
      this.rememberMe = userLogin.rememberMe;
      this.authApiService.login(
        userLogin.username,
        userLogin.password
      )
        .pipe(
          takeUntil(
            this.cancelPipe.newSubject()
          ),
        )
        .subscribe({
          next: loginData => {
            this._token = loginData.token;
            if (
              this.rememberMe
            ) {
              this.savedToken = loginData.token;
            }
            sub.next(true);
            sub.complete();
          },
          error: err => {
            this.rememberMe = false;
            this.savedToken = '';
            sub.next(false);
            sub.complete();
          }
        });
    });
  }

  register(userRegister: UserRegister): Observable<boolean> {
    this.rememberMe = userRegister.rememberMe;
    return new Observable(sub => {
      this.authApiService.register({
        name: userRegister.name,
        username: userRegister.username,
        password: userRegister.password
      })
        .pipe(
          takeUntil(
            this.cancelPipe.newSubject()
          )
        )
        .subscribe({
          next: registerResult => {
            this._token = registerResult.token;
            if (
              this.rememberMe
            ) {
              this.savedToken = registerResult.token;
            }
            sub.next(true);
            sub.complete();
          },
          error: err => {
            this.rememberMe = false;
            this.savedToken = '';
            sub.next(false);
            sub.complete();
          }
        })
    });
  }

  logout() {
    this.rememberMe = false;
    this.savedToken = '';
    this.router.navigate(['/auth']);
    this.user.set(null);
  }

  updateName(name: string): Observable<boolean> {
    return new Observable(sub => {
      this.userApiService.usersUpdate(
        this.user()!.id,
        {
          name,
        }
      )
        .pipe(
          takeUntil(
            this.cancelPipe.newSubject()
          )
        )
        .subscribe({
          next: () => {
            sub.next(true);
            sub.complete();
          },
          error: () => {
            sub.next(false);
            sub.complete();
          }
        })
    });
  }

  removeAccount(): Observable<boolean> {
    return new Observable(sub => {
      this.userApiService.usersDestroy(
        this.user()!.id
      )
        .pipe(
          takeUntil(
            this.cancelPipe.newSubject()
          )
        )
        .subscribe({
          next: () => {
            this.logout();
            sub.next(true);
            sub.complete();
          },
          error: () => {
            sub.next(false);
            sub.complete();
          }
        })
    });
  }
}

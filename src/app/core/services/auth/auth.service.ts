import {DestroyRef, inject, Injectable, signal} from '@angular/core';
import {UserRegister} from "../../api/TEMP/user";
import {UserLogin} from "../../interfaces/auth-util";
import {Observable, takeUntil} from "rxjs";
import {Router} from "@angular/router";
import {AuthenticationService, UserResource, UserService} from "../../swagger";
import {cancelReplaySubject} from "../../utils/rx-util";
import {
  getLocalStorageConfigBool, getLocalStorageConfigJSON, getLocalStorageConfigString,
  setLocalStorageConfigBool,
  setLocalStorageConfigJSON, setLocalStorageConfigString
} from "../../utils/local-storage-utils";

// LocalStorage Key Remember Me
const LSK_REMEMBER_ME = 'rememberMe';
// LocalStorage Key Token
const LSK_TOKEN = 'token';
// LocalStorage Key User
const LSK_USER = 'user';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  user = signal<UserResource | null>(
    (() => {
      if (!this.rememberMe) return null;
      const user = getLocalStorageConfigJSON<any>(LSK_USER, {});
      return user.id ? user : null;
    })()
  );

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
            setLocalStorageConfigJSON(LSK_USER, infoResult.data);
            sub.next(true);
            sub.complete();
          },
          error: () => {
            this.rememberMe = false;
            this.savedToken = '';
            setLocalStorageConfigJSON(LSK_USER, null);
            sub.next(false);
            sub.complete();
          }
        })
    });
  }

  login(userLogin: UserLogin): Observable<boolean> {
    return new Observable<boolean>(sub => {
      this.rememberMe = userLogin.rememberMe;
      this.authApiService.login({
        username: userLogin.username,
        password: userLogin.password
      })
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
            this.user.set(loginData.user);
            setLocalStorageConfigJSON(LSK_USER, loginData.user);
            sub.next(true);
            sub.complete();
          },
          error: err => {
            this.rememberMe = false;
            this.savedToken = '';
            setLocalStorageConfigJSON(LSK_USER, null);
            this.user.set(null);
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
            this.user.set(registerResult.user);
            setLocalStorageConfigJSON(LSK_USER, registerResult.user);
            sub.next(true);
            sub.complete();
          },
          error: err => {
            this.rememberMe = false;
            this.savedToken = '';
            setLocalStorageConfigJSON(LSK_USER, null);
            this.user.set(null);
            sub.next(false);
            sub.complete();
          }
        })
    });
  }

  logout() {
    this.rememberMe = false;
    this.savedToken = '';
    setLocalStorageConfigJSON(LSK_USER, null);
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
            this.user.update(user => ({...user!, name }));
            setLocalStorageConfigJSON(LSK_USER, this.user());
            sub.next(true);
            sub.complete();
          },
          error: () => {
            sub.next(false);
            sub.complete();
          }
        });
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

import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  effect,
  inject,
  OnInit,
  signal,
  ViewEncapsulation
} from '@angular/core';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {passwordRegex} from "../../../core/utils/password-regex";
import {FloatLabelModule} from "primeng/floatlabel";
import {PasswordModule} from "primeng/password";
import {CheckboxModule} from "primeng/checkbox";
import {ChipsModule} from "primeng/chips";
import {Button} from "primeng/button";
import {AuthService} from "../../../core/services/auth/auth.service";
import {IForm} from "../../../core/interfaces/form";
import {UserLogin} from "../../../core/interfaces/auth-util";
import {loadingPipe} from "../../../core/utils/loading-signal-pipe";
import {InputErrorComponent} from "../../../core/elements/input-error/input-error.component";
import {map, switchMap, tap} from "rxjs";
import {ActivatedRoute, Router} from "@angular/router";
import {MessageModule} from "primeng/message";

@Component({
  selector: 'app-login-view',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    FloatLabelModule,
    PasswordModule,
    CheckboxModule,
    ChipsModule,
    Button,
    InputErrorComponent,
    MessageModule
  ],
  templateUrl: './login-view.component.html',
  styleUrl: './login-view.component.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginViewComponent
  implements OnInit {
  loginForm = new FormGroup<IForm<UserLogin>>({
    username: new FormControl<string>('', [Validators.required]),
    password: new FormControl<string>('', [Validators.required, Validators.pattern(passwordRegex)]),
    rememberMe: new FormControl<boolean>(false)
  });
  loading = loadingPipe(
    inject(DestroyRef)
  );
  protected readonly router = inject(Router);
  protected readonly authService = inject(AuthService);
  protected readonly activatedRoute = inject(ActivatedRoute);
  hasError = signal<boolean>(false);

  constructor() {
    effect(() => {
      if (this.loading.signal()) {
        this.loginForm.disable();
      } else {
        this.loginForm.enable();
      }
    });
  }

  ngOnInit() {
    this.authService.tryToLoginIfHasToken();
  }

  submit() {
    if (
      this.loginForm.invalid
      || this.loading.signal()
    ) return;
    this.hasError.set(false);
    this.loading.pipeTo(
      this.authService.login(
        this.loginForm.getRawValue() as UserLogin
      )
        .pipe(
          switchMap((loggedIn) =>
            this.activatedRoute.queryParamMap.pipe(
              map(paramMap => ({
                paramMap,
                loggedIn: loggedIn
              }))
            )
          ),
          tap(({paramMap, loggedIn}) => {
            if (!loggedIn) {
              this.hasError.set(true);
              return;
            }
            if (paramMap.has('next')) {
              this.router.navigateByUrl(paramMap.get('next')!);
            } else {
              this.router.navigate(['/notes']);
            }
          })
        )
    );
  }

  get username() {
    return this.loginForm.get('username') as FormControl;
  }

  get password() {
    return this.loginForm.get('password') as FormControl;
  }
}

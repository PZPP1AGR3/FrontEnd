import {ChangeDetectionStrategy, Component, DestroyRef, effect, inject, ViewEncapsulation} from '@angular/core';
import {Button} from "primeng/button";
import {CheckboxModule} from "primeng/checkbox";
import {FloatLabelModule} from "primeng/floatlabel";
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {InputTextModule} from "primeng/inputtext";
import {PasswordModule} from "primeng/password";
import {IForm} from "../../../core/interfaces/form";
import {passwordRegex} from "../../../core/utils/password-regex";
import {loadingPipe} from "../../../core/utils/loading-signal-pipe";
import {AuthService} from "../../../core/services/auth.service";
import {UserRegister} from "../../../core/api/TEMP/user";
import {passwordRepeatValidator} from "../../../core/utils/password-repeat-validator";
import {InputErrorComponent} from "../../../core/elements/input-error/input-error.component";

@Component({
  selector: 'app-register-view',
  standalone: true,
  imports: [
    Button,
    CheckboxModule,
    FloatLabelModule,
    FormsModule,
    InputTextModule,
    PasswordModule,
    ReactiveFormsModule,
    InputErrorComponent
  ],
  templateUrl: './register-view.component.html',
  styleUrl: './register-view.component.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RegisterViewComponent {
  registerForm = new FormGroup<IForm<UserRegister>>({
    name: new FormControl<string>('', [
      Validators.required,
      Validators.minLength(6),
      Validators.maxLength(50)
    ]),
    username: new FormControl<string>('', [
      Validators.required,
      Validators.minLength(6),
      Validators.maxLength(16)
    ]),
    password: new FormControl<string>('', [
      Validators.required,
      Validators.pattern(passwordRegex)
    ]),
    confirmPassword: new FormControl<string>('', [
      Validators.required,
      Validators.pattern(passwordRegex)
    ]),
    rememberMe: new FormControl<boolean>(false)
  });
  private readonly destroyRef = inject(DestroyRef);
  loading = loadingPipe(
    this.destroyRef
  );
  protected readonly authService = inject(AuthService);

  constructor() {
    passwordRepeatValidator(
      this.registerForm,
      'password',
      'confirmPassword',
      this.destroyRef
    );
    effect(() => {
      if (this.loading.signal()) {
        this.registerForm.disable();
      } else {
        this.registerForm.enable();
      }
    });
  }

  submit() {
    if (
      this.registerForm.invalid
      || this.loading.signal()
    ) return;
    this.loading.pipeTo(
      this.authService.register(
        this.registerForm.getRawValue() as UserRegister
      )
    );
  }

  get name() {
    return this.registerForm.get('name')!;
  }

  get username() {
    return this.registerForm.get('username')!;
  }

  get password() {
    return this.registerForm.get('password')!;
  }

  get confirmPassword() {
    return this.registerForm.get('confirmPassword')!;
  }

  get rememberMe() {
    return this.registerForm.get('rememberMe')!;
  }
}

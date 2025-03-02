import {ChangeDetectionStrategy, Component, ViewEncapsulation} from '@angular/core';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {passwordRegex} from "../../../core/interfaces/password-regex";
import {FloatLabelModule} from "primeng/floatlabel";
import {PasswordModule} from "primeng/password";
import {CheckboxModule} from "primeng/checkbox";
import {ChipsModule} from "primeng/chips";
import {Button} from "primeng/button";

@Component({
  selector: 'app-login-view',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    FloatLabelModule,
    PasswordModule,
    CheckboxModule,
    ChipsModule,
    Button
  ],
  templateUrl: './login-view.component.html',
  styleUrl: './login-view.component.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginViewComponent {
  loginForm = new FormGroup({
    username: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.required, Validators.pattern(passwordRegex)]),
    rememberMe: new FormControl(false)
  });
  // TODO: ADD LOADING STORE
  submit() {
    console.log(this.loginForm.getRawValue());
  }
}

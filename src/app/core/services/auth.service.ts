import {Injectable, signal} from '@angular/core';
import {User, UserRegister, UserUpdate} from "../api/TEMP/user";

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  user = signal<User | null>(null);

  constructor() { }

  get isAuthorized(): boolean {
    return this.user() !== null;
  }

  login(username: string, password: string) {

  }

  register(userRegister: UserRegister) {

  }

  logout() {

  }

  update(userUpdate: UserUpdate) {

  }

  removeAccount() {
    
  }
}

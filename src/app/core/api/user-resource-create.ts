import {Role} from "../swagger";

export interface UserResourceCreate {
  name: string;
  role: Role;
  username: string;
  password: string;
}

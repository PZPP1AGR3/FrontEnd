export * from './authentication.service';
import { AuthenticationService } from './authentication.service';
export * from './note.service';
import { NoteService } from './note.service';
export * from './user.service';
import { UserService } from './user.service';
export const APIS = [AuthenticationService, NoteService, UserService];

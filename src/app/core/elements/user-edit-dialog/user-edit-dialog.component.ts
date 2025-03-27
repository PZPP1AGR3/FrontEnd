import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef, effect,
  inject, signal,
  ViewEncapsulation
} from '@angular/core';
import {UserEditDialogService} from "../../services/user-edit-dialog/user-edit-dialog.service";
import {IForm} from "../../interfaces/form";
import {UserResource} from "../../swagger";
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {UsersDataService} from "../../services/users-data/users-data.service";
import {ConfirmationService, MessageService} from "primeng/api";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {debounceTime, filter} from "rxjs";
import {parseJSON} from "date-fns";
import {DialogModule} from "primeng/dialog";
import {Button} from "primeng/button";
import {FloatLabelModule} from "primeng/floatlabel";
import {InputErrorComponent} from "../input-error/input-error.component";
import {InputTextModule} from "primeng/inputtext";
import {DropdownModule} from "primeng/dropdown";
import {CalendarModule} from "primeng/calendar";

@Component({
  selector: 'app-user-edit-dialog',
  standalone: true,
  imports: [
    DialogModule,
    ReactiveFormsModule,
    Button,
    FloatLabelModule,
    InputErrorComponent,
    InputTextModule,
    DropdownModule,
    CalendarModule
  ],
  templateUrl: './user-edit-dialog.component.html',
  styleUrl: './user-edit-dialog.component.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserEditDialogComponent {
  protected readonly usersDataService = inject(UsersDataService);
  protected readonly destroyRef = inject(DestroyRef);
  protected readonly messageService = inject(MessageService);
  protected readonly confirmationService = inject(ConfirmationService);
  protected readonly userEditDialogService = inject(UserEditDialogService);
  loading = computed(() => this.usersDataService.loading.signal());
  userDialogOpen = signal<boolean>(false);
  currentUserString: string = '';
  hasChanges = signal<boolean>(false);
  userForm = new FormGroup<IForm<UserResource>>({
    id: new FormControl<number>(0),
    name: new FormControl<string>('', [Validators.required, Validators.min(6), Validators.max(50)]),
    role: new FormControl<string>('User', [Validators.required]),
    created_at: new FormControl<Date | null>(null, []),
    updated_at: new FormControl<Date | null>(null, [])
  });
  userRoleOptions = [
    {role: 'Admin'},
    {role: 'User'}
  ];

  constructor() {
    effect(() => {
      if (this.usersDataService.loading.signal()) {
        this.userForm.disable();
      } else {
        this.userForm.enable();
        this.created_at.disable();
        this.updated_at.disable();
      }
    });
    this.userEditDialogService.openDialog$
      .pipe(
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(userId => {
        if (userId) {
          this.loadUser(userId);
        } else {
          this.close(false);
        }
      });
    this.userEditDialogService.onClose$
      .pipe(
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => {
        this.userDialogOpen.set(false);
        this.hasChanges.set(false);
        this.currentUserString = '';
      });
    this.userForm.valueChanges
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        filter(() => !!this.id),
        debounceTime(150)
      )
      .subscribe(val => {
        this.hasChanges.set(
          JSON.stringify(
            this.userForm.getRawValue()
          ) !== this.currentUserString
        );
      });
  }

  loadUser(userId: number) {
    this.usersDataService.get(
      userId
    )
      .pipe(
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (user: UserResource) => {
          const parsedUser = {
            ...user,
            updated_at: parseJSON(user.updated_at),
            created_at: parseJSON(user.created_at)
          }
          this.currentUserString = JSON.stringify(parsedUser);
          this.userForm.setValue(parsedUser, {emitEvent: true});
          this.userDialogOpen.set(true);
        },
        error: err => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error getting user',
            detail: 'An error occurred while getting the user.',
          });
          return err;
        }
      });
  }

  save() {
    if (
      this.loading()
      || this.userForm.invalid
    ) return;
    const user = this.userForm.getRawValue() as UserResource;
    this.usersDataService.update(
      user.id,
      {
        name: user.name,
        role: user.role
      }
    )
      .pipe(
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'User updated',
            detail: `User "${this.name.value}" has been successfully updated.`,
          });
          this.close(true);
        },
        error: err => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error updating user',
            detail: 'An error occurred while updating the user.',
          });
          return err;
        }
      });
  }

  deleteUser() {
    if (!this.id.value) return;
    this.confirmationService.confirm({
      header: `Delete user`,
      message: `Are you sure that you want to delete user "${this.name.value}"?`,
      acceptButtonStyleClass: 'p-button-danger',
      rejectButtonStyleClass: 'p-button-text p-button-secondary',
      acceptIcon: 'pi pi-trash mr-2',
      rejectIcon: 'pi pi-times mr-2',
      acceptLabel: 'Yes, delete',
      rejectLabel: 'Cancel',
      accept: () => {
        this.usersDataService.delete(
          this.id.value as number
        )
          .pipe(
            takeUntilDestroyed(this.destroyRef)
          )
          .subscribe({
            next: () => {
              this.messageService.add({
                severity: 'success',
                summary: 'User deleted',
                detail: `User "${this.name.value}" has been successfully deleted.`,
              });
              this.close(true);
            },
            error: err => {
              this.messageService.add({
                severity: 'error',
                summary: 'Error deleting user',
                detail: 'An error occurred while deleting the user.',
              });
              return err;
            }
          });
      }
    });
  }

  reset() {
    const user = JSON.parse(this.currentUserString);
    this.userForm.setValue({
      ...user,
      updated_at: new Date(user.updated_at),
      created_at: new Date(user.created_at)
    }, {emitEvent: true});
    this.hasChanges.set(false);
  }

  close(hasChanges: boolean) {
    this.userEditDialogService.closed(hasChanges);
  }

  get id() {
    return this.userForm.get('id')!;
  }

  get name() {
    return this.userForm.get('name')!;
  }

  get role() {
    return this.userForm.get('role')!;
  }

  get created_at() {
    return this.userForm.get('created_at')!;
  }

  get updated_at() {
    return this.userForm.get('updated_at')!;
  }
}

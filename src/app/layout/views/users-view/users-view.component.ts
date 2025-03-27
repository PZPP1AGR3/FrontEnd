import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component, computed,
  DestroyRef, effect,
  inject,
  Injector, signal, viewChild,
  ViewEncapsulation
} from '@angular/core';
import {ConfirmationService, MessageService, PrimeTemplate} from "primeng/api";
import {Router} from "@angular/router";
import {Table, TableModule} from "primeng/table";
import {Paginator, PaginatorModule} from "primeng/paginator";
import {FormControl, FormsModule, ReactiveFormsModule} from "@angular/forms";
import {UserResource} from "../../../core/swagger";
import {debounceTime, filter, fromEvent, throttleTime} from "rxjs";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {mapOrderNumberToLiteral, mapRangeToPagination} from "../../../core/utils/api-adapters";
import {UsersDataService} from "../../../core/services/users-data/users-data.service";
import {TableControl, tableControl} from "../../../core/utils/table-factory";
import {Button} from "primeng/button";
import {InputTextModule} from "primeng/inputtext";
import {TooltipModule} from "primeng/tooltip";
import {UserEditDialogComponent} from "../../../core/elements/user-edit-dialog/user-edit-dialog.component";
import {UserEditDialogService} from "../../../core/services/user-edit-dialog/user-edit-dialog.service";

@Component({
  selector: 'app-users-view',
  standalone: true,
  imports: [
    Button,
    FormsModule,
    InputTextModule,
    PaginatorModule,
    PrimeTemplate,
    TableModule,
    TooltipModule,
    ReactiveFormsModule,
    UserEditDialogComponent
  ],
  providers: [UserEditDialogService],
  templateUrl: './users-view.component.html',
  styleUrl: './users-view.component.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UsersViewComponent
  implements AfterViewInit {
  protected readonly usersService = inject(UsersDataService);
  protected readonly destroyRef = inject(DestroyRef);
  protected readonly injector = inject(Injector);
  protected readonly confirmationService = inject(ConfirmationService);
  protected readonly messageService = inject(MessageService);
  protected readonly router = inject(Router);
  protected readonly userEditDialogService = inject(UserEditDialogService);
  private readonly notesTableRef = viewChild<Table>('usersTable');
  private readonly notesPaginatorRef = viewChild<Paginator>('usersPagination');
  private tableControl?: TableControl;
  searchFieldControl = new FormControl('');
  private searchText = signal<string>('');
  isLoading = computed<boolean>(() => this.usersService.loading.signal());
  showNoDataMessage = computed<boolean>(
    () =>
      !this.isLoading() && this.users().length === 0
  );
  users = signal<UserResource[]>([]);
  totalRecords = signal(0);
  hasMorePages = computed(() =>
    Math.floor(
      this.usersService.totalRecords()
      / (this.tableControl?.rows() ?? 1)
    ) > 1
  );

  ngAfterViewInit() {
    this.initializeTable();

    fromEvent<KeyboardEvent>(
      window,
      'keydown'
    )
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        throttleTime(60)
      )
      .subscribe((ev: KeyboardEvent) => {
        if (ev.altKey && ev.key === 'r') {
          this.getPage();
          ev.preventDefault();
          ev.stopPropagation();
          ev.stopImmediatePropagation();
        }
      });
    this.userEditDialogService.onClose$
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        filter(hasChanges => hasChanges)
      )
      .subscribe(() => {
        this.getPage();
      });
  }

  initializeTable() {
    this.tableControl = tableControl(
      this.notesTableRef()!,
      'notes',
      this.notesPaginatorRef()!,
      this.destroyRef,
      [10, 20, 50],
      this.injector
    );

    this.searchFieldControl.valueChanges
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        debounceTime(300)
      )
      .subscribe(val => this.searchText.set(val ?? ''));

    effect(() => {
      this.users.set(
        this.usersService.users()
      );
    }, {
      injector: this.injector,
      allowSignalWrites: true
    });

    effect(() => {
      this.totalRecords.set(
        this.usersService.totalRecords()
      );
    }, {
      injector: this.injector,
      allowSignalWrites: true
    });

    effect(
      () => {
        this.getPage();
      },
      {
        injector: this.injector,
        allowSignalWrites: true
      }
    );
  }

  getPage() {
    this.usersService.list({
      ...mapRangeToPagination(
        this.tableControl?.start() ?? 1,
        this.tableControl?.rows() ?? 10
      ),
      sortBy: this.tableControl?.sortBy(),
      order: mapOrderNumberToLiteral(this.tableControl?.order()),
      ...(this.searchText() && {search: this.searchText()})
    });
  }

  deleteUser(id: number, name: string) {
    this.confirmationService.confirm({
      header: `Delete user`,
      message: `Are you sure that you want to delete user "${name}"?`,
      acceptButtonStyleClass: 'p-button-danger',
      rejectButtonStyleClass: 'p-button-text p-button-secondary',
      acceptIcon: 'pi pi-trash mr-2',
      rejectIcon: 'pi pi-times mr-2',
      acceptLabel: 'Yes, delete',
      rejectLabel: 'Cancel',
      accept: () => {
        this.usersService.delete(id)
          .subscribe({
            next: () => {
              this.messageService.add({
                severity: 'success',
                summary: 'User deleted',
                detail: `User "${name}" has been successfully deleted.`,
              });
              this.getPage()
            },
            error: () => {
              this.messageService.add({
                severity: 'error',
                summary: 'Error deleting user',
                detail: `An error occurred while deleting the user "${name}".`,
              });
            }
          });
      }
    });
  }

  userTrackByFn = (_: never, user: UserResource) => user.id

  openUser(id: number) {
    this.userEditDialogService.edit(id);
  }
}

import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component, computed, DestroyRef, effect,
  inject, Injector,
  signal, viewChild,
  ViewEncapsulation
} from '@angular/core';
import {NoteResource, NoteSimpleResource} from "../../../core/swagger";
import {NotesDataService} from "../../../core/services/notes-data/notes-data.service";
import {TableControl, tableControl} from "../../../core/utils/table-factory";
import {Table, TableModule} from "primeng/table";
import {Paginator, PaginatorModule} from "primeng/paginator";
import {mapOrderNumberToLiteral, mapRangeToPagination} from "../../../core/utils/api-adapters";
import {FormControl, ReactiveFormsModule} from "@angular/forms";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {debounceTime, fromEvent, throttleTime} from "rxjs";
import {ConfirmationService, MessageService} from "primeng/api";
import {Router} from "@angular/router";
import {Button} from "primeng/button";
import {TooltipModule} from "primeng/tooltip";
import {InputTextModule} from "primeng/inputtext";

@Component({
  selector: 'app-main-view',
  standalone: true,
  imports: [
    TableModule,
    PaginatorModule,
    Button,
    TooltipModule,
    ReactiveFormsModule,
    InputTextModule
  ],
  templateUrl: './main-view.component.html',
  styleUrl: './main-view.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class MainViewComponent
  implements AfterViewInit {
  protected readonly notesService = inject(NotesDataService);
  protected readonly destroyRef = inject(DestroyRef);
  protected readonly injector = inject(Injector);
  protected readonly confirmationService = inject(ConfirmationService);
  protected readonly messageService = inject(MessageService);
  protected readonly router = inject(Router);
  private readonly notesTableRef = viewChild<Table>('notesTable');
  private readonly notesPaginatorRef = viewChild<Paginator>('notesPagination');
  private tableControl?: TableControl;
  searchFieldControl = new FormControl('');
  private searchText = signal<string>('');
  isLoading = computed<boolean>(() => this.notesService.loading.signal());
  showNoDataMessage = computed<boolean>(
    () =>
      !this.isLoading() && this.notes().length === 0
  );
  notes = signal<NoteSimpleResource[]>([]);
  totalRecords = signal(0);
  hasMorePages = computed(() =>
    Math.floor(
      this.notesService.totalRecords()
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
        if (ev.altKey && ev.key === 'n') {
          this.openCreateNote();
          ev.preventDefault();
          ev.stopPropagation();
          ev.stopImmediatePropagation();
        }
        if (ev.altKey && ev.key === 'r') {
          this.getPage();
          ev.preventDefault();
          ev.stopPropagation();
          ev.stopImmediatePropagation();
        }
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
      this.notes.set(
        this.notesService.notes()
      );
    }, {
      injector: this.injector,
      allowSignalWrites: true
    });

    effect(() => {
      this.totalRecords.set(
        this.notesService.totalRecords()
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
    this.notesService.list({
      ...mapRangeToPagination(
        this.tableControl?.start() ?? 1,
        this.tableControl?.rows() ?? 10
      ),
      sortBy: this.tableControl?.sortBy(),
      order: mapOrderNumberToLiteral(this.tableControl?.order()),
      ...(this.searchText() && {search: this.searchText()})
    });
  }

  deleteNote(id: number, title: string) {
    this.confirmationService.confirm({
      header: `Delete note`,
      message: `Are you sure that you want to delete note "${title}"?`,
      acceptButtonStyleClass: 'p-button-danger',
      rejectButtonStyleClass: 'p-button-text p-button-secondary',
      acceptIcon: 'pi pi-trash mr-2',
      rejectIcon: 'pi pi-times mr-2',
      acceptLabel: 'Yes, delete',
      rejectLabel: 'Cancel',
      accept: () => {
        this.notesService.delete(id)
          .subscribe({
            next: () => {
              this.messageService.add({
                severity: 'success',
                summary: 'Note deleted',
                detail: `Note "${title}" has been successfully deleted.`,
              });
              this.getPage()
            },
            error: () => {
              this.messageService.add({
                severity: 'error',
                summary: 'Error deleting note',
                detail: 'An error occurred while deleting the note.',
              });
            }
          });
      }
    });
  }

  noteTrackByFn = (_: never, note: NoteResource) => note.id

  openNote(id: number) {
    this.router.navigate(['/note', id]);
  }

  openCreateNote() {
    this.router.navigate(['/note/new']);
  }
}

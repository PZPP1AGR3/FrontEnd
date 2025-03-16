import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component, computed, DestroyRef, effect,
  inject, Injector,
  OnInit,
  signal, viewChild,
  ViewEncapsulation
} from '@angular/core';
import {NoteResource} from "../../../core/swagger";
import {NotesDataService} from "../../../core/services/notes-data/notes-data.service";
import {TableControl, tableControl} from "../../../core/utils/table-factory";
import {Table, TableModule} from "primeng/table";
import {Paginator, PaginatorModule} from "primeng/paginator";
import {mapOrderNumberToLiteral, mapRangeToPagination} from "../../../core/utils/api-adapters";
import {FormControl, ReactiveFormsModule} from "@angular/forms";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {debounceTime, tap} from "rxjs";
import {ConfirmationService} from "primeng/api";
import {Router, RouterLink} from "@angular/router";
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
    RouterLink,
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
  notes = computed(() => this.notesService.notes());

  ngAfterViewInit() {
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

  openNote(id: number) {
    this.router.navigate(['/note', id])
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
            next: () => this.getPage()
          });
      }
    });
  }

  noteTrackByFn = (_: never, note: NoteResource) => note.id
}

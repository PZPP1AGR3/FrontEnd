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
import {mapOrderNumberToLiteral} from "../../../core/utils/api-adapters";
import {FormControl} from "@angular/forms";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {debounceTime} from "rxjs";

@Component({
  selector: 'app-main-view',
  standalone: true,
  imports: [
    TableModule,
    PaginatorModule
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
  private readonly notesTableRef = viewChild<Table>('notesTable');
  private readonly notesPaginatorRef = viewChild<Paginator>('notesPagination');
  private tableControl?: TableControl;
  searchFieldControl = new FormControl('');
  private searchText = signal<string>('');
  isLoading = computed<boolean>(() => this.notesService.loading.signal());

  notes = signal<NoteResource[]>([]);

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
        injector: this.injector
      }
    );
  }

  getPage() {
    this.notesService.list({
      page: this.tableControl?.start() ?? 1,
      pageSize: this.tableControl?.rows() ?? 10,
      sortBy: this.tableControl?.sortBy(),
      order: mapOrderNumberToLiteral(this.tableControl?.order()),
      search: this.searchText()
    });
  }

  openNote(id: number) {

  }

  deleteNote(id: number) {
    // TODO: confirm dialog
  }
}

import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component, computed,
  DestroyRef, effect,
  inject, Injector,
  signal,
  ViewEncapsulation
} from '@angular/core';
import {EditorComponent} from "../../../core/elements/editor/editor.component";
import {ActivatedRoute, Router} from "@angular/router";
import {NotesDataService} from "../../../core/services/notes-data/notes-data.service";
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {InlineResponse2003, NoteResource, Role, UserResource} from "../../../core/swagger";
import {IForm} from "../../../core/interfaces/form";
import {catchError, debounceTime, filter, tap} from "rxjs";
import {ConfirmationService} from "primeng/api";
import {InputTextModule} from "primeng/inputtext";
import {InputSwitchModule} from "primeng/inputswitch";
import {TooltipModule} from "primeng/tooltip";
import {DatePipe} from "@angular/common";
import {ProgressSpinnerModule} from "primeng/progressspinner";
import {Button} from "primeng/button";

@Component({
  selector: 'app-note-view',
  standalone: true,
  imports: [
    EditorComponent,
    ReactiveFormsModule,
    InputTextModule,
    InputSwitchModule,
    TooltipModule,
    DatePipe,
    ProgressSpinnerModule,
    Button
  ],
  templateUrl: './note-view.component.html',
  styleUrl: './note-view.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class NoteViewComponent
  implements AfterViewInit {
  protected readonly router = inject(Router);
  protected readonly notesDataService = inject(NotesDataService);
  protected readonly destroyRef = inject(DestroyRef);
  protected readonly activatedRoute = inject(ActivatedRoute);
  protected readonly injector = inject(Injector);
  protected readonly confirmationService = inject(ConfirmationService);
  loading = computed(() => this.notesDataService.loading.signal());
  isNew = signal<boolean>(true);
  noteForm = new FormGroup<IForm<NoteResource>>({
    id: new FormControl<number | undefined>(undefined),
    title: new FormControl('', [
      Validators.min(3),
      Validators.max(100)
    ]),
    content: new FormControl(''),
    user: new FormGroup<IForm<UserResource>>({
      id: new FormControl<number>(0),
      name: new FormControl<string>(''),
      role: new FormControl(''),
      created_at: new FormControl(''),
      updated_at: new FormControl('')
    }),
    is_public: new FormControl(false),
    created_at: new FormControl<Date | undefined>(undefined),
    updated_at: new FormControl<Date | undefined>(undefined)
  });
  currentNoteString: string = '';
  error = signal<string | undefined>(undefined);
  hasChanges = signal<boolean>(false);

  ngAfterViewInit() {
    this.activatedRoute.paramMap
      .pipe(
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(params => {
        if (!params.get('id') || params.get('id') === 'new') {
          this.isNew.set(true);
        } else {
          this.isNew.set(false);
          this.loadNote(+params.get('id')!);
        }
      });

    this.noteForm.valueChanges
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        filter(() => !this.isNew()),
        debounceTime(150)
      )
      .subscribe(val => {
        this.hasChanges.set(
          JSON.stringify(val) !== this.currentNoteString
        );
      });
  }

  loadNote(id: number) {
    this.notesDataService.get(
      id
    )
      .pipe(
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: note => {
          this.currentNoteString = JSON.stringify(note);
          this.noteForm.setValue({
            ...note,
            updated_at: new Date(note.updated_at),
            created_at: new Date(note.created_at)
          }, {emitEvent: true});
          this.error.set(undefined);
        },
        error: (err: any) => {
          this.error.set('loading note');
          return err;
        }
      });
  }

  save() {
    if (
      this.loading()
      || this.noteForm.invalid
    ) return;
    const data = this.noteForm.getRawValue() as NoteResource;
    if (data.id) {
      this.updateNote(data);
    } else {
      this.createNote(data);
    }
  }

  updateNote(note: NoteResource) {
    this.notesDataService.update(
      note.id,
      {
        title: note.title,
        content: note.content,
        is_public: note.is_public
      }
    )
      .pipe(
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: updatedNote => {
          this.currentNoteString = JSON.stringify(updatedNote);
          this.noteForm.patchValue({
            updated_at: new Date(updatedNote.updated_at)
          });
          this.error.set(undefined);
        },
        error: err => {
          this.error.set('updating note');
          return err;
        }
      });
  }

  createNote(note: NoteResource) {
    this.notesDataService.create({
      title: note.title,
      content: note.content,
      is_public: note.is_public
    })
      .pipe(
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (createdNote: NoteResource) => {
          this.currentNoteString = JSON.stringify(note);
          this.noteForm.patchValue({
            id: createdNote.id,
            user: createdNote.user,
            is_public: createdNote.is_public,
          }, {emitEvent: true});
          this.isNew.set(false);
          this.hasChanges.set(false);
          this.error.set(undefined);
        },
        error: err => {
          this.error.set('creating note');
          return err;
        }
      });
  }

  deleteNote() {
    const id = this.noteForm.get('id')?.getRawValue();
    if (id) {
      this.confirmationService.confirm({
        header: `Delete note`,
        message: `Are you sure that you want to delete this note?`,
        acceptButtonStyleClass: 'p-button-danger',
        rejectButtonStyleClass: 'p-button-text p-button-secondary',
        acceptIcon: 'pi pi-trash mr-2',
        rejectIcon: 'pi pi-times mr-2',
        acceptLabel: 'Yes, delete',
        rejectLabel: 'Cancel',
        accept: () => {
          this.notesDataService.delete(id)
            .pipe(
              takeUntilDestroyed(this.destroyRef)
            )
            .subscribe({
              next: () => {
                this.router.navigate(['/']);
                this.error.set(undefined);
              },
              error: err => {
                this.error.set('deleting note');
                return err;
              }
            });
        }
      });
    } else {
      this.router.navigate(['/notes']);
    }
  }

  reset() {
    const note = JSON.parse(this.currentNoteString) as NoteResource;
    this.noteForm.setValue({
      ...note,
      updated_at: new Date(note.updated_at),
      created_at: new Date(note.created_at)
    }, {emitEvent: true});
    this.hasChanges.set(false);
  }

  get title() {
    return this.noteForm.get<string>('title')!;
  }

  get author() {
    return this.noteForm.get('user')
      ?.get('name');
  }

  get created_at() {
    return new Date(this.noteForm.get('created_at')!.value as any);
  }

  get updated_at() {
    return new Date(this.noteForm.get('updated_at')!.value as any);
  }
}

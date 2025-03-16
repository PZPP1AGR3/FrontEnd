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
      createdAt: new FormControl(''),
      updatedAt: new FormControl('')
    }),
    isPublic: new FormControl(false),
    createdAt: new FormControl<Date | undefined>(undefined),
    updatedAt: new FormControl<Date | undefined>(undefined)
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
        filter(() => !this.isNew()),
        takeUntilDestroyed(this.destroyRef),
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
      .subscribe({
        next: note => {
          this.currentNoteString = JSON.stringify(note);
          this.noteForm.setValue({
            ...note,
            updatedAt: new Date(note.updatedAt),
            createdAt: new Date(note.createdAt)
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
        isPublic: note.isPublic
      }
    )
      .subscribe({
        next: updatedNote => {
          this.currentNoteString = JSON.stringify(updatedNote);
          this.noteForm.patchValue({
            updatedAt: new Date(updatedNote.updatedAt)
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
      isPublic: note.isPublic
    })
      .subscribe({
        next: (createdNote: NoteResource) => {
          this.currentNoteString = JSON.stringify(note);
          this.noteForm.patchValue({
            id: createdNote.id,
            user: createdNote.user,
            isPublic: createdNote.isPublic,
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
      this.router.navigate(['/']);
    }
  }

  reset() {
    const note = JSON.parse(this.currentNoteString) as NoteResource;
    this.noteForm.setValue({
      ...note,
      updatedAt: new Date(note.updatedAt),
      createdAt: new Date(note.createdAt)
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

  get createdAt() {
    return new Date(this.noteForm.get('createdAt')!.value as any);
  }

  get updatedAt() {
    return new Date(this.noteForm.get('updatedAt')!.value as any);
  }
}

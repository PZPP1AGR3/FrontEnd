import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component, computed,
  DestroyRef,
  inject,
  signal,
  ViewEncapsulation
} from '@angular/core';
import {EditorComponent} from "../../../core/elements/editor/editor.component";
import {ActivatedRoute, Router} from "@angular/router";
import {NotesDataService} from "../../../core/services/notes-data/notes-data.service";
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {NoteResource, UserResource} from "../../../core/swagger";
import {IForm} from "../../../core/interfaces/form";
import {debounceTime, filter} from "rxjs";
import {ConfirmationService, MessageService} from "primeng/api";
import {InputTextModule} from "primeng/inputtext";
import {InputSwitchModule} from "primeng/inputswitch";
import {TooltipModule} from "primeng/tooltip";
import {DatePipe} from "@angular/common";
import {ProgressSpinnerModule} from "primeng/progressspinner";
import {Button} from "primeng/button";
import {AuthService} from "../../../core/services/auth/auth.service";
import {OverlayPanelModule} from "primeng/overlaypanel";
import {MessageModule} from "primeng/message";
import {IconFieldModule} from "primeng/iconfield";
import {Clipboard} from "@angular/cdk/clipboard";
import {parseJSON} from "date-fns";

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
    Button,
    OverlayPanelModule,
    MessageModule,
    IconFieldModule
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
  protected readonly authService = inject(AuthService);
  protected readonly clipboard = inject(Clipboard);
  protected readonly messageService = inject(MessageService);
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
  hasChanges = signal<boolean>(false);
  isSharedByAnother = signal<boolean>(false);
  sharingUrl = signal<string>('');

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
          const parsedNote = {
            ...note,
            updated_at: parseJSON(note.updated_at),
            created_at: parseJSON(note.created_at)
          };
          this.currentNoteString = JSON.stringify(parsedNote);
          this.noteForm.setValue(parsedNote, {emitEvent: true});
          this.isSharedByAnother.set(
            note.user?.id !== this.authService.user()?.id
          );
          this.sharingUrl.set(
            `${location.protocol}//${location.host}/note/${note.id}`
          )
        },
        error: (err: any) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error loading note',
            detail: 'An error occurred while loading the note.',
          });
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
          const parsedNote = {
            ...updatedNote,
            updated_at: parseJSON(updatedNote.updated_at),
            created_at: parseJSON(updatedNote.created_at)
          };
          this.currentNoteString = JSON.stringify(parsedNote);
          this.noteForm.patchValue({
            updated_at: new Date(parsedNote.updated_at)
          });
          this.hasChanges.set(false);
          this.messageService.add({
            severity: 'success',
            summary: 'Note updated',
            detail: 'The note has been updated successfully.',
          });
        },
        error: err => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error updating note',
            detail: 'An error occurred while updating the note.',
          });
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
          this.router.navigate([`/note/${createdNote.id}`], {replaceUrl: true});
          const parsedNote = {
            ...createdNote,
            updated_at: parseJSON(createdNote.updated_at),
            created_at: parseJSON(createdNote.created_at)
          };
          this.currentNoteString = JSON.stringify(parsedNote);
          this.noteForm.setValue(parsedNote, {emitEvent: true});
          this.sharingUrl.set(
            `${location.protocol}//${location.host}/note/${note.id}`
          )
          this.isNew.set(false);
          this.hasChanges.set(false);
          this.messageService.add({
            severity: 'success',
            summary: 'Note created',
            detail: 'The note has been created successfully.',
          });
        },
        error: err => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error creating note',
            detail: 'An error occurred while creating the note.',
          });
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
                this.messageService.add({
                  severity: 'success',
                  summary: 'Note deleted',
                  detail: 'The note has been deleted successfully.',
                });
                this.router.navigate(['/notes']);
              },
              error: err => {
                this.messageService.add({
                  severity: 'error',
                  summary: 'Error deleting note',
                  detail: 'An error occurred while deleting the note.',
                });
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

  get isPublic() {
    return this.noteForm.get('is_public')!.value;
  }

  stopSharing() {
    this.noteForm.get('is_public')!.setValue(false);
  }

  startSharing() {
    this.noteForm.get('is_public')!.setValue(true);
  }

  copySharingUrl() {
    if (
      this.clipboard.copy(this.sharingUrl())
    ) {
      this.messageService.add({
        severity: 'success',
        summary: 'Sharing URL copied',
        detail: 'The sharing URL has been copied to your clipboard.'
      });
    } else {
      this.messageService.add({
        severity: 'error',
        summary: 'Failed to copy sharing URL',
        detail: 'An error occurred while trying to copy the sharing URL to your clipboard.'
      });
    }
  }
}

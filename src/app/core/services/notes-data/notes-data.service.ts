import {DestroyRef, inject, Injectable, signal} from '@angular/core';
import {NoteResource, NotesBody, NoteService, NotesNoteBody} from "../../swagger";
import {Pagination} from "../../api/pagination";
import {tap} from "rxjs";
import {loadingPipe} from "../../utils/loading-signal-pipe";

@Injectable({
  providedIn: 'root'
})
export class NotesDataService {
  protected readonly noteApiService = inject(NoteService);
  protected readonly destroyRef = inject(DestroyRef);
  notes = signal<NoteResource[]>([]);
  loading = loadingPipe(this.destroyRef)

  list(pagination: Pagination){
    return this.loading.pipeTo(
      this.noteApiService.notesIndex(
        pagination.page ?? 1,
        pagination.search,
        undefined,
        undefined,
        pagination.sortBy,
        pagination.order,
        pagination.pageSize ?? 20,
      )
        .pipe(
          tap(notes => this.notes.set(notes.data))
        )
    );
  }

  get(id: number) {
    return this.loading.pipeTo(
      this.noteApiService.notesShow(
        id
      )
    );
  }

  update(id: number, note: NotesNoteBody) {
    return this.loading.pipeTo(
      this.noteApiService.notesUpdate(
        id,
        note
      )
    );
  }

  create(note: NotesBody) {
    return this.loading.pipeTo(
      this.noteApiService.notesStore(
        note
      )
    );
  }

  delete(id: number) {
    return this.loading.pipeTo(
      this.noteApiService.notesDestroy(
        id
      )
    );
  }
}

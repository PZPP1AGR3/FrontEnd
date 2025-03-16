import {DestroyRef, inject, Injectable, signal} from '@angular/core';
import {NoteResource, NotesBody, NoteService, NotesNoteBody} from "../../swagger";
import {Pagination} from "../../api/pagination";
import {catchError, Observable, tap} from "rxjs";
import {loadingPipe} from "../../utils/loading-signal-pipe";

@Injectable({
  providedIn: 'root'
})
export class NotesDataService {
  protected readonly noteApiService = inject(NoteService);
  protected readonly destroyRef = inject(DestroyRef);
  notes = signal<NoteResource[]>([]);
  totalRecords = signal<number>(0);
  loading = loadingPipe(this.destroyRef);


  list(pagination: Pagination) {
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
          tap(notes => this.notes.set(notes.data)),
          tap(notes => this.totalRecords.set((<any>notes).meta?.total ?? 0))
        )
    );
  }

  get(id: number) {
    return new Observable<NoteResource>(sub => {
      this.loading.pipeTo(
        this.noteApiService.notesShow(
          id
        )
          .pipe(
            tap(res => {
              sub.next(res.data);
              sub.complete();
            }),
            catchError(err => {
              sub.error(err);
              sub.complete();
              return err;
            })
          )
      );
    });
  }

  update(id: number, note: NotesNoteBody) {
    return new Observable<NoteResource>(sub => {
      this.loading.pipeTo(
        this.noteApiService.notesUpdate(
          id,
          note
        )
          .pipe(
            tap(res => {
              sub.next(res.data);
              sub.complete();
            }),
            catchError(err => {
              sub.error(err);
              sub.complete();
              return err;
            })
          )
      );
    });
  }

  create(note: NotesBody) {
    return new Observable<NoteResource>(sub => {
      this.loading.pipeTo(
        this.noteApiService.notesStore(
          note
        )
          .pipe(
            tap(res => {
              sub.next(res.data);
              sub.complete();
            }),
            catchError(err => {
              sub.error(err);
              sub.complete();
              return err;
            })
          )
      );
    });
  }

  delete(id: number) {
    return new Observable<any>(sub => {
      this.loading.pipeTo(
        this.noteApiService.notesDestroy(
          id
        )
          .pipe(
            tap(res => {
              sub.next(res.data);
              sub.complete();
            }),
            catchError(err => {
              sub.error(err);
              sub.complete();
              return err;
            })
          )
      );
    });
  }
}

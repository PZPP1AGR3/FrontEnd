import {DestroyRef, inject, Injectable, signal} from '@angular/core';
import {UserResource, UserService, UsersUserBody} from "../../swagger";
import {loadingPipe} from "../../utils/loading-signal-pipe";
import {Pagination} from "../../api/pagination";
import {catchError, Observable, tap} from "rxjs";
import {UserResourceCreate} from "../../api/user-resource-create";

@Injectable({
  providedIn: 'root'
})
export class UsersDataService {
  protected readonly userApiService = inject(UserService);
  protected readonly destroyRef = inject(DestroyRef);
  users = signal<UserResource[]>([]);
  totalRecords = signal<number>(0);
  loading = loadingPipe(this.destroyRef);

  list(pagination: Pagination) {
    return this.loading.pipeTo(
      this.userApiService.usersIndex(
        pagination.page ?? 1,
        pagination.search,
        pagination.sortBy,
        pagination.order,
        undefined,
        pagination.pageSize ?? 20,
      )
        .pipe(
          tap(users => this.users.set(users.data)),
          tap(users => this.totalRecords.set((<any>users).meta?.total ?? 0))
        )
    );
  }

  get(id: number) {
    return new Observable<UserResource>(sub => {
      this.loading.pipeTo(
        this.userApiService.usersShow(
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

  update(id: number, note: UsersUserBody) {
    return new Observable<UserResource>(sub => {
      this.loading.pipeTo(
        this.userApiService.usersUpdate(
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

  create(note: UserResourceCreate) {
    return new Observable<UserResource>(sub => {
      this.loading.pipeTo(
        this.userApiService.usersStore(
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
        this.userApiService.usersDestroy(
          id
        )
          .pipe(
            tap(res => {
              sub.next(res);
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

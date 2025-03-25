import { Injectable } from '@angular/core';
import {Subject} from "rxjs";

type Changed = boolean;

@Injectable({
  providedIn: 'root'
})
export class UserEditDialogService {
  openDialog$ = new Subject<number>();
  onClose$ = new Subject<Changed>();

  edit(userId: number) {
    this.openDialog$.next(userId);
  }

  create() {
    this.openDialog$.next(0);
  }

  closed(hasChanged: Changed) {
    this.onClose$.next(hasChanged);
  }
}

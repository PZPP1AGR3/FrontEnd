import {ReplaySubject} from "rxjs";
import {DestroyRef} from "@angular/core";

export function isNotNull<T>(value: T): value is NonNullable<T> {
  return value != null;
}

export const cancelReplaySubject = (destroyRef?: DestroyRef) => {
  let currentSubject: ReplaySubject<boolean> = new ReplaySubject<boolean>(1);

  if (destroyRef) {
    destroyRef.onDestroy(() => {
      currentSubject.next(true);
      currentSubject.complete();
    });
  }

  return {
    getCurrentSubject: () => currentSubject,
    newSubject: () => {
      if (!currentSubject.closed) {
        currentSubject.next(true);
        currentSubject.complete();
      }
      currentSubject = new ReplaySubject<boolean>(1);
      return currentSubject;
    },
    close: () => {
      currentSubject.next(true);
      currentSubject.complete();
    }
  }
}

type CancellableSubjectIdentifier = string | number;

export const multipleCancelReplaySubjects = (destroyRef?: DestroyRef) => {
  let subjects: Map<CancellableSubjectIdentifier, ReplaySubject<boolean>>
      = new Map<CancellableSubjectIdentifier, ReplaySubject<boolean>>(),
    currentSubject: CancellableSubjectIdentifier | undefined = undefined;

  if (destroyRef) {
    destroyRef.onDestroy(() => {
      subjects.forEach(subject => {
        subject.next(true);
        subject.complete();
      });
      subjects.clear();
    });
  }

  return {
    create: (identifier: CancellableSubjectIdentifier) => {
      subjects.set(identifier, new ReplaySubject<boolean>(1));
      return subjects.get(identifier);
    },
    getCurrentSubject: () => currentSubject,
    get: (identifier: CancellableSubjectIdentifier) => {
      return subjects.get(identifier);
    },
    close: (identifier: CancellableSubjectIdentifier) => {
      const subject = subjects.get(identifier);
      if (!subject) throw new Error(`No subject found with identifier: ${identifier}`);
      subject.next(true);
      subject.complete();
      subjects.delete(identifier);
    },
    closeAll: () => {
      subjects.forEach(subject => {
        subject.next(true);
        subject.complete();
      });
      subjects.clear();
    }
  }
}

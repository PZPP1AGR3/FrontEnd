import {Observable, Subscription} from "rxjs";
import {DestroyRef, signal} from "@angular/core";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";

export const loadingPipe = (destroyRef?: DestroyRef) => {
  let currentSubscription: Subscription | undefined = undefined;
  const sig = signal<boolean>(false),
  subCallback = {
    next: (v: any) => {
      sig.set(false);
    },
    error: () => {
      sig.set(false);
    },
    complete: () => {}
  };
  return {
    subscription: () => currentSubscription,
    pipeTo: (obs: Observable<any>) => {
      if (currentSubscription !== undefined) {
        currentSubscription!.unsubscribe();
      }
      sig.set(true);
      if (destroyRef) {
        currentSubscription = obs.pipe(
          takeUntilDestroyed(destroyRef)
        )
          .subscribe(
            subCallback
          );
      } else {
        currentSubscription = obs.subscribe(
          subCallback
        );
      }
    },
    signal: sig,
    destroy: () => {
      if (destroyRef || currentSubscription === undefined) return;
      sig.set(false);
      currentSubscription!.unsubscribe();
    }
  }
}

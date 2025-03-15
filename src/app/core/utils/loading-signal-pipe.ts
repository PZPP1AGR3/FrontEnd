import {Observable, Subscription} from "rxjs";
import {DestroyRef, signal, WritableSignal} from "@angular/core";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";

export interface LoadingPipeChain {
  observable: () => Observable<any> | undefined;
  pipeTo: (obs: Observable<any>) => LoadingPipeChain;
  signal: WritableSignal<boolean>;
  destroy: () => void;
}

export const loadingPipe = (destroyRef?: DestroyRef): LoadingPipeChain => {
  let currentSubscription: Subscription | undefined = undefined;
  const sig = signal<boolean>(false),
    subCallback = {
      next: (v: any) => {
        sig.set(false);
      },
      error: () => {
        sig.set(false);
      },
      complete: () => {
      }
    };
  let chain: LoadingPipeChain | undefined = undefined,
  currentObservable: Observable<any> | undefined;
  chain = {
    observable: () => currentObservable,
    pipeTo: (obs: Observable<any>) => {
      if (currentSubscription !== undefined) {
        currentSubscription!.unsubscribe();
      }
      sig.set(true);
      currentObservable = obs;
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
      return chain!;
    },
    signal: sig,
    destroy: () => {
      if (destroyRef || currentSubscription === undefined) return;
      sig.set(false);
      currentSubscription!.unsubscribe();
      currentObservable = undefined;
    }
  };
  return chain!;
}

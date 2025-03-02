import {createAction, createFeature, createReducer, on, props, provideState, Store} from "@ngrx/store";
import {DestroyRef, signal, WritableSignal} from "@angular/core";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";

type Err = { error: string | undefined };

export const onLoadingAction = createAction('loading');
export const onLoadedAction = createAction('loaded');
export const onFailedToLoadAction = createAction('failed to load', props<Err>());

export interface LoadingState {
  loading: boolean;
  error: string | undefined;
}

const initialState: LoadingState = {
  loading: false,
  error: undefined
};

export const loadingFeature = createFeature({
  name: 'loading',
  reducer: createReducer(
    initialState,
    on(
      onLoadingAction,
      state => ({
        loading: true,
        error: undefined
      })
    ),
    on(
      onLoadedAction,
      state => ({
        ...state,
        loading: false
      })
    ),
    on(
      onFailedToLoadAction,
      (state, {error}) => ({
        loading: false,
        error
      })
    )
  )
});

export const ofLoadingState = (
  store: Store<{loading: typeof loadingFeature}>,
  destroyRef: DestroyRef
): WritableSignal<LoadingState> => {
  let state = signal<LoadingState>({
    loading: false,
    error: undefined
  });
  store.select('loading')
    .pipe(
      takeUntilDestroyed(destroyRef)
    )
    .subscribe(newState => {
      state.set(newState as any as LoadingState);
    });
  return state;
}

export const loadingStateProvider = provideState(loadingFeature);

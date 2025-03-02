import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  effect, ElementRef,
  inject,
  input,
  signal,
  ViewEncapsulation
} from '@angular/core';
import {AbstractControl} from "@angular/forms";
import {debounceTime, Subscription} from "rxjs";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";

@Component({
  selector: 'app-input-error',
  standalone: true,
  imports: [],
  templateUrl: './input-error.component.html',
  styleUrl: './input-error.component.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InputErrorComponent {
  error = input.required<string>();
  control = input.required<AbstractControl>();
  show = signal<boolean>(false);
  private _subscription: Subscription | undefined = undefined;
  private destroyRef = inject(DestroyRef);
  private el = inject(ElementRef);

  constructor() {
    effect(() => {
      if (this._subscription) this._subscription.unsubscribe();
      this._subscription = this.control().valueChanges
        .pipe(
          takeUntilDestroyed(this.destroyRef),
          debounceTime(100)
        )
        .subscribe(() => {
          this.show.set(
            this.control().hasError(
              this.error()
            )
          );
        });
    });
    effect(() => {
      const classList = this.el.nativeElement.classList;
      if (this.show()) {
        if (classList.contains('hidden')) classList.remove('hidden');
        if (!classList.contains('flex')) classList.add('flex');
      } else {
        if (classList.contains('flex')) classList.remove('flex');
        if (!classList.contains('hidden')) classList.add('hidden');
      }
    });
  }
}

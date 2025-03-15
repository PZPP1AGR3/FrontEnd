import {ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit, signal, ViewEncapsulation} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [],
  templateUrl: './not-found.component.html',
  styleUrl: './not-found.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class NotFoundComponent
  implements OnInit {
  route = signal<string>('');
  protected readonly activatedRoute = inject(ActivatedRoute);
  protected readonly destroyRef = inject(DestroyRef);

  ngOnInit() {
    this.activatedRoute.url
      .pipe(
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(url => {
        this.route.set(
          url.join('/')
        );
      });
  }
}

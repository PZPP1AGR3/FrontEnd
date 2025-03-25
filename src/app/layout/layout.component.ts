import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef, effect,
  inject,
  signal,
  ViewEncapsulation
} from '@angular/core';
import {ListItem} from "../core/interfaces/list-item";
import {NavigationEnd, Router, RouterOutlet} from "@angular/router";
import {MenubarModule} from "primeng/menubar";
import {Button} from "primeng/button";
import {SkeletonModule} from "primeng/skeleton";
import {OverlayPanelModule} from "primeng/overlaypanel";
import {ListboxModule} from "primeng/listbox";
import {AuthService} from "../core/services/auth/auth.service";
import {Location, SlicePipe} from "@angular/common";
import {filter, map} from "rxjs";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {MegaMenuItem} from "primeng/api";

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    MenubarModule,
    Button,
    SkeletonModule,
    OverlayPanelModule,
    ListboxModule,
    SlicePipe
  ],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LayoutComponent {
  protected readonly authService = inject(AuthService);
  protected readonly destroyRef = inject(DestroyRef);
  protected readonly location = inject(Location);
  protected readonly router = inject(Router);
  userBoxItems: ListItem[] = [
    {
      label: 'My account',
      value: 'myAccount',
      command: () => console.log('My account')
    },
    {
      label: 'Logout',
      value: 'logout',
      command: () => this.authService.logout()
    }
  ];
  menuItems: MegaMenuItem[] = [];
  userName = computed(() => this.authService.user()?.name ?? 'Logged out.');
  disableBackButton = signal<boolean>(false);

  constructor() {
    this.router.events
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        filter(event => event instanceof NavigationEnd),
        map(() => this.router.url)
      )
      .subscribe(url => {
        this.disableBackButton.set(url.startsWith('/notes') || url.startsWith('/users'));
      });
    effect(() => {
      this.menuItems = this.authService.user()?.role === 'Admin'
        ? [
          {
            label: 'My notes',
            routerLink: '/notes'
          },
          {
            label: 'Manage users',
            routerLink: '/users'
          }
        ] : [];
    });
  }

  goBack() {
    this.location.back();
  }
}

import {ChangeDetectionStrategy, Component, computed, inject, ViewEncapsulation} from '@angular/core';
import {ListItem} from "../core/interfaces/list-item";
import {RouterOutlet} from "@angular/router";
import {MenubarModule} from "primeng/menubar";
import {Button} from "primeng/button";
import {SkeletonModule} from "primeng/skeleton";
import {OverlayPanelModule} from "primeng/overlaypanel";
import {ListboxModule} from "primeng/listbox";
import {AuthService} from "../core/services/auth.service";
import {SlicePipe} from "@angular/common";

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
  protected readonly authService = inject(AuthService);
  userName = computed(() => this.authService.user()?.name ?? 'Logged out.');
}

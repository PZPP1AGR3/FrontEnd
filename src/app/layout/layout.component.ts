import {ChangeDetectionStrategy, Component, ViewEncapsulation} from '@angular/core';
import {ListItem} from "../core/interfaces/list-item";
import {RouterOutlet} from "@angular/router";
import {MenubarModule} from "primeng/menubar";
import {Button} from "primeng/button";
import {SkeletonModule} from "primeng/skeleton";
import {OverlayPanelModule} from "primeng/overlaypanel";
import {ListboxModule} from "primeng/listbox";

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    MenubarModule,
    Button,
    SkeletonModule,
    OverlayPanelModule,
    ListboxModule
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
      command: () => console.log('Option 1 clicked')
    },
    {
      label: 'Logout',
      value: 'logout',
      command: () => console.log('Option 1 clicked')
    }
  ];
}

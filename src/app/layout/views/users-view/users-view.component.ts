import {ChangeDetectionStrategy, Component, ViewEncapsulation} from '@angular/core';

@Component({
  selector: 'app-users-view',
  standalone: true,
  imports: [],
  templateUrl: './users-view.component.html',
  styleUrl: './users-view.component.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UsersViewComponent {

}

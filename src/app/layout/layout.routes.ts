import {Routes} from "@angular/router";

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () => import('./views/main-view/main-view.component').then(c => c.MainViewComponent)
  },
  {
    path: 'note/:id',
    loadComponent: () => import('./views/note-view/note-view.component').then(c => c.NoteViewComponent)
  }
];

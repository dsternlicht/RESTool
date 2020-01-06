import { RouterModule } from '@angular/router';
import { MainViewComponent } from './main-view.component';

const routes = [
  {path: '', component: MainViewComponent},
  {path: ':pageId', component: MainViewComponent}
];

export const Routing = RouterModule.forChild(routes);

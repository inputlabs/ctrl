import { Component, ApplicationConfig } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, provideRouter} from '@angular/router';

import { HeaderComponent } from './header';
import { SidebarComponent } from './sidebar';
import { CentralComponent } from './central';
import { LogsComponent } from './logs';
import { WipComponent } from './wip';

const routes: Routes = [

  {path: '', component: LogsComponent},
  {path: 'tools/tester', component: WipComponent},
  {path: 'tools/fw_update', component: WipComponent},
  {path: 'profiles/0', component: WipComponent},
  {path: 'profiles/1', component: WipComponent},
  {path: 'profiles/2', component: WipComponent},
  {path: 'profiles/3', component: WipComponent},
  {path: 'profiles/4', component: WipComponent},
  {path: 'profiles/5', component: WipComponent},
  {path: 'profiles/6', component: WipComponent},
  {path: 'profiles/7', component: WipComponent},
  {path: 'profiles/8', component: WipComponent},
  {path: 'profiles/9', component: WipComponent},
  {path: 'profiles/10', component: WipComponent},
  {path: 'profiles/11', component: WipComponent},
  {path: 'profiles/12', component: WipComponent},
  {path: 'settings/protocol', component: WipComponent},
  {path: 'settings/deadzone', component: WipComponent},
  {path: 'settings/touch_sens', component: WipComponent},
  {path: 'settings/mouse_sens', component: WipComponent},
  {path: 'settings/advanced', component: WipComponent},
  {path: 'settings/app', component: WipComponent},
  // Redirects
  {path: 'profiles', redirectTo: '/profiles/0', pathMatch: 'full' },
  {path: 'settings', redirectTo: '/settings/protocol', pathMatch: 'full' },
];

export const appConfig: ApplicationConfig = {
  providers: [provideRouter(routes)]
};

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    HeaderComponent,
    SidebarComponent,
    CentralComponent,
  ],
  templateUrl: './app.html',
  styleUrls: ['./app.sass']
})
export class AppComponent {

}

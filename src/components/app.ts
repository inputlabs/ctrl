import { Component, ApplicationConfig } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, provideRouter} from '@angular/router';

import { HeaderComponent } from './header';
import { SidebarComponent } from './sidebar';
import { CentralComponent } from './central';
import { LogsComponent } from './logs';
import { WipComponent } from './wip';

const routes: Routes = [
  {path: '', redirectTo: '/tools/logs', pathMatch: 'full' },
  {path: 'tools', redirectTo: '/tools/logs', pathMatch: 'full' },
  {path: 'profiles', redirectTo: '/profiles/0', pathMatch: 'full' },
  {path: 'tools/logs', component: LogsComponent},
  {path: 'tools/tester', component: WipComponent},
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
  {path: 'settings', component: WipComponent},
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

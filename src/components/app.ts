import { Component, ApplicationConfig } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Routes, provideRouter} from '@angular/router';

import { HeaderComponent } from './header';
import { SidebarComponent } from './sidebar';
import { CentralComponent } from './central';

const routes: Routes = [];

export const appConfig: ApplicationConfig = {
  providers: [provideRouter(routes) ]
};

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    HeaderComponent,
    SidebarComponent,
    CentralComponent,
  ],
  templateUrl: './app.html',
  styleUrls: ['./app.sass']
})
export class AppComponent {
  title = 'ctrl';
}

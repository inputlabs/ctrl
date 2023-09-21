// SPDX-License-Identifier: GPL-2.0-only
// Copyright (C) 2023, Input Labs Oy.

import { Component, ApplicationConfig } from '@angular/core'
import { CommonModule } from '@angular/common'
import { provideRouter} from '@angular/router'

import { routes } from '../routing'
import { HeaderComponent } from './header'
import { SidebarComponent } from './sidebar'
import { CentralComponent } from './central'

export const appConfig: ApplicationConfig = {
  providers: [provideRouter(routes)]
}

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

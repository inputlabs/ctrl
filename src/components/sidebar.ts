// SPDX-License-Identifier: GPL-2.0-only
// Copyright (C) 2023, Input Labs Oy.

import { Component } from '@angular/core'
import { CommonModule } from '@angular/common'
import { RouterLink, RouterLinkActive, Router, NavigationEnd} from '@angular/router'
import { LedComponent, LED } from './led'
import { version, commit } from '../lib/version'

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.sass'],
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    LedComponent,
  ]
})
export class SidebarComponent {
  route: string = ''
  ledColorOff = '#555'
  LED = LED
  version = version.split('/').pop()
  commit = commit.slice(0, 12)

  constructor(
    private router: Router
  ) {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.route = event.urlAfterRedirects
      }
    })
  }

  isTools() {
    return this.route == '/' || this.route.startsWith('/tools')
  }

  isProfiles() {
    return this.route.startsWith('/profiles')
  }

  isSettings() {
    return this.route.startsWith('/settings')
  }

  isHelp() {
    return this.route.startsWith('/help')
  }
}

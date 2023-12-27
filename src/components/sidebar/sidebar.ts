// SPDX-License-Identifier: GPL-2.0-only
// Copyright (C) 2023, Input Labs Oy.

import { Component } from '@angular/core'
import { CommonModule } from '@angular/common'
import { RouterLink, RouterLinkActive, Router, NavigationEnd} from '@angular/router'
import { LedComponent, LED, getProfileLed } from 'components/led/led'
import { ProfileService } from 'services/profiles'
import { VERSION, COMMIT } from 'lib/version'

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
  // Template aliases.
  LED = LED
  VERSION = VERSION.split('/').pop()  // If version is a branch name from git, keep only the tail.
  COMMIT = COMMIT.slice(0, 12)  // Keep only the first 12 hash characters.
  getProfileLed = getProfileLed

  constructor(
    private router: Router,
    public profileService: ProfileService,
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

  getProfileName(index: number) {
    return this.profileService.profiles[index].name.name
  }
}

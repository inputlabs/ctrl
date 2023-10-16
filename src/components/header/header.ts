// SPDX-License-Identifier: GPL-2.0-only
// Copyright (C) 2023, Input Labs Oy.

import { Component } from '@angular/core'
import { CommonModule } from '@angular/common'
import { Router, RouterLink, RouterLinkActive, NavigationEnd } from '@angular/router'
import { WebusbService } from 'services/webusb'

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
  ],
  templateUrl: './header.html',
  styleUrls: ['./header.sass']
})
export class HeaderComponent {
  route: string = ''
  dialogForget: any

  constructor(
    private router: Router,
    public webusb: WebusbService,
  ) {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.route = event.urlAfterRedirects
      }
    })
  }

  routeIsTools() {
    return this.route == '/' || this.route.startsWith('/tools')  ? 'active' : ''
  }

  showDialogForget() {
    this.dialogForget = document.getElementById('dialog-forget')
    this.dialogForget.showModal()
  }

  hideDialogForget(): boolean {
    this.dialogForget.close()
    return true
  }
}

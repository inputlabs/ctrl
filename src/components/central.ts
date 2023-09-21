// SPDX-License-Identifier: GPL-2.0-only
// Copyright (C) 2023, Input Labs Oy.

import { Component } from '@angular/core'
import { CommonModule } from '@angular/common'
import { Router, RouterOutlet, RouterLink} from '@angular/router'
import { WebusbService } from 'src/services/webusb'

@Component({
  selector: 'app-central',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
  ],
  templateUrl: './central.html',
  styleUrls: ['./central.sass']
})
export class CentralComponent {
  constructor(
    public webusb: WebusbService,
    private router: Router,
  ) {}

  mustHaveController() {
    const isHelp = this.router.url.startsWith('/help')
    return !isHelp
  }
}

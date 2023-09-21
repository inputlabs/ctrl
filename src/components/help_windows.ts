// SPDX-License-Identifier: GPL-2.0-only
// Copyright (C) 2023, Input Labs Oy.

import { Component } from '@angular/core'
import { CommonModule } from '@angular/common'
import { WebusbService } from 'src/services/webusb'

@Component({
  selector: 'app-help-windows',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './help_windows.html',
  styleUrls: ['./help.sass']
})
export class HelpWindowsComponent {
  constructor(
    public webusb: WebusbService
  ) {}
}

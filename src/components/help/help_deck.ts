// SPDX-License-Identifier: GPL-2.0-only
// Copyright (C) 2023, Input Labs Oy.

import { Component } from '@angular/core'
import { CommonModule } from '@angular/common'
import { WebusbService } from 'services/webusb'

@Component({
  selector: 'app-help-deck',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './help_deck.html',
  styleUrls: ['./help.sass']
})
export class HelpDeckComponent {
  constructor(
    public webusb: WebusbService
  ) {}
}

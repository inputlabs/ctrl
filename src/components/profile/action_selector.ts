// SPDX-License-Identifier: GPL-2.0-only
// Copyright (C) 2023, Input Labs Oy.

import { Component, Input } from '@angular/core'
import { CommonModule } from '@angular/common'
import { ActionGroup } from 'lib/actions'
import { HID } from 'lib/hid'

@Component({
  selector: 'app-action-selector',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './action_selector.html',
  styleUrls: ['./action_selector.sass']
})
export class ActionSelectorComponent {
  @Input() actions: ActionGroup[] = []
  @Input() labels: string[] = []
  @Input() groupIndex: number = 0
  @Input() showDialogKeypicker: Function = ()=>{}
  @Input() save: Function = ()=>{}
  @Input() cls: Function = ()=>{}
  // Template aliases.
  HID = HID
}

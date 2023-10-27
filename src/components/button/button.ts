// SPDX-License-Identifier: GPL-2.0-only
// Copyright (C) 2023, Input Labs Oy.

import { Component, Input } from '@angular/core'
import { CommonModule } from '@angular/common'
import { HID, GAMEPAD_INDEX, GAMEPAD_AXIS_INDEX } from 'lib/hid'

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './button.html',
  styleUrls: ['./button.sass']
})
export class ButtonComponent {
  @Input() mapping: any

  getText(action: number) {
    let label = HID[action]
    if (label === 'KEY_ESCAPE') return 'Esc'
    label = label.replace('KEY_', '')
    label = label.replace('MOUSE_', 'Mouse ')
    label = label.replace('GAMEPAD_', '')
    if (['LEFT_CONTROL', 'RIGHT_CONTROL'].includes(label)) label = 'Ctrl'
    if (['LEFT_SHIFT',   'RIGHT_SHIFT']  .includes(label)) label = 'Shift'
    if (['LEFT_ALT',     'RIGHT_ALT']    .includes(label)) label = 'Alt'
    if (['LEFT_SUPER',   'RIGHT_SUPER']  .includes(label)) label = 'Win'
    return label
  }

  getIcon(action: number) {
    const hid = HID[action]
    let icon = null
    if (hid == 'KEY_SPACE') icon = 'space_bar'
    if (hid == 'KEY_BACKSPACE') icon = 'backspace'
    if (hid == 'KEY_ENTER') icon = 'keyboard_return'
    if (['KEY_LEFT', 'GAMEPAD_LEFT'].includes(hid)) icon = 'arrow_back'
    if (['KEY_RIGHT', 'GAMEPAD_RIGHT'].includes(hid)) icon = 'arrow_forward'
    if (['KEY_UP', 'GAMEPAD_UP'].includes(hid)) icon = 'arrow_upward'
    if (['KEY_DOWN', 'GAMEPAD_DOWN'].includes(hid)) icon = 'arrow_downward'
    console.log(action, icon)
    return icon
  }

  getClass(action: number, text: string, icon: string | null) {
    let cls
    if (action < GAMEPAD_INDEX) cls = 'key'
    else if (action < GAMEPAD_AXIS_INDEX) cls = 'gamepad'
    if (icon !== null || text.length == 1) cls += ' fixed'
    if (icon) cls += ' icon'
    return cls
  }

  getMapping(actions: number[]) {
    return actions
      .filter((action: number) => action > 0)
      .map((action: number) => {
        const text = this.getText(action)
        const icon = this.getIcon(action)
        const cls = this.getClass(action, text, icon)
        return {cls, text, icon}
      })
  }

  getPrimary() {
    return this.getMapping(this.mapping.actions_primary)
  }

  getSecondary() {
    return this.getMapping(this.mapping.actions_secondary)
  }
}

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
    // Keys and mouse.
    label = label.replace('KEY_', '')
    label = label.replace('MOUSE_', 'Mouse ')
    if (label == 'ESCAPE') return 'Esc'
    if (label == 'TAB') return 'Tab'
    if (label == 'DELETE') return 'Del'
    if (['LEFT_CONTROL', 'RIGHT_CONTROL'].includes(label)) label = 'Ctrl'
    if (['LEFT_SHIFT',   'RIGHT_SHIFT']  .includes(label)) label = 'Shift'
    if (['LEFT_ALT',     'RIGHT_ALT']    .includes(label)) label = 'Alt'
    if (['LEFT_SUPER',   'RIGHT_SUPER']  .includes(label)) label = 'Win'
    // Proc.
    if (label.startsWith('PROC_PROFILE')) label = label.split('_')[2]
    if (label.startsWith('PROC')) label = label.replace('PROC_', '')
    // Gamepad.
    if (label.startsWith('GAMEPAD_AXIS')) label = label.split('_')[2]
    label = label.replace('GAMEPAD_L1', 'LB')
    label = label.replace('GAMEPAD_R1', 'RB')
    label = label.replace('GAMEPAD_L3', 'LS')
    label = label.replace('GAMEPAD_R3', 'RS')
    label = label.replace('GAMEPAD_', '')
    return label
  }

  getIcon(action: number) {
    const hid = HID[action]
    let icon = null
    let showLabel = false
    if (hid.startsWith('PROC_PROFILE')) {
      icon = 'sports_esports'
      showLabel = true
    }
    if (hid.startsWith('GAMEPAD_AXIS')) {
      icon = 'control_camera'
      showLabel = true
    }
    if (hid == 'KEY_SPACE') icon = 'space_bar'
    if (hid == 'KEY_BACKSPACE') icon = 'backspace'
    if (hid == 'KEY_ENTER') icon = 'keyboard_return'
    if (hid == 'GAMEPAD_SELECT') icon = 'stack'
    if (hid == 'GAMEPAD_START') icon = 'menu'
    if (['KEY_LEFT', 'GAMEPAD_LEFT'].includes(hid)) icon = 'arrow_back'
    if (['KEY_RIGHT', 'GAMEPAD_RIGHT'].includes(hid)) icon = 'arrow_forward'
    if (['KEY_UP', 'GAMEPAD_UP'].includes(hid)) icon = 'arrow_upward'
    if (['KEY_DOWN', 'GAMEPAD_DOWN'].includes(hid)) icon = 'arrow_downward'
    return {icon, showLabel}
  }

  getClass(action: number, text: string, icon: any) {
    let cls
    const hid = HID[action]
    if (hid.startsWith('KEY')) cls = 'square round'
    if (hid.startsWith('MOUSE')) cls = 'square round'
    if (hid.startsWith('GAMEPAD')) cls = 'circle'
    if (hid.startsWith('PROC')) cls = 'square'
    if (icon.icon && !icon.showLabel) cls += ' icon fixed'
    if (!icon.icon && text.length == 1) cls += ' fixed'
    return cls
  }

  getPrimary() {
    const mode = this.mapping.mode
    return this.mapping.actions_primary
      .filter((action: number) => action > 0)
      .map((action: number) => {
        const text = this.getText(action)
        const icon = this.getIcon(action)
        const cls = this.getClass(action, text, icon) + ' press'
        return {cls, text, icon}
      })
  }

  getSecondary() {
    const mode = this.mapping.mode
    return this.mapping.actions_secondary
      .filter((action: number) => action > 0)
      .map((action: number) => {
        const text = this.getText(action)
        const icon = this.getIcon(action)
        let cls = this.getClass(action, text, icon)
        if (mode == 0) cls += ' press'
        if (mode == 1) cls += ' press'
        if (mode == 6) cls += ' double'
        if ([2, 3, 4, 5].includes(mode)) cls += ' hold'
        return {cls, text, icon}
      })
  }
}

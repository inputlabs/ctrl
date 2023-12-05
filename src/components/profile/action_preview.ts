// SPDX-License-Identifier: GPL-2.0-only
// Copyright (C) 2023, Input Labs Oy.

import { Component, Input } from '@angular/core'
import { CommonModule } from '@angular/common'
import { ProfileService } from 'services/profiles'
import { HID } from 'lib/hid'
import { ActionGroup } from 'lib/actions'
import { ButtonMode, CtrlButton, CtrlGyroAxis } from 'lib/ctrl'

interface Chip {
  cls: string,
  text: string,
  icon: Icon,
}

interface Icon {
  icon: string,
  showLabel: boolean,
}

@Component({
  selector: 'app-action-preview',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './action_preview.html',
  styleUrls: ['./action_preview.sass']
})
export class ButtonComponent {
  @Input() type: any
  @Input() mode: ButtonMode = 0
  @Input() actions: ActionGroup[] = []
  @Input() labels: string[] = []

  constructor(
    public profileService: ProfileService,
  ) {}

  getActions(index: number) {
    if (this.type == CtrlButton) {
      if (this.mode == ButtonMode.STICKY) {
        if (index == 0) return this.actions[0].merge(this.actions[1])
        else return new ActionGroup([0])
      }
      return this.actions[index]
    }
    return this.actions[index]
  }

  getText(action: number) {
    let label = HID[action]
    // Keys.
    label = label.replace('KEY_', '')
    if (label == 'ESCAPE') return 'Esc'
    if (label == 'TAB') return 'Tab'
    if (label == 'DELETE') return 'Del'
    if (label == 'BACKQUOTE') return '`'
    if (label == 'BRACKET_LEFT') return '['
    if (label == 'BRACKET_RIGHT') return ']'
    // Mouse.
    if (label == 'MOUSE_SCROLL_UP') return 'Scroll'
    if (label == 'MOUSE_SCROLL_DOWN') return 'Scroll'
    label = label.replace(/^MOUSE_/, 'Mouse ')
    // Modifiers.
    if (label.includes('CONTROL')) label = 'Ctrl'
    if (label.includes('SHIFT')) label = 'Shift'
    if (label.includes('ALT')) label = 'Alt'
    if (label.includes('SUPER')) label = 'Win'
    // Proc.
    if (label == 'PROC_BOOTSEL') return 'Boot mode'
    if (label == 'PROC_CALIBRATE') return 'Calibrate'
    if (label == 'PROC_TUNE_OS') return 'OS'
    if (label == 'PROC_TUNE_MOUSE_SENS') return 'Mouse'
    if (label == 'PROC_TUNE_TOUCH_SENS') return 'Touch'
    if (label == 'PROC_TUNE_DEADZONE') return 'DZ'
    if (label == 'PROC_TUNE_UP') return 'Tune up'
    if (label == 'PROC_TUNE_DOWN') return 'Tune down'
    if (label.startsWith('PROC_PROFILE')) {
      const profileIndex = Number(label.split('_')[2])
      label = this.profileService.profiles[profileIndex].name.name
    }
    if (label.startsWith('PROC_ROTARY_MODE')) label = label.split('_')[3]
    if (label.startsWith('PROC')) label = label.replace('PROC_', '')
    // Gamepad.
    label = label.replace('GAMEPAD_L1', 'LB')
    label = label.replace('GAMEPAD_R1', 'RB')
    label = label.replace('GAMEPAD_L3', 'LS')
    label = label.replace('GAMEPAD_R3', 'RS')
    if (label.startsWith('GAMEPAD_AXIS')) {
      label = label.replace('GAMEPAD_AXIS_', '')
      if (label.endsWith('NEG')) label = label.replace('_NEG', '-')
      else label += '+'
    }
    label = label.replace('GAMEPAD_', '')
    return label
  }

  getIcon(action: number) {
    const hid = HID[action]
    let icon = ''
    let showLabel = false
    if (hid.startsWith('PROC_PROFILE')) {
      icon = 'sports_esports'
      showLabel = true
    }
    if (hid.startsWith('PROC_TUNE')) {
      icon = 'settings'
      showLabel = true
    }
    if (hid.startsWith('PROC_ROTARY_MODE')) {
      icon = 'screen_record'
      showLabel = true
    }
    if (hid.startsWith('MOUSE_SCROLL_UP')) {
      icon = 'stat_2'
      showLabel = true
    }
    if (hid.startsWith('MOUSE_SCROLL_DOWN')) {
      icon = 'stat_minus_2'
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
    let cls = ''
    const hid = HID[action]
    if (hid.startsWith('KEY')) cls = 'square round'
    if (hid.startsWith('MOUSE')) cls = 'square round'
    if (hid.startsWith('GAMEPAD')) cls = 'circle'
    if (icon.icon && !icon.showLabel) cls += ' icon fixed'
    if (!icon.icon && text.length == 1) cls += ' fixed'
    return cls
  }

  getGroupClass(index: number) {
    if (index==0 && this.getActions(1).sizeNonZero()==0 && this.labels[0]?.length>0) return 'wrap'
    return ''
  }

  getChips(index: number): Chip[] {
    if (index == 0) {
      return this.getActions(0).asArray()
        .map((action: number) => {
          const text = this.getText(action)
          const icon = this.getIcon(action)
          const cls = this.getClass(action, text, icon) + ' press'
          return {cls, text, icon}
        })
    } else {
      if (this.actions.length < 2) return []
      if (this.getActions(1).actions.size == 0 && this.labels[1] == '') return []
      const mode = this.mode
      return this.getActions(1).asArray()
        .map((action: number) => {
          const text = this.getText(action)
          const icon = this.getIcon(action)
          let cls = this.getClass(action, text, icon)
          if (mode == ButtonMode.NORMAL) cls += ' press'
          if (mode == ButtonMode.STICKY) cls += ' press'
          if (mode == ButtonMode.HOLD_DOUBLE_PRESS) cls += ' double'
          if ([2, 3, 4, 5].includes(mode)) cls += ' hold'
          return {cls, text, icon}
        })
    }
  }

  getLabel(index: number) {
    return this.labels[index] || null
  }
}

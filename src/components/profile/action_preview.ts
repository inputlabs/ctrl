// SPDX-License-Identifier: GPL-2.0-only
// Copyright (C) 2023, Input Labs Oy.

import { Component, Input } from '@angular/core'
import { CommonModule } from '@angular/common'
import { WebusbService } from 'services/webusb'
import { HID, isAxis } from 'lib/hid'
import { ActionGroup } from 'lib/actions'
import { CtrlButton, CtrlGyroAxis, CtrlRotary, CtrlHome, sectionIsAnalog } from 'lib/ctrl'

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
  @Input() section: CtrlButton | CtrlRotary | CtrlGyroAxis
  @Input() analog: boolean = false

  constructor(
    public webusb: WebusbService,
  ) {
    this.section = undefined as unknown as CtrlButton
  }

  getActions(index: number) {
    // Get a copy so changes are not reflected anywhere else than in this
    // component.
    let actions = this.section.actions[index].copy()
    // Merge sticky mode actions.
    if (this.section instanceof CtrlButton) {
      if (this.section.sticky) {
        if (index == 0) actions = this.section.actions[0].merge(this.section.actions[1])
        else actions = new ActionGroup([0])
      }
    }
    // For rotary only show first action group.
    if (index == 1) {
      if (this.section instanceof CtrlRotary) {
        actions = new ActionGroup([0])
      }
    }
    return actions
  }

  getLabel(index: number): string {
    // Do not show labels if there are 3 groups of actions.
    if (this.section instanceof CtrlButton) {
      const isHome = this.section instanceof CtrlHome
      if (!isHome && this.section.hold && this.section.double) return ''
    }
    // Get label for actions.
    let label = this.section.labels[index] || ''
    if (index == 1) {
      if (this.section instanceof CtrlButton) {
        if (!this.section.hold && !this.section.sticky) label = ''
      }
      if (this.section instanceof CtrlRotary) label = ''
    }
    if (index == 2) {
      if (this.section instanceof CtrlButton) {
        if (!this.section.double) label = ''
      }
      if (this.section instanceof CtrlRotary) label = ''
    }
    return label
  }

  getText(action: number) {
    let label = HID[action]
    // Keys.
    if (label.startsWith('KEY_')) {
      const key = label.slice('KEY_'.length)
      switch (key) {
        case 'ESCAPE': return 'Esc'
        case 'TAB': return 'Tab'
        case 'BACKQUOTE': return '`'
        case 'MINUS': return '-'
        case 'EQUALS': return '='
        case 'BACKSLASH': return '\\'
        case 'BRACKET_LEFT': return '['
        case 'BRACKET_RIGHT': return ']'
        case 'CAPS_LOCK': return 'Caps'
        case 'SEMICOLON': return ';'
        case 'QUOTE': return "'"
        case 'COMMA': return ","
        case 'PERIOD': return "."
        case 'SLASH': return "/"
        case 'INSERT': return 'Ins'
        case 'DELETE': return 'Del'
        case 'HOME': return 'Home'
        case 'END': return 'End'
        case 'PAGE_UP': return 'Page-'
        case 'PAGE_DOWN': return 'Page+'
        // Modifiers.
        case 'CONTROL_LEFT': return 'Ctrl'
        case 'SHIFT_LEFT': return 'Shift'
        case 'ALT_LEFT': return 'Alt'
        case 'SUPER_LEFT': return 'Win'
        case 'CONTROL_RIGHT': return 'RCtrl'
        case 'SHIFT_RIGHT': return 'RShift'
        case 'ALT_RIGHT': return 'RAlt'
        case 'SUPER_RIGHT': return 'RWin'
        case 'PAD_NUMLOCK': return 'Lock'
        case 'PAD_SLASH': return '/'
        case 'PAD_ASTERISK': return '*'
        case 'PAD_MINUS': return '-'
        case 'PAD_PLUS': return '+'
        case 'PAD_ENTER': return '↵'
        case 'PAD_PERIOD': return '.'
      }
      if (key.startsWith('PAD_')) return key.slice('PAD_'.length)
    }
    // Mouse.
    if (label.startsWith('MOUSE_')) {
      const mouse = label.slice('MOUSE_'.length)
      switch (mouse) {
        case 'X': return 'X+'
        case 'Y': return 'Y+'
        case 'X_NEG': return 'X-'
        case 'Y_NEG': return 'Y-'
        case 'SCROLL_UP': return 'Scroll+'
        case 'SCROLL_DOWN': return 'Scroll-'
      }
      return mouse
    }
    // Proc.
    if (label.startsWith('PROC_')) {
      const proc = label.slice('PROC_'.length)
      switch (proc) {
        case 'SLEEP': return 'Sleep'
        case 'BOOTSEL': return 'Boot'
        case 'CALIBRATE': return 'Calibrate'
        case 'PAIR': return 'Pair'
        case 'TUNE_OS': return 'OS'
        case 'TUNE_MOUSE_SENS': return 'Mouse'
        case 'TUNE_TOUCH_SENS': return 'Touch'
        case 'TUNE_DEADZONE': return 'DZ'
        case 'TUNE_UP': return 'Tune up'
        case 'TUNE_DOWN': return 'Tune down'
      }
      if (proc.startsWith('PROFILE_')) {
        const profileIndex = Number(proc.slice('PROFILE_'.length))
        return this.webusb.getProfiles()!.profiles[profileIndex].meta.name
      }
      if (proc.startsWith('MACRO_')) {
        const macroIndex = Number(proc.slice('MACRO_'.length))
        return `M${macroIndex}`
      }
      if (proc.startsWith('ROTARY_MODE_')) return proc.slice('ROTARY_MODE_'.length)
      return proc
    }
    // Gamepad.
    if (label.startsWith('GAMEPAD_')) {
      let gamepad = label.slice('GAMEPAD_'.length)
      switch (gamepad) {
        case 'L1': return 'LB'
        case 'R1': return 'RB'
        case 'L3': return 'LS'
        case 'R3': return 'RS'
      }
      if (gamepad.startsWith('AXIS_')) {
        gamepad = gamepad.slice('AXIS_'.length)
        if (gamepad.endsWith('_NEG')) gamepad = `${gamepad.slice(0, -'_NEG'.length)}-`
        else gamepad += '+'
      }
      return gamepad
    }
    return label
  }

  getIcon(action: number) {
    const hid = HID[action]
    let icon = ''
    let showLabel = false
    if (hid.startsWith('PROC_PROFILE')) {
      icon = 'stadia_controller'
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
    if (hid.startsWith('MOUSE_')) {
      icon = 'mouse'
      showLabel = true
    }
    if (hid.startsWith('KEY_PAD')) {
      icon = 'dialpad'
      showLabel = true
    }
    if (hid.startsWith('PROC_MACRO_')) {
      icon = 'keyboard'
      showLabel = true
    }
    switch (hid) {
      case 'KEY_SPACE':
        icon = 'space_bar'
        break
      case 'KEY_BACKSPACE':
        icon = 'backspace'
        break
      case 'KEY_ENTER':
        icon = 'keyboard_return'
        break
      case 'KEY_PRINT_SCREEN':
        icon = 'photo_camera'
        break
      case 'KEY_SCROLL_LOCK':
        icon = 'sync_lock'
        break
      case 'KEY_PAUSE':
        icon = 'pause_circle'
        break
      case 'KEY_MUTE':
        icon = 'volume_off'
        break
      case 'KEY_VOLUME_UP':
        icon = 'volume_up'
        break
      case 'KEY_VOLUME_DOWN':
        icon = 'volume_down'
        break
      case 'KEY_POWER':
        icon = 'power_settings_new'
        break
      case 'GAMEPAD_SELECT':
        icon = 'stack'
        break
      case 'GAMEPAD_START':
        icon = 'menu'
        break
      case 'PROC_HOME_GAMEPAD':
        icon = 'home'
        break
      case 'KEY_LEFT':
      case 'GAMEPAD_LEFT':
        icon = 'arrow_back'
        break
      case 'KEY_RIGHT':
      case 'GAMEPAD_RIGHT':
        icon = 'arrow_forward'
        break
      case 'KEY_UP':
      case 'GAMEPAD_UP':
        icon = 'arrow_upward'
        break
      case 'KEY_DOWN':
      case 'GAMEPAD_DOWN':
        icon = 'arrow_downward'
        break
    }
    return { icon, showLabel }
  }

  getClass(index: number, action: number, text: string, icon: any) {
    let cls = 'press'
    const hid = HID[action]
    if (hid.startsWith('KEY')) cls += ' square round'
    if (hid.startsWith('MOUSE')) cls += ' square round'
    if (hid.startsWith('GAMEPAD')) cls += ' circle'
    if (action == HID.PROC_HOME_GAMEPAD) cls += ' circle'
    if (icon.icon && !icon.showLabel) cls += ' icon fixed'
    if (!icon.icon && text.length == 1) cls += ' fixed'
    if (this.section instanceof CtrlButton) {
      if (index == 1 && this.section.hold) cls += ' hold'
      if (index == 2 && this.section.double) cls += ' double'
    }
    if (this.analog && sectionIsAnalog(this.section.sectionIndex) && isAxis(action)) {
      cls += ' analog'
    }
    return cls
  }

  getGroupClass(index: number) {
    const wrapConditions = (
      index == 0 &&
      this.getActions(1).sizeValid() == 0 &&
      this.section.labels[0]?.length > 0
    )
    return wrapConditions ? 'wrap' : ''
  }

  getChips(index: number): Chip[] {
    if (index == 0) {
      return this.getActions(0).asArray()
        .map((action: number) => {
          const text = this.getText(action)
          const icon = this.getIcon(action)
          const cls = this.getClass(0, action, text, icon)
          return { cls, text, icon }
        })
    }
    if (index == 1) {
      if (this.section.actions[1] === undefined) return []
      if (this.section instanceof CtrlButton) {
        if (!this.section.sticky) {
          if (!this.section.hold) return []
          if (this.getActions(1).actions.size == 0) return [emptyHoldChip]
        }
      }
      if (this.getActions(1).actions.size == 0) return []
      return this.getActions(1).asArray()
        .filter((action: number) => {
          return action != HID.PROC_THANKS  // Do not show easter egg.
        })
        .map((action: number) => {
          const text = this.getText(action)
          const icon = this.getIcon(action)
          let cls = this.getClass(1, action, text, icon)
          return { cls, text, icon }
        })
    }
    if (index == 2) {
      if (this.section.actions[2] === undefined) return []
      if (this.section instanceof CtrlButton) {
        if (!this.section.double) return []
        if (this.getActions(2).actions.size == 0) return [emptyDoubleChip]
      }
      if (this.getActions(2).actions.size == 0) return []
      if (this.section instanceof CtrlRotary) return []
      return this.getActions(2).asArray()
        .map((action: number) => {
          const text = this.getText(action)
          const icon = this.getIcon(action)
          let cls = this.getClass(2, action, text, icon)
          return { cls, text, icon }
        })
    }
    return []
  }
}

const emptyHoldChip: Chip = {
  text: '',
  cls: 'square round fixed hold',
  icon: { icon: '', showLabel: false },
}

const emptyDoubleChip: Chip = {
  text: '',
  cls: 'square round fixed double',
  icon: { icon: '', showLabel: false },
}

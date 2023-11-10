// SPDX-License-Identifier: GPL-2.0-only
// Copyright (C) 2023, Input Labs Oy.

import { Component, Input } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms';
import { ProfileService } from 'services/profiles'
import { WebusbService } from 'services/webusb';
import { CtrlButton, SectionIndex } from 'lib/ctrl'
import { HID } from 'lib/hid'

enum Category {
  ALPHABET = 1,
  NUMBERS,
  MODIFIERS,
  KEYS,
  NAVIGATION,
  NUMPAD,
  FUNCTION,
  MOUSE,
  GAMEPAD,
  GAMEPAD_AXIS,
  PROC,
}

const alphabet: HID[] = []
const numbers: HID[] = []
const modifiers: HID[] = []
const keys: HID[] = []
const navigation: HID[] = []
const numpad: HID[] = []
const func: HID[] = []
const mouse: HID[] = []
for(let i=HID.KEY_A; i<=HID.KEY_Z; i++) alphabet.push(i)
for(let i=HID.KEY_1; i<=HID.KEY_0; i++) numbers.push(i)
for(let i=HID.KEY_LEFT_CONTROL; i<=HID.KEY_RIGHT_SUPER; i++) modifiers.push(i)
for(let i=HID.KEY_ENTER; i<=HID.KEY_CAPS_LOCK; i++) keys.push(i)
for(let i=HID.KEY_INSERT; i<=HID.KEY_UP; i++) navigation.push(i)
for(let i=HID.KEY_PAD_NUMLOCK; i<=HID.KEY_PAD_EQUAL; i++) numpad.push(i)
for(let i=HID.KEY_F1; i<=HID.KEY_F12; i++) func.push(i)

@Component({
  selector: 'app-section',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
  ],
  templateUrl: './section.html',
  styleUrls: ['./section.sass']
})
export class SectionComponent {
  @Input() profileIndex: number = 0
  @Input() button?: CtrlButton
  HID = HID
  dialogKeyPicker: any
  pickerGroup = 0

  constructor(
    public webusbService: WebusbService,
    public profileService: ProfileService,
  ) {
  }

  ngAfterContentInit() {
  }

  getButton() {
    if (this.button) return [this.button]
    else return []
  }

  getButtonTitle() {
    if (!this.button) return ''
    else {
      const section = this.button.sectionIndex
      if (section <= SectionIndex.START_2) return 'Button ' + SectionIndex[section]
      if (section <= SectionIndex.R4) return 'Trigger ' + SectionIndex[section]
      return SectionIndex[section]
    }
  }

  getActions(group: number) {
    const section = this.button as CtrlButton
    let actions = group==0 ? section.actions_primary : section.actions_secondary
    while(actions.length < 4) actions.push(HID.KEY_NONE)
    return actions
  }

  showDialogKeypicker(pickerGroup: number) {
    this.pickerGroup = pickerGroup
    this.dialogKeyPicker = document.getElementById('dialog-keypicker')
    this.dialogKeyPicker.showModal()
  }

  hideDialogKeypicker(): boolean {
    this.dialogKeyPicker.close()
    return true
  }

  pickAbstract(actions: HID[], key: HID) {
    if(actions.includes(key)) {
      actions = actions.filter((x) => x!=key)
    } else {
      for(let i in [...Array(4)]) {
        if(actions[i] != HID.KEY_NONE) continue
        actions[i] = key
        break
      }
    }
    return actions
  }

  pick(key: HID) {
    const section = this.button as CtrlButton
    if(this.pickerGroup == 0) {
      section.actions_primary = this.pickAbstract(section.actions_primary, key)
    }
    if(this.pickerGroup == 1) {
      section.actions_secondary = this.pickAbstract(section.actions_secondary, key)
    }
    this.save()
  }

  pickCls(key: HID) {
    const section = this.button as CtrlButton
    let actions: HID[] = []
    let cls: string[] = []
    if (this.pickerGroup == 0) {
      actions = section.actions_primary
      cls = ['green']
    }
    if (this.pickerGroup == 1) {
      actions = section.actions_secondary
      cls = ['pink']
    }
    if (actions.includes(key)) return cls
    return []
  }

  save() {
    const section = this.button as CtrlButton
    this.webusbService.setSection(this.profileIndex, section)
  }
}

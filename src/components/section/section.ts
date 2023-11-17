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
  pickerProfile = 0
  pickerRotary = 0
  pickerTune = 0

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
    for(let action of this.getActions(pickerGroup)) {
      if (action >= HID.PROC_PROFILE_0 && action <= HID.PROC_PROFILE_8) {
        this.pickerProfile = action - HID.PROC_PROFILE_0
      }
      if (action >= HID.PROC_ROTARY_MODE_0 && action <= HID.PROC_ROTARY_MODE_5) {
        this.pickerRotary = action - HID.PROC_ROTARY_MODE_0
      }
      if (action >= HID.PROC_TUNE_OS && action <= HID.PROC_TUNE_TOUCH_THRESHOLD) {
        this.pickerTune = action - HID.PROC_TUNE_OS
      }
    }
    this.dialogKeyPicker = document.getElementById('dialog-keypicker')
    this.dialogKeyPicker.showModal()
  }

  hideDialogKeypicker(): boolean {
    this.dialogKeyPicker.close()
    return true
  }

  private _pickToggle(actions: HID[], key: HID) {
    if(actions.includes(key)) {
      this._pickRemove(actions, key)
    } else {
      this._pickAdd(actions, key)
    }
    return actions
  }

  private _pickAdd(actions: HID[], key: HID) {
    for(let i in [...Array(4)]) {
      if(actions[i] != HID.KEY_NONE) continue
      actions[i] = key
      break
    }
    this.save()
  }

  private _pickRemove(actions: HID[], key: HID) {
    const filtered = actions.filter((x) => x!=key)
    for(let [i, x] of filtered.entries()) {
      actions[i] = filtered[i]
    }
    this.save()
  }

  private _pickSelect(
    increment = 0,
    procBase: number,
    nOptions: number,
    valueGet: number,
    valueSet: (x:number)=>void,
  ) {
    const section = this.button as CtrlButton
    const targetActions = (
      this.pickerGroup == 0 ?
      section.actions_primary :
      section.actions_secondary
    )
    const wrap = ((valueGet + increment) % nOptions + nOptions) % nOptions
    if (increment == 0) this.pick(procBase + wrap)
    else {
      this._pickRemove(targetActions, procBase + valueGet)
      this._pickAdd(targetActions, procBase + wrap)
      valueSet(wrap)
    }
  }

  pick(key: HID) {
    const section = this.button as CtrlButton
    const targetActions = (
      this.pickerGroup == 0 ?
      section.actions_primary :
      section.actions_secondary
    )
    this._pickToggle(targetActions, key)
  }

  pickProfile(increment = 0) {
    this._pickSelect(
      increment,
      HID.PROC_PROFILE_0,
      8,
      this.pickerProfile,
      (x) => this.pickerProfile=x,
    )
  }

  pickRotary(increment = 0) {
    this._pickSelect(
      increment,
      HID.PROC_ROTARY_MODE_0,
      5,
      this.pickerRotary,
      (x) => this.pickerRotary=x,
    )
  }

  pickTune(increment = 0) {
    this._pickSelect(
      increment,
      HID.PROC_TUNE_OS,
      4,
      this.pickerTune,
      (x) => this.pickerTune=x,
    )
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

// SPDX-License-Identifier: GPL-2.0-only
// Copyright (C) 2023, Input Labs Oy.

import { Component, Input } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms';
import { ProfileService } from 'services/profiles'
import { WebusbService } from 'services/webusb';
import { ActionGroup, CtrlButton, SectionIndex } from 'lib/ctrl'
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
  pickerProfile = 1
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
    return group==0 ? section.actions_primary : section.actions_secondary
  }

  showDialogKeypicker(pickerGroup: number) {
    this.pickerGroup = pickerGroup
    for(let action of this.getActions(pickerGroup).actions) {
      if (action >= HID.PROC_PROFILE_0 && action <= HID.PROC_PROFILE_8) {
        this.pickerProfile = action - HID.PROC_PROFILE_0
      }
      if (action >= HID.PROC_ROTARY_MODE_0 && action <= HID.PROC_ROTARY_MODE_5) {
        this.pickerRotary = action - HID.PROC_ROTARY_MODE_0
      }
      if (action >= HID.PROC_TUNE_OS && action <= HID.PROC_TUNE_DEADZONE) {
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

  private _pickToggle(actions: ActionGroup, key: HID) {
    if(actions.has(key)) {
      this._pickRemove(actions, key)
    } else {
      this._pickAdd(actions, key)
    }
    return actions
  }

  private _pickAdd(actions: ActionGroup, key: HID) {
    actions.add(key)
    this.save()
  }

  private _pickRemove(actions: ActionGroup, key: HID) {
    actions.delete(key)
    this.save()
  }

  private _pickSelect(
    increment = 0,
    procBase: number,
    wrapMin: number,
    wrapMax: number,
    valueGet: number,
    valueSet: (x:number)=>void,
  ) {
    const section = this.button as CtrlButton
    const targetActions = (
      this.pickerGroup == 0 ?
      section.actions_primary :
      section.actions_secondary
    )
    let wrap = valueGet + increment
    if (wrap < wrapMin) wrap = wrap + (wrapMax - wrapMin + 1)
    else if (wrap > wrapMax) wrap = wrap - (wrapMax - wrapMin + 1)
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
      1,
      8,
      this.pickerProfile,
      (x) => this.pickerProfile=x,
    )
  }

  pickRotary(increment = 0) {
    this._pickSelect(
      increment,
      HID.PROC_ROTARY_MODE_0,
      0,
      4,
      this.pickerRotary,
      (x) => this.pickerRotary=x,
    )
  }

  pickTune(increment = 0) {
    this._pickSelect(
      increment,
      HID.PROC_TUNE_OS,
      0,
      3,
      this.pickerTune,
      (x) => this.pickerTune=x,
    )
  }

  pickCls(key: HID) {
    const section = this.button as CtrlButton
    const actions = this.pickerGroup==0 ? section.actions_primary : section.actions_secondary
    const cls = this.pickerGroup==0 ? ['green'] : ['pink']
    if (actions.has(key)) return cls
    return []
  }

  save() {
    const section = this.button as CtrlButton
    this.webusbService.setSection(this.profileIndex, section)
  }
}

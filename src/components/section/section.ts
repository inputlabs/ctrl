// SPDX-License-Identifier: GPL-2.0-only
// Copyright (C) 2023, Input Labs Oy.

import { Component, Input } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms';
import { ProfileService } from 'services/profiles'
import { WebusbService } from 'services/webusb';
import { CtrlButton, CtrlRotary, CtrlSection } from 'lib/ctrl'
import { SectionName, SectionButton, SectionRotary } from 'lib/ctrl'
import { ActionGroup } from 'lib/actiongroup'
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
  @Input({required:true}) profileIndex: number = 0
  @Input({required:true}) section!: CtrlSection
  HID = HID  // Accessible from template.
  SectionName = SectionName  // Accessible from template.
  SectionButton = SectionButton  // Accessible from template.
  SectionRotary = SectionRotary  // Accessible from template.
  dialogKeyPicker: any
  pickerGroup = 0
  pickerProfile = 1
  pickerRotary = 0
  pickerTune = 0

  constructor(
    public webusbService: WebusbService,
    public profileService: ProfileService,
  ) {}

  ngAfterContentInit() {
  }

  getSection() {
    return this.section as CtrlSection
  }

  getSectionAsButton() {
    return this.section as CtrlButton
  }

  getSectionAsRotary() {
    return this.section as CtrlRotary
  }

  sectionIsButton() {
    return (this.section instanceof CtrlButton)
  }

  sectionIsRotary() {
    return (this.section instanceof CtrlRotary)
  }

  getSectionTitle() {
    const section = this.section.sectionIndex
    if (section <= SectionButton.Y) return 'Button ' + SectionButton[section]
    if (section == SectionButton.DPAD_LEFT)  return 'DPad Left'
    if (section == SectionButton.DPAD_RIGHT) return 'DPad Right'
    if (section == SectionButton.DPAD_UP)    return 'DPad Up'
    if (section == SectionButton.DPAD_DOWN)  return 'DPad Down'
    if (section == SectionButton.SELECT_1) return 'Select'
    if (section == SectionButton.SELECT_2) return 'Select (2)'
    if (section == SectionButton.START_1) return 'Start'
    if (section == SectionButton.START_2) return 'Start (2)'
    if (section <= SectionButton.R4) return 'Trigger ' + SectionButton[section]
    if (section == SectionRotary.ROTARY_UP) return 'Rotary up'
    if (section == SectionRotary.ROTARY_DOWN) return 'Rotary down'
    return ''
  }

  getActions(group: number) {
    if (this.section instanceof CtrlButton) {
      if (group == 0) return this.section.actions_primary
      if (group == 1) return this.section.actions_secondary
    }
    if (this.section instanceof CtrlRotary) {
      if (group == 0) return this.section.actions_0
      if (group == 1) return this.section.actions_1
      if (group == 2) return this.section.actions_2
      if (group == 3) return this.section.actions_3
      if (group == 4) return this.section.actions_4
    }
    return ActionGroup.empty(4)
  }

  isButtonBlockVisible(group: number) {
    const button = this.getSectionAsButton()
    if (group == 0) return true
    if (group == 1 && (button.hold || button.homeCycle)) return true
    return false
  }

  getButtonBlockSubtitle(group: number) {
    const button = this.getSectionAsButton()
    if (group == 0) {
      if (!button.hold && !button.homeCycle) return 'On button press:'
      if (button.hold && button.overlap) return 'On button press (always):'
      if (button.hold && !button.overlap) return 'On button click:'
      if (button.homeCycle) return 'On the first press, until home is released:'
    }
    if (group == 1) {
      if (button.hold && button.overlap) return 'On button hold:'
      if (button.hold && !button.overlap) return 'Otherwise on button hold:'
      if (button.homeCycle) return 'On every press:'
    }
    return ''
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
    const targetActions = this.getActions(this.pickerGroup)
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
    const targetActions = this.getActions(this.pickerGroup)
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
    const actions = this.getActions(this.pickerGroup)
    const cls = this.pickerGroup==0 ? ['green'] : ['pink']
    if (actions.has(key)) return cls
    return []
  }

  save() {
    this.webusbService.setSection(this.profileIndex, this.section)
  }
}

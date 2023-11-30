// SPDX-License-Identifier: GPL-2.0-only
// Copyright (C) 2023, Input Labs Oy.

import { Component, Input } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms';
import { NumberInputComponent } from 'components/number_input/number_input'
import { ProfileService } from 'services/profiles'
import { WebusbService } from 'services/webusb';
import { CtrlButton, CtrlRotary, CtrlSection, CtrlSectionName, CtrlThumbstick } from 'lib/ctrl'
import { SectionIndex } from 'lib/ctrl'
import { ActionGroup } from 'lib/actions'
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
    NumberInputComponent
  ],
  templateUrl: './section.html',
  styleUrls: ['./section.sass']
})
export class SectionComponent {
  @Input() profileIndex: number = 0
  @Input() section: CtrlSection = new CtrlSectionName(0, SectionIndex.NAME, '')
  dialogKeyPicker: any
  pickerGroup = 0
  pickerProfile = 1
  pickerRotary = 0
  pickerTune = 0
  // Template aliases.
  HID = HID
  SectionIndex = SectionIndex

  constructor(
    public webusbService: WebusbService,
    public profileService: ProfileService,
  ) {}

  getSection = () => this.section as CtrlSection
  getSectionAsName = () => this.section as CtrlSectionName
  getSectionAsButton = () => this.section as CtrlButton
  getSectionAsRotary = () => this.section as CtrlRotary
  getSectionAsThumbstick = () => this.section as CtrlThumbstick
  sectionIsName = () => this.section instanceof CtrlSectionName
  sectionIsButton = () => this.section instanceof CtrlButton
  sectionIsRotary = () => this.section instanceof CtrlRotary
  sectionIsThumbstick = () => this.section instanceof CtrlThumbstick

  getSectionTitle() {
    return sectionTitles[this.section.sectionIndex]
  }

  getActions(group: number) {
    const section = this.section as (CtrlButton | CtrlRotary)
    return section.actions[group]
  }

  getHints() {
    const section = this.section as (CtrlButton | CtrlRotary)
    return section.hints
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
    const section = this.section as (CtrlButton | CtrlRotary)
    for(let action of section.actions[pickerGroup].actions) {
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

interface SectionTitles {
  [index: number]: string
}
const sectionTitles: SectionTitles = {
  [SectionIndex.A]:                'Button A',
  [SectionIndex.B]:                'Button B',
  [SectionIndex.X]:                'Button X',
  [SectionIndex.Y]:                'Button Y',
  [SectionIndex.DPAD_LEFT]:        'DPad Left',
  [SectionIndex.DPAD_RIGHT]:       'DPad Right',
  [SectionIndex.DPAD_UP]:          'DPad Up',
  [SectionIndex.DPAD_DOWN]:        'DPad Down',
  [SectionIndex.SELECT_1]:         'Select',
  [SectionIndex.SELECT_2]:         'Select (2)',
  [SectionIndex.START_1]:          'Start',
  [SectionIndex.START_2]:          'Start (2)',
  [SectionIndex.L1]:               'Trigger L1',
  [SectionIndex.L2]:               'Trigger L2',
  [SectionIndex.L4]:               'Trigger L4',
  [SectionIndex.R1]:               'Trigger R1',
  [SectionIndex.R2]:               'Trigger R2',
  [SectionIndex.R4]:               'Trigger R4',
  [SectionIndex.DHAT_LEFT]:        'DHat Left',
  [SectionIndex.DHAT_RIGHT]:       'DHat Right',
  [SectionIndex.DHAT_UP]:          'DHat Up',
  [SectionIndex.DHAT_DOWN]:        'DHat Down',
  [SectionIndex.DHAT_UL]:          'DHat Up-Left',
  [SectionIndex.DHAT_UR]:          'DHat Up-Right',
  [SectionIndex.DHAT_DL]:          'DHat Down-Left',
  [SectionIndex.DHAT_DR]:          'DHat Down-Right',
  [SectionIndex.DHAT_PUSH]:        'DHat Push',
  [SectionIndex.ROTARY_UP]:        'Rotary up',
  [SectionIndex.ROTARY_DOWN]:      'Rotary down',
  [SectionIndex.THUMBSTICK]:       'Thumbstick settings',
  [SectionIndex.THUMBSTICK_LEFT]:  'Thumbstick Left',
  [SectionIndex.THUMBSTICK_RIGHT]: 'Thumbstick Right',
  [SectionIndex.THUMBSTICK_UP]:    'Thumbstick Up',
  [SectionIndex.THUMBSTICK_DOWN]:  'Thumbstick Down',
  [SectionIndex.THUMBSTICK_PUSH]:  'Thumbstick Push',
  [SectionIndex.THUMBSTICK_INNER]: 'Thumbstick Inner',
  [SectionIndex.THUMBSTICK_OUTER]: 'Thumbstick Outer',
}

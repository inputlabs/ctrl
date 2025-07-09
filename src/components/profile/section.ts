// SPDX-License-Identifier: GPL-2.0-only
// Copyright (C) 2023, Input Labs Oy.

import { Component, Input } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { ActionSelectorComponent } from './action_selector'
import { InputNumberComponent } from 'components/input_number/input_number'
import { WebusbService } from 'services/webusb'
import { Profile } from 'lib/profile'
import { CtrlSection, CtrlSectionMeta, CtrlButton, CtrlRotary } from 'lib/ctrl'
import { CtrlThumbstick, CtrlGyro, CtrlGyroAxis, CtrlHome } from 'lib/ctrl'
import { SectionIndex, sectionIsAnalog } from 'lib/ctrl'
import { ThumbstickMode, ThumbstickDistanceMode, GyroMode } from 'lib/ctrl'
import { ActionGroup } from 'lib/actions'
import { HID, isAxis } from 'lib/hid'
import { PinV0, PinV1 } from 'lib/pin'
import { delay } from 'lib/delay'

@Component({
  selector: 'app-section',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    InputNumberComponent,
    ActionSelectorComponent,
  ],
  templateUrl: './section.html',
  styleUrls: ['./section.sass']
})
export class SectionComponent {
  @Input() profileIndex: number = 0
  @Input() section: CtrlSection = new CtrlSectionMeta(0, SectionIndex.META, '', 0, 0, 0, 0)
  @Input() analog: boolean = false
  dialogKeyPicker: any
  pickerGroup = 0
  pickerProfile = 1
  pickerRotary = 0
  pickerMacro = 1
  pickerTune = 0
  profileOverwriteIndex = 0
  profiles = this.webusb.getProfiles()!
  // Template aliases.
  HID = HID
  SectionIndex = SectionIndex
  GyroMode = GyroMode
  ThumbstickMode = ThumbstickMode
  ThumbstickDistanceMode = ThumbstickDistanceMode

  constructor(
    public webusb: WebusbService,
  ) {}

  sectionIsMeta = () => this.section instanceof CtrlSectionMeta
  sectionIsButton = () => this.section instanceof CtrlButton && !(this.section instanceof CtrlHome)
  sectionIsHome = () => this.section instanceof CtrlHome
  sectionIsRotary = () => this.section instanceof CtrlRotary
  sectionIsThumbstick = () => this.section instanceof CtrlThumbstick
  sectionIsGyro = () => this.section instanceof CtrlGyro
  sectionIsGyroAxis = () => this.section instanceof CtrlGyroAxis
  getSection = () => this.section as CtrlSection
  getSectionAsMeta = () => this.section as CtrlSectionMeta
  getSectionAsButton = () => this.section as CtrlButton
  getSectionAsRotary = () => this.section as CtrlRotary
  getSectionAsThumbstick = () => this.section as CtrlThumbstick
  getSectionAsGyro = () => this.section as CtrlGyro
  getSectionAsGyroAxis = () => this.section as CtrlGyroAxis

  getSectionTitle() {
    return sectionTitles[this.section.sectionIndex]
  }

  getActions() {
    const section = this.section as (CtrlButton | CtrlRotary | CtrlGyroAxis)
    return section.actions
  }

  getLabels() {
    const section = this.section as (CtrlButton | CtrlRotary)
    return section.labels
  }

  getPins() {
    if (this.webusb.selectedDevice!.isAlpakkaV0()) return PinV0
    else return PinV1
  }

  isButtonBlockVisible(group: number) {
    const button = this.getSectionAsButton()
    if (group == 0) return true
    if (group == 1 && (button.hold || button.sticky)) return true
    if (group == 2 && (button.double)) return true
    return false
  }

  getButtonBlockSubtitle(group: number) {
    const button = this.getSectionAsButton()
    if (group == 0) {
      if (button.sticky) return $localize`On the first press, until home is released:`
      if (!button.hold && !button.double && !button.immediate) return $localize`On button press:`
      if (button.hold && !button.immediate) return $localize`On short press:`
      if (button.hold && button.immediate) return $localize`On press (always):`
      if (!button.hold && button.double && !button.immediate) return $localize`On single press:`
      if (!button.hold && button.double && button.immediate) return $localize`On first press (always):`
    }
    if (group == 1) {
      if (button.sticky) return $localize`On every press:`
      if (button.hold && !button.double && !button.immediate) return $localize`Otherwise on long press:`
      if (button.hold && button.double && !button.immediate) return $localize`On long press:`
      if (button.hold && button.immediate) return $localize`Additionally on long press:`
      if (!button.hold && button.double && !button.immediate) return $localize`On single press:`
      if (!button.hold && button.double && button.immediate) return $localize`On first press (always):`
    }
    if (group == 2) {
      return $localize`On double press:`
    }
    return ''
  }

  getGyroMode() {
    const profile = this.profiles.getProfile(this.profileIndex) as Profile
    return profile.settingsGyro.mode
  }

  async profileOverwrite() {
    this.webusb.sendProfileOverwrite(this.profileIndex, this.profileOverwriteIndex)
    // Force <select> to initial value. For some reason Angular 2-way binding
    // does not fully work on HTML elements with OS-controlled UI?.
    // So this cannot be done with just "profileOverwriteIndex = 0".
    const element = document.getElementById('loadProfileElement') as any
    element.value = 0
    // Update the profile in the UI. Delay so the controller has time to process
    // the request before re-fetching the profile.
    await delay(500)
    this.profiles.fetchProfile(this.profileIndex, true)
  }

  async profileLoad(files: File[]) {
    const reader = new FileReader()
    reader.onload = (event: any) => {
      this.profiles.loadFromBlob(this.profileIndex, new Uint8Array(event.target.result))
    }
    reader.readAsArrayBuffer(files[0])
  }

  async profileSave() {
    const profileName = this.profiles.getProfile(this.profileIndex).meta.name
    const filename = `${profileName}.ctrl`
    const data = this.profiles.saveToBlob(this.profileIndex)
    const blob = new Blob([data], {type: 'application/octet-stream'})
    const a = document.createElement('a')
    document.body.appendChild(a)
    a.href = URL.createObjectURL(blob)
    a.download = filename
    a.click()
    URL.revokeObjectURL(a.href)
    a.remove()
  }

  showDialogKeypicker = (pickerGroup: number) => {
    this.pickerGroup = pickerGroup
    const section = this.section as (CtrlButton | CtrlRotary | CtrlGyroAxis)
    for(let action of section.actions[pickerGroup].actions) {
      if (action >= HID.PROC_PROFILE_0 && action <= HID.PROC_PROFILE_12) {
        this.pickerProfile = action - HID.PROC_PROFILE_0
      }
      if (action >= HID.PROC_ROTARY_MODE_0 && action <= HID.PROC_ROTARY_MODE_5) {
        this.pickerRotary = action - HID.PROC_ROTARY_MODE_0
      }
      if (action >= HID.PROC_MACRO_1 && action <= HID.PROC_MACRO_8) {
        this.pickerMacro = action - HID.PROC_MACRO_1 + 1
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
    const targetActions = this.getActions()[this.pickerGroup]
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
    const targetActions = this.getActions()[this.pickerGroup]
    this._pickToggle(targetActions, key)
  }

  pickProfile(increment = 0) {
    this._pickSelect(
      increment,
      HID.PROC_PROFILE_0,
      1,  // First profile.
      12,  // Last profile.
      this.pickerProfile,
      (x) => this.pickerProfile=x,
    )
  }

  pickRotary(increment = 0) {
    this._pickSelect(
      increment,
      HID.PROC_ROTARY_MODE_0,
      0,  // First rotary mode.
      4,  // Last rotary mode.
      this.pickerRotary,
      (x) => this.pickerRotary=x,
    )
  }

  pickMacro(increment = 0) {
    this._pickSelect(
      increment,
      HID.PROC_MACRO_1 - 1,
      1,  // First macro.
      8,  // Last macro.
      this.pickerMacro,
      (x) => this.pickerMacro=x,
    )
  }

  pickTune(increment = 0) {
    this._pickSelect(
      increment,
      HID.PROC_TUNE_OS,
      0,  // First tune index.
      3,  // Last tune index.
      this.pickerTune,
      (x) => this.pickerTune=x,
    )
  }

  // Colors in the picker UI.
  pickCls(action: HID) {
    const actions = this.getActions()[this.pickerGroup]
    let cls = 'pressBG'
    if (this.section instanceof CtrlButton) {
      if (this.pickerGroup==1 && this.section.hold) cls += ' holdBG'
      if (this.pickerGroup==2 && this.section.double) cls += ' doubleBG'
    }
    if (this.analog && sectionIsAnalog(this.section.sectionIndex) && isAxis(action)) {
      cls += ' analogBG'
    }
    if (actions.has(action)) return cls
    return ''
  }

  // Colors in the sidebar action selector.
  actionCls = (index: number, action: HID) => {
    let cls = 'press'
    if (this.section instanceof CtrlButton) {
      if (index==1 && this.section.hold) cls += ' hold'
      if (index==2 && this.section.double) cls += ' double'
    }
    if (this.analog && sectionIsAnalog(this.section.sectionIndex) && isAxis(action)) {
      cls += ' analog'
    }
    return cls
  }

  save = async () => {
    await this.webusb.trySetSection(this.profileIndex, this.section)
  }
}

interface SectionTitles {
  [index: number]: string
}
const sectionTitles: SectionTitles = {
  [SectionIndex.A]:                $localize`Button A`,
  [SectionIndex.B]:                $localize`Button B`,
  [SectionIndex.X]:                $localize`Button X`,
  [SectionIndex.Y]:                $localize`Button Y`,
  [SectionIndex.DPAD_LEFT]:        $localize`DPad Left`,
  [SectionIndex.DPAD_RIGHT]:       $localize`DPad Right`,
  [SectionIndex.DPAD_UP]:          $localize`DPad Up`,
  [SectionIndex.DPAD_DOWN]:        $localize`DPad Down`,
  [SectionIndex.SELECT_1]:         $localize`Select`,
  [SectionIndex.SELECT_2]:         $localize`Select (2)`,
  [SectionIndex.START_1]:          $localize`Start`,
  [SectionIndex.START_2]:          $localize`Start (2)`,
  [SectionIndex.L1]:               $localize`Trigger L1`,
  [SectionIndex.L2]:               $localize`Trigger L2`,
  [SectionIndex.L4]:               $localize`Trigger L4`,
  [SectionIndex.R1]:               $localize`Trigger R1`,
  [SectionIndex.R2]:               $localize`Trigger R2`,
  [SectionIndex.R4]:               $localize`Trigger R4`,
  [SectionIndex.LSTICK_SETTINGS]:  $localize`LStick Settings`,
  [SectionIndex.LSTICK_LEFT]:      $localize`LStick Left`,
  [SectionIndex.LSTICK_RIGHT]:     $localize`LStick Right`,
  [SectionIndex.LSTICK_UP]:        $localize`LStick Up`,
  [SectionIndex.LSTICK_DOWN]:      $localize`LStick Down`,
  [SectionIndex.LSTICK_UL]:        $localize`LStick Up-Left`,
  [SectionIndex.LSTICK_UR]:        $localize`LStick Up-Right`,
  [SectionIndex.LSTICK_DL]:        $localize`LStick Down-Left`,
  [SectionIndex.LSTICK_DR]:        $localize`LStick Down-Right`,
  [SectionIndex.LSTICK_PUSH]:      $localize`LStick Push`,
  [SectionIndex.LSTICK_INNER]:     $localize`LStick Inner`,
  [SectionIndex.LSTICK_OUTER]:     $localize`LStick Outer`,
  [SectionIndex.RSTICK_SETTINGS]:  $localize`RStick Settings`,
  [SectionIndex.RSTICK_LEFT]:      $localize`RStick Left`,
  [SectionIndex.RSTICK_RIGHT]:     $localize`RStick Right`,
  [SectionIndex.RSTICK_UP]:        $localize`RStick Up`,
  [SectionIndex.RSTICK_DOWN]:      $localize`RStick Down`,
  [SectionIndex.RSTICK_UL]:        $localize`RStick Up-Left`,
  [SectionIndex.RSTICK_UR]:        $localize`RStick Up-Right`,
  [SectionIndex.RSTICK_DL]:        $localize`RStick Down-Left`,
  [SectionIndex.RSTICK_DR]:        $localize`RStick Down-Right`,
  [SectionIndex.RSTICK_PUSH]:      $localize`RStick Push`,
  [SectionIndex.ROTARY_UP]:        $localize`Rotary up`,
  [SectionIndex.ROTARY_DOWN]:      $localize`Rotary down`,
  [SectionIndex.GYRO_SETTINGS]:    $localize`Gyro settings`,
  [SectionIndex.GYRO_X]:           $localize`Gyro Axis X`,
  [SectionIndex.GYRO_Y]:           $localize`Gyro Axis Y`,
  [SectionIndex.GYRO_Z]:           $localize`Gyro Axis Z`,
}

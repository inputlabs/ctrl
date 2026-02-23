// SPDX-License-Identifier: GPL-2.0-only
// Copyright (C) 2023, Input Labs Oy.

import { Component, Input, ViewChild, ElementRef} from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { ActionSelectorComponent } from './action_selector'
import { InputNumberComponent } from 'components/input_number/input_number'
import { WebusbService } from 'services/webusb'
import { Profile } from 'lib/profile'
import { CtrlSection, CtrlSectionMeta, CtrlButton, CtrlRotary } from 'lib/ctrl'
import { CtrlThumbstick, CtrlGyro, CtrlGyroAxis, CtrlHome } from 'lib/ctrl'
import { SectionIndex, sectionIsAnalog } from 'lib/ctrl'
import { ThumbstickMode, GyroMode } from 'lib/ctrl'
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
  tab = 0
  canvasCircle!: ElementRef<HTMLCanvasElement>
  canvasRamp!: ElementRef<HTMLCanvasElement>
  green = 'hsl(160deg, 100%, 50%)'
  purple = 'hsl(266deg, 100%, 50%)'
  // Template aliases.
  HID = HID
  SectionIndex = SectionIndex
  GyroMode = GyroMode
  ThumbstickMode = ThumbstickMode

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

  @ViewChild('_canvasCircle') set _canvasCircle(canvas: ElementRef<HTMLCanvasElement>) {
    if (!canvas) return
    this.canvasCircle = canvas
    this.plot()
  }

  @ViewChild('_canvasRamp') set _canvasRamp(canvas: ElementRef<HTMLCanvasElement>) {
    if (!canvas) return
    this.canvasRamp = canvas
    this.plot()
  }

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
      if (button.sticky) return 'On the first press, until home is released:'
      if (!button.hold && !button.double && !button.immediate) return 'On button press:'
      if (button.hold && !button.immediate) return 'On short press:'
      if (button.hold && button.immediate) return 'On press (always):'
      if (!button.hold && button.double && !button.immediate) return 'On single press:'
      if (!button.hold && button.double && button.immediate) return 'On first press (always):'
    }
    if (group == 1) {
      if (button.sticky) return 'On every press:'
      if (button.hold && !button.double && !button.immediate) return 'Otherwise on long press:'
      if (button.hold && button.double && !button.immediate) return 'On long press:'
      if (button.hold && button.immediate) return 'Additionally on long press:'
      if (!button.hold && button.double && !button.immediate) return 'On single press:'
      if (!button.hold && button.double && button.immediate) return 'On first press (always):'
    }
    if (group == 2) {
      return 'On double press:'
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

  plot = () => {
    this.plotCircle()
    this.plotRamp()
  }

  plotCircle = () => {
    if (!this.canvasCircle) return
    const ctx = this.canvasCircle.nativeElement.getContext('2d')!
    const thumbstick = this.getSectionAsThumbstick()

    const size = this.canvasCircle.nativeElement.width
    const mid = size / 2
    const max = size * 0.4
    let overlap = (50-thumbstick.overlap) / 100 * 90
    let overlapNeg = -thumbstick.overlap / 100 * 90
    // Helper functions.
    const deg = (angle: number) => {
      return angle * (Math.PI / 180)
    }
    const drawArc = (stroke: number, angle: number, size: number) => {
      let half = size / 2
      ctx.beginPath();
      ctx.arc(mid, mid, max, angle-half, angle+half)
      ctx.strokeStyle = this.green
      ctx.lineWidth = stroke
      ctx.stroke()
    }
    const drawCircle = (radius: number, lineWidth: number) => {
      ctx.beginPath()
      ctx.arc(mid, mid, radius, 0, deg(360))
      ctx.strokeStyle = this.purple
      ctx.lineWidth = lineWidth
      ctx.stroke()
    }
    // Draw.
    ctx.clearRect(0, 0, size, size);
    if (thumbstick.overlap >= 0) {
      drawArc(3, deg(0), deg(45+overlap))
      drawArc(3, deg(90), deg(45+overlap))
      drawArc(3, deg(180), deg(45+overlap))
      drawArc(3, deg(270), deg(45+overlap))
    }
    if (thumbstick.overlap >= 0) {
      drawArc(1, deg(45+0), deg(45-overlap))
      drawArc(1, deg(45+90), deg(45-overlap))
      drawArc(1, deg(45+180), deg(45-overlap))
      drawArc(1, deg(45+270), deg(45-overlap))
    }
    if (thumbstick.overlap < 0) {
      drawArc(3, deg(0), deg(90-overlapNeg))
      drawArc(3, deg(90), deg(90-overlapNeg))
      drawArc(3, deg(180), deg(90-overlapNeg))
      drawArc(3, deg(270), deg(90-overlapNeg))
    }
    drawCircle(thumbstick.deadzone*max/100, 3)
    drawCircle(thumbstick.outer_threshold*max/100, 3)
  }

  plotRamp = () => {
    if (!this.canvasRamp) return
    const ctx = this.canvasRamp.nativeElement.getContext('2d')!
    const thumbstick = this.getSectionAsThumbstick()
    const size = this.canvasRamp.nativeElement.width
    const min = 2
    const max = size - 2
    const pointA = {x: min, y: min}
    const pointB = {x: min + thumbstick.deadzone/100*max, y: min}
    const pointC = {x: pointB.x, y: min + thumbstick.antideadzone/100*max}
    const pointD = {x: thumbstick.saturation/100*max, y: max}
    const pointE = {x: max, y: max}
    // Accel curve.
    const curvePoints = 20
    const startX = min + (thumbstick.deadzone / 100) * max
    const startY = min + (thumbstick.antideadzone / 100) * max
    const endX = (thumbstick.saturation / 100) * max
    const scaleX = endX - startX
    const scaleY = max - startY
    // Helper functions.
    const drawVert = (x: number) => {
      ctx.beginPath();
      ctx.moveTo(x, min);
      ctx.lineTo(x, max);
      ctx.strokeStyle = this.purple;
      ctx.lineWidth = 3;
      ctx.stroke();
    }
    const felixCurve = (x: number, k: number) => {
      return (x*k+x) / (2*x*k-k+1)
    }
    // Clear.
    ctx.clearRect(0, 0, size, size);
    // Draw vertical lines.
    drawVert(pointB.x)
    drawVert(thumbstick.outer_threshold / 100 * max)
    // Draw starting lines.
    ctx.beginPath()
    ctx.moveTo(pointA.x, pointA.y)
    ctx.lineTo(pointB.x, pointB.y)
    ctx.lineTo(pointC.x, pointC.y)
    ctx.strokeStyle = this.green
    ctx.lineWidth = 3
    ctx.stroke()
    // Draw accel curve.
    let pointCz: {x: number, y:number}[] = []
    for(let i=0; i<=curvePoints; i++) {
      const k = thumbstick.accel_curve / 100
      let x = i / curvePoints
      let y = felixCurve(x, k)
      x *= scaleX
      y *= scaleY
      x += startX
      y += startY
      pointCz.push({x, y})
    }
    ctx.beginPath()
    ctx.moveTo(pointC.x, pointC.y)
    for(let i=0; i<=curvePoints; i++) {
      ctx.lineTo(pointCz[i].x, pointCz[i].y)
    }
    ctx.lineTo(pointD.x, pointD.y)
    ctx.strokeStyle = this.green
    ctx.lineWidth = 3
    ctx.stroke()
    // Draw ending lines.
    ctx.beginPath()
    ctx.moveTo(pointD.x, pointD.y)
    ctx.lineTo(pointE.x, pointE.y)
    ctx.strokeStyle = this.green
    ctx.lineWidth = 3
    ctx.stroke()
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
  [SectionIndex.LSTICK_SETTINGS]:  'LStick Settings',
  [SectionIndex.LSTICK_LEFT]:      'LStick Left',
  [SectionIndex.LSTICK_RIGHT]:     'LStick Right',
  [SectionIndex.LSTICK_UP]:        'LStick Up',
  [SectionIndex.LSTICK_DOWN]:      'LStick Down',
  [SectionIndex.LSTICK_UL]:        'LStick Up-Left',
  [SectionIndex.LSTICK_UR]:        'LStick Up-Right',
  [SectionIndex.LSTICK_DL]:        'LStick Down-Left',
  [SectionIndex.LSTICK_DR]:        'LStick Down-Right',
  [SectionIndex.LSTICK_PUSH]:      'LStick Push',
  [SectionIndex.LSTICK_INNER]:     'LStick Inner',
  [SectionIndex.LSTICK_OUTER]:     'LStick Outer',
  [SectionIndex.RSTICK_SETTINGS]:  'RStick Settings',
  [SectionIndex.RSTICK_LEFT]:      'RStick Left',
  [SectionIndex.RSTICK_RIGHT]:     'RStick Right',
  [SectionIndex.RSTICK_UP]:        'RStick Up',
  [SectionIndex.RSTICK_DOWN]:      'RStick Down',
  [SectionIndex.RSTICK_UL]:        'RStick Up-Left',
  [SectionIndex.RSTICK_UR]:        'RStick Up-Right',
  [SectionIndex.RSTICK_DL]:        'RStick Down-Left',
  [SectionIndex.RSTICK_DR]:        'RStick Down-Right',
  [SectionIndex.RSTICK_PUSH]:      'RStick Push',
  [SectionIndex.ROTARY_UP]:        'Rotary up',
  [SectionIndex.ROTARY_DOWN]:      'Rotary down',
  [SectionIndex.GYRO_SETTINGS]:    'Gyro settings',
  [SectionIndex.GYRO_X]:           'Gyro Axis X',
  [SectionIndex.GYRO_Y]:           'Gyro Axis Y',
  [SectionIndex.GYRO_Z]:           'Gyro Axis Z',
}

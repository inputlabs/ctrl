// SPDX-License-Identifier: GPL-2.0-only
// Copyright (C) 2023, Input Labs Oy.

import { Component } from '@angular/core'
import { CommonModule } from '@angular/common'
import { ActivatedRoute } from '@angular/router'
import { WebusbService } from 'services/webusb'
import { ButtonComponent } from 'components/profile/action_preview'
import { SectionComponent } from 'components/profile/section'
import { LedComponent, getProfileLed } from 'components/led/led'
import { CtrlSection, CtrlSectionMeta, CtrlButton, CtrlRotary, CtrlGyroAxis } from 'lib/ctrl'
import { ThumbstickMode, GyroMode } from 'lib/ctrl'
import { sectionIsGyroAxis, sectionIsHome } from 'lib/ctrl'
import { SectionIndex } from 'lib/ctrl'
import { Device } from 'lib/device'

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    ButtonComponent,
    SectionComponent,
    LedComponent,
  ],
  templateUrl: './profile.html',
  styleUrls: ['./profile.sass']
})
export class ProfileComponent {
  device?: Device
  profileIndex: number = 0
  selected: CtrlSection = new CtrlSectionMeta(0, SectionIndex.META, '', 0, 0, 0, 0)
  // Template aliases.
  SectionIndex = SectionIndex
  getLedPattern = getProfileLed

  constructor(
    private activatedRoute: ActivatedRoute,
    public webusb: WebusbService,
  ) {
    activatedRoute.data.subscribe((data) => {
      this.profileIndex = data['index']
    })
  }

  ngOnInit() {
    // Refresh data if device changes.
    if (!this.webusb.selectedDevice) return
    if (!this.webusb.isController()) return
    this.device = this.webusb.selectedDevice
    this.init()
  }

  async init() {
    // Wait until the device is ready.
    await this.device!.waitUntilReady()
    // Fetch profile names, retry if it fails.
    await this.tryFetchNames()
    // Selected early to avoid flickering.
    this.setSelectedMeta()
    // Fetch profile sections, retry if it fails.
    await this.tryFetchProfile()
    // Selected again to connect Angular 2-way binding correctly.
    this.setSelectedMeta()
  }

  async tryFetchNames() {
    const profiles = this.webusb.selectedDevice!.profiles
    await profiles.fetchProfileNames()
  }

  async tryFetchProfile() {
    console.log('tryFetchProfile', this.profileIndex)
    const profiles = this.webusb.selectedDevice!.profiles
    await profiles.fetchProfile(this.profileIndex, false)
  }

  getProfile() {
    return this.webusb.selectedDevice!.profiles.getProfile(this.profileIndex)
  }

  setSelected(section: CtrlSection) {
    this.selected = section
  }

  setSelectedMeta() {
    this.selected = this.getProfile().meta
  }

  setSelectedGyro() {
    this.selected = this.getProfile().settingsGyro
  }

  getSelected() {
    return this.selected as CtrlSection
  }

  getAdditionalClass(sectionIndex: SectionIndex): string {
    let cls = ''
    if (sectionIsHome(sectionIndex)) cls += ' centered'
    if (sectionIsGyroAxis(sectionIndex)) cls += ' centered'
    return cls
  }

  sectionCouldBeAnalog(section: CtrlSection) {
    const dirLStick= [
      SectionIndex.LSTICK_LEFT,
      SectionIndex.LSTICK_RIGHT,
      SectionIndex.LSTICK_UP,
      SectionIndex.LSTICK_DOWN
    ]
    const dirRStick= [
      SectionIndex.RSTICK_LEFT,
      SectionIndex.RSTICK_RIGHT,
      SectionIndex.RSTICK_UP,
      SectionIndex.RSTICK_DOWN
    ]
    const LThumbstickModeAnalog = (
      this.getProfile().settingsLStick.mode == ThumbstickMode.DIR4 ||
      this.getProfile().settingsLStick.mode == ThumbstickMode.ROTATION
    )
    const RThumbstickModeAnalog = (
      this.getProfile().settingsRStick.mode == ThumbstickMode.DIR4 ||
      this.getProfile().settingsRStick.mode == ThumbstickMode.ROTATION
    )
    if (LThumbstickModeAnalog) {
      if (dirLStick.includes(section.sectionIndex)) return true
    }
    if (RThumbstickModeAnalog) {
      if (dirRStick.includes(section.sectionIndex)) return true
    }
    if (sectionIsGyroAxis(section.sectionIndex)) return true
    return false
  }

  getMapping(section: CtrlButton | CtrlRotary | CtrlGyroAxis) {
    const pos = position.filter((x) => x.section==section.sectionIndex)[0]
    let style = {'grid-column': pos.column, 'grid-row': pos.row}
    let cls = 'cls' in pos ? <string>pos.cls : ''
    let analog = false
    if (this.sectionCouldBeAnalog(section)) analog = true
    if (section.sectionIndex == this.selected?.sectionIndex) cls += ' selected'
    return {
      section,
      cls,
      style,
      analog,
      click: () => this.setSelected(section),
    }
  }

  getMappings() {
    const profile = this.getProfile()
    const isV0 = this.device!.isAlpakkaV0()
    const settingsLStick = profile.settingsLStick
    const settingsRStick = profile.settingsRStick
    const gyro = profile.settingsGyro
    const rotaryUp = this.getMapping(profile.rotaryUp)
    const rotaryDown = this.getMapping(profile.rotaryDown)
    const home = this.getMapping(profile.home)
    const modeHas4DirOrMore = (mode: ThumbstickMode) => {
      return (
        mode==ThumbstickMode.DIR4 ||
        mode==ThumbstickMode.DIR8 ||
        mode==ThumbstickMode.ROTATION
      )
    }
    const buttons = [
      this.getMapping(profile.buttonA),
      this.getMapping(profile.buttonB),
      this.getMapping(profile.buttonX),
      this.getMapping(profile.buttonY),
      this.getMapping(profile.buttonDpadLeft),
      this.getMapping(profile.buttonDpadRight),
      this.getMapping(profile.buttonDpadUp),
      this.getMapping(profile.buttonDpadDown),
      this.getMapping(profile.buttonSelect1),
      this.getMapping(profile.buttonSelect2),
      this.getMapping(profile.buttonStart1),
      this.getMapping(profile.buttonStart2),
      this.getMapping(profile.buttonL1),
      this.getMapping(profile.buttonL2),
      this.getMapping(profile.buttonL4),
      this.getMapping(profile.buttonR1),
      this.getMapping(profile.buttonR2),
      this.getMapping(profile.buttonR4),
    ]
    if (modeHas4DirOrMore(settingsLStick.mode)) {
      buttons.push(...[
        this.getMapping(profile.buttonLStickLeft),
        this.getMapping(profile.buttonLStickRight),
        this.getMapping(profile.buttonLStickUp),
        this.getMapping(profile.buttonLStickDown),
        this.getMapping(profile.buttonLStickPush),
        this.getMapping(profile.buttonLStickInner),
        this.getMapping(profile.buttonLStickOuter),
      ])
    }
    if (settingsLStick.mode==ThumbstickMode.DIR8) {
      buttons.push(...[
        this.getMapping(profile.buttonLStickUL),
        this.getMapping(profile.buttonLStickUR),
        this.getMapping(profile.buttonLStickDL),
        this.getMapping(profile.buttonLStickDR),
      ])
    }
    if (isV0 || modeHas4DirOrMore(settingsRStick.mode)) {
      buttons.push(...[
        this.getMapping(profile.buttonRStickLeft),
        this.getMapping(profile.buttonRStickRight),
        this.getMapping(profile.buttonRStickUp),
        this.getMapping(profile.buttonRStickDown),
        this.getMapping(profile.buttonRStickPush),
        // this.getMapping(profile.buttonRStickInner),
        // this.getMapping(profile.buttonRStickOuter),
      ])
    }
    if (isV0 || settingsRStick.mode==ThumbstickMode.DIR8) {
      buttons.push(...[
        this.getMapping(profile.buttonRStickUL),
        this.getMapping(profile.buttonRStickUR),
        this.getMapping(profile.buttonRStickDL),
        this.getMapping(profile.buttonRStickDR),
      ])
    }
    let gyroAxis: any = []
    if (gyro.mode != GyroMode.OFF) {
      gyroAxis = [
        this.getMapping(profile.gyroX),
        this.getMapping(profile.gyroY),
        this.getMapping(profile.gyroZ),
      ]
    }
    return [...buttons, ...gyroAxis, rotaryUp, rotaryDown, home]
  }

  // Required so change detection is working better is scenarios where the
  // focus is "stolen" by sidebar form inputs.
  trackById(index: number, item: any): any {
    return item.id
  }
}

const position = [
  {section: 0,                             column: 0,       row: 0 },
  {section: SectionIndex.L2,               column: 1,       row: 1,     cls:'overflow' },
  {section: SectionIndex.L1,               column: 1,       row: 2,     cls:'overflow' },
  {section: SectionIndex.DPAD_UP,          column: 1,       row: 4,     cls:'overflow' },
  {section: SectionIndex.DPAD_RIGHT,       column: 1,       row: '5/7', cls:'overflow' },
  {section: SectionIndex.DPAD_LEFT,        column: 1,       row: '7/9', cls:'overflow' },
  {section: SectionIndex.DPAD_DOWN,        column: 1,       row: 9,     cls:'overflow' },
  {section: SectionIndex.L4,               column: 1,       row: 11,    cls:'overflow' },
  {section: SectionIndex.SELECT_1,         column: '4/10',  row: 1 },
  {section: SectionIndex.SELECT_2,         column: '4/10',  row: 2 },
  {section: SectionIndex.START_1,          column: '10/15', row: 1,     cls:'overflow' },
  {section: SectionIndex.START_2,          column: '10/15', row: 2,     cls:'overflow' },
  {section: SectionIndex.R2,               column: '17/19', row: 1 },
  {section: SectionIndex.R1,               column: '17/19', row: 2 },
  {section: SectionIndex.Y,                column: '17/19', row: 4 },
  {section: SectionIndex.X,                column: '17/19', row: '5/7' },
  {section: SectionIndex.B,                column: '17/19', row: '7/9' },
  {section: SectionIndex.A,                column: '17/19', row: 9 },
  {section: SectionIndex.R4,               column: '17/19', row: 11 },

  {section: SectionIndex.LSTICK_UL,        column: 1,       row: 13 },
  {section: SectionIndex.LSTICK_LEFT,      column: 1,       row: 14 },
  {section: SectionIndex.LSTICK_DL,        column: 1,       row: 15 },
  {section: SectionIndex.LSTICK_UP,        column: 2,       row: 13 },
  {section: SectionIndex.LSTICK_PUSH,      column: 2,       row: 14 },
  {section: SectionIndex.LSTICK_DOWN,      column: 2,       row: 15 },
  {section: SectionIndex.LSTICK_UR,        column: '3/7',   row: 13 },
  {section: SectionIndex.LSTICK_RIGHT,     column: '3/7',   row: 14 },
  {section: SectionIndex.LSTICK_DR,        column: '3/7',   row: 15 },
  {section: SectionIndex.LSTICK_INNER,     column: 2,       row: '18/20' },
  {section: SectionIndex.LSTICK_OUTER,     column: 2,       row: '20/22' },

  {section: SectionIndex.RSTICK_LEFT,      column: '12/16', row: 14 },
  {section: SectionIndex.RSTICK_RIGHT,     column: '17/19', row: 14 },
  {section: SectionIndex.RSTICK_UP,        column: 16,      row: 13 },
  {section: SectionIndex.RSTICK_DOWN,      column: 16,      row: 15 },
  {section: SectionIndex.RSTICK_UL,        column: '12/16', row: 13 },
  {section: SectionIndex.RSTICK_UR,        column: '17/19', row: 13 },
  {section: SectionIndex.RSTICK_DL,        column: '12/16', row: 15 },
  {section: SectionIndex.RSTICK_DR,        column: '17/19', row: 15 },
  {section: SectionIndex.RSTICK_PUSH,      column: 16,      row: 14 },

  {section: SectionIndex.ROTARY_UP,        column: '16/18', row: '18/20', cls:'wide'},
  {section: SectionIndex.ROTARY_DOWN,      column: '16/18', row: '20/22', cls:'wide'},
  {section: SectionIndex.GYRO_X,           column: '6/13',  row: '17/19', cls:'thin'},
  {section: SectionIndex.GYRO_Y,           column: '6/13',  row: '19/21', cls:'thin'},
  {section: SectionIndex.GYRO_Z,           column: '6/13',  row: '21/23', cls:'thin'},
  {section: SectionIndex.HOME,             column: '6/13',  row: 11, cls: 'thin'},
]

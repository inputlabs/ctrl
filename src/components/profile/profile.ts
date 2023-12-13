// SPDX-License-Identifier: GPL-2.0-only
// Copyright (C) 2023, Input Labs Oy.

import { Component } from '@angular/core'
import { CommonModule } from '@angular/common'
import { ActivatedRoute } from '@angular/router'
import { ProfileService } from 'services/profiles'
import { ButtonComponent } from 'components/profile/action_preview'
import { SectionComponent } from 'components/profile/section'
import { LedComponent, getProfileLed } from 'components/led/led'
import { CtrlSection, CtrlSectionName, CtrlButton, CtrlRotary, CtrlGyroAxis } from 'lib/ctrl'
import { ThumbstickMode, GyroMode } from 'lib/ctrl'
import { sectionIsThumbtickButton, sectionIsGyroAxis, sectionIsHome } from 'lib/ctrl'
import { SectionIndex } from 'lib/ctrl'

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
  profileIndex: number = 0
  selected: CtrlSection = new CtrlSectionName(0, SectionIndex.NAME, '')
  // Template aliases.
  SectionIndex = SectionIndex
  getLedPattern = getProfileLed

  constructor(
    private activatedRoute: ActivatedRoute,
    public profileService: ProfileService,
  ) {
    activatedRoute.data.subscribe((data) => {
      this.profileIndex = data['index']
    })
  }

  ngOnInit() {
    this.init()
  }

  async init() {
    this.initName()  // Display previous name without flickering.
    await this.profileService.fetchProfileNames()
    this.initName()
    await this.profileService.fetchProfile(this.profileIndex)
  }

  initName() {
    this.selected = this.profileService.profiles[this.profileIndex].name
  }

  setSelected(section: CtrlSection) {
    this.selected = section
  }

  setSelectedName() {
    this.selected = this.profileService.profiles[this.profileIndex].name
  }

  setSelectedThumbstick() {
    this.selected = this.profileService.profiles[this.profileIndex].thumbstick
  }

  setSelectedGyro() {
    this.selected = this.profileService.profiles[this.profileIndex].gyro
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

  getMapping( section: CtrlButton | CtrlRotary | CtrlGyroAxis) {
    const pos = position.filter((x) => x.section==section.sectionIndex)[0]
    let style = {'grid-column': pos.column, 'grid-row': pos.row}
    let cls = 'cls' in pos ? <string>pos.cls : ''
    if (section.sectionIndex == this.selected?.sectionIndex) cls += ' selected'
    return {
      section,
      cls,
      style,
      click: () => this.setSelected(section),
    }
  }

  getMappings() {
    const profile = this.profileService.profiles[this.profileIndex]
    const thumbstick = profile.thumbstick
    const gyro = profile.gyro
    const rotaryUp = this.getMapping(profile.rotaryUp)
    const rotaryDown = this.getMapping(profile.rotaryDown)
    const home = this.getMapping(profile.home)
    const buttons = profile.buttons
      .filter((button: CtrlButton) => {
        // Filter out thumbstick directions if mode is unfitting.
        if (!sectionIsThumbtickButton(button.sectionIndex)) return true
        else if (thumbstick.mode == ThumbstickMode.DIR4) return true
        return false
      })
      .map((button: CtrlButton) => this.getMapping(button))
    const gyroAxis = profile.gyroAxis
      .filter((axis: CtrlGyroAxis) => {
        // Filter out gyro axis if mode is unfitting.
        if (!sectionIsGyroAxis(axis.sectionIndex)) return true
        else if (gyro.mode == GyroMode.OFF) return false
        return true
      })
      .map((axis: CtrlGyroAxis) => this.getMapping(axis))
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
  {section: SectionIndex.L2,               column: 1,       row: 1 },
  {section: SectionIndex.L1,               column: 1,       row: 2 },
  {section: SectionIndex.DPAD_UP,          column: 1,       row: 4,     cls:'overflow' },
  {section: SectionIndex.DPAD_RIGHT,       column: 1,       row: '5/7', cls:'overflow' },
  {section: SectionIndex.DPAD_LEFT,        column: 1,       row: '7/9', cls:'overflow' },
  {section: SectionIndex.DPAD_DOWN,        column: 1,       row: 9,     cls:'overflow' },
  {section: SectionIndex.L4,               column: 1,       row: 11 },
  {section: SectionIndex.SELECT_1,         column: '4/9',   row: 1 },
  {section: SectionIndex.SELECT_2,         column: '4/9',   row: 2 },
  {section: SectionIndex.START_1,          column: '10/15', row: 1 },
  {section: SectionIndex.START_2,          column: '10/15', row: 2 },
  {section: SectionIndex.R2,               column: 17,      row: 1 },
  {section: SectionIndex.R1,               column: 17,      row: 2 },
  {section: SectionIndex.Y,                column: 17,      row: 4 },
  {section: SectionIndex.X,                column: 17,      row: '5/7' },
  {section: SectionIndex.B,                column: 17,      row: '7/9' },
  {section: SectionIndex.A,                column: 17,      row: 9 },
  {section: SectionIndex.R4,               column: 17,      row: 11 },
  {section: SectionIndex.DHAT_LEFT,        column: '12/16', row: 14 },
  {section: SectionIndex.DHAT_RIGHT,       column: 17,      row: 14 },
  {section: SectionIndex.DHAT_UP,          column: 16,      row: 13 },
  {section: SectionIndex.DHAT_DOWN,        column: 16,      row: 15 },
  {section: SectionIndex.DHAT_UL,          column: '12/16', row: 13 },
  {section: SectionIndex.DHAT_UR,          column: 17,      row: 13 },
  {section: SectionIndex.DHAT_DL,          column: '12/16', row: 15 },
  {section: SectionIndex.DHAT_DR,          column: 17,      row: 15 },
  {section: SectionIndex.DHAT_PUSH,        column: 16,      row: 14 },
  {section: SectionIndex.ROTARY_UP,        column: '16/18', row: '18/20', cls:'wide'},
  {section: SectionIndex.ROTARY_DOWN,      column: '16/18', row: '20/22', cls:'wide'},
  {section: SectionIndex.THUMBSTICK_LEFT,  column: 1,       row: 14 },
  {section: SectionIndex.THUMBSTICK_RIGHT, column: '3/7',   row: 14 },
  {section: SectionIndex.THUMBSTICK_UP,    column: 2,       row: 13 },
  {section: SectionIndex.THUMBSTICK_DOWN,  column: 2,       row: 15 },
  {section: SectionIndex.THUMBSTICK_PUSH,  column: 2,       row: 14 },
  {section: SectionIndex.THUMBSTICK_INNER, column: 2,       row: '18/20' },
  {section: SectionIndex.THUMBSTICK_OUTER, column: 2,       row: '20/22' },
  {section: SectionIndex.GYRO_X,           column: '6/13',  row: '17/19', cls:'thin'},
  {section: SectionIndex.GYRO_Y,           column: '6/13',  row: '19/21', cls:'thin'},
  {section: SectionIndex.GYRO_Z,           column: '6/13',  row: '21/23', cls:'thin'},
  {section: SectionIndex.HOME,             column: '6/13',  row: 11, cls: 'thin'},
]

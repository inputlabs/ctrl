// SPDX-License-Identifier: GPL-2.0-only
// Copyright (C) 2023, Input Labs Oy.

import { Component } from '@angular/core'
import { CommonModule } from '@angular/common'
import { ActivatedRoute } from '@angular/router'
import { ProfileService } from 'services/profiles'
import { ButtonComponent } from 'components/profile/action_preview'
import { SectionComponent } from 'components/profile/section'
import { CtrlSection, CtrlSectionName, CtrlButton, CtrlRotary, CtrlGyroAxis, SectionIndex, ButtonMode } from 'lib/ctrl'

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    ButtonComponent,
    SectionComponent,
  ],
  templateUrl: './profile.html',
  styleUrls: ['./profile.sass']
})
export class ProfileComponent {
  profileIndex: number = 0
  selected: CtrlSection = new CtrlSectionName(0, SectionIndex.NAME, '')
  // Template aliases.
  SectionIndex = SectionIndex

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

  setSelectedThumbstick() {
    this.selected = this.profileService.profiles[this.profileIndex].thumbstick
  }

  setSelectedGyro() {
    this.selected = this.profileService.profiles[this.profileIndex].gyro
  }

  getSelected() {
    return this.selected as CtrlSection
  }

  getMapping(
    section: CtrlButton | CtrlRotary | CtrlGyroAxis,
    cls: string = '',
  ) {
    const pos = position.filter((x) => x.section==section.sectionIndex)[0]
    let style = {'grid-column': pos.column, 'grid-row': pos.row}
    if (section.sectionIndex == this.selected?.sectionIndex) cls += ' selected'
    return {
      mode: section instanceof CtrlButton ? section.mode() : ButtonMode.NORMAL,
      actions: section instanceof CtrlRotary ? [section.actions[0]] : section.actions,
      hints: section instanceof CtrlRotary
        ? [section.hints[0]]
        : section instanceof CtrlButton ? section.hints : [],
      cls,
      style,
      click: () => this.setSelected(section),
    }
  }

  getMappings() {
    const buttons = this.profileService.profiles[this.profileIndex].buttons
      .map((button: CtrlButton) => this.getMapping(button))
    const rotaryUp = this.getMapping(this.profileService.profiles[this.profileIndex].rotaryUp)
    const rotaryDown = this.getMapping(this.profileService.profiles[this.profileIndex].rotaryDown)
    const gyroX = this.getMapping(this.profileService.profiles[this.profileIndex].gyroX)
    const gyroY = this.getMapping(this.profileService.profiles[this.profileIndex].gyroY)
    const gyroZ = this.getMapping(this.profileService.profiles[this.profileIndex].gyroZ)
    return [...buttons, rotaryUp, rotaryDown, gyroX, gyroY, gyroZ]
  }
}

const position = [
  {section: 0,                             column: 0,       row: 0 },
  {section: SectionIndex.L2,               column: 1,       row: 1 },
  {section: SectionIndex.L1,               column: 1,       row: 2 },
  {section: SectionIndex.DPAD_UP,          column: 1,       row: 4 },
  {section: SectionIndex.DPAD_RIGHT,       column: 1,       row: 5 },
  {section: SectionIndex.DPAD_LEFT,        column: 1,       row: 6 },
  {section: SectionIndex.DPAD_DOWN,        column: 1,       row: 7 },
  {section: SectionIndex.L4,               column: 1,       row: 9 },
  {section: SectionIndex.SELECT_1,         column: '4/8',   row: 1 },
  {section: SectionIndex.SELECT_2,         column: '4/8',   row: 2 },
  {section: SectionIndex.START_1,          column: '9/13',  row: 1 },
  {section: SectionIndex.START_2,          column: '9/13',  row: 2 },
  {section: SectionIndex.R2,               column: 15,      row: 1 },
  {section: SectionIndex.R1,               column: 15,      row: 2 },
  {section: SectionIndex.Y,                column: 15,      row: 4 },
  {section: SectionIndex.X,                column: 15,      row: 5 },
  {section: SectionIndex.B,                column: 15,      row: 6 },
  {section: SectionIndex.A,                column: 15,      row: 7 },
  {section: SectionIndex.R4,               column: 15,      row: 9 },
  {section: SectionIndex.DHAT_LEFT,        column: '10/14', row: 12 },
  {section: SectionIndex.DHAT_RIGHT,       column: 15,      row: 12 },
  {section: SectionIndex.DHAT_UP,          column: 14,      row: 11 },
  {section: SectionIndex.DHAT_DOWN,        column: 14,      row: 13 },
  {section: SectionIndex.DHAT_UL,          column: '10/14', row: 11 },
  {section: SectionIndex.DHAT_UR,          column: 15,      row: 11 },
  {section: SectionIndex.DHAT_DL,          column: '10/14', row: 13 },
  {section: SectionIndex.DHAT_DR,          column: 15,      row: 13 },
  {section: SectionIndex.DHAT_PUSH,        column: 14,      row: 12 },
  {section: SectionIndex.GYRO_X,           column: '6/11',  row: 15 },
  {section: SectionIndex.GYRO_Y,           column: '6/11',  row: 16 },
  {section: SectionIndex.GYRO_Z,           column: '6/11',  row: 17 },
  {section: SectionIndex.ROTARY_UP,        column: 14,      row: 15 },
  {section: SectionIndex.ROTARY_DOWN,      column: 14,      row: 16 },
  {section: SectionIndex.THUMBSTICK_LEFT,  column: 1,       row: 12 },
  {section: SectionIndex.THUMBSTICK_RIGHT, column: '3/7',   row: 12 },
  {section: SectionIndex.THUMBSTICK_UP,    column: 2,       row: 11 },
  {section: SectionIndex.THUMBSTICK_DOWN,  column: 2,       row: 13 },
  {section: SectionIndex.THUMBSTICK_PUSH,  column: 2,       row: 12 },
  {section: SectionIndex.THUMBSTICK_INNER, column: 2,       row: 15 },
  {section: SectionIndex.THUMBSTICK_OUTER, column: 2,       row: 16 },
]

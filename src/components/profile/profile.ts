// SPDX-License-Identifier: GPL-2.0-only
// Copyright (C) 2023, Input Labs Oy.

import { Component } from '@angular/core'
import { CommonModule } from '@angular/common'
import { ActivatedRoute } from '@angular/router'
import { ProfileService } from 'services/profiles'
import { ButtonComponent } from 'components/keygroup/keygroup'
import { SectionComponent } from 'components/section/section'
import { ActionGroup } from 'lib/actiongroup'
import { CtrlButton, CtrlRotary, CtrlSection } from 'lib/ctrl'
import { SectionName, SectionButton, SectionRotary } from 'lib/ctrl'

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
  selected?: CtrlSection

  constructor(
    private activatedRoute: ActivatedRoute,
    public profileService: ProfileService,
  ) {
    activatedRoute.data.subscribe((data) => {
      this.profileIndex = data['index']
    })
  }

  ngOnInit() {
    this.profileService.getProfile(this.profileIndex)
  }

  setSelected(section: CtrlSection) {
    this.selected = section
  }

  getSelected() {
    return this.selected as CtrlSection
  }

  getMappingButton(button: CtrlButton) {
    const pos = position.filter((x) => x.section==button.sectionIndex)[0]
    let cls = ''
    let style = {'grid-column': pos.column, 'grid-row': pos.row}
    if (button.sectionIndex == this.selected?.sectionIndex) cls += ' selected'
    return {
      mode: button.mode(),
      actions_primary: button.actions_primary,
      actions_secondary: button.actions_secondary,
      hint_primary: button.hint_primary,
      hint_secondary: button.hint_secondary,
      cls,
      style,
      click: () => this.setSelected(button),
    }
  }

  getMappingRotary(rotary: CtrlRotary) {
    const pos = position.filter((x) => x.section==rotary.sectionIndex)[0]
    let cls = 'doublewidth'
    let style = {'grid-column': pos.column, 'grid-row': pos.row}
    if (rotary.sectionIndex == this.selected?.sectionIndex) cls += ' selected'
    return {
      mode: 0,
      actions_primary: rotary.actions_0,
      actions_secondary: ActionGroup.empty(4),
      hint_primary: rotary.hint_0,
      hint_secondary: '',
      cls,
      style,
      click: () => this.setSelected(rotary),
    }
  }

  getMappings() {
    const buttons = this.profileService.profiles[this.profileIndex].buttons
      .map((button: CtrlButton) => this.getMappingButton(button))
    const rotary_up = this.getMappingRotary(
      this.profileService.profiles[this.profileIndex].rotary_up
    )
    const rotary_down = this.getMappingRotary(
      this.profileService.profiles[this.profileIndex].rotary_down
    )
    return [...buttons, rotary_up, rotary_down]
  }
}

const position = [
  {section: 0,        column: 0,       row: 0 },
  {section: SectionButton.L2,          column: 1,       row: 1 },
  {section: SectionButton.L1,          column: 1,       row: 2 },
  {section: SectionButton.DPAD_UP,     column: 1,       row: 4 },
  {section: SectionButton.DPAD_RIGHT,  column: 1,       row: 5 },
  {section: SectionButton.DPAD_LEFT,   column: 1,       row: 6 },
  {section: SectionButton.DPAD_DOWN,   column: 1,       row: 7 },
  {section: SectionButton.L4,          column: 1,       row: 9 },
  {section: SectionButton.SELECT_1,    column: '4/8',   row: 1 },
  {section: SectionButton.SELECT_2,    column: '4/8',   row: 2 },
  {section: SectionButton.START_1,     column: '9/13',  row: 1 },
  {section: SectionButton.START_2,     column: '9/13',  row: 2 },
  {section: SectionButton.R2,          column: 15,      row: 1 },
  {section: SectionButton.R1,          column: 15,      row: 2 },
  {section: SectionButton.Y,           column: 15,      row: 4 },
  {section: SectionButton.X,           column: 15,      row: 5 },
  {section: SectionButton.B,           column: 15,      row: 6 },
  {section: SectionButton.A,           column: 15,      row: 7 },
  {section: SectionButton.R4,          column: 15,      row: 9 },
  {section: SectionButton.DHAT_LEFT,   column: '10/14', row: 12 },
  {section: SectionButton.DHAT_RIGHT,  column: 15,      row: 12 },
  {section: SectionButton.DHAT_UP,     column: 14,      row: 11 },
  {section: SectionButton.DHAT_DOWN,   column: 14,      row: 13 },
  {section: SectionButton.DHAT_UL,     column: '10/14', row: 11 },
  {section: SectionButton.DHAT_UR,     column: 15,      row: 11 },
  {section: SectionButton.DHAT_DL,     column: '10/14', row: 13 },
  {section: SectionButton.DHAT_DR,     column: 15,      row: 13 },
  {section: SectionButton.DHAT_PUSH,   column: 14,      row: 12 },
  {section: SectionRotary.ROTARY_UP,   column: '14/16', row: 15 },
  {section: SectionRotary.ROTARY_DOWN, column: '14/16', row: 16 },
]

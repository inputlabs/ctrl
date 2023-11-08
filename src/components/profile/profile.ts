// SPDX-License-Identifier: GPL-2.0-only
// Copyright (C) 2023, Input Labs Oy.

import { Component } from '@angular/core'
import { CommonModule } from '@angular/common'
import { ActivatedRoute } from '@angular/router'
import { ProfileService } from 'services/profiles'
import { ButtonComponent } from 'components/keygroup/keygroup'
import { SectionComponent } from 'components/section/section'
import { CtrlButton, CtrlRotary, CtrlSection, SectionIndex } from 'lib/ctrl'

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
    return this.selected
  }

  getSelectedAsButton(): Array<CtrlButton> {
    if(!this.selected) return []
    const index = this.selected.sectionIndex
    if (index >= 2 && index <= 28) return [this.selected as CtrlButton]
    return []
  }

  getMappingButton(button: CtrlButton) {
    const pos = position.filter((x) => x.section==button.sectionIndex)[0]
    let cls = ''
    let style = {'grid-column': pos.column, 'grid-row': pos.row}
    if (button.sectionIndex == this.selected?.sectionIndex) cls += ' selected'
    return {
      mode: button.mode,
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
      actions_secondary: [],
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
  {section: SectionIndex.NONE,        column: 0,       row: 0 },
  {section: SectionIndex.L2,          column: 1,       row: 1 },
  {section: SectionIndex.L1,          column: 1,       row: 2 },
  {section: SectionIndex.DPAD_UP,     column: 1,       row: 4 },
  {section: SectionIndex.DPAD_RIGHT,  column: 1,       row: 5 },
  {section: SectionIndex.DPAD_LEFT,   column: 1,       row: 6 },
  {section: SectionIndex.DPAD_DOWN,   column: 1,       row: 7 },
  {section: SectionIndex.L4,          column: 1,       row: 9 },
  {section: SectionIndex.SELECT_1,    column: '4/8',   row: 1 },
  {section: SectionIndex.SELECT_2,    column: '4/8',   row: 2 },
  {section: SectionIndex.START_1,     column: '9/13',  row: 1 },
  {section: SectionIndex.START_2,     column: '9/13',  row: 2 },
  {section: SectionIndex.R2,          column: 15,      row: 1 },
  {section: SectionIndex.R1,          column: 15,      row: 2 },
  {section: SectionIndex.Y,           column: 15,      row: 4 },
  {section: SectionIndex.X,           column: 15,      row: 5 },
  {section: SectionIndex.B,           column: 15,      row: 6 },
  {section: SectionIndex.A,           column: 15,      row: 7 },
  {section: SectionIndex.R4,          column: 15,      row: 9 },
  {section: SectionIndex.DHAT_LEFT,   column: '10/14', row: 12 },
  {section: SectionIndex.DHAT_RIGHT,  column: 15,      row: 12 },
  {section: SectionIndex.DHAT_UP,     column: 14,      row: 11 },
  {section: SectionIndex.DHAT_DOWN,   column: 14,      row: 13 },
  {section: SectionIndex.DHAT_UL,     column: '10/14', row: 11 },
  {section: SectionIndex.DHAT_UR,     column: 15,      row: 11 },
  {section: SectionIndex.DHAT_DL,     column: '10/14', row: 13 },
  {section: SectionIndex.DHAT_DR,     column: 15,      row: 13 },
  {section: SectionIndex.DHAT_PUSH,   column: 14,      row: 12 },
  {section: SectionIndex.ROTARY_UP,   column: '14/16', row: 15 },
  {section: SectionIndex.ROTARY_DOWN, column: '14/16', row: 16 },
]

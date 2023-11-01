// SPDX-License-Identifier: GPL-2.0-only
// Copyright (C) 2023, Input Labs Oy.

import { Component } from '@angular/core'
import { CommonModule } from '@angular/common'
import { ActivatedRoute } from '@angular/router'
import { ProfileService, Button } from 'services/profiles'
import { ButtonComponent } from 'components/button/button'
import { SectionIndex } from 'lib/ctrl'

@Component({
  selector: 'app-wip',
  standalone: true,
  imports: [
    CommonModule,
    ButtonComponent,
  ],
  templateUrl: './profile.html',
  styleUrls: ['./profile.sass']
})
export class ProfileComponent {
  profileIndex: number = 0
  selected?: Button

  constructor(
    private activatedRoute: ActivatedRoute,
    public profileService: ProfileService,
  ) {
    activatedRoute.data.subscribe((data) => {
      this.profileIndex = data['index']
    })
    this.profileService.getProfile(this.profileIndex)
  }

  setSelected(button: Button) {
    this.selected = button
  }

  getSelected() {
    return {
      section: SectionIndex[(<Button>this.selected).section],
      button: this.selected,
    }
  }

  getSectionName() {
    return SectionIndex[(<Button>this.selected).section]
  }

  getMappings() {
    const table = [
      {section: SectionIndex.L2,         column: 1,       row: 1 },
      {section: SectionIndex.L1,         column: 1,       row: 2 },
      {section: SectionIndex.DPAD_UP,    column: 1,       row: 4 },
      {section: SectionIndex.DPAD_RIGHT, column: 1,       row: 5 },
      {section: SectionIndex.DPAD_LEFT,  column: 1,       row: 6 },
      {section: SectionIndex.DPAD_DOWN,  column: 1,       row: 7 },
      {section: SectionIndex.L4,         column: 1,       row: 9 },
      {section: SectionIndex.SELECT_1,   column: '4/8',   row: 1 },
      {section: SectionIndex.SELECT_2,   column: '4/8',   row: 2 },
      {section: SectionIndex.START_1,    column: '9/13',  row: 1 },
      {section: SectionIndex.START_2,    column: '9/13',  row: 2 },
      {section: SectionIndex.R2,         column: 15,      row: 1 },
      {section: SectionIndex.R1,         column: 15,      row: 2 },
      {section: SectionIndex.Y,          column: 15,      row: 4 },
      {section: SectionIndex.X,          column: 15,      row: 5 },
      {section: SectionIndex.B,          column: 15,      row: 6 },
      {section: SectionIndex.A,          column: 15,      row: 7 },
      {section: SectionIndex.R4,         column: 15,      row: 9 },
      {section: SectionIndex.DHAT_LEFT,  column: '10/14', row: 12 },
      {section: SectionIndex.DHAT_RIGHT, column: 15,      row: 12 },
      {section: SectionIndex.DHAT_UP,    column: 14,      row: 11 },
      {section: SectionIndex.DHAT_DOWN,  column: 14,      row: 13 },
      {section: SectionIndex.DHAT_UL,    column: '10/14', row: 11 },
      {section: SectionIndex.DHAT_UR,    column: 15,      row: 11 },
      {section: SectionIndex.DHAT_DL,    column: '10/14', row: 13 },
      {section: SectionIndex.DHAT_DR,    column: 15,      row: 13 },
      {section: SectionIndex.DHAT_PUSH,  column: 14,      row: 12 },
    ]
    return this.profileService.profiles[this.profileIndex].buttons
      .map((button: Button) => {
        const tableEntry = table.filter((x) => x.section==button.section)[0]
        let cls = ''
        let style = {'grid-column': tableEntry.column, 'grid-row': tableEntry.row}
        if (button.section == this.selected?.section) cls += ' selected'
        return {
          button,
          cls,
          style,
          click: () => this.setSelected(button),
        }
      })
  }
}

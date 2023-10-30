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

  getMappings() {
    const table = [
      {section: SectionIndex.A,          row: 6, column: 9},
      {section: SectionIndex.L2,         row: 1, column: 1},
      {section: SectionIndex.L1,         row: 2, column: 1},
      {section: SectionIndex.DPAD_UP,    row: 3, column: 1},
      {section: SectionIndex.DPAD_RIGHT, row: 4, column: 1},
      {section: SectionIndex.DPAD_LEFT,  row: 5, column: 1},
      {section: SectionIndex.DPAD_DOWN,  row: 6, column: 1},
      {section: SectionIndex.L4,         row: 7, column: 1},
      {section: SectionIndex.R2,         row: 1, column: 9},
      {section: SectionIndex.R1,         row: 2, column: 9},
      {section: SectionIndex.Y,          row: 3, column: 9},
      {section: SectionIndex.X,          row: 4, column: 9},
      {section: SectionIndex.B,          row: 5, column: 9},
      {section: SectionIndex.A,          row: 6, column: 9},
      {section: SectionIndex.R4,         row: 7, column: 9},
      {section: SectionIndex.SELECT_1,   row: 1, column: 4},
      {section: SectionIndex.SELECT_2,   row: 2, column: 4},
      {section: SectionIndex.START_1,    row: 1, column: 6},
      {section: SectionIndex.START_2,    row: 2, column: 6},
    ]
    return this.profileService.profiles[this.profileIndex].buttons
      .map((button: Button) => {
        const tableEntry = table.filter((x) => x.section==button.section)[0]
        let cls = `row${tableEntry.row} column${tableEntry.column}`
        if (button.section == this.selected?.section) cls += ' selected'
        return {
          button,
          cls,
          click: () => this.setSelected(button),
        }
      })
  }
}

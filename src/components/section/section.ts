// SPDX-License-Identifier: GPL-2.0-only
// Copyright (C) 2023, Input Labs Oy.

import { Component, Input } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms';
import { ProfileService } from 'services/profiles'
import { CtrlButton, SectionIndex } from 'lib/ctrl'
import { HID } from 'lib/hid'

@Component({
  selector: 'app-section',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
  ],
  templateUrl: './section.html',
  styleUrls: ['./section.sass']
})
export class SectionComponent {
  @Input() button?: CtrlButton
  nPrimary = 1
  nSecondary = 1

  constructor(
    public profileService: ProfileService,
  ) {

  }

  getKeyCategory(action: HID) {
    if (action >= HID.KEY_A && action <= HID.KEY_UP) return 'KEYS'
    if (action >= HID.KEY_LEFT_CONTROL && action <= HID.KEY_RIGHT_SUPER) return 'MODIFIER'
    if (HID[action].startsWith('MOUSE')) return 'MOUSE'
    if (HID[action].startsWith('PROC')) return 'PROC'
    return 'NONE'
  }

  getButton() {
    if (this.button) return [this.button]
    else return []
  }

  getButtonTitle() {
    if (!this.button) return ''
    else {
      const section = this.button.sectionIndex
      if (section <= SectionIndex.START_2) return 'Button ' + SectionIndex[section]
      if (section <= SectionIndex.R4) return 'Trigger ' + SectionIndex[section]
      return SectionIndex[section]
    }
  }

  getKeyName(index: number) {
    return HID[index]
  }

  getKeyValues() {
    return Object.keys(HID)
      .filter((value: string) => {
        return HID[Number(value)]
      })
      .map((value: string) => {
        let name = HID[Number(value)]
        name = name.replace('KEY_', '')
        name = name.replace('PROC_', '')
        return {value, name}
      })
  }
}

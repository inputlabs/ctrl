// SPDX-License-Identifier: GPL-2.0-only
// Copyright (C) 2023, Input Labs Oy.

import { Injectable } from '@angular/core'
import { WebusbService } from 'services/webusb'
import {
  SectionIndex,
  CtrlSectionName,
  CtrlButton,
  CtrlRotary,
} from 'lib/ctrl'

export class Profile {
  constructor (
    public name: CtrlSectionName = new CtrlSectionName(0, 0, '') ,
    public buttons: CtrlButton[] = [],
    public rotary_up: CtrlRotary = new CtrlRotary(0, 0),
    public rotary_down: CtrlRotary = new CtrlRotary(0, 0),
  ) {}
}

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  profiles: Profile[] = []

  constructor(
    private webusb: WebusbService,
  ) {
    for(let i of Array(12).keys()) {
      this.profiles[i] = new Profile()
    }
  }

  async getProfile(profileIndex: number) {
    // Name.
    const sectionName = await this.webusb.getSection(profileIndex, SectionIndex.NAME) as CtrlSectionName
    this.profiles[profileIndex].name = sectionName
    // Buttons.
    const getButton = async (sectionIndex: SectionIndex) => {
      const button = await this.webusb.getSection(profileIndex, sectionIndex) as CtrlButton
      this.profiles[profileIndex].buttons.push(button)
    }
    await getButton(SectionIndex.A)
    await getButton(SectionIndex.B)
    await getButton(SectionIndex.X)
    await getButton(SectionIndex.Y)
    await getButton(SectionIndex.DPAD_LEFT)
    await getButton(SectionIndex.DPAD_RIGHT)
    await getButton(SectionIndex.DPAD_UP)
    await getButton(SectionIndex.DPAD_DOWN)
    await getButton(SectionIndex.SELECT_1)
    await getButton(SectionIndex.SELECT_2)
    await getButton(SectionIndex.START_1)
    await getButton(SectionIndex.START_2)
    await getButton(SectionIndex.L1)
    await getButton(SectionIndex.L2)
    await getButton(SectionIndex.L4)
    await getButton(SectionIndex.R1)
    await getButton(SectionIndex.R2)
    await getButton(SectionIndex.R4)
    await getButton(SectionIndex.DHAT_LEFT)
    await getButton(SectionIndex.DHAT_RIGHT)
    await getButton(SectionIndex.DHAT_UP)
    await getButton(SectionIndex.DHAT_DOWN)
    await getButton(SectionIndex.DHAT_UL)
    await getButton(SectionIndex.DHAT_UR)
    await getButton(SectionIndex.DHAT_DL)
    await getButton(SectionIndex.DHAT_DR)
    await getButton(SectionIndex.DHAT_PUSH)
    // Rotary.
    const rotary_up = await this.webusb.getSection(profileIndex, SectionIndex.ROTARY_UP) as CtrlRotary
    const rotary_down = await this.webusb.getSection(profileIndex, SectionIndex.ROTARY_DOWN) as CtrlRotary
    this.profiles[profileIndex].rotary_up = rotary_up
    this.profiles[profileIndex].rotary_down = rotary_down

  }
}

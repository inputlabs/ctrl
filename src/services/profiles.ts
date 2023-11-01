// SPDX-License-Identifier: GPL-2.0-only
// Copyright (C) 2023, Input Labs Oy.

import { Injectable } from '@angular/core'
import { WebusbService } from 'services/webusb'
import { CtrlProfileShare, SectionIndex } from 'lib/ctrl'

export class Button {
  constructor (
    public section: SectionIndex,
    public mode: number = 0,
    public actions_primary: number[] = [],
    public actions_secondary: number[] = [],
  ) {}
}

export class Profile {
  constructor (
    public buttons: Button[] = []
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
    const parse = async (sectionIndex: SectionIndex) => {
      let section = await this.webusb.getSection(profileIndex, sectionIndex)
      let button = new Button(
        sectionIndex,
        section.values[0],                      // Mode.
        Array.from(section.values.slice(1,5)),  // Actions primary.
        Array.from(section.values.slice(5,9)),  // Actions secondary.
      )
      this.profiles[profileIndex].buttons.push(button)
      console.log(button)
    }
    await parse(SectionIndex.A)
    await parse(SectionIndex.B)
    await parse(SectionIndex.X)
    await parse(SectionIndex.Y)
    await parse(SectionIndex.DPAD_LEFT)
    await parse(SectionIndex.DPAD_RIGHT)
    await parse(SectionIndex.DPAD_UP)
    await parse(SectionIndex.DPAD_DOWN)
    await parse(SectionIndex.SELECT_1)
    await parse(SectionIndex.SELECT_2)
    await parse(SectionIndex.START_1)
    await parse(SectionIndex.START_2)
    await parse(SectionIndex.L1)
    await parse(SectionIndex.L2)
    await parse(SectionIndex.L4)
    await parse(SectionIndex.R1)
    await parse(SectionIndex.R2)
    await parse(SectionIndex.R4)
    await parse(SectionIndex.DHAT_LEFT)
    await parse(SectionIndex.DHAT_RIGHT)
    await parse(SectionIndex.DHAT_UP)
    await parse(SectionIndex.DHAT_DOWN)
    await parse(SectionIndex.DHAT_UL)
    await parse(SectionIndex.DHAT_UR)
    await parse(SectionIndex.DHAT_DL)
    await parse(SectionIndex.DHAT_DR)
    await parse(SectionIndex.DHAT_PUSH)
  }
}

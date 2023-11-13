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
  name: CtrlSectionName

  constructor (
    name: string,
    public buttons: CtrlButton[] = [],
    public rotary_up: CtrlRotary = new CtrlRotary(0, 0),
    public rotary_down: CtrlRotary = new CtrlRotary(0, 0),
  ) {
    this.name = new CtrlSectionName(0, 0, name)
  }
}

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  profiles: Profile[] = []
  namesInitialized = false

  constructor(
    private webusb: WebusbService,
  ) {
    this.initProfiles()
  }

  initProfiles() {
    for(let i of Array(13).keys()) this.resetProfile(i)
  }

  resetProfile(index: number) {
    const name = index==0 ? 'Home' : index <= 8 ? `Profile ${index}` : `Custom ${index-8}`
    this.profiles[index] = new Profile(name)
  }

  async getProfile(profileIndex: number) {
    this.resetProfile(profileIndex)
    // Name(s).
    await this.updateProfileNames()
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

  getProfileName(profile: number) {
    return this.profiles[profile].name.name
  }

  async updateProfileNames() {
    while (!this.namesInitialized && !this.webusb.isConnected) {
      return
    }
    for(let profile of Array(9).keys()) {
      const section = await this.webusb.getSection(profile, SectionIndex.NAME)
      this.profiles[profile].name = section as CtrlSectionName
    }
    this.namesInitialized = true
  }
}

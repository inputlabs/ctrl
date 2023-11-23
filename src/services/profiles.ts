// SPDX-License-Identifier: GPL-2.0-only
// Copyright (C) 2023, Input Labs Oy.

/// <reference types="w3c-web-usb" />

import { Injectable } from '@angular/core'
import { WebusbService } from 'services/webusb'
import { CtrlSectionName, CtrlButton, CtrlRotary } from 'lib/ctrl'
import { SectionIndex, SectionName, SectionButton, SectionRotary } from 'lib/ctrl'

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
  synced = false

  constructor(
    private webusb: WebusbService,
  ) {
    this.initProfiles()
    // Reset profiles if controller is disconnected.
    navigator.usb.addEventListener('disconnect', (event:any) => {
      this.initProfiles()
    })
  }

  initProfiles() {
    for(let i of Array(13).keys()) this.initProfile(i)
    this.synced = false
  }

  initProfile(index: number) {
    const name = index==0 ? 'Home' : index <= 8 ? `Profile ${index}` : `Custom ${index-8}`
    this.profiles[index] = new Profile(name)
  }

  async getProfiles() {
    if (this.synced) return
    await this.getProfilesName()
    for(let i of Array(9).keys()) {
      await this.getProfile(i)
    }
    this.synced = true
  }

  async getProfilesName() {
    for(let profile of Array(9).keys()) {
      const section = await this.webusb.getSection(profile, SectionName.NAME)
      this.profiles[profile].name = section as CtrlSectionName
    }
  }

  async getProfile(profileIndex: number) {
    // Buttons.
    const getButton = async (sectionIndex: SectionIndex) => {
      const button = await this.webusb.getSection(profileIndex, sectionIndex) as CtrlButton
      this.profiles[profileIndex].buttons.push(button)
    }
    await getButton(SectionButton.A)
    await getButton(SectionButton.B)
    await getButton(SectionButton.X)
    await getButton(SectionButton.Y)
    await getButton(SectionButton.DPAD_LEFT)
    await getButton(SectionButton.DPAD_RIGHT)
    await getButton(SectionButton.DPAD_UP)
    await getButton(SectionButton.DPAD_DOWN)
    await getButton(SectionButton.SELECT_1)
    await getButton(SectionButton.SELECT_2)
    await getButton(SectionButton.START_1)
    await getButton(SectionButton.START_2)
    await getButton(SectionButton.L1)
    await getButton(SectionButton.L2)
    await getButton(SectionButton.L4)
    await getButton(SectionButton.R1)
    await getButton(SectionButton.R2)
    await getButton(SectionButton.R4)
    await getButton(SectionButton.DHAT_LEFT)
    await getButton(SectionButton.DHAT_RIGHT)
    await getButton(SectionButton.DHAT_UP)
    await getButton(SectionButton.DHAT_DOWN)
    await getButton(SectionButton.DHAT_UL)
    await getButton(SectionButton.DHAT_UR)
    await getButton(SectionButton.DHAT_DL)
    await getButton(SectionButton.DHAT_DR)
    await getButton(SectionButton.DHAT_PUSH)
    // Rotary.
    const rotary_up = await this.webusb.getSection(profileIndex, SectionRotary.ROTARY_UP) as CtrlRotary
    const rotary_down = await this.webusb.getSection(profileIndex, SectionRotary.ROTARY_DOWN) as CtrlRotary
    this.profiles[profileIndex].rotary_up = rotary_up
    this.profiles[profileIndex].rotary_down = rotary_down
  }
}

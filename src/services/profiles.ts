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
    public rotaryUp: CtrlRotary = new CtrlRotary(0, 0),
    public rotaryDown: CtrlRotary = new CtrlRotary(0, 0),
  ) {
    this.name = new CtrlSectionName(0, 0, name)
  }
}

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  profiles: Profile[] = []
  syncedNames = false

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
  }

  initProfile(index: number) {
    const name = index==0 ? 'Home' : index <= 8 ? `Profile ${index}` : `Custom ${index-8}`
    this.profiles[index] = new Profile(name)
  }

  async fetchProfileNames() {
    for(let index of Array(9).keys()) {
      await this.fetchProfileName(index)
    }
    this.syncedNames = true
  }

  async fetchProfileName(index: number) {
    const section = await this.webusb.getSection(index, SectionName.NAME)
    this.profiles[index].name = section as CtrlSectionName
  }

  async fetchProfile(profileIndex: number) {
    // Name
    if (!this.syncedNames) await this.fetchProfileNames()
    await this.fetchProfileName(profileIndex)
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
    const rotaryUp = await this.webusb.getSection(profileIndex, SectionRotary.ROTARY_UP) as CtrlRotary
    const rotaryDown = await this.webusb.getSection(profileIndex, SectionRotary.ROTARY_DOWN) as CtrlRotary
    this.profiles[profileIndex].rotaryUp = rotaryUp
    this.profiles[profileIndex].rotaryDown = rotaryDown
  }
}

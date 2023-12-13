// SPDX-License-Identifier: GPL-2.0-only
// Copyright (C) 2023, Input Labs Oy.

/// <reference types="w3c-web-usb" />

import { Injectable } from '@angular/core'
import { WebusbService } from 'services/webusb'
import { CtrlSectionName, CtrlButton, CtrlRotary, CtrlThumbstick } from 'lib/ctrl'
import { SectionIndex, CtrlGyro, CtrlGyroAxis, CtrlHome } from 'lib/ctrl'
import { ActionGroup } from 'lib/actions'
import { HID } from 'lib/hid'

export class Profile {
  name: CtrlSectionName
  home: CtrlHome
  synced: boolean = false

  constructor (
    name: string,
    public buttons: CtrlButton[] = [],
    public rotaryUp: CtrlRotary = new CtrlRotary(0, 0),
    public rotaryDown: CtrlRotary = new CtrlRotary(0, 0),
    public thumbstick: CtrlThumbstick = new CtrlThumbstick(0, 0, 0, 0, 0, false, 0),
    public gyro: CtrlGyro = new CtrlGyro(0, 0, 0, 0),
    public gyroAxis: CtrlGyroAxis[] = []
  ) {
    this.name = new CtrlSectionName(0, 0, name)
    // Fake home definitions.
    const actions = [
      new ActionGroup([HID.PROC_PROFILE_0]),
      new ActionGroup([HID.PROC_HOME_GAMEPAD]),
    ]
    const labels = ['', 'Gamepad home']
    this.home = new CtrlHome(0, SectionIndex.HOME, 0, actions, labels)
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
    const name = index==0 ? 'Home' : index <= 8 ? `Profile` : `Custom ${index-8}`
    this.profiles[index] = new Profile(name)
    this.syncedNames = false
  }

  async fetchProfileNames() {
    if (this.syncedNames) return
    for(let index of Array(9).keys()) {
      await this.fetchProfileName(index)
    }
    this.syncedNames = true
  }

  async fetchProfileName(index: number) {
  const section = await this.webusb.getSection(index, SectionIndex.NAME)
    this.profiles[index].name = section as CtrlSectionName
  }

  async fetchProfile(profileIndex: number) {
    // Skip if profile was already fetched.
    const profile = this.profiles[profileIndex]
    if (profile.synced) return
    // Buttons.
    const getButton = async (sectionIndex: SectionIndex) => {
      const button = await this.webusb.getSection(profileIndex, sectionIndex) as CtrlButton
      profile.buttons.push(button)
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
    // DHat.
    await getButton(SectionIndex.DHAT_LEFT)
    await getButton(SectionIndex.DHAT_RIGHT)
    await getButton(SectionIndex.DHAT_UP)
    await getButton(SectionIndex.DHAT_DOWN)
    await getButton(SectionIndex.DHAT_UL)
    await getButton(SectionIndex.DHAT_UR)
    await getButton(SectionIndex.DHAT_DL)
    await getButton(SectionIndex.DHAT_DR)
    await getButton(SectionIndex.DHAT_PUSH)
    // Thumbstick 4DIR buttons/axis.
    await getButton(SectionIndex.THUMBSTICK_LEFT)
    await getButton(SectionIndex.THUMBSTICK_RIGHT)
    await getButton(SectionIndex.THUMBSTICK_UP)
    await getButton(SectionIndex.THUMBSTICK_DOWN)
    await getButton(SectionIndex.THUMBSTICK_PUSH)
    await getButton(SectionIndex.THUMBSTICK_INNER)
    await getButton(SectionIndex.THUMBSTICK_OUTER)
    // Rotary.
    const rotaryUp = await this.webusb.getSection(profileIndex, SectionIndex.ROTARY_UP) as CtrlRotary
    const rotaryDown = await this.webusb.getSection(profileIndex, SectionIndex.ROTARY_DOWN) as CtrlRotary
    profile.rotaryUp = rotaryUp
    profile.rotaryDown = rotaryDown
    // Thumbstick mode.
    const ts = await this.webusb.getSection(profileIndex, SectionIndex.THUMBSTICK) as CtrlThumbstick
    profile.thumbstick = ts
    // Gyro mode.
    const gyro = await this.webusb.getSection(profileIndex, SectionIndex.GYRO) as CtrlGyro
    profile.gyro = gyro
    // Gyro Axes.
    const gyroX = await this.webusb.getSection(profileIndex, SectionIndex.GYRO_X) as CtrlGyroAxis
    const gyroY = await this.webusb.getSection(profileIndex, SectionIndex.GYRO_Y) as CtrlGyroAxis
    const gyroZ = await this.webusb.getSection(profileIndex, SectionIndex.GYRO_Z) as CtrlGyroAxis
    profile.gyroAxis[0] = gyroX
    profile.gyroAxis[1] = gyroY
    profile.gyroAxis[2] = gyroZ
    // Flag as synced.
    profile.synced = true
  }

  getProfile(profileIndex: number) {
    return this.profiles[profileIndex]
  }
}

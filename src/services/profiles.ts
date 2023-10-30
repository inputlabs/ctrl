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

  parse_button(section: SectionIndex, ctrl: CtrlProfileShare) {
    const v = ctrl.values
    return new Button(
      section,
      v[0],                      // Mode.
      Array.from(v.slice(1,5)),  // Actions primary.
      Array.from(v.slice(5,9)),  // Actions secondary.
    )
  }

  async getProfile(index: number) {
    let a =          await this.webusb.getSection(index, SectionIndex.A)
    let b =          await this.webusb.getSection(index, SectionIndex.B)
    let x =          await this.webusb.getSection(index, SectionIndex.X)
    let y =          await this.webusb.getSection(index, SectionIndex.Y)
    let dpad_left =  await this.webusb.getSection(index, SectionIndex.DPAD_LEFT)
    let dpad_right = await this.webusb.getSection(index, SectionIndex.DPAD_RIGHT)
    let dpad_up =    await this.webusb.getSection(index, SectionIndex.DPAD_UP)
    let dpad_down =  await this.webusb.getSection(index, SectionIndex.DPAD_DOWN)
    let select_1 =   await this.webusb.getSection(index, SectionIndex.SELECT_1)
    let select_2 =   await this.webusb.getSection(index, SectionIndex.SELECT_2)
    let start_1 =    await this.webusb.getSection(index, SectionIndex.START_1)
    let start_2 =    await this.webusb.getSection(index, SectionIndex.START_2)
    let l1 =         await this.webusb.getSection(index, SectionIndex.L1)
    let l2 =         await this.webusb.getSection(index, SectionIndex.L2)
    let l4 =         await this.webusb.getSection(index, SectionIndex.L4)
    let r1 =         await this.webusb.getSection(index, SectionIndex.R1)
    let r2 =         await this.webusb.getSection(index, SectionIndex.R2)
    let r4 =         await this.webusb.getSection(index, SectionIndex.R4)
    this.profiles[index].buttons.push(
      this.parse_button(SectionIndex.A, a),
      this.parse_button(SectionIndex.B, b),
      this.parse_button(SectionIndex.X, x),
      this.parse_button(SectionIndex.Y, y),
      this.parse_button(SectionIndex.DPAD_LEFT, dpad_left),
      this.parse_button(SectionIndex.DPAD_RIGHT, dpad_right),
      this.parse_button(SectionIndex.DPAD_UP, dpad_up),
      this.parse_button(SectionIndex.DPAD_DOWN, dpad_down),
      this.parse_button(SectionIndex.SELECT_1, select_1),
      this.parse_button(SectionIndex.SELECT_2, select_2),
      this.parse_button(SectionIndex.START_1, start_1),
      this.parse_button(SectionIndex.START_2, start_2),
      this.parse_button(SectionIndex.L1, l1),
      this.parse_button(SectionIndex.L2, l2),
      this.parse_button(SectionIndex.L4, l4),
      this.parse_button(SectionIndex.R1, r1),
      this.parse_button(SectionIndex.R2, r2),
      this.parse_button(SectionIndex.R4, r4),
    )
  }
}

// SPDX-License-Identifier: GPL-2.0-only
// Copyright (C) 2023, Input Labs Oy.

import { Injectable } from '@angular/core'
import { WebusbService } from 'services/webusb'
import { CtrlProfileShare, SectionIndex } from 'lib/ctrl'

class Button {
  constructor (
    public mode: number = 0,
    public actions_primary: number[] = [],
    public actions_secondary: number[] = [],
  ) {}
}

class Profile {
  constructor (
    public a: Button = new Button(),
    public b: Button = new Button(),
    public x: Button = new Button(),
    public y: Button = new Button(),
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

  parse_button(ctrl: CtrlProfileShare) {
    const v = ctrl.values
    return new Button(
      v[0],                      // Mode.
      Array.from(v.slice(1,5)),  // Actions primary.
      Array.from(v.slice(5,9)),  // Actions secondary.
    )
  }

  async getProfile(index: number) {
    let a = await this.webusb.getSection(index, SectionIndex.A)
    let b = await this.webusb.getSection(index, SectionIndex.B)
    let x = await this.webusb.getSection(index, SectionIndex.X)
    let y = await this.webusb.getSection(index, SectionIndex.Y)
    this.profiles[index].a = this.parse_button(a)
    this.profiles[index].b = this.parse_button(b)
    this.profiles[index].x = this.parse_button(x)
    this.profiles[index].y = this.parse_button(y)
    // console.log(this.profiles)
  }
}

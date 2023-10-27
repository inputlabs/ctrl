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
    public dpad_left: Button = new Button(),
    public dpad_right: Button = new Button(),
    public dpad_up: Button = new Button(),
    public dpad_down: Button = new Button(),
    public select_1: Button = new Button(),
    public select_2: Button = new Button(),
    public start_1: Button = new Button(),
    public start_2: Button = new Button(),
    public l1: Button = new Button(),
    public l2: Button = new Button(),
    public l4: Button = new Button(),
    public r1: Button = new Button(),
    public r2: Button = new Button(),
    public r4: Button = new Button(),
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
    let dpad_left = await this.webusb.getSection(index, SectionIndex.DPAD_LEFT)
    let dpad_right = await this.webusb.getSection(index, SectionIndex.DPAD_RIGHT)
    let dpad_up = await this.webusb.getSection(index, SectionIndex.DPAD_UP)
    let dpad_down = await this.webusb.getSection(index, SectionIndex.DPAD_DOWN)
    let l1 = await this.webusb.getSection(index, SectionIndex.L1)
    let l2 = await this.webusb.getSection(index, SectionIndex.L2)
    let l4 = await this.webusb.getSection(index, SectionIndex.L4)
    let r1 = await this.webusb.getSection(index, SectionIndex.R1)
    let r2 = await this.webusb.getSection(index, SectionIndex.R2)
    let r4 = await this.webusb.getSection(index, SectionIndex.R4)
    this.profiles[index].a = this.parse_button(a)
    this.profiles[index].b = this.parse_button(b)
    this.profiles[index].x = this.parse_button(x)
    this.profiles[index].y = this.parse_button(y)
    this.profiles[index].dpad_left = this.parse_button(dpad_left)
    this.profiles[index].dpad_right = this.parse_button(dpad_right)
    this.profiles[index].dpad_up = this.parse_button(dpad_up)
    this.profiles[index].dpad_down = this.parse_button(dpad_down)
    this.profiles[index].l1 = this.parse_button(l1)
    this.profiles[index].l2 = this.parse_button(l2)
    this.profiles[index].l4 = this.parse_button(l4)
    this.profiles[index].r1 = this.parse_button(r1)
    this.profiles[index].r2 = this.parse_button(r2)
    this.profiles[index].r4 = this.parse_button(r4)
    // console.log(this.profiles)
  }
}

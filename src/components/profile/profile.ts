// SPDX-License-Identifier: GPL-2.0-only
// Copyright (C) 2023, Input Labs Oy.

import { Component } from '@angular/core'
import { CommonModule } from '@angular/common'
import { ActivatedRoute } from '@angular/router'
import { ProfileService } from 'services/profiles'
import { HID } from 'lib/hid'

@Component({
  selector: 'app-wip',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile.html',
  styleUrls: ['./profile.sass']
})
export class ProfileComponent {
  profileIndex: number = 0

  constructor(
    private activatedRoute: ActivatedRoute,
    public profileService: ProfileService,
  ) {
    activatedRoute.data.subscribe((data) => {
      this.profileIndex = data['index']
    })
    this.profileService.getProfile(this.profileIndex)
  }

  displayKeys() {
    const profile = this.profileService.profiles[this.profileIndex]
    return [
      HID[profile.a.actions_primary[0]],
      HID[profile.b.actions_primary[0]],
      HID[profile.x.actions_primary[0]],
      HID[profile.y.actions_primary[0]],
    ]
  }
}


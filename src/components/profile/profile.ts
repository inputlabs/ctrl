// SPDX-License-Identifier: GPL-2.0-only
// Copyright (C) 2023, Input Labs Oy.

import { Component } from '@angular/core'
import { CommonModule } from '@angular/common'
import { ActivatedRoute } from '@angular/router'
import { ProfileService } from 'services/profiles'
import { ButtonComponent } from 'components/button/button'
import { HID } from 'lib/hid'

@Component({
  selector: 'app-wip',
  standalone: true,
  imports: [
    CommonModule,
    ButtonComponent,
  ],
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

  getMapping() {
    return this.profileService.profiles[this.profileIndex]
  }
}


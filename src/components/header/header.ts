// SPDX-License-Identifier: GPL-2.0-only
// Copyright (C) 2023, Input Labs Oy.

import { Component } from '@angular/core'
import { CommonModule } from '@angular/common'
import { Router, RouterLink, RouterLinkActive, NavigationEnd } from '@angular/router'
import { WebusbService } from 'services/webusb'
import { LATEST_FIRMWARE } from 'lib/version'


const RELEASES_LINK = 'https://github.com/inputlabs/alpakka_firmware/releases'
const FIRMWARE_ACK = 'firmware_ack'

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
  ],
  templateUrl: './header.html',
  styleUrls: ['./header.sass']
})
export class HeaderComponent {
  route: string = ''
  dialogForget: any
  dialogFirmware: any
  // Template aliases.
  LATEST_FIRMWARE = LATEST_FIRMWARE
  RELEASES_LINK = RELEASES_LINK

  constructor(
    private router: Router,
    public webusb: WebusbService,
  ) {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.route = event.urlAfterRedirects
      }
    })
  }

  routeIsTools() {
    return this.route == '/' || this.route.startsWith('/tools')  ? 'active' : ''
  }

  showDialogForget() {
    this.dialogForget = document.getElementById('dialog-forget')
    this.dialogForget.showModal()
  }

  hideDialogForget(): boolean {
    this.dialogForget.close()
    return true
  }

  showDialogFirmware() {
    this.dialogFirmware = document.getElementById('dialog-firmware')
    this.dialogFirmware.showModal()
  }

  hideDialogFirmware(): boolean {
    this.dialogFirmware.close()
    return true
  }

  firmwareAsNumber(version: number[]) {
    return (version[0] * 1000000) + (version[1] * 1000) + version[2]
  }

  firmwareAsString(version: number[]) {
    return `${version[0]}.${version[1]}.${version[2]}`
  }

  firmwareAck() {
    const fwValue = this.firmwareAsNumber(LATEST_FIRMWARE).toString()
    localStorage.setItem(FIRMWARE_ACK, fwValue)
  }

  shouldNotifyFirmware() {
    const knownByUser = Number(localStorage.getItem(FIRMWARE_ACK))
    return knownByUser < this.firmwareAsNumber(LATEST_FIRMWARE)
  }
}

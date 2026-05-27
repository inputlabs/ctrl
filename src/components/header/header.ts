// SPDX-License-Identifier: GPL-2.0-only
// Copyright (C) 2023, Input Labs Oy.

import { Component } from '@angular/core'
import { CommonModule } from '@angular/common'
import { Router, RouterLink, RouterLinkActive, NavigationEnd } from '@angular/router'
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker'
import { interval, Subscription } from 'rxjs';
import { filter } from 'rxjs/operators'
import { WebusbService } from 'services/webusb'
import { MINUMUM_FIRMWARE_VERSION } from 'lib/version'


const FW_RELEASES_LINK = 'https://github.com/inputlabs/alpakka_firmware/releases'
const APP_RELEASES_LINK = 'https://github.com/inputlabs/ctrl/releases'
const FIRMWARE_ACK = 'firmware_ack'
const PWA_UPDATE_CHECK_FREQ = 1000 * 60 * 5  // 5 Minutes.

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
  dialog: any
  lastRouteForTools = ''
  lastRouteForProfiles = '/profiles/0'
  lastRouteForSettings = '/'
  PWAUpdateAvailable = false
  PWATimerSub!: Subscription
  // Template aliases.
  LATEST_FIRMWARE = MINUMUM_FIRMWARE_VERSION
  FW_RELEASES_LINK = FW_RELEASES_LINK
  APP_RELEASES_LINK = APP_RELEASES_LINK

  constructor(
    private router: Router,
    public webusb: WebusbService,
    private swUpdate: SwUpdate,
  ) {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.route = event.urlAfterRedirects
        // Remember route.
        if (this.route.startsWith('/profiles')) {
          this.lastRouteForProfiles = this.route
        }
        if (this.route.startsWith('/settings') || this.route == '/') {
          this.lastRouteForSettings = this.route
        }
        // Check for PWA updates on each router navigation.
        if (this.swUpdate.isEnabled) {
          this.swUpdate.checkForUpdate()
        }
      }
    })
  }

  ngOnInit() {
    this.PWAUpdateWatch()
  }

  PWAUpdateWatch() {
    // Check for new PWA versions regularly (in case no router navigation).
    this.PWATimerSub = interval(PWA_UPDATE_CHECK_FREQ).subscribe(() => {
      if (this.swUpdate.isEnabled) {
        this.swUpdate.checkForUpdate()
      }
    })
    // Subscribe to PWA version changes.
    this.swUpdate.versionUpdates.subscribe(evt => {
      console.log('PWA update event', evt.type, evt)
      if (evt.type === 'VERSION_READY') {
        this.PWAUpdateAvailable = true
      }
    })
  }

  ngOnDestroy() {
    this.PWATimerSub.unsubscribe()
  }

  ngAfterViewChecked() {
    if (this.shouldWarningFirmware()) this.showDialog('firmware')
  }

  routeIsSettings() {
    return this.route == '/' || this.route.startsWith('/settings')  ? 'active' : ''
  }

  showDialog(id: string) {
    this.dialog = document.getElementById(`dialog-${id}`)
    this.dialog.showModal()
  }

  hideDialog(): boolean {
    this.dialog.close()
    return true
  }

  firmwareAsNumber(version: number[]) {
    return (version[0] * 1000000) + (version[1] * 1000) + version[2]
  }

  firmwareAsString(version: number[]) {
    return `${version[0]}.${version[1]}.${version[2]}`
  }

  firmwareAck() {
    const fwValue = this.firmwareAsNumber(MINUMUM_FIRMWARE_VERSION).toString()
    localStorage.setItem(FIRMWARE_ACK, fwValue)
  }

  shouldWarningFirmware() {
    // Should display a Forced modal window?.
    if (!this.webusb.isConnectedRaw()) return false
    if (this.webusb.getFirmwareAsString() === '0.0.0') return
    const minimumVersion = this.firmwareAsNumber(MINUMUM_FIRMWARE_VERSION)
    const deviceVersion = this.firmwareAsNumber(this.webusb.getFirmwareVersion())
    const ackVersion = Number(localStorage.getItem(FIRMWARE_ACK))
    if (!deviceVersion) return 0
    return (deviceVersion < minimumVersion) && (ackVersion < minimumVersion)
  }

  shouldNotifyFirmware() {
    // Should notify as an icon in the header?.
    if (!this.webusb.isConnectedRaw()) return false
    if (this.webusb.getFirmwareAsString() === '0.0.0') return
    const minimumVersion = this.firmwareAsNumber(MINUMUM_FIRMWARE_VERSION)
    const deviceVersion = this.firmwareAsNumber(this.webusb.getFirmwareVersion())
    return deviceVersion < minimumVersion
  }

  shouldNotifySerial() {
    if (!this.webusb.selectedDevice) return false
    if (!this.webusb.selectedDevice.isConnected) return false
    if (!this.webusb.selectedDevice.isController()) return false
    return !this.webusb.selectedDevice.canReadSerialNumber()
  }

  pwaRefresh() {
    document.location.reload()
  }
}

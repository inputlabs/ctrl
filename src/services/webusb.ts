// SPDX-License-Identifier: GPL-2.0-only
// Copyright (C) 2023, Input Labs Oy.

/// <reference types="w3c-web-usb" />

import { Injectable } from '@angular/core'
import { Router } from '@angular/router'
import { HID } from 'lib/hid'
import { Device, deviceWirelessProxyHandler } from 'lib/device'
import { PresetWithValues } from 'lib/tunes'
import { ConfigIndex, SectionIndex, CtrlSection } from 'lib/ctrl'

@Injectable({
  providedIn: 'root'
})
export class WebusbService {
  devices: Device[] = []
  selectedDevice?: Device

  constructor(
    private router: Router,
  ) {
    if (!this.isCompatibleBrowser()) return
    this.checkForConnectedDevices()
    this.configureCallbacks()
  }

  checkForConnectedDevices() {
    navigator.usb.getDevices().then((usbDevices) => {
      console.log('Devices found:', usbDevices)
      if (usbDevices.length == 0) return
      for(let usbDevice of usbDevices) {
        this.addDevice(usbDevice)
      }
      this.selectDevice(this.listDevices().at(-1))
    })
  }

  configureCallbacks() {
    navigator.usb.addEventListener("connect", (event:any) => {
      console.log('Device connected')
      this.addDevice(event.device, true)
    })
    navigator.usb.addEventListener("disconnect", (event:any) => {
      console.log('Device disconnected')
      for(let device of this.devices) {
        if (event.device == device.usbDevice) {
          this.removeDevice(device)
        }
      }
    })
  }

  isCompatibleBrowser() {
    return !!navigator.usb
  }

  isConnected() {
    for(let device of this.devices) {
      if (device.isConnected) return true
    }
    return false
  }

  isConnectedRaw() {
    for(let device of this.devices) {
      if (device.isConnectedRaw) return true
    }
    return false
  }

  isFailed() {
    if (!this.selectedDevice) return false
    return this.selectedDevice!.failed
  }

  getFailedError() {
    return this.selectedDevice!.failedError
  }

  getFailedHint() {
    if (this.selectedDevice!.failedError?.message.includes('Access')) {
      return $localize`Missing Udev rules?`
    } else {
      return $localize`Try re-plugging the controller.`
    }
  }

  getFirmwareVersion() {
    if (!this.selectedDevice) return [0,0,0]
    return this.selectedDevice!.firmwareVersion
  }

  getFirmwareAsString() {
    if (!this.selectedDevice) return '0.0.0'
    return this.selectedDevice!.getFirmwareAsString()
  }

  getManufacturerName() {
    if (!this.selectedDevice) return ''
    return this.selectedDevice.usbDevice.manufacturerName
  }

  getProductName() {
    if (!this.selectedDevice) return ''
    return this.selectedDevice.usbDevice.productName
  }

  async requestDevice() {
    const filters = [
      {vendorId:0x0170},
      {vendorId:0x045E, productId:0x028E},
    ]
    let usbDevice = await navigator.usb.requestDevice({filters});
    let usbDevices = this.devices.map((device) => device.usbDevice)
    if (!usbDevices.includes(usbDevice)) {
      let device = new Device(usbDevice)
      this.devices.push(device)
      this.selectDevice(device)
      this.router.navigate(['/'])
    }
  }

  addDevice(usbDevice: USBDevice, select=false) {
    let device = new Device(usbDevice)
    this.devices.push(device)
    if (device.isDongle()) {
      // Dongle wireless proxy.
      const proxy = new Proxy(device, deviceWirelessProxyHandler)
      device.proxiedDevice = proxy
      this.devices.push(proxy)
    }
    if (select) this.selectDevice(device)
  }

  removeDevice(device: Device) {
    device.disconnectCallback()
    // Remove device from list.
    let index = this.devices.indexOf(device)
    this.devices.splice(index, 1);
    if (device.isDongle()) {
      this.removeDevice(device.proxiedDevice!)
    }
    // Select other device.
    if (this.devices.length > 0) {
      this.selectDevice(this.devices.at(-1))
    } else {
      this.selectDevice(undefined)
    }
  }

  async selectDevice(device?: Device) {
    console.log('selectDevice', device)
    this.selectedDevice = device
    if (!device) return
    // Proxy switch.
    device.proxyEnabled = device.isProxy()
    // Request device firmware version.
    await device.tryGetStatus()
    // Force component refresh with dummy redirect technique.
    // (retriggers component ngOnInit).
    const refresh = (url?: string) => {
      const originalUrl = this.router.url
      this.router.navigateByUrl('/', {skipLocationChange: true}).then(() => {
        this.router.navigateByUrl(url ? url : originalUrl)
      })
    }
    // If any other profile or setting page, just refresh the same page.
    const pages = ['/profiles', '/settings']
    for(let page of pages) {
      if (this.router.url.startsWith(page)) {
        refresh()
      }
    }
  }

  listDevices() {
    // Copy list.
    let list = [...this.devices]
    // Sort dongle first.
    list = list.sort((a, b) => a.isController() ? 1 : -1)
    // Hide wireless Alpakka if wired is connected.
    if (this.deviceListHasDongle() && this.deviceListHasWiredAlpakka()) {
      list = list.filter(device => device.isWired())
    }
    // Return.
    return list
  }

  async forgetDevice() {
    await this.selectedDevice!.usbDevice.forget()
    this.removeDevice(this.selectedDevice!)
    // // Nuclear option since otherwise the same device cannot be requested again.
    // window.location.reload()  // Not needed anymore?
  }

  deviceListHasDongle() {
    return this.devices.some(device => device.isDongle())
  }

  deviceListHasWiredAlpakka() {
    return this.devices.some(device => device.isAlpakkaV1() && device.isWired())
  }

  isController() {
    if (!this.selectedDevice) return false
    return this.selectedDevice.isController()
  }

  isDongle() {
    if (!this.selectedDevice) return false
    return this.selectedDevice.isDongle()
  }

  isProxy() {
    if (!this.selectedDevice) return false
    return this.selectedDevice.isProxy()
  }

  getLogs() {
    return this.selectedDevice!.logs
  }

  clearLogs() {
    this.selectedDevice!.clearLogs()
  }

  async sendProc(proc: HID) {
    return await this.selectedDevice!.sendProc(proc)
  }

  async sendProfileOverwrite(indexTo: number, indexFrom: number) {
    return await this.selectedDevice!.sendProfileOverwrite(indexTo, indexFrom)
  }

  async tryGetConfig(index: ConfigIndex): Promise<PresetWithValues> {
    return await this.selectedDevice!.tryGetConfig(index)
  }

  async trySetConfig(index: ConfigIndex, preset: number, values: number[]): Promise<number> {
    return await this.selectedDevice!.trySetConfig(index, preset, values)
  }

  async tryGetSection(profileIndex: number, sectionIndex: SectionIndex): Promise<CtrlSection> {
    return await this.selectedDevice!.tryGetSection(profileIndex, sectionIndex)
  }

  async trySetSection( profileIndex: number, section: CtrlSection) {
    return await this.selectedDevice!.trySetSection(profileIndex, section)
  }

  getProfiles() {
    if (!this.selectedDevice) return undefined
    return this.selectedDevice.profiles
  }

}

/// <reference types="w3c-web-usb" />
import { Injectable } from '@angular/core';
import { delay } from '../lib/delay'
import { Ctrl, CtrlLog, CtrlProc, Proc, PACKAGE_SIZE } from '../lib/ctrl'

const ADDR_IN = 3
const ADDR_OUT = 4

@Injectable({
  providedIn: 'root'
})
export class WebusbService {
  browserIsCompatible = false
  device: any = null
  logs: string[] = []
  isConnected: boolean = false

  constructor() {
    this.logs = []
    this.browserIsCompatible = this.checkBrowser()
    if (!this.browserIsCompatible) return
    navigator.usb.getDevices().then((devices) => {
      console.log('Devices found:', devices.length)
      this.logs = []
      if (!devices.length) return
      this.device = devices[0]
      this.openDevice()
    })
    navigator.usb.addEventListener("connect", (event:any) => {
      console.log('Device connected')
      this.logs = []
      this.device = event.device
      this.openDevice()
    })
    navigator.usb.addEventListener("disconnect", (event:any) => {
      console.log('Device disconnected')
      this.logs = []
      this.device = null
      delay(2000).then(() => {
        // Do not flicker while restarting the controller.
        if (!this.device) this.isConnected = false
      })
    })
  }

  checkBrowser() {
    return !!navigator.usb
  }

  async requestDevice() {
    const filters = [
      {vendorId:0x0170},
      {vendorId:0x045E, productId:0x028E},
    ]
    this.device = await navigator.usb.requestDevice({filters});
    await this.openDevice()
  }

  async openDevice() {
    (<any>window).device = this.device
    await this.device.open()
    console.log('Device opened')
    await this.device.selectConfiguration(1)
    console.log('Configuration selected')
    await this.device.claimInterface(1)
    console.log('Interface claimed')
    this.isConnected = true;
    this.sendEmpty()
    this.listen()
  }

  async listen() {
    try {
      // console.log('Listening...')
      const response = await this.device.transferIn(ADDR_IN, PACKAGE_SIZE)
      const ctrl = Ctrl.decode(response.data)
      if (ctrl instanceof CtrlLog) this.handleCtrlLog(ctrl)
    } catch (error:any) {
      console.warn(error)
      return
    }
    await this.listen()
  }

  handleCtrlLog(ctrl: CtrlLog) {
    if (!this.logs[0] || this.logs[0]?.endsWith('\n')) {
      this.logs.unshift(ctrl.logMessage)
    } else {
      this.logs[0] += ctrl.logMessage
    }
    // console.log(ctrl.logMessage.length, ctrl.logMessage)
  }

  clearLogs() {
    this.logs = []
  }

  async sendEmpty() {
    const data = new Uint8Array(64)
    await this.send(data)
  }

  async sendRestart() {
    const data = new CtrlProc(Proc.RESTART).encode()
    await this.send(data)
  }

  async sendBootsel() {
    const data = new CtrlProc(Proc.BOOTSEL).encode()
    await this.send(data)
  }

  async sendCalibrate() {
    const data = new CtrlProc(Proc.CALIBRATE).encode()
    await this.send(data)
  }

  async sendFactory() {
    const data = new CtrlProc(Proc.FACTORY).encode()
    await this.send(data)
  }

  async send(data: any) {
    await this.device.transferOut(ADDR_OUT, data)
  }
}

/// <reference types="w3c-web-usb" />
import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { delay } from '../lib/delay'
import {
  Ctrl,
  CtrlLog,
  CtrlProc,
  Proc,
  ConfigIndex,
  PACKAGE_SIZE,
  CtrlConfigGet,
  CtrlConfigGive,
} from '../lib/ctrl'

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
  pending: Subject<CtrlConfigGive> | undefined

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
    await this.sendEmpty()
    this.isConnected = true;
    this.listen()
  }

  async listen() {
    try {
      // console.log('Listening...')
      const response = await this.device.transferIn(ADDR_IN, PACKAGE_SIZE)
      const ctrl = Ctrl.decode(response.data)
      // console.log('received', ctrl)
      if (ctrl instanceof CtrlLog) this.handleCtrlLog(ctrl)
      if (ctrl instanceof CtrlConfigGive && this.pending) {
        this.pending.next(ctrl)
        this.pending.complete()
        this.pending = undefined
      }
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
    await this.device.transferOut(ADDR_OUT, data)  // TODO: use send()
  }

  async sendRestart() {
    const data = new CtrlProc(Proc.RESTART)
    await this.send(data)
  }

  async sendBootsel() {
    const data = new CtrlProc(Proc.BOOTSEL)
    await this.send(data)
  }

  async sendCalibrate() {
    const data = new CtrlProc(Proc.CALIBRATE)
    await this.send(data)
  }

  async sendFactory() {
    const data = new CtrlProc(Proc.FACTORY)
    await this.send(data)
  }

  async send(ctrl: CtrlProc | CtrlConfigGet) {
    console.log('send', ctrl)
    await this.device.transferOut(ADDR_OUT, ctrl.encode())
  }

  async getConfig(index: ConfigIndex): Promise<number> {
    this.pending = new Subject()
    const ctrlOut = new CtrlConfigGet(index)
    await this.send(ctrlOut)
    return new Promise((resolve, reject) => {
      this.pending?.subscribe({
        next: (ctrlIn) => {
          resolve(ctrlIn.value)
        }
      })
    })
  }
}

/// <reference types="w3c-web-usb" />
import { Injectable } from '@angular/core';
import { delay } from '../shared'

const ALPAKKA_ID = 1
const MESSAGE_PROC = 2
const PROC_CALIBRATE = 220
const PROC_RESTART = 221
const PROC_BOOTSEL = 222
const PROC_FACTORY = 223

@Injectable({
  providedIn: 'root'
})
export class WebusbService {
  device: any = null
  logs: string[] = []
  isConnected: boolean = false

  constructor() {
    this.logs = []
    navigator.usb.getDevices().then((devices) => {
      this.logs = []
      if (!devices.length) return
      this.device = devices[0]
      this.openDevice()
    })
    navigator.usb.addEventListener("connect", (event:any) => {
      this.logs = []
      this.device = event.device
      this.openDevice()
    })
    navigator.usb.addEventListener("disconnect", (event:any) => {
      this.logs = []
      this.device = null
      delay(2000).then(() => {
        // Do not blink while restarting the controller.
        if (!this.device) this.isConnected = false
      })
    })
  }

  async requestDevice() {
    const filters = [
      {vendorId:0x0170},
      {vendorId:0x045E, productId:0x028E},
    ]
    this.device = await navigator.usb.requestDevice({filters})
    this.openDevice()
  }

  async openDevice() {
    await this.device.open()
    await this.device.selectConfiguration(1)
    await this.device.claimInterface(1)
    console.log('Device connected')
    this.isConnected = true;
    this.sendEmpty()
    this.listen()
  }

  async listen() {
    try {
      const response = await this.device.transferIn(4, 64)
      const data = new TextDecoder().decode(response.data)
      if (!this.logs[0] || this.logs[0]?.endsWith('\n')) this.logs.unshift(data)
      else this.logs[0] += data
    } catch (error:any) {
      if (error.message.includes('The device was disconnected')) {
        console.warn(error)
        return
      }
      else throw(error)
    }
    await this.listen()
  }

  message_proc(proc: number) {
    const data = new Uint8Array(64)
    data[0] = 1
    data[1] = ALPAKKA_ID
    data[2] = MESSAGE_PROC
    data[3] = proc
    return data
  }

  async sendEmpty() {
    const data = new Uint8Array(64)
    await this.device.transferOut(4, data)
  }

  async sendRestart() {
    const data = this.message_proc(PROC_RESTART)
    await this.device.transferOut(4, data)
  }

  async sendBootsel() {
    const data = this.message_proc(PROC_BOOTSEL)
    await this.device.transferOut(4, data)
  }

  async sendCalibrate() {
    const data = this.message_proc(PROC_CALIBRATE)
    await this.device.transferOut(4, data)
  }

  async sendFactory() {
    const data = this.message_proc(PROC_FACTORY)
    await this.device.transferOut(4, data)
  }
}

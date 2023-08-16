/// <reference types="w3c-web-usb" />
import { Injectable } from '@angular/core';
import { delay } from '../shared'

@Injectable({
  providedIn: 'root'
})
export class WebusbService {
  device: any = null
  logs: string[] = []
  isConnected: boolean = false

  constructor() {
    this.logs = []
    navigator.usb.addEventListener("connect", (event:any) => {
      this.logs = []
      this.device = event.device
      this.openDevice()
    })
    navigator.usb.addEventListener("disconnect", (event:any) => {
      this.logs = []
      this.device = null
      delay(1000).then(() => {
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

  async getDevices() {
    return await navigator.usb.getDevices()
  }
}

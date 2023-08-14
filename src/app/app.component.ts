/// <reference types="w3c-web-usb" />
import { Component } from '@angular/core'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'ctrl'
  device: any
  logs: string[]

  constructor() {
    this.logs = []
    navigator.usb.addEventListener("connect", (event:any) => {
      this.logs = []
      this.device = event.device
      this.openDevice()
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
    this.listen()
  }

  async listen() {
    try {
      const response = await this.device.transferIn(4, 64)
      const data = new TextDecoder().decode(response.data)
      this.logs.push(data)
      // console.log(data)
    } catch (error:any) {
      if (error.message.includes('The device was disconnected')) {
        console.warn(error)
        return
      }
      else throw(error)
    }
    await this.listen()
  }
}

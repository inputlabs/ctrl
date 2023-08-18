import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { LedComponent } from './led';

@Component({
  selector: 'app-tune',
  standalone: true,
  imports: [
    CommonModule,
    LedComponent
  ],
  templateUrl: './tune.html',
  styleUrls: ['./tune.sass']
})
export class TuneComponent {
  modeName?: string
  mode?: any
  title?: string
  active: number = 0

  constructor(private activatedRoute: ActivatedRoute) {
    activatedRoute.data.subscribe((data) => {
      this.modeName = data['mode']
      this.configure()
    })
  }

  configure() {
    const modes: any = {
      protocol: {
        title: 'Protocol',
        presets: [
          {name: 'Windows', desc:'', value:'XInput', leds:0b0001, blink:0b1000},
          {name: 'Linux', desc:'', value:'XPad', leds:0b0001, blink:0b0100},
          {name: 'Generic', desc:'aka DirectInput', value:'HID', leds:0b0001, blink:0b0010},
        ]
      },
      deadzone: {
        title: 'Thumbstick deadzone',
        presets: [
          {name: 'Low', desc: '', value: '7%', leds:0b1000, blink:0b0100},
          {name: 'Mid', desc: '', value: '10%', leds:0b1000, blink:0b0010},
          {name: 'High', desc: '', value: '15%', leds:0b1000, blink:0b0001},
        ]
      },
      touch_sens: {
        title: 'Touch sensitivity',
        presets: [
          {name: 'Auto', desc: '', value: null, leds:0b0010, blink:0b0100},
          {name: 'Low', desc: '', value: '13 us', leds:0b0010, blink:0b1000},
          {name: 'High', desc: '', value: '2 us', leds:0b0010, blink:0b0001},
        ]
      },
      mouse_sens: {
        title: 'Mouse sensitivity',
        presets: [
          {name: 'Low', desc: '1080p', value: '1x', leds:0b0100, blink:0b1000},
          {name: 'Mid', desc: '1440p', value: '1.5x', leds:0b0100, blink:0b0001},
          {name: 'High', desc: '4K', value: '2x', leds:0b0100, blink:0b0010},
        ]
      },
    }
    this.mode = modes[this.modeName as string]
  }

  setActive(index: number) {
    this.active = index
  }

  isActive(index: number) {
    return index === this.active ? 'selected' : ''
  }
}

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { LedComponent } from './led';

interface Modes  {
  [key: string]: Mode
}

interface Mode {
  title: string,
  presets: Preset[]
}

interface Preset {
  name: string,
  desc: string,
  value: string,
  leds: number,
  blink: number,
}

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
  mode?: Mode
  title?: string
  active?: Preset
  modes: Modes = {
    protocol: {
      title: 'Communication protocol',
      presets: [
        {name: 'Windows', desc:'', value:'XInput', leds:0b0001, blink:0b1000},
        {name: 'Linux', desc:'', value:'XPad', leds:0b0001, blink:0b0100},
        {name: 'Generic', desc:'aka DirectInput', value:'HID', leds:0b0001, blink:0b0010},
      ]
    },
    touch_sens: {
      title: 'Touch sensitivity',
      presets: [
        {name: 'Auto', desc: '', value: '', leds:0b0010, blink:0b0100},
        {name: 'Low', desc: '', value: '8 μs', leds:0b0010, blink:0b1100},
        {name: 'Mid', desc: '', value: '5 μs', leds:0b0010, blink:0b1000},
        {name: 'High', desc: '', value: '3 μs', leds:0b0010, blink:0b1001},
        {name: 'Very high', desc: '', value: '2 μs', leds:0b0010, blink:0b0001},
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
    deadzone: {
      title: 'Thumbstick deadzone',
      presets: [
        {name: 'Low', desc: '', value: '7%', leds:0b1000, blink:0b0100},
        {name: 'Mid', desc: '', value: '10%', leds:0b1000, blink:0b0010},
        {name: 'High', desc: '', value: '15%', leds:0b1000, blink:0b0001},
      ]
    },
  }


  constructor(private activatedRoute: ActivatedRoute) {
    activatedRoute.data.subscribe((data) => {
      this.mode = this.modes[data['mode'] as string]
      this.active = this.mode.presets[0]
    })
  }

  setActive(preset: Preset) {
    this.active = preset
  }

  isActive(preset: Preset) {
    return preset === this.active ? 'selected' : ''
  }
}

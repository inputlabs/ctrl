import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { LedComponent } from './led';

interface Modes  {
  [key: string]: Mode
}

interface Mode {
  url: string,
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
  mode: Mode
  title: string = ''
  active: Preset
  modes: Modes = {
    protocol: {
      url: 'protocol',
      title: 'Communication protocol',
      presets: [
        {name: 'Windows', desc:'', value:'XInput', leds:0b0001, blink:0b1000},
        {name: 'Linux', desc:'and Steam Deck', value:'XPad', leds:0b0001, blink:0b0100},
        {name: 'Generic', desc:'aka DirectInput', value:'HID', leds:0b0001, blink:0b0010},
      ]
    },
    touch_sens: {
      url: 'touch_sens',
      title: 'Touch sensitivity',
      presets: [
        {name: 'Ultra', desc: 'Very responsive', value: '2 μs', leds:0b0010, blink:0b0001},
        {name: 'High', desc: '', value: '3 μs', leds:0b0010, blink:0b1001},
        {name: 'Mid', desc: '', value: '5 μs', leds:0b0010, blink:0b1000},
        {name: 'Low', desc: 'Very numb', value: '8 μs', leds:0b0010, blink:0b1100},
        {name: 'Auto', desc: 'Self adjusting', value: '', leds:0b0010, blink:0b0100},
      ]
    },
    mouse_sens: {
      url: 'mouse_sens',
      title: 'Mouse sensitivity',
      presets: [
        {name: 'High', desc: '4K', value: '2x', leds:0b0100, blink:0b0010},
        {name: 'Mid', desc: '1440p', value: '1.5x', leds:0b0100, blink:0b0001},
        {name: 'Low', desc: '1080p', value: '1x', leds:0b0100, blink:0b1000},
      ]
    },
    deadzone: {
      url: 'deadzone',
      title: 'Thumbstick deadzone',
      presets: [
        {name: 'High', desc: 'Bigger center radius', value: '15%', leds:0b1000, blink:0b0001},
        {name: 'Mid', desc: '', value: '10%', leds:0b1000, blink:0b0010},
        {name: 'Low', desc: 'Smaller center radius', value: '7%', leds:0b1000, blink:0b0100},
      ]
    }
  }

  constructor(private activatedRoute: ActivatedRoute) {
    this.mode = this.modes['protocol']  // Default to avoid compiler complains.
    this.active = this.modes['protocol'].presets[0]  // Default to avoid compiler complains.
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

import { Component } from '@angular/core'
import { CommonModule } from '@angular/common'
import { ActivatedRoute } from '@angular/router'
import { LedComponent } from './led'
import { WebusbService } from '../services/webusb'
import { ConfigIndex } from 'src/lib/ctrl'

interface Modes  {
  [key: string]: Mode
}

interface Mode {
  url: string,
  title: string,
  configIndex: ConfigIndex,
  presets: Preset[]
}

interface Preset {
  index: number,
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
  active: Preset | null = null
  modes: Modes = {
    protocol: {
      configIndex: ConfigIndex.PROTOCOL,
      url: 'protocol',
      title: 'Communication protocol',
      presets: [
        {index: 0, name: 'Windows', desc:'', value:'XInput', leds:0b0001, blink:0b1000},
        {index: 1, name: 'Linux', desc:'and Steam Deck', value:'XPad', leds:0b0001, blink:0b0100},
        {index: 2, name: 'Generic', desc:'aka DirectInput', value:'HID', leds:0b0001, blink:0b0010},
      ]
    },
    touch_sens: {
      configIndex: ConfigIndex.SENS_TOUCH,
      url: 'touch_sens',
      title: 'Touch sensitivity',
      presets: [
        {index: 4, name: 'Ultra', desc: 'Very responsive', value: '2 μs', leds:0b0010, blink:0b0001},
        {index: 3, name: 'High', desc: '', value: '3 μs', leds:0b0010, blink:0b1001},
        {index: 2, name: 'Mid', desc: '', value: '5 μs', leds:0b0010, blink:0b1000},
        {index: 1, name: 'Low', desc: 'Very numb', value: '8 μs', leds:0b0010, blink:0b1100},
        {index: 0, name: 'Auto', desc: 'Self adjusting', value: '', leds:0b0010, blink:0b0100},
      ]
    },
    mouse_sens: {
      configIndex: ConfigIndex.SENS_MOUSE,
      url: 'mouse_sens',
      title: 'Mouse sensitivity',
      presets: [
        {index: 2, name: 'High', desc: '4K', value: '2x', leds:0b0100, blink:0b0010},
        {index: 1, name: 'Mid', desc: '1440p', value: '1.5x', leds:0b0100, blink:0b0001},
        {index: 0, name: 'Low', desc: '1080p', value: '1x', leds:0b0100, blink:0b1000},
      ]
    },
    deadzone: {
      configIndex: ConfigIndex.DEADZONE,
      url: 'deadzone',
      title: 'Thumbstick deadzone',
      presets: [
        {index: 2, name: 'High', desc: 'Bigger center radius', value: '15%', leds:0b1000, blink:0b0001},
        {index: 1, name: 'Mid', desc: '', value: '10%', leds:0b1000, blink:0b0010},
        {index: 0, name: 'Low', desc: 'Smaller center radius', value: '7%', leds:0b1000, blink:0b0100},
      ]
    }
  }

  constructor(
    private activatedRoute: ActivatedRoute,
    public webusb: WebusbService,
  ) {
    this.mode = this.modes['protocol']  // Default to avoid compiler complains.
    activatedRoute.data.subscribe((data) => {
      this.mode = this.modes[data['mode'] as string]
      this.getActivePreset()
    })
  }

  async getActivePreset() {
    const presetIndex = await this.webusb.getConfig(this.mode.configIndex)
    this.active = this.mode.presets.filter((preset) => preset.index == presetIndex).pop() as Preset
  }

  setActive(preset: Preset) {
    this.active = preset
  }

  isActive(preset: Preset) {
    return preset === this.active ? 'selected' : ''
  }
}

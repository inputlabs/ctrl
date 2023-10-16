// SPDX-License-Identifier: GPL-2.0-only
// Copyright (C) 2023, Input Labs Oy.

import { Component } from '@angular/core'
import { CommonModule } from '@angular/common'
import { ActivatedRoute } from '@angular/router'
import { LedComponent } from 'components/led/led'
import { WebusbService } from 'services/webusb'
import { ConfigIndex } from 'lib/ctrl'

interface Modes  {
  [key: string]: Mode
}

interface Mode {
  url: string,
  title: string,
  format: (value: any) => string,
  parse: (value: string) => number | null,
  displayReversed: boolean,
  configIndex: ConfigIndex,
  presets: Preset[]
}

interface Preset {
  index: number,
  name: string,
  desc: string,
  value?: string,
  invalid?: boolean,
  leds: number,
  blink: number,
  readonly?: boolean,
  hidden?: boolean,
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
  dialogProtocol: any
  dialogProtocolConfirmFunc: any
  modes: Modes = {
    protocol: {
      configIndex: ConfigIndex.PROTOCOL,
      url: 'protocol',
      title: 'Communication protocol',
      displayReversed: false,
      format: (x) => `${x}`,
      parse: (x) => Number(x),
      presets: [
        {index: 0, name: 'Windows', desc:'',                value:'XInput', leds:0b0001, blink:0b1000, readonly:true},
        {index: 1, name: 'Linux',   desc:'and Steam Deck',  value:'XPad',   leds:0b0001, blink:0b0100, readonly:true},
        {index: 2, name: 'Generic', desc:'aka DirectInput', value:'HID',    leds:0b0001, blink:0b0010, readonly:true},
      ]
    },
    touch_sens: {
      configIndex: ConfigIndex.SENS_TOUCH,
      url: 'touch_sens',
      title: 'Touch sensitivity',
      displayReversed: true,
      format: (x) => `${x} μs`,
      parse: (x) => {
        const re = RegExp('^([0-9]{1,3}) μs$').exec(x)
        if (re) {
          let value = Number(re[1])  // Group 1.
          if (value < 256) return value
        }
        return null
      },
      presets: [
        {index: 0, name: 'Auto',  desc: 'Self adjusting',  leds:0b0010, blink:0b0100, hidden:true},
        {index: 1, name: 'Low',   desc: 'Less responsive', leds:0b0010, blink:0b1100},
        {index: 2, name: 'Mid',   desc: '',                leds:0b0010, blink:0b1000},
        {index: 3, name: 'High',  desc: '',                leds:0b0010, blink:0b1001},
        {index: 4, name: 'Ultra', desc: 'More responsive', leds:0b0010, blink:0b0001},
      ]
    },
    mouse_sens: {
      configIndex: ConfigIndex.SENS_MOUSE,
      url: 'mouse_sens',
      title: 'Mouse sensitivity',
      displayReversed: true,
      format: (x) => `${x}`,
      parse: (x) => {
        const re = RegExp('^([0-9]{1,3})$').exec(x)
        if (re) {
          let value = Number(re[1])  // Group 1.
          if (value < 256) return value
        }
        return null
      },
      presets: [
        {index: 0, name: 'Low',  desc: '1080p', leds:0b0100, blink:0b1000},
        {index: 1, name: 'Mid',  desc: '1440p', leds:0b0100, blink:0b0001},
        {index: 2, name: 'High', desc: '4K',    leds:0b0100, blink:0b0010},
      ]
    },
    deadzone: {
      configIndex: ConfigIndex.DEADZONE,
      url: 'deadzone',
      title: 'Thumbstick deadzone',
      displayReversed: true,
      format: (x) => `${x} %`,
      parse: (x) => {
        const re = RegExp('^([0-9]{1,2}) %$').exec(x)
        if (re) {
          return Number(re[1])  // Group 1.
        }
        return null
      },
      presets: [
        {index: 0, name: 'Low',  desc: 'Smaller center radius', leds:0b1000, blink:0b0100},
        {index: 1, name: 'Mid',  desc: '',                      leds:0b1000, blink:0b0010},
        {index: 2, name: 'High', desc: 'Bigger center radius',  leds:0b1000, blink:0b0001},
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
      this.getPreset()
    })
  }

  getPresets() {
    if (this.mode.displayReversed) return this.mode.presets.reverse()
    else return this.mode.presets
  }

  async getPreset() {
    const presetWithValues = await this.webusb.getConfig(this.mode.configIndex)
    if (this.mode.url != 'protocol') {
      for(let [index, preset] of  this.mode.presets.entries()) {
        preset.value = presetWithValues.values[index].toString()
      }
    }
    this.setPresetFromIndex(presetWithValues.presetIndex)
  }

  setPresetConfirm(preset: Preset) {
    if (this.mode.configIndex == ConfigIndex.PROTOCOL) {
      this.dialogProtocolConfirmFunc = () => this.setPreset(preset)
      this.showDialogProtocol()
    }
    else this.setPreset(preset)
  }

  async setPreset(preset: Preset) {
    const presetIndex = await this.webusb.setConfig(
      this.mode.configIndex,
      preset.index,
      this.mode.presets.map((preset) => Number(preset.value)),
    )
    this.setPresetFromIndex(presetIndex)
  }

  setPresetFromIndex(index: number) {
    this.active = this.mode.presets.filter((preset) => preset.index == index).pop() as Preset
  }

  setValues(preset:Preset, event: any) {
    const value = this.mode.parse(event.target.value)
    if (value === null) {
      preset.invalid = true
      return
    }
    preset.invalid = false
    preset.value = value.toString()
    this.setPreset(preset)
  }

  isActive(preset: Preset) {
    return preset === this.active ? 'selected' : ''
  }

  showDialogProtocol() {
    this.dialogProtocol = document.getElementById('dialog-protocol')
    this.dialogProtocol.showModal()
  }

  hideDialogProtocol(): boolean {
    this.dialogProtocol.close()
    return true
  }

  confirmDialogProtocol() {
    this.dialogProtocolConfirmFunc()
  }
}

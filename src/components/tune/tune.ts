// SPDX-License-Identifier: GPL-2.0-only
// Copyright (C) 2023, Input Labs Oy.

import { Component } from '@angular/core'
import { CommonModule } from '@angular/common'
import { ActivatedRoute } from '@angular/router'
import { LedComponent } from 'components/led/led'
import { NumberInputComponent } from 'components/number_input/number_input'
import { WebusbService } from 'services/webusb'
import { ConfigIndex } from 'lib/ctrl'

interface Modes  {
  [key: string]: Mode
}

interface Mode {
  url: string,
  title: string,
  unit: string,
  min: number,
  max: number,
  step: number,
  displayReversed: boolean,
  configIndex: ConfigIndex,
  presets: Preset[]
}

interface Preset {
  index: number,
  name: string,
  desc: string,
  value?: number,
  fixed?: string,
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
    LedComponent,
    NumberInputComponent,
  ],
  templateUrl: './tune.html',
  styleUrls: ['./tune.sass']
})
export class TuneComponent {
  modes: Modes = modes
  mode: Mode
  title: string = ''
  active: Preset | null = null
  dialogProtocol: any
  dialogProtocolConfirmFunc: any

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
    if (this.mode.displayReversed) return this.mode.presets.slice().reverse()
    else return this.mode.presets
  }

  async getPreset() {
    const presetWithValues = await this.webusb.getConfig(this.mode.configIndex)
    if (this.mode.url != 'protocol') {
      for(let [index, preset] of  this.mode.presets.entries()) {
        preset.value = presetWithValues.values[index]
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
      this.mode.presets.map((preset) => preset.value as number),
    )
    this.setPresetFromIndex(presetIndex)
  }

  setPresetFromIndex(index: number) {
    this.active = this.mode.presets.filter((preset) => preset.index == index).pop() as Preset
  }

  setValue(preset:Preset, value: number) {
    preset.value = value
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

const modes: Modes = {
  protocol: {
    configIndex: ConfigIndex.PROTOCOL,
    url: 'protocol',
    title: 'Communication protocol',
    unit: '',
    min: 0,
    max: 0,
    step: 0,
    displayReversed: false,
    presets: [
      {index: 0, name: 'Windows', desc:'',                fixed:'XInput', leds:0b0001, blink:0b1000, readonly:true},
      {index: 1, name: 'Linux',   desc:'and Steam Deck',  fixed:'XPad',   leds:0b0001, blink:0b0100, readonly:true},
      {index: 2, name: 'Generic', desc:'aka DirectInput', fixed:'HID',    leds:0b0001, blink:0b0010, readonly:true},
    ]
  },
  touch_sens: {
    configIndex: ConfigIndex.SENS_TOUCH,
    url: 'touch_sens',
    title: 'Touch sensitivity',
    unit: 'μs',
    min: 0,
    max: 100,
    step: 1,
    displayReversed: true,
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
    unit: '',
    min: 0,
    max: 100,
    step: 1,
    displayReversed: true,
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
    unit: '%',
    min: 0,
    max: 99,
    step: 1,
    displayReversed: true,
    presets: [
      {index: 0, name: 'Low',  desc: 'Smaller center radius', leds:0b1000, blink:0b0100},
      {index: 1, name: 'Mid',  desc: '',                      leds:0b1000, blink:0b0010},
      {index: 2, name: 'High', desc: 'Bigger center radius',  leds:0b1000, blink:0b0001},
    ]
  }
}

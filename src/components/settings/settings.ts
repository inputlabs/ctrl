// SPDX-License-Identifier: GPL-2.0-only
// Copyright (C) 2023, Input Labs Oy.

import { Component } from '@angular/core'
import { CommonModule } from '@angular/common'
import { ActivatedRoute } from '@angular/router'
import { InputToggleComponent } from 'components/input_toggle/input_toggle'
import { InputNumberComponent } from 'components/input_number/input_number'
import { WebusbService } from 'services/webusb'
import { ConfigIndex } from 'lib/ctrl'

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    CommonModule,
    InputToggleComponent,
    InputNumberComponent,
  ],
  templateUrl: './settings.html',
  styleUrls: ['./settings.sass']
})
export class SettingsComponent {
  longCalibration = false
  swapGyros = false
  invertTouchPolarity = false
  gyroUserOffsetX = 0
  gyroUserOffsetY = 0
  gyroUserOffsetZ = 0
  dialogHelp: any
  helpTitle = 'Title'
  helpText = 'Text'

  constructor(
    private activatedRoute: ActivatedRoute,
    public webusb: WebusbService,
  ) {
  }

  ngAfterViewInit() {
    this.load()
  }

  async load() {
    const getConfig = async(index: ConfigIndex) => {
      return (await this.webusb.getConfig(index)).presetIndex
    }
    this.longCalibration = !!await getConfig(ConfigIndex.LONG_CALIBRATION)
    this.swapGyros = !!await getConfig(ConfigIndex.SWAP_GYROS)
    this.invertTouchPolarity = !!await getConfig(ConfigIndex.TOUCH_INVERT_POLARITY)
    const gyroUserOffset = await this.webusb.getConfig(ConfigIndex.GYRO_USER_OFFSET)
    this.gyroUserOffsetX = gyroUserOffset.values[0]
    this.gyroUserOffsetY = gyroUserOffset.values[1]
    this.gyroUserOffsetZ = gyroUserOffset.values[2]
    if (this.gyroUserOffsetX > 127) this.gyroUserOffsetX -= 256
    if (this.gyroUserOffsetY > 127) this.gyroUserOffsetY -= 256
    if (this.gyroUserOffsetZ > 127) this.gyroUserOffsetZ -= 256
  }

  async saveLongCalibration() {
    await this.webusb.setConfig(ConfigIndex.LONG_CALIBRATION, +this.longCalibration, [])
  }

  async saveSwapGyros() {
    await this.webusb.setConfig(ConfigIndex.SWAP_GYROS, +this.swapGyros, [])
  }

  async saveInvertTouchPolarity() {
    await this.webusb.setConfig(ConfigIndex.TOUCH_INVERT_POLARITY, +this.invertTouchPolarity, [])
  }

  async saveGyroUserOffset() {
    await this.webusb.setConfig(ConfigIndex.GYRO_USER_OFFSET, 0, [
      this.gyroUserOffsetX,
      this.gyroUserOffsetY,
      this.gyroUserOffsetZ,
    ])
  }

  showDialogHelp(key: string) {
    const titles: {[key: string]: string} = {
      longCalibration: $localize`Long calibration`,
      swapGyros: $localize`Swap gyros`,
      invertTouchPolarity: $localize`Invert touch polarity`,
      gyroUserOffset: $localize`Gyro calibration tweak`,
    }
    const texts: {[key: string]: string} = {
      longCalibration:
        $localize`In some cases the drift could be changing direction so slowly that a normal calibration is
        not able to capture it completely. A longer calibration will do a better job
        averaging the drift.<br><br>
        After enabling this setting, any new calibration procedure will take 4x times longer.`,
      swapGyros:
        $localize`In some cases one of the IMU sensors could be more sensitive to temperature-induced drift,
        since each gyroscope sensor is configured in a slightly different way, swapping their roles
        could help preventing this issue.<br><br>
        A re-calibration is required after enabling this feature.`,
      invertTouchPolarity:
        $localize`The touch sensor works by measuring how long it takes to charge up or charge down the touch
        plate (and anything that touches it). This polarity setting controls which one it is
        (up or down).<br><br>
        If you are having problems with the touch sensor, this feature could help making the
        measurements more stable.`,
      gyroUserOffset:
        $localize`Since the calibration has to be performed with the controller on a flat surface, it is
        possible that the piezoelectric sensor has slightly different zero readings while tilted
        back and held in a normal gaming position.<br><br>
        If this problem is noticeable, it can be solved by manually adding additional offsets into
        the calibration values.`,
    }
    this.helpTitle = titles[key]
    this.helpText = texts[key]
    this.dialogHelp = document.getElementById('dialog-help')
    this.dialogHelp.showModal()
  }

  hideDialogHelp() {
    this.dialogHelp.close()
  }
}

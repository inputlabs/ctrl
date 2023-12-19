// SPDX-License-Identifier: GPL-2.0-only
// Copyright (C) 2023, Input Labs Oy.

import { Component, Input, Output, EventEmitter } from '@angular/core'
import { CommonModule } from '@angular/common'

const HOLD_DELAY = 500
const REPEAT_INTERVAL = 50

@Component({
  selector: 'app-number-input',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './number_input.html',
  styleUrls: ['./number_input.sass']
})
export class NumberInputComponent {
  @Input() value: number = 0
  @Output() update = new EventEmitter<number>()
  @Input() unit: string = ''
  @Input() min: number = 0
  @Input() max: number = 100
  @Input() step: number = 1
  clickTime: number = 0
  timeout: any
  interval: any

  increase(dir: number) {
    let value = this.value
    dir===1 ? value += this.step : value -= this.step
    this.value = Math.min(Math.max(value, this.min), this.max)
  }

  save() {
    this.update.emit(this.value)
  }

  press(dir: number) {
    this.clickTime = Date.now()
    this.timeout = setTimeout(() => {
      this.interval = setInterval(() => {
        this.increase(dir)
      }, REPEAT_INTERVAL)
    }, HOLD_DELAY)
  }

  release(dir: number) {
    const delta = Date.now() - this.clickTime
    if (delta < HOLD_DELAY) {
      this.increase(dir)
    }
    clearTimeout(this.timeout)
    clearInterval(this.interval)
    this.save()
  }
}

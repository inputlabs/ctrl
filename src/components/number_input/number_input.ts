// SPDX-License-Identifier: GPL-2.0-only
// Copyright (C) 2023, Input Labs Oy.

import { Component, Input, Output, EventEmitter } from '@angular/core'
import { CommonModule } from '@angular/common'

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

  crease(up: boolean) {
    let value = this.value
    up ? value += this.step : value -= this.step
    value = Math.max(value, this.min)
    value = Math.min(value, this.max)
    this.update.emit(value)
  }

  increase() {
    this.crease(true)
  }

  decrease() {
    this.crease(false)
  }
}

// SPDX-License-Identifier: GPL-2.0-only
// Copyright (C) 2023, Input Labs Oy.

import { Component, Input, ElementRef, ViewChild } from '@angular/core'
import { CommonModule } from '@angular/common'

export const LED = {
  UP: 0b0001,
  RIGHT: 0b0010,
  DOWN: 0b0100,
  LEFT: 0b1000,
  ALL: 0b1111,
}

@Component({
  selector: 'app-led',
  standalone: true,
  templateUrl: './led.html',
  styleUrls: ['./led.sass'],
  imports: [CommonModule],
})
export class LedComponent {
  @ViewChild('led_0', {static: true}) led_0?: ElementRef
  @ViewChild('led_1', {static: true}) led_1?: ElementRef
  @ViewChild('led_2', {static: true}) led_2?: ElementRef
  @ViewChild('led_3', {static: true}) led_3?: ElementRef
  @Input('dotsize') dotsize = 5
  @Input('aperture') aperture = 0
  @Input('on') maskOn = 0b0000
  @Input('blink') maskBlink = 0b0000
  @Input('colorOn') colorOn = '#fff'
  @Input('colorOff') colorOff = '#000'
  @Input('colorBlink') colorBlink = '#888'
  blinkers: any[] = []

  ngAfterViewInit() {
    this.update()
  }

  ngOnChanges() {
    this.update()
  }

  ngOnDestroy() {
    this.clear()
  }

  update() {
    this.clear()
    const leds: HTMLElement[] = [
      this.led_0?.nativeElement,
      this.led_1?.nativeElement,
      this.led_2?.nativeElement,
      this.led_3?.nativeElement,
    ]
    leds[0].style.backgroundColor = (0b0001 & this.maskOn) ? this.colorOn : this.colorOff
    leds[1].style.backgroundColor = (0b0010 & this.maskOn) ? this.colorOn : this.colorOff
    leds[2].style.backgroundColor = (0b0100 & this.maskOn) ? this.colorOn : this.colorOff
    leds[3].style.backgroundColor = (0b1000 & this.maskOn) ? this.colorOn : this.colorOff

    for(let [i, led] of leds.entries()) {
      if (1<<i & this.maskBlink) {
        const id = setInterval(() => {
          // TODO: Install an actual color library.
          const R = Number('0x' + this.colorOff[1])
          const G = Number('0x' + this.colorOff[2])
          const B = Number('0x' + this.colorOff[3])
          const colorOff = `rgb(${R}, ${G}, ${B})`
          led.style.backgroundColor = (
            led.style.backgroundColor==colorOff ?
            this.colorBlink :
            this.colorOff
          )
        }, 300)
        this.blinkers.push(id)
      }
    }
  }

  clear() {
    for(let id of this.blinkers) {
      clearInterval(id)
    }
  }

  getDotSize() {
    return `${this.dotsize}%`
  }

  getPosition(index: number) {
    const offset = this.dotsize / 2
    const ap = this.aperture
    let top = 0
    let left = 0
    if      (index == 0) {top = 25-offset-ap; left = 50-offset}
    else if (index == 1) {top = 50-offset;    left = 75-offset+ap}
    else if (index == 2) {top = 75-offset+ap; left = 50-offset}
    else if (index == 3) {top = 50-offset;    left = 25-offset-ap}
    return {top: `${top}%`, left: `${left}%`}
  }
}

export function getProfileLed(profileIndex: Number) {
  if (profileIndex == 0) return LED.ALL
  if (profileIndex == 1) return LED.UP
  if (profileIndex == 2) return LED.RIGHT
  if (profileIndex == 3) return LED.DOWN
  if (profileIndex == 4) return LED.LEFT
  if (profileIndex == 5) return LED.UP + LED.LEFT + LED.RIGHT
  if (profileIndex == 6) return LED.RIGHT + LED.UP + LED.DOWN
  if (profileIndex == 7) return LED.DOWN + LED.LEFT + LED.RIGHT
  if (profileIndex == 8) return LED.LEFT + LED.UP + LED.DOWN
  if (profileIndex == 9) return LED.UP + LED.RIGHT
  if (profileIndex == 10) return LED.RIGHT + LED.DOWN
  if (profileIndex == 11) return LED.DOWN + LED.LEFT
  if (profileIndex == 12) return LED.LEFT + LED.UP
  return 0
}

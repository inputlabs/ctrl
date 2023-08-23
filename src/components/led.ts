import { Component, Input, ElementRef } from '@angular/core'
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
  @Input('size') size =  26
  @Input('dotsize') dotsize =  5
  @Input('on') maskOn =  0b0000
  @Input('blink') maskBlink = 0b0000
  @Input('colorOn') colorOn = '#fff'
  @Input('colorOff') colorOff = '#000'
  @Input('colorBlink') colorBlink = '#888'
  blinkers: any[] = []

  constructor(private element: ElementRef) {}

  ngOnInit() {
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
    const leds: HTMLElement[] = []
    leds[0] = this.element.nativeElement.getElementsByClassName('i0')[0] as HTMLElement
    leds[1] = this.element.nativeElement.getElementsByClassName('i1')[0] as HTMLElement
    leds[2] = this.element.nativeElement.getElementsByClassName('i2')[0] as HTMLElement
    leds[3] = this.element.nativeElement.getElementsByClassName('i3')[0] as HTMLElement
    leds[0].style.left = this.size * 0.5  - (this.dotsize/2) + 'px'
    leds[1].style.left = this.size * 0.75 - (this.dotsize/2) + 'px'
    leds[2].style.left = this.size * 0.5  - (this.dotsize/2) + 'px'
    leds[3].style.left = this.size * 0.25 - (this.dotsize/2) + 'px'
    leds[0].style.top =  this.size * 0.25 - (this.dotsize/2) + 'px'
    leds[1].style.top =  this.size * 0.5  - (this.dotsize/2) + 'px'
    leds[2].style.top =  this.size * 0.75 - (this.dotsize/2) + 'px'
    leds[3].style.top =  this.size * 0.5  - (this.dotsize/2) + 'px'
    leds[0].style.backgroundColor = (0b0001 & this.maskOn) ? this.colorOn : this.colorOff
    leds[1].style.backgroundColor = (0b0010 & this.maskOn) ? this.colorOn : this.colorOff
    leds[2].style.backgroundColor = (0b0100 & this.maskOn) ? this.colorOn : this.colorOff
    leds[3].style.backgroundColor = (0b1000 & this.maskOn) ? this.colorOn : this.colorOff

    for(let i of [0,1,2,3]) {
      if (1<<i & this.maskBlink) {
        const id = setInterval(() => {
          // TODO: Install an actual color library.
          const R = Number('0x' + this.colorOff[1])
          const G = Number('0x' + this.colorOff[2])
          const B = Number('0x' + this.colorOff[3])
          const colorOff = `rgb(${R}, ${G}, ${B})`
          leds[i].style.backgroundColor = (
            leds[i].style.backgroundColor==colorOff ?
            this.colorBlink :
            this.colorOff
          )
        }, 200)
        this.blinkers.push(id)
      }
    }
  }

  clear() {
    for(let id of this.blinkers) {
      clearInterval(id)
    }
  }
}

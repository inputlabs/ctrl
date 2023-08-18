import { Component, Input, ElementRef } from '@angular/core'
import { CommonModule } from '@angular/common'

@Component({
  selector: 'app-led',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './led.html',
  styleUrls: ['./led.sass']
})
export class LedComponent {
  @Input('on') maskOn =  0b0000
  @Input('blink') maskBlink = 0b0000

  constructor(private element: ElementRef) {}

  ngOnInit() {
    const w = 100 - 12
    const h = 100 - 12
    const leds: HTMLElement[] = []
    leds[0] = this.element.nativeElement.getElementsByClassName('i0')[0] as HTMLElement
    leds[1] = this.element.nativeElement.getElementsByClassName('i1')[0] as HTMLElement
    leds[2] = this.element.nativeElement.getElementsByClassName('i2')[0] as HTMLElement
    leds[3] = this.element.nativeElement.getElementsByClassName('i3')[0] as HTMLElement
    leds[0].style.left = h*0.5 + 'px'
    leds[1].style.left = h*0.75 + 'px'
    leds[2].style.left = h*0.5 + 'px'
    leds[3].style.left = h*0.25 + 'px'
    leds[0].style.top = h*0.25 + 'px'
    leds[1].style.top = h*0.5 + 'px'
    leds[2].style.top = h*0.75 + 'px'
    leds[3].style.top = h*0.5 + 'px'
    leds[0].style.backgroundColor = (0b0001 & this.maskOn) ? 'white' : 'black'
    leds[1].style.backgroundColor = (0b0010 & this.maskOn) ? 'white' : 'black'
    leds[2].style.backgroundColor = (0b0100 & this.maskOn) ? 'white' : 'black'
    leds[3].style.backgroundColor = (0b1000 & this.maskOn) ? 'white' : 'black'

    for(let i of [0,1,2,3]) {
      if (1<<i & this.maskBlink) {
        setInterval(() => {
          leds[i].style.backgroundColor = leds[i].style.backgroundColor=='black' ? '#888' : 'black'
        }, 200)
      }
    }
  }
}

import { Component } from '@angular/core'
import { CommonModule } from '@angular/common'
import { WebusbService } from 'src/services/webusb'

@Component({
  selector: 'app-help-deck',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './help_deck.html',
  styleUrls: ['./help.sass']
})
export class HelpDeckComponent {
  constructor(
    public webusb: WebusbService
  ) {}
}

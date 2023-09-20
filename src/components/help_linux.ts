import { Component } from '@angular/core'
import { CommonModule } from '@angular/common'
import { WebusbService } from 'src/services/webusb'

@Component({
  selector: 'app-help-linux',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './help_linux.html',
  styleUrls: ['./help.sass']
})
export class HelpLinuxComponent {
  constructor(
    public webusb: WebusbService
  ) {}
}

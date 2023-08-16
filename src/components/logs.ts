import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WebusbService } from 'src/services/webusb';

@Component({
  selector: 'app-logs',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './logs.html',
  styleUrls: ['./logs.sass']
})
export class LogsComponent {
  constructor(public webusb: WebusbService) {}
}

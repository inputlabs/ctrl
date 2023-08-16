import { Component } from '@angular/core';
import { LogsComponent } from './logs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-central',
  standalone: true,
  imports: [
    CommonModule,
    LogsComponent,
  ],
  templateUrl: './central.html',
  styleUrls: ['./central.sass']
})
export class CentralComponent {

}

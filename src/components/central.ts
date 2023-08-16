import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet} from '@angular/router';

@Component({
  selector: 'app-central',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
  ],
  templateUrl: './central.html',
  styleUrls: ['./central.sass']
})
export class CentralComponent {

}

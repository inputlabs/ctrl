import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-tune',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tune.html',
  styleUrls: ['./tune.sass']
})
export class TuneComponent {
  sub?: string
  title?: string

  constructor(private activatedRoute: ActivatedRoute) {
    activatedRoute.data.subscribe((data) => {
      this.sub = data['sub']
      this.configure()
    })
  }

  configure() {
    const titles: { [key: string]: string } = {
      mouse_sens: "Mouse Sensitivity"
    }
    this.title = titles[this.sub as string]
  }
}

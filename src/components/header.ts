import { Component } from '@angular/core'
import { CommonModule } from '@angular/common'
import { Router, RouterLink, RouterLinkActive, NavigationEnd } from '@angular/router'

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
  ],
  templateUrl: './header.html',
  styleUrls: ['./header.sass']
})
export class HeaderComponent {
  route: string = ''

  constructor(private router: Router) {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.route = event.urlAfterRedirects
      }
    })
  }

  routeIsTools() {
    return this.route == '/' || this.route.startsWith('/tools')  ? 'active' : ''
  }
}

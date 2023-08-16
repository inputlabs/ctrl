import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, Router } from '@angular/router'

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
  ],
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.sass']
})
export class SidebarComponent {
  route: string = ''

  constructor(private router: Router) {
    this.router.events.subscribe((event) => {
      if (event.type == 1) {  // NavigationEnd
        this.route = event.urlAfterRedirects
      }
    })
  }

  isTools() {
    return this.route == '/' || this.route.startsWith('/tools')
  }

  isProfiles() {
    return this.route.startsWith('/profiles')
  }

  isSettings() {
    return this.route.startsWith('/settings')
  }
}

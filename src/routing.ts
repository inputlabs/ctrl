import { Routes } from '@angular/router'

import { LogsComponent } from './components/logs'
import { WipComponent } from './components/wip'
import { TuneComponent } from './components/tune'
import { ProfileComponent } from './components/profile'
import { HelpWindowsComponent } from './components/help_windows'
import { HelpLinuxComponent } from './components/help_linux'
import { HelpDeckComponent } from './components/help_deck'
import { HelpPrivacyComponent } from './components/help_privacy'

export const routes: Routes = [
    {path: '', component: LogsComponent},
    {path: 'tools/tester', component: WipComponent},
    {path: 'tools/fw_update', component: WipComponent},
    {path: 'profiles/0', component: ProfileComponent},
    {path: 'profiles/1', component: ProfileComponent},
    {path: 'profiles/2', component: ProfileComponent},
    {path: 'profiles/3', component: ProfileComponent},
    {path: 'profiles/4', component: ProfileComponent},
    {path: 'profiles/5', component: ProfileComponent},
    {path: 'profiles/6', component: ProfileComponent},
    {path: 'profiles/7', component: ProfileComponent},
    {path: 'profiles/8', component: ProfileComponent},
    {path: 'profiles/9', component: ProfileComponent},
    {path: 'profiles/10', component: ProfileComponent},
    {path: 'profiles/11', component: ProfileComponent},
    {path: 'profiles/12', component: ProfileComponent},
    {path: 'settings/protocol', component: TuneComponent, data: {mode:'protocol'}},
    {path: 'settings/deadzone', component: TuneComponent, data: {mode:'deadzone'}},
    {path: 'settings/touch_sens', component: TuneComponent, data: {mode:'touch_sens'}},
    {path: 'settings/mouse_sens', component: TuneComponent, data: {mode:'mouse_sens'}},
    {path: 'settings/advanced', component: WipComponent},
    {path: 'settings/app', component: WipComponent},
    {path: 'help/windows', component: HelpWindowsComponent},
    {path: 'help/linux', component: HelpLinuxComponent},
    {path: 'help/deck', component: HelpDeckComponent},
    {path: 'help/privacy', component: HelpPrivacyComponent},
    // Redirects
    {path: 'profiles', redirectTo: '/profiles/0', pathMatch: 'full' },
    {path: 'settings', redirectTo: '/settings/protocol', pathMatch: 'full' },
    {path: 'help', redirectTo: '/help/windows', pathMatch: 'full' },
  ]

import { Routes } from '@angular/router'

import { LogsComponent } from './components/logs'
import { WipComponent } from './components/wip'
import { TuneComponent } from './components/tune'
import { ProfileComponent } from './components/profile'

export const routes: Routes = [
    {path: '', component: LogsComponent},
    {path: 'tools/tester', component: WipComponent},
    {path: 'tools/fw_update', component: WipComponent},
    {path: 'profiles/0', component: ProfileComponent},
    {path: 'profiles/1', component: ProfileComponent},
    {path: 'profiles/2', component: WipComponent},
    {path: 'profiles/3', component: WipComponent},
    {path: 'profiles/4', component: WipComponent},
    {path: 'profiles/5', component: WipComponent},
    {path: 'profiles/6', component: WipComponent},
    {path: 'profiles/7', component: WipComponent},
    {path: 'profiles/8', component: WipComponent},
    {path: 'profiles/9', component: WipComponent},
    {path: 'profiles/10', component: WipComponent},
    {path: 'profiles/11', component: WipComponent},
    {path: 'profiles/12', component: WipComponent},
    {path: 'settings/protocol', component: TuneComponent, data: {mode:'protocol'}},
    {path: 'settings/deadzone', component: TuneComponent, data: {mode:'deadzone'}},
    {path: 'settings/touch_sens', component: TuneComponent, data: {mode:'touch_sens'}},
    {path: 'settings/mouse_sens', component: TuneComponent, data: {mode:'mouse_sens'}},
    {path: 'settings/advanced', component: WipComponent},
    {path: 'settings/app', component: WipComponent},
    // Redirects
    {path: 'profiles', redirectTo: '/profiles/0', pathMatch: 'full' },
    {path: 'settings', redirectTo: '/settings/protocol', pathMatch: 'full' },
  ]

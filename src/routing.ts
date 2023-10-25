// SPDX-License-Identifier: GPL-2.0-only
// Copyright (C) 2023, Input Labs Oy.

import { Routes } from '@angular/router'
import { LogsComponent } from 'components/logs/logs'
import { WipComponent } from 'components/wip/wip'
import { TuneComponent } from 'components/tune/tune'
import { ProfileComponent } from 'components/profile/profile'
import { HelpWindowsComponent } from 'components/help/help_windows'
import { HelpLinuxComponent } from 'components/help/help_linux'
import { HelpDeckComponent } from 'components/help/help_deck'
import { HelpPrivacyComponent } from 'components/help/help_privacy'

export const routes: Routes = [
  {path: '', component: LogsComponent},
  {path: 'tools/tester', component: WipComponent},
  {path: 'tools/fw_update', component: WipComponent},
  {path: 'profiles/0', component: ProfileComponent, data: {index:0}},
  {path: 'profiles/1', component: ProfileComponent, data: {index:1}},
  {path: 'profiles/2', component: ProfileComponent, data: {index:2}},
  {path: 'profiles/3', component: ProfileComponent, data: {index:3}},
  {path: 'profiles/4', component: ProfileComponent, data: {index:4}},
  {path: 'profiles/5', component: ProfileComponent, data: {index:5}},
  {path: 'profiles/6', component: ProfileComponent, data: {index:6}},
  {path: 'profiles/7', component: ProfileComponent, data: {index:7}},
  {path: 'profiles/8', component: ProfileComponent, data: {index:8}},
  {path: 'profiles/9', component: ProfileComponent, data: {index:9}},
  {path: 'profiles/10', component: ProfileComponent, data: {index:10}},
  {path: 'profiles/11', component: ProfileComponent, data: {index:11}},
  {path: 'profiles/12', component: ProfileComponent, data: {index:12}},
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

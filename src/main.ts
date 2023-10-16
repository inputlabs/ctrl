// SPDX-License-Identifier: GPL-2.0-only
// Copyright (C) 2023, Input Labs Oy.

import { bootstrapApplication } from '@angular/platform-browser'
import { AppComponent, appConfig } from 'components/app/app'

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));

import { bootstrapApplication } from '@angular/platform-browser'
import { AppComponent, appConfig } from './components/app'

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));

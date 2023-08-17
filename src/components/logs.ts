import { Component } from '@angular/core'
import { CommonModule } from '@angular/common'
import { WebusbService } from '../services/webusb'

@Component({
  selector: 'app-logs',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './logs.html',
  styleUrls: ['./logs.sass']
})
export class LogsComponent {
  dialogCalibrate: any
  dialogFactory: any

  constructor(
    public webusb: WebusbService,
  ) {}

  downloadLogs() {
    if (this.webusb.logs.length == 0) return
    let logs = [...this.webusb.logs]
    logs.reverse()
    const data = logs.join('')
    const blob = new Blob([data], {type: 'text/plain'})
    const a = document.createElement('a')
    document.body.appendChild(a)
    // a.style = 'display: none'
    a.href = URL.createObjectURL(blob)
    a.download = 'alpakka_logs.txt'
    a.click()
    URL.revokeObjectURL(a.href)
    a.remove()
  }

  showDialogCalibrate() {
    this.dialogCalibrate = document.getElementById('dialog-calibrate')
    this.dialogCalibrate.showModal()
  }

  hideDialogCalibrate(): boolean {
    this.dialogCalibrate.close()
    return true
  }

  showDialogFactory() {
    this.dialogFactory = document.getElementById('dialog-factory')
    this.dialogFactory.showModal()
  }

  hideDialogFactory(): boolean {
    this.dialogFactory.close()
    return true
  }
}

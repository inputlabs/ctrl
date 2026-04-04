// SPDX-License-Identifier: GPL-2.0-only
// Copyright (C) 2023, Input Labs Oy.

import { CtrlSectionMeta, CtrlButton, CtrlRotary, CtrlThumbstick, ButtonMode } from 'lib/ctrl'
import { SectionIndex, CtrlGyro, CtrlGyroAxis, CtrlHome } from 'lib/ctrl'
import { ActionGroup } from 'lib/actions'
import { HID } from 'lib/hid'

const getDefaultThumbstick = () => {
  return new CtrlThumbstick(0, 0, 0, !!0, 0, 0, !!0, 0, 0, 0, !!0, 0, 0, 0, 0, 0, 0, !!0, !!0, !!0, 0, 0, 0, 0)
}

export class Profile {
  home: CtrlHome

  constructor (
    public meta: CtrlSectionMeta = new CtrlSectionMeta(0, 0, '', 0, 0, 0, 0),
    public buttonA: CtrlButton = new CtrlButton(0, 0, 0),
    public buttonB: CtrlButton = new CtrlButton(0, 0, 0),
    public buttonX: CtrlButton = new CtrlButton(0, 0, 0),
    public buttonY: CtrlButton = new CtrlButton(0, 0, 0),
    public buttonDpadLeft: CtrlButton = new CtrlButton(0, 0, 0),
    public buttonDpadRight: CtrlButton = new CtrlButton(0, 0, 0),
    public buttonDpadUp: CtrlButton = new CtrlButton(0, 0, 0),
    public buttonDpadDown: CtrlButton = new CtrlButton(0, 0, 0),
    public buttonSelect1: CtrlButton = new CtrlButton(0, 0, 0),
    public buttonSelect2: CtrlButton = new CtrlButton(0, 0, 0),
    public buttonStart1: CtrlButton = new CtrlButton(0, 0, 0),
    public buttonStart2: CtrlButton = new CtrlButton(0, 0, 0),
    public buttonL1: CtrlButton = new CtrlButton(0, 0, 0),
    public buttonL2: CtrlButton = new CtrlButton(0, 0, 0),
    public buttonL4: CtrlButton = new CtrlButton(0, 0, 0),
    public buttonR1: CtrlButton = new CtrlButton(0, 0, 0),
    public buttonR2: CtrlButton = new CtrlButton(0, 0, 0),
    public buttonR4: CtrlButton = new CtrlButton(0, 0, 0),
    // Left stick.
    public settingsLStick: CtrlThumbstick = getDefaultThumbstick(),
    public buttonLStickLeft: CtrlButton = new CtrlButton(0, 0, 0),
    public buttonLStickRight: CtrlButton = new CtrlButton(0, 0, 0),
    public buttonLStickUp: CtrlButton = new CtrlButton(0, 0, 0),
    public buttonLStickDown: CtrlButton = new CtrlButton(0, 0, 0),
    public buttonLStickUL: CtrlButton = new CtrlButton(0, 0, 0),
    public buttonLStickUR: CtrlButton = new CtrlButton(0, 0, 0),
    public buttonLStickDL: CtrlButton = new CtrlButton(0, 0, 0),
    public buttonLStickDR: CtrlButton = new CtrlButton(0, 0, 0),
    public buttonLStickPush: CtrlButton = new CtrlButton(0, 0, 0),
    public buttonLStickInner: CtrlButton = new CtrlButton(0, 0, 0),
    public buttonLStickOuter: CtrlButton = new CtrlButton(0, 0, 0),
    // Right stick (stick or dhat).
    public settingsRStick: CtrlThumbstick = getDefaultThumbstick(),
    public buttonRStickLeft: CtrlButton = new CtrlButton(0, 0, 0),
    public buttonRStickRight: CtrlButton = new CtrlButton(0, 0, 0),
    public buttonRStickUp: CtrlButton = new CtrlButton(0, 0, 0),
    public buttonRStickDown: CtrlButton = new CtrlButton(0, 0, 0),
    public buttonRStickUL: CtrlButton = new CtrlButton(0, 0, 0),
    public buttonRStickUR: CtrlButton = new CtrlButton(0, 0, 0),
    public buttonRStickDL: CtrlButton = new CtrlButton(0, 0, 0),
    public buttonRStickDR: CtrlButton = new CtrlButton(0, 0, 0),
    public buttonRStickPush: CtrlButton = new CtrlButton(0, 0, 0),
    // Rotary.
    public rotaryUp: CtrlRotary = new CtrlRotary(0, 0),
    public rotaryDown: CtrlRotary = new CtrlRotary(0, 0),
    // Gyro.
    public settingsGyro: CtrlGyro = new CtrlGyro(0, 0, 0, 0),
    public gyroX: CtrlGyroAxis = CtrlGyroAxis.default(),
    public gyroY: CtrlGyroAxis = CtrlGyroAxis.default(),
    public gyroZ: CtrlGyroAxis = CtrlGyroAxis.default(),
  ) {
    // Fake home definitions.
    const actions = [
      new ActionGroup([]),
      new ActionGroup([HID.PROC_PROFILE_0]),
      new ActionGroup([HID.PROC_HOME_GAMEPAD]),
    ]
    const labels = ['', '', 'Gamepad home']
    this.home = new CtrlHome(
      0,
      SectionIndex.HOME,
      ButtonMode.HOLD + ButtonMode.DOUBLE,
      actions,
      labels
    )
  }

  getSections() {
    return Object.values(this)
      .filter((value) => value.sectionIndex!=SectionIndex.HOME)
  }

  thumbstickHasAxis(thumbstick: CtrlThumbstick, isAxisFunc: (x:HID)=>boolean) {
    const isLeft = thumbstick === this.settingsLStick
    const isRight = thumbstick === this.settingsRStick
    let buttons: CtrlButton[] = []
    if (isLeft) {
      buttons = [this.buttonLStickUp, this.buttonLStickDown, this.buttonLStickLeft, this.buttonLStickRight]
    }
    if (isRight) {
      buttons = [this.buttonRStickUp, this.buttonRStickDown, this.buttonRStickLeft, this.buttonRStickRight]
    }
    for (const button of buttons) {
      for (const actionSet of button.actions) {
        const actions = actionSet.asArray()
        for (const action of actions) {
          if (isAxisFunc(action)) return true;
        }
      }
    }
    return false
  }
}

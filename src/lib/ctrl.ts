// SPDX-License-Identifier: GPL-2.0-only
// Copyright (C) 2023, Input Labs Oy.

import { HID } from 'lib/hid'
import { ActionGroup } from './actiongroup'

export const PACKAGE_SIZE = 64

enum DeviceId {
  ALPAKKA = 1,
}

enum MessageType {
  LOG = 1,
  PROC,
  CONFIG_GET,
  CONFIG_SET,
  CONFIG_SHARE,
  PROFILE_GET,
  PROFILE_SET,
  PROFILE_SHARE,
}

export enum ConfigIndex {
  PROTOCOL = 1,
  SENS_TOUCH,
  SENS_MOUSE,
  DEADZONE,
}

export type SectionIndex = SectionName | SectionButton | SectionRotary

export enum SectionName {
  NONE,
  NAME,
}

export enum SectionButton {
  A = 2,
  B,
  X,
  Y,
  DPAD_LEFT,
  DPAD_RIGHT,
  DPAD_UP,
  DPAD_DOWN,
  SELECT_1,
  START_1,
  SELECT_2,
  START_2,
  L1,
  R1,
  L2,
  R2,
  L4,
  R4,
  DHAT_LEFT,
  DHAT_RIGHT,
  DHAT_UP,
  DHAT_DOWN,
  DHAT_UL,
  DHAT_UR,
  DHAT_DL,
  DHAT_DR,
  DHAT_PUSH,
}

export enum SectionRotary {
  ROTARY_UP = 29,
  ROTARY_DOWN,
}

export enum ButtonMode {
  NORMAL,
  STICKY,
  HOLD_EXCLUSIVE,
  HOLD_EXCLUSIVE_LONG,
  HOLD_OVERLAP,
  HOLD_OVERLAP_LONG,
  HOLD_DOUBLE_PRESS,
}

function string_from_slice(buffer: ArrayBuffer, start: number, end: number) {
  return new TextDecoder().decode(buffer.slice(start, end)).replace(/\0/g, '')
}

function string_to_buffer(size: number, str: string) {
  const buffer = new Uint8Array(size)
  new TextEncoder().encodeInto(str, buffer)
  return buffer
}

export class Ctrl {
  constructor(
    public protocolVersion: number,
    public deviceId: number,
    public messageType: MessageType,
  ) {}

  payload() {
    return [] as number[]
  }

  encode() {
    const data = new Uint8Array(PACKAGE_SIZE)
    // console.log(data)
    data[0] = this.protocolVersion
    data[1] = this.deviceId
    data[2] = this.messageType
    data[3] = this.payload().length
    for (let [i, value] of this.payload().entries()) {
      data[4+i] = value
    }
    return data
  }

  static decode(buffer: ArrayBuffer) {
    // See: https://github.com/inputlabs/alpakka_firmware/blob/main/docs/ctrl_protocol.md
    const data = Array.from(new Uint8Array(buffer))
    const msgType = data[2]
    if (msgType== MessageType.LOG) return CtrlLog.decode(buffer)
    if (msgType == MessageType.CONFIG_SHARE) return CtrlConfigShare.decode(buffer)
    if (msgType == MessageType.PROFILE_SHARE) {
      const section = data[5]
      if (section == SectionName.NAME) return CtrlSectionName.decode(buffer)
      if (section in SectionButton) return CtrlButton.decode(buffer)
      if (section in SectionRotary) return CtrlRotary.decode(buffer)
    }
    return false
  }
}

export class CtrlLog extends Ctrl {
  constructor(
    public override protocolVersion: number,
    public override deviceId: number,
    public logMessage: string
  ) {
    super(protocolVersion, deviceId, MessageType.LOG)
  }

  static override decode(buffer: ArrayBuffer) {
    const data = Array.from(new Uint8Array(buffer))
    return new CtrlLog(
      data[0],  // ProtocolVersion.
      data[1],  // DeviceId.
      string_from_slice(buffer, 4, 64)  // Log message.
    )
  }

  override payload() {
    return Array.from(new TextEncoder().encode(this.logMessage))
  }
}

export class CtrlProc extends Ctrl {
  constructor(
    public proc: HID
  ) {
    super(1, DeviceId.ALPAKKA, MessageType.PROC)
  }

  override payload() {
    return [this.proc]
  }
}

export class CtrlConfigGet extends Ctrl {
  constructor(
    public cfgIndex: ConfigIndex
  ) {
    super(1, DeviceId.ALPAKKA, MessageType.CONFIG_GET)
  }

  override payload() {
    return [this.cfgIndex]
  }
}

export class CtrlConfigSet extends Ctrl {
  constructor(
    public cfgIndex: ConfigIndex,
    public preset: number,
    public values: number[],
  ) {
    super(1, DeviceId.ALPAKKA, MessageType.CONFIG_SET)
  }

  override payload() {
    return [this.cfgIndex, this.preset, ...this.values]
  }
}

export class CtrlConfigShare extends Ctrl {
  constructor(
    public cfgIndex: ConfigIndex,
    public preset: number,
    public values: number[],
  ) {
    const payload = [cfgIndex, preset, values]
    super(1, DeviceId.ALPAKKA, MessageType.CONFIG_SHARE)
  }

  static override decode(buffer: ArrayBuffer) {
    const data = Array.from(new Uint8Array(buffer))
    return new CtrlConfigShare(
      data[4],  // ConfigIndex.
      data[5],  // Preset.
      [data[6], data[7], data[8], data[9], data[10]],  // Values.
    )
  }

  override payload() {
    return [this.cfgIndex, this.preset, ...this.values]
  }
}

export class CtrlProfileGet extends Ctrl {
  constructor(
    public profileIndex: number,
    public sectionIndex: SectionIndex,
  ) {
    super(1, DeviceId.ALPAKKA, MessageType.PROFILE_GET)
  }

  override payload() {
    return [this.profileIndex, this.sectionIndex]
  }
}

export class CtrlProfileSet extends Ctrl {
  constructor(
    public profileIndex: number,
    public sectionIndex: SectionIndex,
    protected _payload: number[]
  ) {
    super(1, DeviceId.ALPAKKA, MessageType.PROFILE_SET)
  }

  override payload() {
    return this._payload
  }
}

export class CtrlProfileShare extends Ctrl {
  constructor(
    public profileIndex: number,
    public sectionIndex: SectionIndex,
    public values: number[],
  ) {
    const payload = [profileIndex, sectionIndex, values]
    super(1, DeviceId.ALPAKKA, MessageType.PROFILE_SHARE)
  }

  override payload() {
    return [this.profileIndex, this.sectionIndex, ...this.values]
  }
}

export class CtrlSectionName extends Ctrl {
  constructor(
    public profileIndex: number,
    public sectionIndex: SectionIndex,
    public name: string,
  ) {
    const payload = [profileIndex, sectionIndex, name]
    super(1, DeviceId.ALPAKKA, MessageType.PROFILE_SHARE)
  }

  static override decode(buffer: ArrayBuffer) {
    const data = Array.from(new Uint8Array(buffer))
    return new CtrlSectionName(
      data[4],  // ProfileIndex.
      data[5],  // SectionIndex.
      string_from_slice(buffer, 6, 30)  // Name.
    )
  }

  override payload() {
    return [
      this.profileIndex,
      this.sectionIndex,
      ...string_to_buffer(24, this.name)
    ]
  }
}

export class CtrlButton extends Ctrl {
  hold = false
  doubleclick = false
  overlap = false
  long = false
  homeCycle = false

  constructor(
    public profileIndex: number,
    public sectionIndex: SectionIndex,
    private _mode: number,
    public actions: ActionGroup[] = Array(2).fill(ActionGroup.empty(4)),
    public hints: string[] = Array(2).fill(''),
  ) {
    const payload: number[] = []
    super(1, DeviceId.ALPAKKA, MessageType.PROFILE_SHARE)
    if (_mode == ButtonMode.HOLD_EXCLUSIVE) {
      this.hold = true
    }
    if (_mode == ButtonMode.HOLD_EXCLUSIVE_LONG) {
      this.hold = true
      this.long = true
    }
    if (_mode == ButtonMode.HOLD_OVERLAP) {
      this.hold = true
      this.overlap = true
    }
    if (_mode == ButtonMode.HOLD_OVERLAP_LONG) {
      this.hold = true
      this.overlap = true
      this.long = true
    }
    if (_mode == ButtonMode.STICKY) {
      this.homeCycle = true
    }
  }

  mode() {
    let mode = ButtonMode.NORMAL;
    if (this.hold && !this.overlap && !this.long) mode = ButtonMode.HOLD_EXCLUSIVE
    if (this.hold && !this.overlap && this.long) mode = ButtonMode.HOLD_EXCLUSIVE_LONG
    if (this.hold && this.overlap && !this.long) mode = ButtonMode.HOLD_OVERLAP
    if (this.hold && this.overlap && this.long) mode = ButtonMode.HOLD_OVERLAP_LONG
    if (this.homeCycle) mode = ButtonMode.STICKY
    return mode
  }

  static override decode(buffer: ArrayBuffer) {
    const data = Array.from(new Uint8Array(buffer))
    return new CtrlButton(
      data[4],  // ProfileIndex.
      data[5],  // SectionIndex.
      data[6],  // Mode.
      [
        new ActionGroup(data.slice(8, 12)),
        new ActionGroup(data.slice(12, 16)),
      ],
      [
        string_from_slice(buffer, 36, 50),
        string_from_slice(buffer, 50, 64),
      ]
    )
  }

  override payload() {
    return [
      this.profileIndex,
      this.sectionIndex,
      this.mode(),
      0,  // Reserved.
      ...this.actions[0].asArrayPadded(),
      ...this.actions[1].asArrayPadded(),
      ...Array(20).fill(0),  // Reserved.
      ...string_to_buffer(14, this.hints[0]),
      ...string_to_buffer(14, this.hints[1]),
    ]
  }
}

export class CtrlRotary extends Ctrl {
  constructor(
    public profileIndex: number,
    public sectionIndex: SectionIndex,
    public actions: ActionGroup[] = Array(5).fill(ActionGroup.empty(4)),
    public hints: string[] = Array(5).fill(''),
  ) {
    super(1, DeviceId.ALPAKKA, MessageType.PROFILE_SHARE)
  }

  static override decode(buffer: ArrayBuffer) {
    const data = Array.from(new Uint8Array(buffer))
    return new CtrlRotary(
      data[4],  // ProfileIndex.
      data[5],  // SectionIndex.
      [
        new ActionGroup(data.slice(6, 10)),  // Actions
        new ActionGroup(data.slice(10, 14)), // Actions
        new ActionGroup(data.slice(14, 18)), // Actions
        new ActionGroup(data.slice(18, 22)), // Actions
        new ActionGroup(data.slice(22, 26)), // Actions
      ],
      [
        string_from_slice(buffer, 26, 40), // Hint
        string_from_slice(buffer, 40, 46), // Hint
        string_from_slice(buffer, 46, 52), // Hint
        string_from_slice(buffer, 52, 58), // Hint
        string_from_slice(buffer, 58, 64), // Hint
      ]
    )
  }

  override payload() {
    return [
      this.profileIndex,
      this.sectionIndex,
      ...this.actions[0].asArrayPadded(),
      ...this.actions[1].asArrayPadded(),
      ...this.actions[2].asArrayPadded(),
      ...this.actions[3].asArrayPadded(),
      ...this.actions[4].asArrayPadded(),
      ...string_to_buffer(14, this.hints[0]),
      ...string_to_buffer(6, this.hints[1]),
      ...string_to_buffer(6, this.hints[2]),
      ...string_to_buffer(6, this.hints[3]),
      ...string_to_buffer(6, this.hints[4]),
    ]
  }
}

export type CtrlSection = CtrlSectionName | CtrlButton | CtrlRotary

export function isCtrlSection(instance: any) {
  if (instance instanceof CtrlSectionName) return true
  if (instance instanceof CtrlButton) return true
  if (instance instanceof CtrlRotary) return true
  return false
}

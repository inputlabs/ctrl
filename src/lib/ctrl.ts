// SPDX-License-Identifier: GPL-2.0-only
// Copyright (C) 2023, Input Labs Oy.

import { HID } from 'lib/hid'
import { ActionGroup } from './actions'

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

export enum SectionIndex {
  NONE,
  NAME,
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
  ROTARY_UP,
  ROTARY_DOWN,
  THUMBSTICK,
  THUMBSTICK_LEFT,
  THUMBSTICK_RIGHT,
  THUMBSTICK_UP,
  THUMBSTICK_DOWN,
  THUMBSTICK_PUSH,
  THUMBSTICK_INNER,
  THUMBSTICK_OUTER,
  GLYPHS_0,
  GLYPHS_1,
  GLYPHS_2,
  GLYPHS_3,
  DAISY_0,
  DAISY_1,
  DAISY_2,
  DAISY_3,
  GYRO,
  GYRO_X,
  GYRO_Y,
  GYRO_Z,
  MACRO_1,
  MACRO_2,
  MACRO_3,
  MACRO_4,
  HOME = 100,
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

export enum ThumbstickMode {
  OFF,
  DIR4,
  ALPHANUMERIC,
}

export enum ThumbstickDistanceMode {
  AXIAL,
  RADIAL,
}

export enum GyroMode {
  OFF,
  ALWAYS_ON,
  TOUCH_OFF,
  TOUCH_ON,
  AXIS_ABSOLUTE,
}

export function sectionIsName(section: SectionIndex) {
  return section == SectionIndex.NAME
}

export function sectionIsButton(section: SectionIndex) {
  return (
    (section >= SectionIndex.A && section <= SectionIndex.DHAT_PUSH) ||
    (section >= SectionIndex.THUMBSTICK_LEFT && section <= SectionIndex.THUMBSTICK_OUTER)
  )
}

export function sectionIsRotary(section: SectionIndex) {
  return section == SectionIndex.ROTARY_UP || section == SectionIndex.ROTARY_DOWN
}

export function sectionIsThumbtick(section: SectionIndex) {
  return section == SectionIndex.THUMBSTICK
}

export function sectionIsThumbtickDirection(section: SectionIndex) {
  return section >= SectionIndex.THUMBSTICK_LEFT && section <= SectionIndex.THUMBSTICK_DOWN
}

export function sectionIsThumbtickButton(section: SectionIndex) {
  return sectionIsThumbtickDirection(section) || section == SectionIndex.THUMBSTICK_PUSH
}

export function sectionIsGyro(section: SectionIndex) {
  return section == SectionIndex.GYRO
}

export function sectionIsGyroAxis(section: SectionIndex) {
  return section >= SectionIndex.GYRO_X && section <= SectionIndex.GYRO_Z
}

export function sectionIsHome(section: SectionIndex) {
  return section == SectionIndex.HOME
}

export function sectionIsAnalog(section: SectionIndex) {
  return sectionIsThumbtickDirection(section) || sectionIsGyroAxis(section)
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
      if (sectionIsName(section)) return CtrlSectionName.decode(buffer)
      if (sectionIsButton(section)) return CtrlButton.decode(buffer)
      if (sectionIsRotary(section)) return CtrlRotary.decode(buffer)
      if (sectionIsThumbtick(section)) return CtrlThumbstick.decode(buffer)
      if (sectionIsGyro(section)) return CtrlGyro.decode(buffer)
      if (sectionIsGyroAxis(section)) return CtrlGyroAxis.decode(buffer)
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

export abstract class CtrlSection extends Ctrl {
  profileIndex: number = 0
  sectionIndex: SectionIndex = 0
}

export class CtrlSectionName extends CtrlSection {
  constructor(
    public override profileIndex: number,
    public override sectionIndex: SectionIndex,
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

export class CtrlButton extends CtrlSection {
  hold = false
  doubleclick = false
  overlap = false
  long = false
  homeCycle = false

  constructor(
    public override profileIndex: number,
    public override sectionIndex: SectionIndex,
    private _mode: number,
    public actions: ActionGroup[] = Array(2).fill(ActionGroup.empty(4)),
    public labels: string[] = Array(2).fill(''),
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

  mode(): ButtonMode {
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
        new ActionGroup(data.slice(8, 12)),  // Actions 0.
        new ActionGroup(data.slice(12, 16)), // Actions 1.
      ],
      [
        string_from_slice(buffer, 36, 50),  // Label 0.
        string_from_slice(buffer, 50, 64),  // Label 1.
      ]
    )
  }

  override payload() {
    // Delete secondary data if hold has been disabled.
    if (this.hold == false) {
      this.actions[1].clear()
      this.labels[1] = ''
    }
    // Compose.
    return [
      this.profileIndex,
      this.sectionIndex,
      this.mode(),
      0,  // Reserved.
      ...this.actions[0].asArrayPadded(),
      ...this.actions[1].asArrayPadded(),
      ...Array(20).fill(0),  // Reserved.
      ...string_to_buffer(14, this.labels[0]),
      ...string_to_buffer(14, this.labels[1]),
    ]
  }
}

export class CtrlRotary extends CtrlSection {
  constructor(
    public override profileIndex: number,
    public override sectionIndex: SectionIndex,
    public actions: ActionGroup[] = Array(5).fill(ActionGroup.empty(4)),
    public labels: string[] = Array(5).fill(''),
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
        string_from_slice(buffer, 26, 40), // Label
        string_from_slice(buffer, 40, 46), // Label
        string_from_slice(buffer, 46, 52), // Label
        string_from_slice(buffer, 52, 58), // Label
        string_from_slice(buffer, 58, 64), // Label
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
      ...string_to_buffer(14, this.labels[0]),
      ...string_to_buffer(6, this.labels[1]),
      ...string_to_buffer(6, this.labels[2]),
      ...string_to_buffer(6, this.labels[3]),
      ...string_to_buffer(6, this.labels[4]),
    ]
  }
}

export class CtrlThumbstick extends CtrlSection {
  constructor(
    public override profileIndex: number,
    public override sectionIndex: SectionIndex,
    public mode: ThumbstickMode,
    public distance_mode: ThumbstickDistanceMode,
    public deadzone: number,
    public overlap : number,
    public deadzone_override: boolean,
  ) {
    super(1, DeviceId.ALPAKKA, MessageType.PROFILE_SHARE)
  }

  static override decode(buffer: ArrayBuffer) {
    // See firmware repo "ctrl.h" header, "CtrlThumbstick" struct.
    const data = Array.from(new Uint8Array(buffer))
    return new CtrlThumbstick(
      data[4],  // ProfileIndex.
      data[5],  // SectionIndex.
      data[6],  // Mode.
      data[7],  // Distance mode.
      data[8],  // Deadzone.
      data[9] <= 128 ? data[9] : data[9]-256,  // Axis overlap (unsigned to signed).
      Boolean(data[10]),  // Deadzone override.
    )
  }

  override payload() {
    return [
      this.profileIndex,
      this.sectionIndex,
      Number(this.mode),
      Number(this.distance_mode),
      this.deadzone,
      this.overlap,
      Number(this.deadzone_override),
    ]
  }
}

export class CtrlGyro extends CtrlSection {
  constructor(
    public override profileIndex: number,
    public override sectionIndex: SectionIndex,
    public mode: GyroMode,
    public engage: number,
  ) {
    super(1, DeviceId.ALPAKKA, MessageType.PROFILE_SHARE)
  }

  static override decode(buffer: ArrayBuffer) {
    const data = Array.from(new Uint8Array(buffer))
    return new CtrlGyro(
      data[4],  // ProfileIndex.
      data[5],  // SectionIndex.
      data[6],  // Gyro mode.
      data[7],  // Engage button.
    )
  }

  override payload() {
    return [
      this.profileIndex,
      this.sectionIndex,
      Number(this.mode),
      Number(this.engage),
    ]
  }
}

export class CtrlGyroAxis extends CtrlSection {
  constructor(
    public override profileIndex: number,
    public override sectionIndex: SectionIndex,
    public actions: ActionGroup[] = Array(2).fill(ActionGroup.empty(4)),
    public minAngle = 0,
    public maxAngle = 0,
    public labels: string[]
  ) {
    super(1, DeviceId.ALPAKKA, MessageType.PROFILE_SHARE)
  }

  static override decode(buffer: ArrayBuffer) {
    const data = Array.from(new Uint8Array(buffer))
    return new CtrlGyroAxis(
      data[4],  // ProfileIndex.
      data[5],  // SectionIndex.
      [
        new ActionGroup(data.slice(6, 10)),   // Action negative.
        new ActionGroup(data.slice(10, 14)),  // Action positive.
      ],
      data[14] <= 128 ? data[14] : data[14]-256,  // Min angle (nnsigned to signed).
      data[15] <= 128 ? data[15] : data[15]-256,  // Max angle (nnsigned to signed).
      [
        string_from_slice(buffer, 16, 30),  // Label negative.
        string_from_slice(buffer, 30, 48),  // Label positive.
      ]
    )
  }

  override payload() {
    return [
      this.profileIndex,
      this.sectionIndex,
      ...this.actions[0].asArrayPadded(),
      ...this.actions[1].asArrayPadded(),
      this.minAngle,
      this.maxAngle,
      ...string_to_buffer(14, this.labels[0]),
      ...string_to_buffer(14, this.labels[1]),
    ]
  }
}

export class CtrlHome extends CtrlButton {}

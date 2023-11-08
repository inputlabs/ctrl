// SPDX-License-Identifier: GPL-2.0-only
// Copyright (C) 2023, Input Labs Oy.

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

export enum Proc {
  CALIBRATE = 220,
  RESTART = 221,
  BOOTSEL = 222,
  FACTORY = 223,
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
  A,
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
}

function string_from_slice(buffer: ArrayBuffer, start: number, end: number) {
  return new TextDecoder().decode(buffer.slice(start, end)).replace(/\0/g, '')
}

export class Ctrl {
  constructor(
    public protocolVersion: number,
    public deviceId: number,
    public messageType: MessageType,
    public payloadSize: number,
    public payload: any,
  ) {}

  encode() {
    const data = new Uint8Array(PACKAGE_SIZE)
    // console.log(data)
    data[0] = this.protocolVersion
    data[1] = this.deviceId
    data[2] = this.messageType
    data[3] = this.payloadSize
    if (Array.isArray(this.payload)) {
      for (let [i, value] of this.payload.entries()) {
        data[4+i] = value
      }
    } else {
      data[4] = this.payload
    }
    return data
  }

  static decode(buffer: ArrayBuffer) {
    // See: https://github.com/inputlabs/alpakka_firmware/blob/main/docs/ctrl_protocol.md
    const data = Array.from(new Uint8Array(buffer))
    if (data[2] == MessageType.LOG) {
      return new CtrlLog(
        data[0],  // ProtocolVersion.
        data[1],  // DeviceId.
        string_from_slice(buffer, 4, 64)  // Log message.
      )
    }
    if (data[2] == MessageType.CONFIG_SHARE) {
      return new CtrlConfigShare(
        data[4],  // ConfigIndex.
        data[5],  // Preset.
        [data[6], data[7], data[8], data[9], data[10]],  // Values.
      )
    }
    if (data[2] == MessageType.PROFILE_SHARE) {
      const profile = data[4]
      const section = data[5]
      if (section == SectionIndex.NAME) {
        return new CtrlSectionName(
          profile,  // ProfileIndex.
          section,  // SectionIndex.
          string_from_slice(buffer, 6, 64)  // Name.
        )
      }
      if (section >= 2 && section <= 28) {  // Buttons.
        return new CtrlButton(
          profile,  // ProfileIndex.
          section,  // SectionIndex.
          data[6],  // Mode.
          data.slice(7, 11),
          data.slice(11, 15),
          string_from_slice(buffer, 15, 35),
          string_from_slice(buffer, 35, 55),
        )
      }
      if ([SectionIndex.ROTARY_UP, SectionIndex.ROTARY_DOWN].includes(section)) {
        return new CtrlRotary(
          profile,  // ProfileIndex.
          section,  // SectionIndex.
          data.slice(6, 10),  // Actions
          data.slice(10, 14), // Actions
          data.slice(14, 18), // Actions
          data.slice(18, 22), // Actions
          data.slice(22, 26), // Actions
          string_from_slice(buffer, 26, 46), // Hint
          string_from_slice(buffer, 46, 50), // Hint
          string_from_slice(buffer, 50, 54), // Hint
          string_from_slice(buffer, 54, 58), // Hint
          string_from_slice(buffer, 58, 62), // Hint
        )
      }
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
    super(protocolVersion, deviceId, MessageType.LOG, logMessage.length, logMessage)
  }
}

export class CtrlProc extends Ctrl {
  constructor(
    public proc: Proc
  ) {
    super(1, DeviceId.ALPAKKA, MessageType.PROC, 1, [proc])
  }
}

export class CtrlConfigGet extends Ctrl {
  constructor(
    cfgIndex: ConfigIndex
  ) {
    super(1, DeviceId.ALPAKKA, MessageType.CONFIG_GET, 1, [cfgIndex])
  }
}

export class CtrlConfigSet extends Ctrl {
  constructor(
    cfgIndex: ConfigIndex,
    public preset: number,
    public values: number[],
  ) {
    const payload = [cfgIndex, preset, ...values]
    super(1, DeviceId.ALPAKKA, MessageType.CONFIG_SET, 7, payload)
  }
}

export class CtrlConfigShare extends Ctrl {
  constructor(
    public cfgIndex: ConfigIndex,
    public preset: number,
    public values: number[],
  ) {
    const payload = [cfgIndex, preset, values]
    super(1, DeviceId.ALPAKKA, MessageType.CONFIG_SHARE, 7, payload)
  }
}

export class CtrlProfileGet extends Ctrl {
  constructor(
    profileIndex: number,
    sectionIndex: SectionIndex,
  ) {
    super(1, DeviceId.ALPAKKA, MessageType.PROFILE_GET, 1, [profileIndex, sectionIndex])
  }
}

export class CtrlProfileShare extends Ctrl {
  constructor(
    public profileIndex: number,
    public sectionIndex: SectionIndex,
    public values: number[],
  ) {
    const payload = [profileIndex, sectionIndex, values]
    super(1, DeviceId.ALPAKKA, MessageType.PROFILE_SHARE, 10, payload)
  }
}

export class CtrlSectionName extends Ctrl {
  constructor(
    public profileIndex: number,
    public sectionIndex: SectionIndex,
    public name: string,
  ) {
    const payload = [profileIndex, sectionIndex, name]
    super(1, DeviceId.ALPAKKA, MessageType.PROFILE_SHARE, 10, payload)
  }
}

export class CtrlButton extends Ctrl {
  constructor(
    public profileIndex: number,
    public sectionIndex: SectionIndex,
    public mode: number,
    public actions_primary: number[],
    public actions_secondary: number[],
    public hint_primary: string,
    public hint_secondary: string,
  ) {
    const payload = [
      profileIndex,
      sectionIndex,
      mode,
      actions_primary,
      actions_secondary,
      hint_primary,
      hint_secondary,
    ]
    super(1, DeviceId.ALPAKKA, MessageType.PROFILE_SHARE, 10, payload)
  }
}

export class CtrlRotary extends Ctrl {
  constructor(
    public profileIndex: number,
    public sectionIndex: SectionIndex,
    public actions_0: number[] = [],
    public actions_1: number[] = [],
    public actions_2: number[] = [],
    public actions_3: number[] = [],
    public actions_4: number[] = [],
    public hint_0: string = '',
    public hint_1: string = '',
    public hint_2: string = '',
    public hint_3: string = '',
    public hint_4: string = '',
  ) {
    const payload = [
      profileIndex,
      sectionIndex,
      actions_0,
      actions_1,
      actions_2,
      actions_3,
      actions_4,
      hint_0,
      hint_1,
      hint_2,
      hint_3,
      hint_4,
    ]
    super(1, DeviceId.ALPAKKA, MessageType.PROFILE_SHARE, 10, payload)
  }
}

export type CtrlSection = CtrlSectionName | CtrlButton | CtrlRotary

export function isCtrlSection(instance: any) {
  if (instance instanceof CtrlSectionName) return true
  if (instance instanceof CtrlButton) return true
  if (instance instanceof CtrlRotary) return true
  return false
}

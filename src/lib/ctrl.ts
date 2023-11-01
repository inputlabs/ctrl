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
    SELECT_2,
    START_1,
    START_2,
    L1,
    L2,
    L4,
    R1,
    R2,
    R4,
    DHAT_LEFT = 31,
    DHAT_RIGHT,
    DHAT_UP,
    DHAT_DOWN,
    DHAT_UL,
    DHAT_UR,
    DHAT_DL,
    DHAT_DR,
    DHAT_PUSH,
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

    static decode(data: any) {
        // See: https://github.com/inputlabs/alpakka_firmware/blob/main/docs/ctrl_protocol.md
        data = new Uint8Array(data.buffer)
        if (data[2] == MessageType.LOG) {
            return new CtrlLog(
                data[0],  // ProtocolVersion.
                data[1],  // DeviceId.
                new TextDecoder().decode(data.slice(4, PACKAGE_SIZE))  // Log message.
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
            return new CtrlProfileShare(
                data[4],  // ProfileIndex.
                data[5],  // SectionIndex.
                data.slice(6, 16),  // Values.
            )
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

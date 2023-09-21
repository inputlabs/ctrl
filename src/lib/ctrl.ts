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
    CONFIG_GIVE,
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
        data = new Uint8Array(data.buffer)
        // console.log(data)
        if (data[2] == MessageType.LOG) {
            return new CtrlLog(
                data[0],
                data[1],
                new TextDecoder().decode(data.slice(4, PACKAGE_SIZE))
            )
        }
        if (data[2] == MessageType.CONFIG_GIVE) {
            return new CtrlConfigGive(data[4], data[5])
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
        public value: number,
    ) {
        const payload = [cfgIndex, value]
        super(1, DeviceId.ALPAKKA, MessageType.CONFIG_SET, 2, payload)
    }
}

export class CtrlConfigGive extends Ctrl {
    constructor(
        public cfgIndex: ConfigIndex,
        public value: number,
    ) {
        const payload = [cfgIndex, value]
        super(1, DeviceId.ALPAKKA, MessageType.CONFIG_GIVE, 2, payload)
    }
}

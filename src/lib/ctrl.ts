export const PACKAGE_SIZE = 64

enum DeviceId {
    ALPAKKA = 1,
}

enum MessageType {
    LOG = 1,
    PROC,
    CONFIG_GET,
    CONFIG_GIVE,
    CONFIG_SET,
}

export enum Proc {
    CALIBRATE = 220,
    RESTART = 221,
    BOOTSEL = 222,
    FACTORY = 223,
}

export enum ConfigIndex {
    PROTOCOL = 1,
    SENS_MOUSE,
    SENS_TOUCH,
    DEADZONE,
}

export class Ctrl {
    constructor(
        public protocolVersion: number,
        public deviceId: number,
        public messageType: MessageType,
        public payload: any,
    ) {}

    encode() {
        const data = new Uint8Array(PACKAGE_SIZE)
        data[0] = this.protocolVersion
        data[1] = this.deviceId
        data[2] = this.messageType
        data[3] = this.payload
        return data
    }

    static decode(data: any) {
        data = new Uint8Array(data.buffer)
        if (data[2] == MessageType.LOG) {
            return new CtrlLog(
                data[0],
                data[1],
                new TextDecoder().decode(data.slice(3, PACKAGE_SIZE))
            )
        }
        if (data[2] == MessageType.CONFIG_GIVE) {
            return new CtrlConfigGive(
                data[3],
                data[4],
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
        super(protocolVersion, deviceId, MessageType.LOG, logMessage)
    }
}

export class CtrlProc extends Ctrl {
    constructor(
        public proc: Proc
    ) {
        super(1, DeviceId.ALPAKKA, MessageType.PROC, proc)
    }
}

export class CtrlConfigGet extends Ctrl {
    constructor(
        index: ConfigIndex
    ) {
        super(1, DeviceId.ALPAKKA, MessageType.CONFIG_GET, index)
    }
}

export class CtrlConfigGive extends Ctrl {
    constructor(
        public index: ConfigIndex,
        public value: number,
    ) {
        super(1, DeviceId.ALPAKKA, MessageType.CONFIG_GIVE, value)
    }
}

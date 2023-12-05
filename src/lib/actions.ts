// SPDX-License-Identifier: GPL-2.0-only
// Copyright (C) 2023, Input Labs Oy.

import { HID } from './hid'

export class ActionGroup {
    actions = new Set<number>()
    size = 0

    constructor(values: number[]) {
      this.size = values.length
      const nonZeroValues = values.filter((x) => x != 0)
      for(let value of nonZeroValues.values()) {
        this.actions.add(value)
      }
    }

    add(action: HID) {
      if (this.actions.size >= this.size) return
      else this.actions.add(action)
    }

    delete(action: HID) {
      this.actions.delete(action)
    }

    has(action: HID) {
      return this.actions.has(action)
    }

    sizeNonZero() {
      return this.asArray().filter((x) => x!=0).length
    }

    copy() {
      return new ActionGroup(this.asArray())
    }

    merge(other: ActionGroup) {
      return new ActionGroup([...this.asArray(), ...other.asArray()])
    }

    asArray() {
      return Array.from(this.actions)
    }

    asArrayPadded() {
      const actions = Array.from(this.actions)
      const padding = Array(this.size-this.actions.size).fill(0)
      return [...actions, ...padding]
    }

    static empty(size: number) {
      return new ActionGroup(Array(size).fill(0))
    }
  }

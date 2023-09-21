// SPDX-License-Identifier: GPL-2.0-only
// Copyright (C) 2023, Input Labs Oy.

export function delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms))
}


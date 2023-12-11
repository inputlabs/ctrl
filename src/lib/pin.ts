// SPDX-License-Identifier: GPL-2.0-only
// Copyright (C) 2023, Input Labs Oy.

// Definitions ported from:
// https://github.com/inputlabs/alpakka_firmware/blob/main/src/headers/pin.h

export const PIN_GROUP_PICO     = 1
export const PIN_GROUP_PICO_END = 99
export const PIN_GROUP_IO_0     = 100
export const PIN_GROUP_IO_0_END = 199
export const PIN_GROUP_IO_1     = 200
export const PIN_GROUP_IO_1_END = 249
export const PIN_GROUP_SPECIAL  = 250

export enum PIN {
  // Pico pins.
  NONE = 0,
  HOME = 20,
  TOUCH_IN = 7,

  // IO expansion 1.
  SELECT_1 = 114,
  SELECT_2 = 113,
  DPAD_LEFT = 104,
  DPAD_RIGHT = 101,
  DPAD_UP = 103,
  DPAD_DOWN = 100,
  L1 = 102,
  L2 = 115,
  L3 = 112,
  L4 = 109,

  // IO expansion 2.
  START_1 = 200,
  START_2 = 201,
  A = 215,
  B = 210,
  X = 213,
  Y = 211,
  DHAT_LEFT = 203,
  DHAT_RIGHT = 205,
  DHAT_UP = 206,
  DHAT_DOWN = 202,
  DHAT_PUSH = 204,
  R1 = 212,
  R2 = 214,
  R4 = 207,
}

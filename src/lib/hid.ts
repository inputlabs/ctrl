// SPDX-License-Identifier: GPL-2.0-only
// Copyright (C) 2023, Input Labs Oy.

// Definitions ported from:
// https://github.com/inputlabs/alpakka_firmware/blob/main/src/headers/hid.h

const MODIFIER_INDEX = 120
const MOUSE_INDEX = 140
const GAMEPAD_INDEX = 160
const GAMEPAD_AXIS_INDEX = 180
const PROC_INDEX = 200

export const HID: Array<string> = []

HID[0] = 'KEY_NONE'

HID[4] = 'KEY_A'
HID[5] = 'KEY_B'
HID[6] = 'KEY_C'
HID[7] = 'KEY_D'
HID[8] = 'KEY_E'
HID[9] = 'KEY_F'
HID[10] = 'KEY_G'
HID[11] = 'KEY_H'
HID[12] = 'KEY_I'
HID[13] = 'KEY_J'
HID[14] = 'KEY_K'
HID[15] = 'KEY_L'
HID[16] = 'KEY_M'
HID[17] = 'KEY_N'
HID[18] = 'KEY_O'
HID[19] = 'KEY_P'
HID[20] = 'KEY_Q'
HID[21] = 'KEY_R'
HID[22] = 'KEY_S'
HID[23] = 'KEY_T'
HID[24] = 'KEY_U'
HID[25] = 'KEY_V'
HID[26] = 'KEY_W'
HID[27] = 'KEY_X'
HID[28] = 'KEY_Y'
HID[29] = 'KEY_Z'

HID[30] = 'KEY_1'
HID[31] = 'KEY_2'
HID[32] = 'KEY_3'
HID[33] = 'KEY_4'
HID[34] = 'KEY_5'
HID[35] = 'KEY_6'
HID[36] = 'KEY_7'
HID[37] = 'KEY_8'
HID[38] = 'KEY_9'
HID[39] = 'KEY_0'

HID[40] = 'KEY_ENTER'
HID[41] = 'KEY_ESCAPE'
HID[42] = 'KEY_BACKSPACE'
HID[43] = 'KEY_TAB'
HID[44] = 'KEY_SPACE'
HID[45] = 'KEY_MINUS'
HID[46] = 'KEY_EQUALS'
HID[47] = 'KEY_LEFT_BRACKET'
HID[48] = 'KEY_RIGHT_BRACKET'
HID[49] = 'KEY_BACKSLASH'
HID[51] = 'KEY_SEMICOLON'
HID[52] = 'KEY_QUOTE'
HID[53] = 'KEY_BACKQUOTE'
HID[54] = 'KEY_COMMA'
HID[55] = 'KEY_PERIOD'
HID[56] = 'KEY_SLASH'
HID[57] = 'KEY_CAPS_LOCK'

HID[58] = 'KEY_F1'
HID[59] = 'KEY_F2'
HID[60] = 'KEY_F3'
HID[61] = 'KEY_F4'
HID[62] = 'KEY_F5'
HID[63] = 'KEY_F6'
HID[64] = 'KEY_F7'
HID[65] = 'KEY_F8'
HID[66] = 'KEY_F9'
HID[67] = 'KEY_F10'
HID[68] = 'KEY_F11'
HID[69] = 'KEY_F12'

HID[73] = 'KEY_INSERT'
HID[74] = 'KEY_HOME'
HID[75] = 'KEY_PAGE_UP'
HID[76] = 'KEY_DELETE'
HID[77] = 'KEY_END'
HID[78] = 'KEY_PAGE_DOWN'

HID[79] = 'KEY_RIGHT'
HID[80] = 'KEY_LEFT'
HID[81] = 'KEY_DOWN'
HID[82] = 'KEY_UP'

HID[83] = 'KEY_PAD_NUMLOCK'
HID[84] = 'KEY_PAD_SLASH'
HID[85] = 'KEY_PAD_ASTERISK'
HID[86] = 'KEY_PAD_MINUS'
HID[87] = 'KEY_PAD_PLUS'
HID[88] = 'KEY_PAD_ENTER'
HID[89] = 'KEY_PAD_1'
HID[90] = 'KEY_PAD_2'
HID[91] = 'KEY_PAD_3'
HID[92] = 'KEY_PAD_4'
HID[93] = 'KEY_PAD_5'
HID[94] = 'KEY_PAD_6'
HID[95] = 'KEY_PAD_7'
HID[96] = 'KEY_PAD_8'
HID[97] = 'KEY_PAD_9'
HID[98] = 'KEY_PAD_0'
HID[99] = 'KEY_PAD_PERIOD'
HID[100] = 'KEY_PAD_BACKSLASH'
HID[103] = 'KEY_PAD_EQUAL'

HID[104] = 'KEY_F13'
HID[105] = 'KEY_F14'
HID[106] = 'KEY_F15'
HID[107] = 'KEY_F16'
HID[108] = 'KEY_F17'
HID[109] = 'KEY_F18'
HID[110] = 'KEY_F19'
HID[111] = 'KEY_F20'
HID[112] = 'KEY_F21'
HID[113] = 'KEY_F22'
HID[114] = 'KEY_F23'
HID[115] = 'KEY_F24'

HID[MODIFIER_INDEX + 0] = 'KEY_LEFT_CONTROL'
HID[MODIFIER_INDEX + 1] = 'KEY_LEFT_SHIFT'
HID[MODIFIER_INDEX + 2] = 'KEY_LEFT_ALT'
HID[MODIFIER_INDEX + 3] = 'KEY_LEFT_SUPER'
HID[MODIFIER_INDEX + 4] = 'KEY_RIGHT_CONTROL'
HID[MODIFIER_INDEX + 5] = 'KEY_RIGHT_SHIFT'
HID[MODIFIER_INDEX + 6] = 'KEY_RIGHT_ALT'
HID[MODIFIER_INDEX + 7] = 'KEY_RIGHT_SUPER'

HID[MOUSE_INDEX + 0] = 'MOUSE_1'
HID[MOUSE_INDEX + 1] = 'MOUSE_2'
HID[MOUSE_INDEX + 2] = 'MOUSE_3'
HID[MOUSE_INDEX + 3] = 'MOUSE_4'
HID[MOUSE_INDEX + 4] = 'MOUSE_5'
HID[MOUSE_INDEX + 5] = 'MOUSE_SCROLL_UP'
HID[MOUSE_INDEX + 6] = 'MOUSE_SCROLL_DOWN'
HID[MOUSE_INDEX + 7] = 'MOUSE_X'
HID[MOUSE_INDEX + 8] = 'MOUSE_Y'
HID[MOUSE_INDEX + 9] = 'MOUSE_X_NEG'
HID[MOUSE_INDEX + 10] = 'MOUSE_Y_NEG'

HID[GAMEPAD_INDEX + 0] = 'GAMEPAD_UP'
HID[GAMEPAD_INDEX + 1] = 'GAMEPAD_DOWN'
HID[GAMEPAD_INDEX + 2] = 'GAMEPAD_LEFT'
HID[GAMEPAD_INDEX + 3] = 'GAMEPAD_RIGHT'
HID[GAMEPAD_INDEX + 4] = 'GAMEPAD_START'
HID[GAMEPAD_INDEX + 5] = 'GAMEPAD_SELECT'
HID[GAMEPAD_INDEX + 6] = 'GAMEPAD_L3'
HID[GAMEPAD_INDEX + 7] = 'GAMEPAD_R3'
HID[GAMEPAD_INDEX + 8] = 'GAMEPAD_L1'
HID[GAMEPAD_INDEX + 9] = 'GAMEPAD_R1'
HID[GAMEPAD_INDEX + 10] = 'GAMEPAD_HOME'
HID[GAMEPAD_INDEX + 12] = 'GAMEPAD_A'
HID[GAMEPAD_INDEX + 13] = 'GAMEPAD_B'
HID[GAMEPAD_INDEX + 14] = 'GAMEPAD_X'
HID[GAMEPAD_INDEX + 15] = 'GAMEPAD_Y'

HID[GAMEPAD_AXIS_INDEX + 0] = 'GAMEPAD_AXIS_LX'
HID[GAMEPAD_AXIS_INDEX + 1] = 'GAMEPAD_AXIS_LY'
HID[GAMEPAD_AXIS_INDEX + 2] = 'GAMEPAD_AXIS_LZ'
HID[GAMEPAD_AXIS_INDEX + 3] = 'GAMEPAD_AXIS_RX'
HID[GAMEPAD_AXIS_INDEX + 4] = 'GAMEPAD_AXIS_RY'
HID[GAMEPAD_AXIS_INDEX + 5] = 'GAMEPAD_AXIS_RZ'
HID[GAMEPAD_AXIS_INDEX + 6] = 'GAMEPAD_AXIS_LX_NEG'
HID[GAMEPAD_AXIS_INDEX + 7] = 'GAMEPAD_AXIS_LY_NEG'
HID[GAMEPAD_AXIS_INDEX + 8] = 'GAMEPAD_AXIS_LZ_NEG'
HID[GAMEPAD_AXIS_INDEX + 9] = 'GAMEPAD_AXIS_RX_NEG'
HID[GAMEPAD_AXIS_INDEX + 10] = 'GAMEPAD_AXIS_RY_NEG'
HID[GAMEPAD_AXIS_INDEX + 11] = 'GAMEPAD_AXIS_RZ_NEG'

HID[PROC_INDEX + 0] = 'PROC_HOME'
HID[PROC_INDEX + 1] = 'PROC_PROFILE_1'
HID[PROC_INDEX + 2] = 'PROC_PROFILE_2'
HID[PROC_INDEX + 3] = 'PROC_PROFILE_3'
HID[PROC_INDEX + 4] = 'PROC_PROFILE_4'
HID[PROC_INDEX + 5] = 'PROC_PROFILE_5'
HID[PROC_INDEX + 6] = 'PROC_PROFILE_6'
HID[PROC_INDEX + 7] = 'PROC_PROFILE_7'
HID[PROC_INDEX + 8] = 'PROC_PROFILE_8'
HID[PROC_INDEX + 9] = 'PROC_PROFILE_9'
HID[PROC_INDEX + 10] = 'PROC_PROFILE_10'
HID[PROC_INDEX + 11] = 'PROC_PROFILE_11'
HID[PROC_INDEX + 12] = 'PROC_PROFILE_12'

HID[PROC_INDEX + 13] = 'PROC_TUNE_UP'
HID[PROC_INDEX + 14] = 'PROC_TUNE_DOWN'
HID[PROC_INDEX + 15] = 'PROC_TUNE_OS'
HID[PROC_INDEX + 16] = 'PROC_TUNE_SENSITIVITY'
HID[PROC_INDEX + 17] = 'PROC_TUNE_DEADZONE'
HID[PROC_INDEX + 18] = 'PROC_TUNE_TOUCH_THRESHOLD'
HID[PROC_INDEX + 19] = 'PROC_TUNE_VIBRATION'
HID[PROC_INDEX + 20] = 'PROC_CALIBRATE'
HID[PROC_INDEX + 21] = 'PROC_RESTART'
HID[PROC_INDEX + 22] = 'PROC_BOOTSEL'
HID[PROC_INDEX + 23] = 'PROC_FACTORY'
HID[PROC_INDEX + 24] = 'PROC_THANKS'
HID[PROC_INDEX + 25] = 'PROC_MACRO'
HID[PROC_INDEX + 26] = 'PROC_HOME_GAMEPAD'

HID[PROC_INDEX + 27] = 'PROC_ROTARY_MODE_0'
HID[PROC_INDEX + 28] = 'PROC_ROTARY_MODE_1'
HID[PROC_INDEX + 29] = 'PROC_ROTARY_MODE_2'
HID[PROC_INDEX + 30] = 'PROC_ROTARY_MODE_3'
HID[PROC_INDEX + 31] = 'PROC_ROTARY_MODE_4'
HID[PROC_INDEX + 32] = 'PROC_ROTARY_MODE_5'

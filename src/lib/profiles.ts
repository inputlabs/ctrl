// SPDX-License-Identifier: GPL-2.0-only
// Copyright (C) 2023, Input Labs Oy.

/// <reference types="w3c-web-usb" />

import { MessageType, SectionIndex, CtrlGyro, CtrlGyroAxis } from 'lib/ctrl'
import { Device } from 'lib/device'
import { Profile } from 'lib/profile'
import {
  Ctrl,
  CtrlSectionMeta,
  CtrlButton,
  CtrlRotary,
  CtrlThumbstick,
  CtrlSection,
  ThumbstickMode,
} from 'lib/ctrl'

const NUMBER_OF_PROFILES = 13  // Home + 12 builtin.

export class Profiles {
  device: Device
  profiles: Profile[] = []
  syncedNames = false

  constructor(device: Device) {
    this.device = device
    this.initProfiles()
  }

  async initProfiles() {
    for(let i of Array(NUMBER_OF_PROFILES).keys()) this.initProfile(i)
  }

  initProfile(index: number) {
    this.profiles[index] = new Profile()
    this.syncedNames = false
  }

  async fetchProfileNames() {
    if (this.syncedNames) return
    for(let index of Array(NUMBER_OF_PROFILES).keys()) {
      await this.fetchProfileName(index)
    }
    this.syncedNames = true
  }

  async fetchProfileName(index: number) {
    const section = await this.device.tryGetSection(index, SectionIndex.META)
    this.profiles[index].meta = section as CtrlSectionMeta
  }

  async fetchProfile(profileIndex: number, strict: boolean) {
    const profile = this.profiles[profileIndex]
    // Replace internal meta properties instead of the whole object, so Angular
    // reference to the object is not lost. (Profile name is special because is
    // linked in many dynamic UI elements).
    const meta = await this.device.tryGetSection(profileIndex, SectionIndex.META) as CtrlSectionMeta
    profile.meta.replaceContentsWith(meta)
    // Buttons.
    const getButton = async (sectionIndex: SectionIndex) => {
      return await this.device.tryGetSection(profileIndex, sectionIndex) as CtrlButton
    }
    profile.buttonA = await getButton(SectionIndex.A)
    profile.buttonB = await getButton(SectionIndex.B)
    profile.buttonX = await getButton(SectionIndex.X)
    profile.buttonY = await getButton(SectionIndex.Y)
    profile.buttonDpadLeft = await getButton(SectionIndex.DPAD_LEFT)
    profile.buttonDpadRight = await getButton(SectionIndex.DPAD_RIGHT)
    profile.buttonDpadUp = await getButton(SectionIndex.DPAD_UP)
    profile.buttonDpadDown = await getButton(SectionIndex.DPAD_DOWN)
    profile.buttonSelect1 = await getButton(SectionIndex.SELECT_1)
    profile.buttonSelect2 = await getButton(SectionIndex.SELECT_2)
    profile.buttonStart1 = await getButton(SectionIndex.START_1)
    profile.buttonStart2 = await getButton(SectionIndex.START_2)
    profile.buttonL1 = await getButton(SectionIndex.L1)
    profile.buttonL2 = await getButton(SectionIndex.L2)
    profile.buttonL4 = await getButton(SectionIndex.L4)
    profile.buttonR1 = await getButton(SectionIndex.R1)
    profile.buttonR2 = await getButton(SectionIndex.R2)
    profile.buttonR4 = await getButton(SectionIndex.R4)
    // Left stick.
    profile.buttonLStickLeft = await getButton(SectionIndex.LSTICK_LEFT)
    profile.buttonLStickRight = await getButton(SectionIndex.LSTICK_RIGHT)
    profile.buttonLStickUp = await getButton(SectionIndex.LSTICK_UP)
    profile.buttonLStickDown = await getButton(SectionIndex.LSTICK_DOWN)
    profile.buttonLStickUL = await getButton(SectionIndex.LSTICK_UL)
    profile.buttonLStickUR = await getButton(SectionIndex.LSTICK_UR)
    profile.buttonLStickDL = await getButton(SectionIndex.LSTICK_DL)
    profile.buttonLStickDR = await getButton(SectionIndex.LSTICK_DR)
    profile.buttonLStickPush = await getButton(SectionIndex.LSTICK_PUSH)
    profile.buttonLStickInner = await getButton(SectionIndex.LSTICK_INNER)
    profile.buttonLStickOuter = await getButton(SectionIndex.LSTICK_OUTER)
    // Right stick (thumbstick or dhat).
    profile.buttonRStickLeft = await getButton(SectionIndex.RSTICK_LEFT)
    profile.buttonRStickRight = await getButton(SectionIndex.RSTICK_RIGHT)
    profile.buttonRStickUp = await getButton(SectionIndex.RSTICK_UP)
    profile.buttonRStickDown = await getButton(SectionIndex.RSTICK_DOWN)
    profile.buttonRStickUL = await getButton(SectionIndex.RSTICK_UL)
    profile.buttonRStickUR = await getButton(SectionIndex.RSTICK_UR)
    profile.buttonRStickDL = await getButton(SectionIndex.RSTICK_DL)
    profile.buttonRStickDR = await getButton(SectionIndex.RSTICK_DR)
    profile.buttonRStickPush = await getButton(SectionIndex.RSTICK_PUSH)
    // Rotary.
    const rotaryUp = await this.device.tryGetSection(profileIndex, SectionIndex.ROTARY_UP) as CtrlRotary
    const rotaryDown = await this.device.tryGetSection(profileIndex, SectionIndex.ROTARY_DOWN) as CtrlRotary
    profile.rotaryUp = rotaryUp
    profile.rotaryDown = rotaryDown
    // Thumbstick mode.
    const lStick = await this.device.tryGetSection(profileIndex, SectionIndex.LSTICK_SETTINGS) as CtrlThumbstick
    const rStick = await this.device.tryGetSection(profileIndex, SectionIndex.RSTICK_SETTINGS) as CtrlThumbstick
    profile.settingsLStick = lStick
    profile.settingsRStick = rStick
    // Gyro mode.
    const gyro = await this.device.tryGetSection(profileIndex, SectionIndex.GYRO_SETTINGS) as CtrlGyro
    profile.settingsGyro = gyro
    // Gyro Axes.
    profile.gyroX = await this.device.tryGetSection(profileIndex, SectionIndex.GYRO_X) as CtrlGyroAxis
    profile.gyroY = await this.device.tryGetSection(profileIndex, SectionIndex.GYRO_Y) as CtrlGyroAxis
    profile.gyroZ = await this.device.tryGetSection(profileIndex, SectionIndex.GYRO_Z) as CtrlGyroAxis
  }

  getProfile(profileIndex: number) {
    return this.profiles[profileIndex]
  }

  saveToBlob(profileIndex: number) {
    const profile = this.profiles[profileIndex]
    const data:number[] = []
    for(const section of profile.getSections()) {
      const sectionBinary = new Uint8Array(60)
      const payload = section.payload().slice(1)  // Remove profile index.
      for (let [i, value] of payload.entries()) {
        sectionBinary[i] = value
      }
      data.push(...sectionBinary)
    }
    return new Uint8Array(data)
  }

  async loadFromBlob(profileIndex: number, data: Uint8Array) {
    let sections: CtrlSection[] = []
    for(let i=0; i<data.length; i+=60) {
      const rawData = data.slice(i, i+60)
      const sectionData = [
        0,
        0,
        MessageType.SECTION_SHARE,
        0,
        profileIndex,
        ...rawData,
      ]
      const section = Ctrl.decode(new Uint8Array(sectionData)) as CtrlSection
      sections.push(section)
    }
    sections = this.upgradeFrom097(sections)
    for(let section of sections) {
      console.log('Section from blob', section)
      await this.device.trySetSection(profileIndex, section)
    }
    this.fetchProfile(profileIndex, true)
  }

  upgradeFrom097(sections: CtrlSection[]): CtrlSection[] {
    // Bump profile version.
    const meta = sections.find(s => s instanceof CtrlSectionMeta) as CtrlSectionMeta
    meta.versionMajor = 1
    meta.versionMinor = 1
    meta.versionPatch = 0
    // Inject default right stick settings if not defined.
    // (Default made to resemble digital 8-dir as in old controllers).
    const hasRightThumbstick = (
      sections
      .filter((section => section instanceof CtrlThumbstick))
      .length == 2
    )
    if (!hasRightThumbstick) {
      const rStickSection = new CtrlThumbstick(
        sections[0].profileIndex,
        SectionIndex.RSTICK_SETTINGS,
        ThumbstickMode.DIR8,
        false,  // Distance mode / Ignore misalignment.
        60,  // Deadzone.
        50,  // Axis overlap (unsigned to signed).
        true,  // Deadzone override.
        0, // Antideadzone.
        70, // Saturation.
        80,  // Outer threshold.
        false,  // Push auto-toggle.
        100,  // Sens mouse.
        10,  // Sens scroll.
        100,  // Sens Y ratio.
        0,  // Accel.
        0,  // Rotation center deadzone.
        0,  // Rotation entry deadzone.
        false,  // Rotation anti-clockwise.
        false,  // Rotation absolute mode
        false,  // Rotation RWS enabled.
        0,  // Rotation RWS.
        0,  // Rotation sens axis.
        0,  // Rotation smoothing.
      )
      sections.push(rStickSection)
    }
    return sections
  }
}

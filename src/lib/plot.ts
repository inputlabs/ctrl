  // SPDX-License-Identifier: GPL-2.0-only
// Copyright (C) 2023, Input Labs Oy.

import { SectionComponent } from 'components/profile/section'

interface Coordinate {
  x: number
  y: number
}

const deg = (angle: number) => {
    return angle * (Math.PI / 180)
}

export const plotCircle = (section: SectionComponent) => {
    if (!section.canvasCircle) return
    const ctx = section.canvasCircle.nativeElement.getContext('2d')!
    const thumbstick = section.getSectionAsThumbstick()
    const deadzone = thumbstick.deadzone_override ? thumbstick.deadzone : section.globalDeadzone
    let overlap = thumbstick.overlap
    if (overlap == 0) overlap = -2.5  // Force a visual gap when value is zero.
    const outer = section.canvasCircle.nativeElement.getAttribute('plot_outer') == 'true'
    const size = section.canvasCircle.nativeElement.width
    const mid = size / 2
    const max = size * 0.4
    let overlapDeg = (50-overlap) / 100 * 90
    let overlapDegNeg = -overlap / 100 * 90
    // Helper functions.
    const drawArc = (stroke: number, angle: number, size: number) => {
        let half = size / 2
        ctx.beginPath()
        ctx.arc(mid, mid, max, angle-half, angle+half)
        ctx.strokeStyle = section.green
        ctx.lineWidth = stroke
        ctx.stroke()
    }
    const drawCircle = (radius: number, lineWidth: number) => {
        ctx.beginPath()
        ctx.arc(mid, mid, radius, 0, deg(360))
        ctx.strokeStyle = section.purple
        ctx.lineWidth = lineWidth
        ctx.stroke()
    }
    // Draw.
    ctx.clearRect(0, 0, size, size)
    if (overlap > 0) {
        drawArc(3, deg(0), deg(45+overlapDeg))
        drawArc(3, deg(90), deg(45+overlapDeg))
        drawArc(3, deg(180), deg(45+overlapDeg))
        drawArc(3, deg(270), deg(45+overlapDeg))
    }
    if (overlap > 0) {
        drawArc(1, deg(45+0), deg(45-overlapDeg))
        drawArc(1, deg(45+90), deg(45-overlapDeg))
        drawArc(1, deg(45+180), deg(45-overlapDeg))
        drawArc(1, deg(45+270), deg(45-overlapDeg))
    }
    if (overlap < 0) {
        drawArc(3, deg(0), deg(90-overlapDegNeg))
        drawArc(3, deg(90), deg(90-overlapDegNeg))
        drawArc(3, deg(180), deg(90-overlapDegNeg))
        drawArc(3, deg(270), deg(90-overlapDegNeg))
    }
    drawCircle(deadzone*max/100, 3)
    if (outer) drawCircle(thumbstick.outer_threshold*max/100, 3)
}

export const plotRamp = (section: SectionComponent) => {
    if (!section.canvasRamp) return
    const ctx = section.canvasRamp.nativeElement.getContext('2d')!
    const thumbstick = section.getSectionAsThumbstick()
    const deadzone = thumbstick.deadzone_override ? thumbstick.deadzone : section.globalDeadzone
    const outer = section.canvasRamp.nativeElement.getAttribute('plot_outer') == 'true'
    const size = section.canvasRamp.nativeElement.width
    const min = 2
    const max = size - 2
    type Point = {x: number, y:number}
    const pointA = {x: min, y: min}
    const pointB = {x: min + deadzone/100*max, y: min}
    const pointC = {x: pointB.x, y: min + thumbstick.antideadzone/100*max}
    let pointD = {x: thumbstick.saturation/100*max, y: max}
    if (!outer) pointD = {x: pointC.x, y: max}  // Force vertical.
    const pointE = {x: max, y: max}
    // Accel curve.
    const curvePoints = 20
    const startX = min + (deadzone / 100) * max
    const startY = min + (thumbstick.antideadzone / 100) * max
    const endX = (thumbstick.saturation / 100) * max
    const scaleX = endX - startX
    const scaleY = max - startY
    // Helper functions.
    const drawVert = (x: number) => {
        ctx.beginPath()
        ctx.moveTo(x, min)
        ctx.lineTo(x, max)
        ctx.strokeStyle = section.purple
        ctx.lineWidth = 3
        ctx.stroke()
    }
    const drawLines = (points: Point[]) => {
        ctx.beginPath()
        ctx.moveTo(points[0].x, points[0].y)
        for (const point of points.slice(1)) {
        ctx.lineTo(point.x, point.y)
        }
        ctx.strokeStyle = section.green
        ctx.lineWidth = 3
        ctx.stroke()
    }
    const felixCurve = (x: number, k: number) => {
        return (x*k+x) / (2*x*k-k+1)
    }
    let pointsCtoD: Point[] = []
    for(let i=0; i<=curvePoints; i++) {
        const k = thumbstick.accel_curve / 100
        let x = i / curvePoints
        let y = felixCurve(x, k)
        x *= scaleX
        y *= scaleY
        x += startX
        y += startY
        pointsCtoD.push({x, y})
    }
    // Draw.
    ctx.clearRect(0, 0, size, size)
    drawVert(outer ? pointB.x : pointB.x-4)  // Offset so both verticals are visible.
    if (outer) drawVert(thumbstick.outer_threshold / 100 * max)
    drawLines([pointA, pointB, pointC])
    if (outer) drawLines(pointsCtoD)  // Curve.
    else drawLines([pointC, pointD])
    drawLines([pointD, pointE])
}

export const plotRotation = (section: SectionComponent) => {
    if (!section.canvasRotation) return
    const ctx = section.canvasRotation.nativeElement.getContext('2d')!
    const thumbstick = section.getSectionAsThumbstick()
    const CenterDeadzone = thumbstick.rot_center_deadzone
    const entryDeadzone = thumbstick.rot_entry_deadzone
    const sens = 360 / 100 * (thumbstick.rot_sens_axis * 5)
    const size = section.canvasRotation.nativeElement.width
    const mid = size / 2
    const max = size * 0.4
    // Helper functions.
    const polar = (angle: number, radius: number): Coordinate => {
        const endX = mid + radius * Math.cos(angle - deg(90))
        const endY = mid + radius * Math.sin(angle - deg(90))
        return {x: endX, y: endY}
    }
    const drawLabel = (pos: Coordinate, text: string) => {
        ctx.font = '10px monospace'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillStyle = section.green
        ctx.strokeStyle = '#000'
        ctx.lineWidth = 2
        ctx.strokeText(text, pos.x, pos.y)
        ctx.fillText(text, pos.x, pos.y);
    }
    const drawPie = (_angle: number, size: number) => {
        const radius = max
        const angle = _angle - deg(90)
        ctx.beginPath()
        ctx.moveTo(mid, mid)
        ctx.arc(mid, mid, radius, angle-size, angle+size)
        ctx.closePath()
        ctx.fillStyle = section.purple
        ctx.fill()
    }
    const drawTriangle = (pos: Coordinate, _angle: number) => {
        const gap = Math.PI / 6
        const size = 12
        const angle = _angle + deg(90)
        ctx.beginPath()
        ctx.moveTo(pos.x, pos.y)  // Tip.
        ctx.lineTo(
            pos.x + size * Math.cos(angle - gap),
            pos.y + size * Math.sin(angle - gap)
        )
        ctx.lineTo(
            pos.x + size * Math.cos(angle + gap),
            pos.y + size * Math.sin(angle + gap)
        )
        ctx.closePath()
        ctx.fillStyle = section.green
        ctx.fill()
    }
    const drawEntry = (angle: number) => {
        const radius = max * 0.9
        ctx.beginPath()
        ctx.moveTo(mid, mid)
        const end = polar(angle, radius)
        ctx.lineTo(end.x, end.y)
        ctx.strokeStyle = section.green
        ctx.lineWidth = 3
        ctx.stroke()
        drawTriangle(end, angle)
    }
    const drawPerimeter = (_angleStart: number, _angleEnd: number, clockwise: boolean) => {
        let angleStart = deg(-90) + _angleStart
        let angleEnd = deg(-90) + _angleEnd
        if (!clockwise) {
            [angleStart, angleEnd] = [angleEnd, angleStart]
        }
        ctx.beginPath()
        ctx.arc(mid, mid, max, angleStart, angleEnd)
        ctx.strokeStyle = section.green
        ctx.lineWidth = 3
        ctx.stroke()
        const end = polar(angleEnd+deg(90), max)
        drawTriangle(end, angleEnd+deg(180))
        drawLabel(polar(angleEnd + deg(90) + deg(17), max), '100%')
    }
    const drawCircle = (radius: number, lineWidth: number, color: string, alpha: number) => {
        ctx.beginPath()
        ctx.arc(mid, mid, radius, 0, deg(360))
        ctx.strokeStyle = color
        ctx.lineWidth = lineWidth
        ctx.globalAlpha = alpha
        ctx.stroke()
        ctx.globalAlpha = 1
    }
    // Draw.
    ctx.clearRect(0, 0, size, size)
    drawCircle(CenterDeadzone * max / 100, 3, section.purple, 1)
    drawCircle(max, 3, section.green, 0.3)
    const entryAngle = 0
    drawPie(deg(entryAngle), deg(entryDeadzone))
    drawEntry(deg(entryAngle))
    drawPerimeter(deg(entryAngle), deg(entryAngle)+deg(sens), true)
}

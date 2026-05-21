import { useCallback, useImperativeHandle, useRef, forwardRef } from 'react'
import type { ComponentSchema } from '@ptd/core'
import { setShapeStyle } from '../../state'
import { getComponentRotatedStyle } from '../../utils'
import styles from './EditorLine.module.css'

type LineName = 'xt' | 'xc' | 'xb' | 'yl' | 'yc' | 'yr'

const LINE_NAMES: LineName[] = ['xt', 'xc', 'xb', 'yl', 'yc', 'yr']
const DIFF = 3

export interface EditorLineHandle {
  showLines(isDownward: boolean, isRightward: boolean, componentData: ComponentSchema[], curComponent: ComponentSchema | null, onChange?: (t: import('@ptd/core').TemplateSchema) => void): void
  hideLines(): void
}

export const EditorLine = forwardRef<EditorLineHandle>(function EditorLine(_props, ref) {
  const lineRefs = useRef<Partial<Record<LineName, HTMLDivElement | null>>>({})
  const lineStatusRef = useRef<Record<LineName, boolean>>({
    xt: false, xc: false, xb: false, yl: false, yc: false, yr: false,
  })

  const isNearly = (a: number, b: number) => Math.abs(a - b) <= DIFF

  const hideLine = useCallback(() => {
    for (const name of LINE_NAMES) {
      lineStatusRef.current[name] = false
      const el = lineRefs.current[name]
      if (el) el.style.display = 'none'
    }
  }, [])

  const showLine = useCallback((name: LineName, shift: number) => {
    lineStatusRef.current[name] = true
    const el = lineRefs.current[name]
    if (!el) return
    el.style.display = 'block'
    if (name.startsWith('x')) {
      el.style.top = `${shift}px`
    } else {
      el.style.left = `${shift}px`
    }
  }, [])

  const chooseTheTrueLine = useCallback(
    (needToShow: LineName[], isDownward: boolean, isRightward: boolean) => {
      if (isRightward) {
        if (needToShow.includes('yr')) showLine('yr', lineRefs.current['yr'] ? parseFloat((lineRefs.current['yr'] as HTMLDivElement).style.left) : 0)
        else if (needToShow.includes('yc')) showLine('yc', lineRefs.current['yc'] ? parseFloat((lineRefs.current['yc'] as HTMLDivElement).style.left) : 0)
        else if (needToShow.includes('yl')) showLine('yl', lineRefs.current['yl'] ? parseFloat((lineRefs.current['yl'] as HTMLDivElement).style.left) : 0)
      } else {
        if (needToShow.includes('yl')) showLine('yl', lineRefs.current['yl'] ? parseFloat((lineRefs.current['yl'] as HTMLDivElement).style.left) : 0)
        else if (needToShow.includes('yc')) showLine('yc', lineRefs.current['yc'] ? parseFloat((lineRefs.current['yc'] as HTMLDivElement).style.left) : 0)
        else if (needToShow.includes('yr')) showLine('yr', lineRefs.current['yr'] ? parseFloat((lineRefs.current['yr'] as HTMLDivElement).style.left) : 0)
      }
      if (isDownward) {
        if (needToShow.includes('xb')) showLine('xb', lineRefs.current['xb'] ? parseFloat((lineRefs.current['xb'] as HTMLDivElement).style.top) : 0)
        else if (needToShow.includes('xc')) showLine('xc', lineRefs.current['xc'] ? parseFloat((lineRefs.current['xc'] as HTMLDivElement).style.top) : 0)
        else if (needToShow.includes('xt')) showLine('xt', lineRefs.current['xt'] ? parseFloat((lineRefs.current['xt'] as HTMLDivElement).style.top) : 0)
      } else {
        if (needToShow.includes('xt')) showLine('xt', lineRefs.current['xt'] ? parseFloat((lineRefs.current['xt'] as HTMLDivElement).style.top) : 0)
        else if (needToShow.includes('xc')) showLine('xc', lineRefs.current['xc'] ? parseFloat((lineRefs.current['xc'] as HTMLDivElement).style.top) : 0)
        else if (needToShow.includes('xb')) showLine('xb', lineRefs.current['xb'] ? parseFloat((lineRefs.current['xb'] as HTMLDivElement).style.top) : 0)
      }
    },
    [showLine],
  )

  useImperativeHandle(ref, () => ({
    hideLines: hideLine,
    showLines(isDownward, isRightward, componentData, curComponent, onChange) {
      if (!curComponent) return
      hideLine()
      const curStyle = getComponentRotatedStyle(curComponent.style)
      const curHalfW = curStyle.width / 2
      const curHalfH = curStyle.height / 2

      for (const component of componentData) {
        if (component.id === curComponent.id) continue
        const cs = getComponentRotatedStyle(component.style)
        const { top, left, bottom, right } = cs
        const halfW = cs.width / 2
        const halfH = cs.height / 2

        const needToShow: LineName[] = []

        // Horizontal lines (top axis)
        const topConditions: Array<{ isNearly: boolean; line: LineName; dragShift: number; lineShift: number }> = [
          { isNearly: isNearly(curStyle.top, top), line: 'xt', dragShift: top, lineShift: top },
          { isNearly: isNearly(curStyle.bottom, top), line: 'xt', dragShift: top - curStyle.height, lineShift: top },
          { isNearly: isNearly(curStyle.top + curHalfH, top + halfH), line: 'xc', dragShift: top + halfH - curHalfH, lineShift: top + halfH },
          { isNearly: isNearly(curStyle.top, bottom), line: 'xb', dragShift: bottom, lineShift: bottom },
          { isNearly: isNearly(curStyle.bottom, bottom), line: 'xb', dragShift: bottom - curStyle.height, lineShift: bottom },
        ]
        const leftConditions: Array<{ isNearly: boolean; line: LineName; dragShift: number; lineShift: number }> = [
          { isNearly: isNearly(curStyle.left, left), line: 'yl', dragShift: left, lineShift: left },
          { isNearly: isNearly(curStyle.right, left), line: 'yl', dragShift: left - curStyle.width, lineShift: left },
          { isNearly: isNearly(curStyle.left + curHalfW, left + halfW), line: 'yc', dragShift: left + halfW - curHalfW, lineShift: left + halfW },
          { isNearly: isNearly(curStyle.left, right), line: 'yr', dragShift: right, lineShift: right },
          { isNearly: isNearly(curStyle.right, right), line: 'yr', dragShift: right - curStyle.width, lineShift: right },
        ]

        for (const cond of topConditions) {
          if (!cond.isNearly) continue
          const el = lineRefs.current[cond.line]
          if (el) el.style.top = `${cond.lineShift}px`
          const shift = curComponent.style.rotate !== 0
            ? Math.round(cond.dragShift - ((curComponent.style.height - curStyle.height) / 2))
            : cond.dragShift
          setShapeStyle(curComponent.id, { top: shift } as Partial<ComponentSchema['style']>, onChange)
          needToShow.push(cond.line)
        }
        for (const cond of leftConditions) {
          if (!cond.isNearly) continue
          const el = lineRefs.current[cond.line]
          if (el) el.style.left = `${cond.lineShift}px`
          const shift = curComponent.style.rotate !== 0
            ? Math.round(cond.dragShift - ((curComponent.style.width - curStyle.width) / 2))
            : cond.dragShift
          setShapeStyle(curComponent.id, { left: shift } as Partial<ComponentSchema['style']>, onChange)
          needToShow.push(cond.line)
        }

        if (needToShow.length) {
          chooseTheTrueLine(needToShow, isDownward, isRightward)
        }
      }
    },
  }), [hideLine, chooseTheTrueLine])

  return (
    <div className={styles.markLine}>
      {LINE_NAMES.map((name) => (
        <div
          key={name}
          ref={(el) => { lineRefs.current[name] = el }}
          className={`${styles.line} ${name.startsWith('x') ? styles.xline : styles.yline}`}
          style={{ display: 'none' }}
        />
      ))}
    </div>
  )
})

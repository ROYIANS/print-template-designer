import { describe, it, expect } from 'vitest'
import { RoySimpleText } from '../components/RoySimpleText'
import { DataBindingEngine } from '@ptd/core'
import type { ComponentSchema } from '@ptd/core'

function makeSchema(propValue: string): ComponentSchema {
  return {
    id: 'test-1',
    component: 'RoySimpleText',
    propValue,
    style: {
      width: 200,
      height: 40,
      rotate: 0,
      opacity: 1,
      fontSize: 12,
      color: '#212121',
      background: 'transparent',
      borderType: 'none',
    },
    groupStyle: {},
    position: {},
  }
}

describe('RoySimpleText', () => {
  it('mounts without throwing', () => {
    const schema = makeSchema('Hello World')
    const comp = new RoySimpleText(schema)
    const parent = document.createElement('div')
    expect(() => comp.mount(parent)).not.toThrow()
    expect(parent.querySelector('.ptd-simple-text')).toBeTruthy()
  })

  it('renders propValue as innerHTML', () => {
    const schema = makeSchema('Hello World')
    const comp = new RoySimpleText(schema)
    const parent = document.createElement('div')
    comp.mount(parent)
    const inner = parent.querySelector('.ptd-simple-text__inner')
    expect(inner?.innerHTML).toBe('Hello World')
  })

  it('resolves data binding with DataBindingEngine', () => {
    const schema = makeSchema('[::name::]')
    const comp = new RoySimpleText(schema)
    const parent = document.createElement('div')
    comp.mount(parent)

    const engine = new DataBindingEngine({ name: 'Alice' }, [])
    comp.resolveWithData(engine)

    const inner = parent.querySelector('.ptd-simple-text__inner')
    expect(inner?.innerHTML).toBe('Alice')
  })

  it('applies CSS variables for width and height', () => {
    const schema = makeSchema('test')
    const comp = new RoySimpleText(schema)
    expect(comp['container'].style.getPropertyValue('--ptd-width')).toBe('200px')
    expect(comp['container'].style.getPropertyValue('--ptd-height')).toBe('40px')
  })

  it('updates on schema change', () => {
    const schema = makeSchema('initial')
    const comp = new RoySimpleText(schema)
    const parent = document.createElement('div')
    comp.mount(parent)

    comp.update(makeSchema('updated'))
    const inner = parent.querySelector('.ptd-simple-text__inner')
    expect(inner?.innerHTML).toBe('updated')
  })

  it('destroys and removes from DOM', () => {
    const schema = makeSchema('bye')
    const comp = new RoySimpleText(schema)
    const parent = document.createElement('div')
    comp.mount(parent)
    expect(parent.children.length).toBe(1)
    comp.destroy()
    expect(parent.children.length).toBe(0)
  })
})

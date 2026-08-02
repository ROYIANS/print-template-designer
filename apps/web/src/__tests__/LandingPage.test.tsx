import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { LandingPage } from '../LandingPage'

class TestObserver {
  observe() {}
  disconnect() {}
}

describe('Landing page brand hero', () => {
  let container: HTMLDivElement
  let root: Root

  beforeEach(() => {
    container = document.createElement('div')
    document.body.append(container)
    root = createRoot(container)
    vi.stubGlobal('IntersectionObserver', TestObserver)
    vi.stubGlobal('ResizeObserver', TestObserver)
    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      value: vi.fn(() => ({
        matches: true,
        media: '(prefers-reduced-motion: reduce)',
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        addListener: vi.fn(),
        removeListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    })
  })

  afterEach(async () => {
    await act(async () => root.unmount())
    container.remove()
    vi.unstubAllGlobals()
  })

  it('uses one accessible Foliq wordmark as the hero title without the legacy P mark', async () => {
    await act(async () => {
      root.render(
        <LandingPage
          access={{
            kind: 'allowed',
            user: {
              id: 'user-1',
              name: 'Foliq Tester',
              email: 'foliq@example.test',
              image: null,
              authMode: 'dev-bypass',
            },
          }}
          onEnterApp={vi.fn()}
          onRetry={vi.fn()}
        />,
      )
    })

    const hero = container.querySelector('section[aria-labelledby="hero-title"]')
    const titles = container.querySelectorAll('h1')
    expect(hero).not.toBeNull()
    expect(titles).toHaveLength(1)
    expect(titles[0]?.id).toBe('hero-title')
    expect(titles[0]?.textContent?.trim()).toBe('Foliq')
    expect(titles[0]?.querySelector('pre[aria-hidden="true"]')).not.toBeNull()
    expect(hero?.textContent).toContain('不是设计一张图')
    expect(container.querySelector('[aria-label="Foliq 首页"] svg')).toBeNull()
    expect(container.querySelector('[aria-label="返回 Foliq 首页"] svg')).toBeNull()
    expect(container.querySelector('img[src*="ptd-mark"]')).toBeNull()
  })
})

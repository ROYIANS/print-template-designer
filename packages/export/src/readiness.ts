import type { OutputDiagnostic } from '@ptd/core'

const DEFAULT_TIMEOUT_MS = 10_000

export async function waitForOutputReady(
  root: HTMLElement,
  timeoutMs = DEFAULT_TIMEOUT_MS,
): Promise<readonly OutputDiagnostic[]> {
  const diagnostics: OutputDiagnostic[] = []
  const deadline = performance.now() + Math.max(1, timeoutMs)
  try {
    await withDeadline(waitForFonts(), deadline)
  } catch {
    diagnostics.push({
      severity: 'error',
      code: 'MISSING_FONT',
      message: '等待输出字体加载完成时超时。',
    })
  }
  try {
    await withDeadline(waitForComponentRenderers(root), deadline)
  } catch {
    // The remaining loading states are converted to component-specific diagnostics below.
  }
  diagnostics.push(...componentDiagnostics(root))
  diagnostics.push(...remoteResourceDiagnostics(root))
  const images = Array.from(root.querySelectorAll('img'))
  await Promise.all(
    images.map(async (image) => {
      try {
        await withDeadline(image.decode(), deadline)
      } catch {
        diagnostics.push({
          severity: 'error',
          code: 'IMAGE_LOAD_FAILED',
          message: '输出图片未能在截止时间前解码。',
        })
      }
    }),
  )
  try {
    await withDeadline(waitForStableLayout(root), deadline)
  } catch {
    diagnostics.push({
      severity: 'error',
      code: 'LAYOUT_TIMEOUT',
      message: '输出布局未能在截止时间前稳定。',
    })
  }
  return diagnostics
}

async function waitForFonts(): Promise<void> {
  if ('fonts' in document) await document.fonts.ready
}

async function waitForStableLayout(root: HTMLElement): Promise<void> {
  let previous = dimensions(root)
  for (let stableFrames = 0; stableFrames < 2; ) {
    await animationFrame()
    const current = dimensions(root)
    if (current === previous) stableFrames += 1
    else stableFrames = 0
    previous = current
  }
}

async function waitForComponentRenderers(root: HTMLElement): Promise<void> {
  while (root.querySelector('[data-render-state="loading"]')) await animationFrame()
}

function componentDiagnostics(root: HTMLElement): readonly OutputDiagnostic[] {
  return Array.from(
    root.querySelectorAll<HTMLElement>(
      '[data-render-state="error"], [data-render-state="loading"]',
    ),
  )
    .map((element): OutputDiagnostic | null => {
      const loading = element.dataset.renderState === 'loading'
      const sourceComponentId = element.closest<HTMLElement>('[data-ptd-source-component]')?.dataset
        .ptdSourceComponent
      if (element.classList.contains('ptd-qrcode')) {
        return {
          severity: 'error',
          code: 'QRCODE_RENDER_FAILED',
          message: loading ? '二维码未能在截止时间前完成渲染。' : '二维码渲染失败。',
          ...(sourceComponentId ? { sourceComponentId } : {}),
        }
      }
      if (element.classList.contains('ptd-barcode')) {
        return {
          severity: 'error',
          code: 'BARCODE_RENDER_FAILED',
          message: loading ? '条形码未能在截止时间前完成渲染。' : '条形码渲染失败。',
          ...(sourceComponentId ? { sourceComponentId } : {}),
        }
      }
      if (element.classList.contains('ptd-image')) {
        return {
          severity: 'error',
          code: 'IMAGE_LOAD_FAILED',
          message: loading ? '输出图片未能在截止时间前完成载入。' : '输出图片载入失败。',
          ...(sourceComponentId ? { sourceComponentId } : {}),
        }
      }
      return null
    })
    .filter((diagnostic): diagnostic is OutputDiagnostic => diagnostic !== null)
}

function remoteResourceDiagnostics(root: HTMLElement): readonly OutputDiagnostic[] {
  return Array.from(root.querySelectorAll<HTMLElement>('[data-ptd-remote-resource-blocked]')).map(
    (element) => ({
      severity: 'error',
      code: 'REMOTE_RESOURCE_BLOCKED',
      message: '远程图片不会在打印预览或 PDF 输出中加载，请改用已嵌入模板的图片。',
      ...(element.dataset.ptdRemoteResourceBlocked
        ? { sourceComponentId: element.dataset.ptdRemoteResourceBlocked }
        : {}),
    }),
  )
}

function dimensions(root: HTMLElement): string {
  return `${root.scrollWidth}:${root.scrollHeight}:${root.getBoundingClientRect().width}:${root.getBoundingClientRect().height}`
}

function animationFrame(): Promise<void> {
  return new Promise((resolve) => requestAnimationFrame(() => resolve()))
}

async function withDeadline<T>(promise: Promise<T>, deadline: number): Promise<T> {
  const remaining = Math.max(0, deadline - performance.now())
  let timeoutId: ReturnType<typeof setTimeout> | undefined
  const timeout = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error('Output readiness timed out')), remaining)
  })
  try {
    return await Promise.race([promise, timeout])
  } finally {
    if (timeoutId !== undefined) clearTimeout(timeoutId)
  }
}

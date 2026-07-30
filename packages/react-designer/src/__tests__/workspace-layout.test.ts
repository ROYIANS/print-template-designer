import { describe, expect, it } from 'vitest'
import {
  clampPanelWidth,
  DEFAULT_RESOURCE_PANEL,
  INSPECTOR_MAX,
  INSPECTOR_MIN,
  RESOURCE_PANEL_MAX,
  RESOURCE_PANEL_MIN,
  RESOURCE_PANEL_DEFAULT,
  workspaceModeForWidth,
} from '../hooks/useWorkspaceLayout'

describe('workspace layout contracts', () => {
  it('uses content-driven workspace modes at the documented boundaries', () => {
    expect(DEFAULT_RESOURCE_PANEL).toBe('pages')
    expect(workspaceModeForWidth(1179)).toBe('compact')
    expect(workspaceModeForWidth(1180)).toBe('standard')
    expect(workspaceModeForWidth(1439)).toBe('standard')
    expect(workspaceModeForWidth(1440)).toBe('wide')
  })

  it('keeps resizable panels inside recoverable bounds', () => {
    expect(RESOURCE_PANEL_DEFAULT).toBe(280)
    expect(clampPanelWidth('resources', 40)).toBe(RESOURCE_PANEL_MIN)
    expect(clampPanelWidth('resources', 999)).toBe(RESOURCE_PANEL_MAX)
    expect(clampPanelWidth('inspector', 40)).toBe(INSPECTOR_MIN)
    expect(clampPanelWidth('inspector', 999)).toBe(INSPECTOR_MAX)
  })
})

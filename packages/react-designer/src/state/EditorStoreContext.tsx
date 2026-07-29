import { createContext, useContext, type ReactNode } from 'react'
import type { EditorStore } from './editor'

const EditorStoreContext = createContext<EditorStore | null>(null)

interface EditorStoreProviderProps {
  store: EditorStore
  children: ReactNode
}

export function EditorStoreProvider({ store, children }: EditorStoreProviderProps) {
  return <EditorStoreContext.Provider value={store}>{children}</EditorStoreContext.Provider>
}

export function useEditorStore(): EditorStore {
  const store = useContext(EditorStoreContext)
  if (!store) throw new Error('useEditorStore must be used inside EditorStoreProvider')
  return store
}

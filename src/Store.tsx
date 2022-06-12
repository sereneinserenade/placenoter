import { atom } from 'recoil';

import { Note, QuickLink } from './types'

export const notesState = atom<Note[]>({
  key: 'notesState',
  default: []
})

export const binNotesState = atom<Note[]>({
  key: 'binNotes',
  default: []
})

export const quickLinks = atom<Record<string, QuickLink>>({
  key: 'quickLinks',
  default: {}
})

export const quickLinksOrder = atom<string[]>({
  key: 'quickLinksOrder',
  default: []
})

export const sidebarActiveState = atom<boolean>({
  key: 'sidebarActiveState',
  default: false
})

export const activeNoteState = atom<Note | undefined>({
  key: 'activeNoteState',
  default: undefined
})

export const editorSearchState = atom<string>({
  key: 'editorSearchState',
  default: ""
})

export const linkModalState = atom<boolean>({
  key: 'linkModalState',
  default: false
})

export const currentLinkUrlState = atom<string>({
  key: 'currentLinkUrlState',
  default: ''
})

export const spellCheckState = atom<boolean>({
  key: 'spellCheckState',
  default: true
})

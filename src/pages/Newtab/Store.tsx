import React from "react";
import { atom } from 'recoil';

import { Note } from './types'

export const notesState = atom<Note[]>({
  key: 'notesState',
  default: []
})

export const sidebarActiveState = atom<boolean>({
  key: 'sidebarActiveState',
  default: true
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

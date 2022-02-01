import { getBucket } from '@extend-chrome/storage';
import React, { useEffect, useState, EffectCallback } from "react";
import { Note } from './types'
import { v4 as uuidv4 } from 'uuid'

const Context = React.createContext({});

type ContextProviderProps = {
  children: any
}

interface ContextInterface {
  notes: Note[]
  setNotes: Function

  sidebarActive: boolean
  setSidebarActive: Function

  activeNote: Note
  setActiveNote: Function

  createNewNoteAndSetItAsActiveNote: Function
}

interface BucketData {
  notes: Note[]
}

export const bucket = getBucket<BucketData>('pagenoter', 'sync')

const ContextProvider = ({ children }: ContextProviderProps) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [sidebarActive, setSidebarActive] = useState<boolean>(true);
  const [activeNote, setActiveNote] = useState<Note | undefined>(undefined);

  // saves notes to sync whenever changed
  useEffect(() => {
    debugger
    bucket.set({ notes })
  }, [notes])

  // finds activeNote and Updates it
  useEffect(() => {
    debugger
    if (!activeNote) return
    const { id } = activeNote

    const noteIndex = notes.findIndex((n) => n?.id === id)
    const foundNote = notes[noteIndex]

    if (activeNote.content === foundNote.content) return

    const copyOfNotes = [...notes.slice()]

    copyOfNotes[noteIndex] = activeNote

    setNotes(copyOfNotes)
  }, [activeNote])

  const useMountEffect = (fun: EffectCallback) => useEffect(fun, [])

  const fetchNotesFromSyncStorage = () => {

    bucket.getKeys().then((keys) => {
      debugger
      if (keys.includes('notes')) bucket.get(({ notes }) => {
        debugger
        setNotes(notes)
      })
      else bucket.set({ notes: [] })
    })
  }

  const createNewNoteAndSetItAsActiveNote = () => {
    const newNote: Note = {
      id: uuidv4(),
      content: '',
      timestamp: new Date(),
      title: ''
    }

    setActiveNote(JSON.parse(JSON.stringify(newNote)))

    notes.push(newNote)
  }

  useMountEffect(fetchNotesFromSyncStorage)

  return (
    <Context.Provider
      value={{
        notes,
        setNotes,

        sidebarActive,
        setSidebarActive,

        activeNote,
        setActiveNote,

        createNewNoteAndSetItAsActiveNote
      }}
    >
      {children}
    </Context.Provider>
  );
}

export { Context, ContextInterface, ContextProvider };

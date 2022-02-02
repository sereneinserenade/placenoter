import React, { useState } from "react";
import { Note } from './types'

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
}

interface BucketData {
  notes: string
}

const { storage } = chrome

const ContextProvider = ({ children }: ContextProviderProps) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [sidebarActive, setSidebarActive] = useState<boolean>(true);
  const [activeNote, setActiveNote] = useState<Note | undefined>(undefined);

  const state = {
    notes,
    setNotes,

    sidebarActive,
    setSidebarActive,

    activeNote,
    setActiveNote,
  }

  return (
    <Context.Provider value={state} >
      {children}
    </Context.Provider>
  );
}

export { Context, ContextInterface, ContextProvider };

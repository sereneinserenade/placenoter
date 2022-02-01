import { getBucket } from '@extend-chrome/storage';
import React, { useEffect, useState, EffectCallback } from "react";
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
}

interface BucketData {
  notes: Note[]
}

export const bucket = getBucket<BucketData>('pagenoter', 'sync')

const ContextProvider = ({ children }: ContextProviderProps) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [sidebarActive, setSidebarActive] = useState<boolean>(true);

  const useMountEffect = (fun: EffectCallback) => useEffect(fun, [])

  const fetchNotesFromSyncStorage = () => {
    bucket.getKeys().then((keys) => {
      if (keys.includes('notes')) bucket.get(({ notes }) => setNotes(notes))
      else bucket.set({ notes: [] })
    })
  }

  // saves notes to sync whenever changed
  useEffect(() => { bucket.set({ notes }) }, [notes])

  useMountEffect(fetchNotesFromSyncStorage)

  return (
    <Context.Provider
      value={{
        notes,
        setNotes,
        sidebarActive,
        setSidebarActive,
      }}
    >
      {children}
    </Context.Provider>
  );
}

export { Context, ContextInterface, ContextProvider };

import { Container, FormElement, Input, Link } from '@nextui-org/react';
import React, { EffectCallback, useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid'
import { useRecoilState, useRecoilValue } from 'recoil';

import { EditorAreaContainer, Maintop, Sidebar, Tiptap } from './components';
import { notesState, activeNoteState, sidebarActiveState } from './Store';
import { Note } from './types';

const { storage } = chrome

function Main() {
  const sidebarActive = useRecoilValue(sidebarActiveState)

  const [notes, setNotes] = useRecoilState(notesState)

  const [activeNote, setActiveNote] = useRecoilState(activeNoteState)

  const [notesFetchedFromDb, setNotesFetchedFromDb] = useState(false)

  const useMountEffect = (fun: EffectCallback) => useEffect(fun, [])

  // finds activeNote and Updates it
  useEffect(() => {
    if (!activeNote) return

    const noteIndex = notes.findIndex((n) => n?.id === activeNote.id)
    const foundNote = notes[noteIndex]

    if (activeNote?.content === foundNote?.content && activeNote?.title === foundNote?.title) return

    const copyOfNotes = [...notes.slice()]

    if (activeNote) {
      copyOfNotes[noteIndex] = activeNote
      setNotes(copyOfNotes)
    }
  }, [activeNote])

  useEffect(() => {
    if (notesFetchedFromDb) storage.sync.set({ dbnotes: notes })
  }, [notes])


  const createNewNoteAndSetItAsActiveNote = () => {
    const newNote: Note = {
      id: uuidv4(),
      content: '',
      timestamp: `${new Date()}`,
      title: '',
      textContent: ''
    }

    setActiveNote(undefined)

    setTimeout(() => {
      setActiveNote(JSON.parse(JSON.stringify(newNote)))
      setNotes([newNote, ...notes])
    })
  }

  const fetchNotesFromSyncStorage = () => {
    // storage.sync.set({ dbnotes: [] })

    storage.sync.get('dbnotes', ({ dbnotes }) => {
      if (dbnotes) setNotes(dbnotes)
      else storage.sync.set({ dbnotes: [] })

      setNotesFetchedFromDb(true)
    })
  }

  useMountEffect(fetchNotesFromSyncStorage)

  const onCreateNewNoteClicked = (e: React.MouseEvent<unknown, MouseEvent>) => {
    e.preventDefault()
    e.stopPropagation()

    createNewNoteAndSetItAsActiveNote()
  }
  return (
    <main className="placenoter">
      <Sidebar />

      <section className={`note-content h-full ${!sidebarActive ? 'full' : ''}`}>
        <Maintop />

        {
          activeNote?.id ?
            (
              <main className='editor-area'>
                <EditorAreaContainer />
              </main>
            ) : (
              <main className='no-note-selected flex h-full'>
                <h1> No Note selected </h1>

                <h3 className='flex'>
                  Select or <Link onClick={(e) => onCreateNewNoteClicked(e)} > &nbsp; create a new &nbsp; </Link>  note.
                </h3>
              </main>
            )
        }


      </section>
    </main>
  )
}

export default Main
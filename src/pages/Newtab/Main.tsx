import { Container, FormElement, Input, Link } from '@nextui-org/react';
import React, { EffectCallback, useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid'
import { useRecoilState, useRecoilValue } from 'recoil';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.min.css';

import { EditorAreaContainer, Maintop, Sidebar, Tiptap } from './components';
import { notesState, activeNoteState, sidebarActiveState } from './Store';
import { Note } from './types';
import PlaceNoterLogo from '../../assets/img/logo.svg';
import './Main.scss'
import { debounce } from 'lodash';


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

  const setNotesInLocalStorage = () => storage.local.set({ dbnotes: notes })

  const debouncedSetNotesInLocalStorage = debounce(setNotesInLocalStorage, 300)

  useEffect(() => { notesFetchedFromDb && debouncedSetNotesInLocalStorage() }, [notes])

  const checkIfAnEmptyNoteExists = (): Note | undefined => {
    return notes.find((n) => n.title.trim() === "" && n.textContent.trim() === "")
  }

  const createNewNoteAndSetItAsActiveNote = () => {
    const emptyNoteInNotesList = checkIfAnEmptyNoteExists()
    if (emptyNoteInNotesList) {
      setActiveNote(undefined)
      setTimeout(() => setActiveNote(emptyNoteInNotesList))

      return
    }

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
    // storage.local.set({ dbnotes: [] })

    storage.local.get('dbnotes', ({ dbnotes }) => {
      if (dbnotes) setNotes(dbnotes)
      else storage.local.set({ dbnotes: [] })

      setNotesFetchedFromDb(true)

      storage.local.get('lastActiveNoteId', ({ lastActiveNoteId }) => {
        const foundNote = dbnotes.find((n: Note) => n.id === lastActiveNoteId)
        setActiveNote(foundNote)
      })
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
                <img className='logo' src={PlaceNoterLogo} alt="PlaceNoterLogo" />

                <h1> No Note selected </h1>

                <h3 className='flex'>
                  Select or <Link color='primary' onClick={(e) => onCreateNewNoteClicked(e)} > &nbsp; create a new &nbsp; </Link>  note.
                </h3>
              </main>
            )
        }


      </section>

      <ToastContainer
        position="bottom-left"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </main>
  )
}

export default Main
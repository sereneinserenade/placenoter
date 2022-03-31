import { Container, FormElement, Input, Link } from '@nextui-org/react';
import React, { EffectCallback, useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid'
import { useRecoilState, useRecoilValue } from 'recoil';
// import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.min.css';

import { EditorAreaContainer, Maintop, Sidebar, QuickLinks } from './components';
import { notesState, activeNoteState, sidebarActiveState, binNotesState } from './Store';
import { Note } from './types';
import PlaceNoterLogo from '../../assets/img/logo.svg';
import './Main.scss'
import { debounce } from 'lodash';


const { storage } = chrome

function Main() {
  const sidebarActive = useRecoilValue(sidebarActiveState)

  const [notes, setNotes] = useRecoilState(notesState)

  const [binNotes, setBinNotes] = useRecoilState(binNotesState)

  const [activeNote, setActiveNote] = useRecoilState(activeNoteState)

  const [notesFetchedFromDb, setNotesFetchedFromDb] = useState(false)

  const [binNotesFetchedFromDb, setBinNotesFetchedFromDb] = useState(false)

  const [internetSearchText, setInternetSearchText] = useState('')

  const useMountEffect = (fun: EffectCallback) => useEffect(fun, [])

  // finds activeNote and Updates it
  useEffect(() => {
    if (!activeNote) return

    const binNoteIndex = binNotes.findIndex((n) => n?.id === activeNote.id)

    const isInBin = binNoteIndex >= 0

    const noteIndex = notes.findIndex((n) => n?.id === activeNote.id)

    if (isInBin) {
      const foundNote = binNotes[binNoteIndex]

      if (activeNote?.content === foundNote?.content && activeNote?.title === foundNote?.title) return

      const copyOfNotes = [...binNotes.slice()]

      if (activeNote) {
        copyOfNotes[binNoteIndex] = activeNote
        setBinNotes(copyOfNotes)
      }

      return
    } else if (noteIndex >= 0) {

      const foundNote = notes[noteIndex]

      if (activeNote?.content === foundNote?.content && activeNote?.title === foundNote?.title) return

      const copyOfNotes = [...notes.slice()]

      if (activeNote) {
        copyOfNotes[noteIndex] = activeNote
        setNotes(copyOfNotes)
      }

      return
    }

    const { id, title } = activeNote

    debugger

    console.error(`This activeNote is not inside \`notes\` and \`binNotes\` \n ${JSON.stringify({ id, title })}`)
  }, [activeNote])

  const setNotesInLocalStorage = () => storage.local.set({ dbnotes: notes })

  const debouncedSetNotesInLocalStorage = debounce(setNotesInLocalStorage, 300)

  useEffect(() => { notesFetchedFromDb && debouncedSetNotesInLocalStorage() }, [notes])

  const setBinNotesInLocalStorage = () => storage.local.set({ binNotes })

  const debouncedSetBinNotesInLocalStorage = debounce(setBinNotesInLocalStorage, 300)

  useEffect(() => { binNotesFetchedFromDb && debouncedSetBinNotesInLocalStorage() }, [binNotes])

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
      setNotes([newNote, ...notes])
      setActiveNote(newNote)
    })
  }

  const fetchNotesFromSyncStorage = () => {
    // storage.local.set({ dbnotes: [] })

    storage.local.get('dbnotes', ({ dbnotes }) => {
      if (dbnotes) setNotes(dbnotes)
      else storage.local.set({ dbnotes: [] })

      setNotesFetchedFromDb(true)
    })

    storage.local.get('binNotes', ({ binNotes }) => {
      if (binNotes) {
        setBinNotes(binNotes)
      } else storage.local.set({ binNotes: [] })

      setBinNotesFetchedFromDb(true)
    })
  }

  useMountEffect(fetchNotesFromSyncStorage)

  const onCreateNewNoteClicked = (e: React.MouseEvent<unknown, MouseEvent>) => {
    e.preventDefault()
    e.stopPropagation()

    createNewNoteAndSetItAsActiveNote()
  }

  const searchInternet = (text: string) => {
    window.location.href = `https://google.com/search?q=${text}`
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
              <main className='no-note-selected flex flex-col h-full'>
                {/* <img className='logo' src={PlaceNoterLogo} alt="PlaceNoterLogo" />

                <h1> No Note selected </h1>

                <h3 className='flex'>
                  Select or <Link color='primary' onClick={(e) => onCreateNewNoteClicked(e)} > &nbsp; create a new &nbsp; </Link>  note.
                </h3> */}

                <Input
                  bordered
                  placeholder="Search Google..."
                  onInput={(e) => setInternetSearchText((e.target as HTMLInputElement).value)}
                  onKeyPress={(e) => e.code === 'Enter' && searchInternet(internetSearchText)}
                  css={{
                    width: '50ch'
                  }}
                />

                <QuickLinks />



              </main>
            )
        }


      </section>

      {/* <ToastContainer
        position="bottom-left"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick={false}
        pauseOnFocusLoss={false}
        draggable={false}
        pauseOnHover={false}
        closeButton={false}
      /> */}
    </main>
  )
}

export default Main

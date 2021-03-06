import { Input, Loading } from '@nextui-org/react';
import { debounce } from 'lodash';
import { EffectCallback, useCallback, useEffect, useRef, useState } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import { v4 as uuidv4 } from 'uuid';

import PlaceNoterLogo from './assets/logo.svg';

import { EditorAreaContainer, Maintop, QuickLinks, Sidebar } from './components';
import './Main.scss';
import { activeNoteState, binNotesState, notesState, sidebarActiveState } from './Store';
import { Note } from './types';

const { storage } = chrome

function Main() {
  const sidebarActive = useRecoilValue(sidebarActiveState)

  const [notes, setNotes] = useRecoilState(notesState)

  const [binNotes, setBinNotes] = useRecoilState(binNotesState)

  const [activeNote, setActiveNote] = useRecoilState(activeNoteState)

  const [notesFetchedFromDb, setNotesFetchedFromDb] = useState(false)

  const [binNotesFetchedFromDb, setBinNotesFetchedFromDb] = useState(false)

  const [internetSearchText, setInternetSearchText] = useState('')

  const [loading, setLoading] = useState<boolean>(false)

  const searchInputEl = useRef(null);

  const focusSearchInput = useCallback(() => {
    (searchInputEl.current as unknown as HTMLInputElement).focus();
  }, [searchInputEl])

  useEffect(() => {
    if (activeNote?.id) return

    focusSearchInput()
  }, [activeNote])

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

  useMountEffect(() => { setTimeout(focusSearchInput, 500) })

  const searchInternet = (text: string) => {
    setLoading(true)

    window.location.href = `https://google.com/search?q=${text}`
  }

  return (
    <main className="placenoter" aria-label='main-section'>
      <Sidebar />

      <section className={`note-content h-full ${!sidebarActive ? 'full' : ''}`} aria-label='note-content-section'>
        <Maintop />

        {
          activeNote?.id ?
            (
              <section className='editor-area' aria-label='editor-area-container'>
                <EditorAreaContainer />
              </section>
            ) : (
              <section className='no-note-selected flex flex-col h-full' aria-label='home-page-section'>
                <img className='logo' src={PlaceNoterLogo} alt="PlaceNoterLogo" />

                <Input
                  bordered
                  labelPlaceholder="Search Google..."
                  onInput={(e) => setInternetSearchText((e.target as HTMLInputElement).value)}
                  onKeyPress={(e) => e.code === 'Enter' && searchInternet(internetSearchText)}
                  size="xl"
                  css={{ width: '50ch' }}
                  ref={searchInputEl}
                  tabIndex={1}
                  contentRight={loading && <Loading css={{ transform: 'translateX(-1rem)' }} />}
                />

                <QuickLinks />
              </section>
            )
        }
      </section>
    </main>
  )
}

export default Main

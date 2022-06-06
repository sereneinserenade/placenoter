import React, { useCallback, useEffect, useState } from 'react';
import { Button, Input, Link, Text, Tooltip } from '@nextui-org/react';
import { useRecoilState } from 'recoil';
import { format } from 'date-fns'
import { v4 as uuidv4 } from 'uuid'
import { RiArrowLeftSLine, RiDeleteBin2Line } from 'react-icons/ri';
import { useLocalStorage } from 'react-use';

import { sidebarActiveState, activeNoteState, notesState, editorSearchState, binNotesState } from '../Store'
import { Note } from '../types';

import './css/Sidebar.scss'
import { NotePreview } from './note/NotePreview';
import { stopPrevent } from '../utils';

const { storage } = chrome

const Sidebar = () => {
  const [sidebarActive, setSidebarActive] = useRecoilState(sidebarActiveState)

  const [activeNote, setActiveNote] = useRecoilState(activeNoteState)

  const [globalSearchTerm, setGlobalSearchTerm] = useRecoilState(editorSearchState)

  const [notes, setNotes] = useRecoilState(notesState)

  const [binNotes, setBinNotes] = useRecoilState(binNotesState)

  const [isBinActive, setIsBinActive] = useState(false)

  const [pinnedNoteIds, setPinnedNoteIds] = useState<string[]>([])

  const [pinnedNoteIdsFetchedFromStorage, setPinnedNoteIdsFetchedFromStorage] = useState(false)

  const [isSidebarOpen, setIsSidebarOpen, remove] = useLocalStorage('sidebar-active', 'false');

  useEffect(() => {
    setTimeout(() => isSidebarOpen && setSidebarActive(!!['false', 'true'].indexOf(isSidebarOpen)), 100)
  }, [])

  useEffect(() => { setIsSidebarOpen(`${Boolean(sidebarActive)}`) }, [sidebarActive])

  const returnFormattedDateString = (timestamp: Date) => format(new Date(timestamp), 'PPpp')

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

  const changeActiveNoteTo = (note: Note) => {
    if (activeNote?.id === note.id) return

    setActiveNote(undefined)

    setTimeout(() => setActiveNote(note))
  }

  const updateNote = (updatedNote: Note) => {
    const { id } = updatedNote

    const isInBin = binNotes.find(({ id: bnId }) => bnId === id)

    const localNotes: Note[] = isInBin ? JSON.parse(JSON.stringify(binNotes)) : JSON.parse(JSON.stringify(notes))

    const index = localNotes.findIndex(n => n.id === id)

    localNotes[index] = JSON.parse(JSON.stringify(updatedNote))

    if (isInBin) setBinNotes(localNotes)
    else setNotes(localNotes)

    if (updatedNote.id !== activeNote?.id) return

    setActiveNote(undefined)

    setTimeout(() => setActiveNote(JSON.parse(JSON.stringify(updatedNote))))
  }

  const setNoteTitle = (note: Note, newTitle: string) => updateNote({ ...note, title: newTitle })

  const deleteNote = (id: string, source: 'normal' | 'bin' = 'normal') => {
    const isBin = source === 'bin'

    const localNotes: Note[] = JSON.parse(JSON.stringify(isBin ? binNotes : notes))

    const index = localNotes.findIndex((n) => n.id === id)

    const noteToBeDeleted = JSON.parse(JSON.stringify(localNotes[index]))

    localNotes.splice(index, 1)

    if (isBin) setBinNotes(JSON.parse(JSON.stringify(localNotes)))
    else setNotes(JSON.parse(JSON.stringify(localNotes)))

    if (activeNote?.id === id) setActiveNote(undefined)

    return noteToBeDeleted
  }

  const moveNoteToBin = (note: Note) => {
    const { id } = note

    // Removing note from `notes`
    setNotes(JSON.parse(JSON.stringify(notes.filter(n => n.id !== id))))

    // Adding note to `binNotes`
    // TODO: don't need so much vars/consts
    setBinNotes(JSON.parse(JSON.stringify([note, ...binNotes])))
  }

  const initiateMoveToBin = (e: any, note: Note) => {
    if (e) stopPrevent(e)

    moveNoteToBin(note)
  }

  const recycleNote = (note: Note) => {
    setNotes(JSON.parse(JSON.stringify([note, ...notes])))

    setBinNotes(JSON.parse(JSON.stringify(binNotes.filter(n => n.id !== note.id))))
  }

  const initiateRecycleNote = (e: any, note: Note) => {
    if (e) stopPrevent(e)

    recycleNote(note)
  }

  const initiateDeletePermanently = (e: any, note: Note) => {
    if (e) stopPrevent(e)

    deleteNote(note.id, 'bin')
  }

  const filterNotes = useCallback((notes: Note[], searchTerm: string) => {
    return notes
      .filter(({ textContent, title }) => {
        return title.toLowerCase().includes(searchTerm) || textContent.replaceAll('\n\n', ' ').toLowerCase().includes(searchTerm)
      })
  }, [])

  useEffect(() => {
    storage.local.get('pinnedNoteIds', ({ pinnedNoteIds }) => {
      if (pinnedNoteIds) setPinnedNoteIds(pinnedNoteIds)
      else setPinnedNoteIds([])

      setPinnedNoteIdsFetchedFromStorage(true)
    })
  }, [])

  useEffect(() => { pinnedNoteIdsFetchedFromStorage && storage.local.set({ pinnedNoteIds }) }, [pinnedNoteIds])

  const togglePin = (note: Note) => {
    const pinIndex = pinnedNoteIds.indexOf(note.id)
    const isPinned = pinIndex !== -1

    const localPinnedNoteIds = [...pinnedNoteIds]

    if (isPinned) localPinnedNoteIds.splice(pinIndex, 1)
    else localPinnedNoteIds.unshift(note.id)

    setPinnedNoteIds(localPinnedNoteIds)
  }

  const GimmeNotesToShow = () => {
    let lowerCaseSearchTerm = globalSearchTerm.toLowerCase().trim()

    if (isBinActive) {
      let localBinNotes: Note[] = binNotes

      if (lowerCaseSearchTerm) localBinNotes = filterNotes(localBinNotes, lowerCaseSearchTerm)

      return (
        <>
          <section className='bin-top-section flex justify-between' aria-label='bin-top-section'>
            <Text
              h3
              css={{
                padding: '0.5em 10px',
                fontWeight: 400
              }}
            >
              Bin here 👋, you can <Link onClick={() => setIsBinActive(false)}> {'Go Back <'} </Link>
            </Text>
          </section>

          {
            localBinNotes.length
              ? (
                <section className='bin-section' aria-label='bin-section'>
                  {
                    localBinNotes.map((note: Note) => {
                      return (
                        <NotePreview
                          activeNote={activeNote}
                          initiateMoveToBin={initiateMoveToBin}
                          isBin={true}
                          note={note}
                          onClick={() => changeActiveNoteTo(note)}
                          returnFormattedDateString={returnFormattedDateString}
                          setNoteTitle={setNoteTitle}
                          key={note.id}
                          initiateRecycleNote={initiateRecycleNote}
                          initiateDeletePermanently={initiateDeletePermanently}
                          isPinned={false}
                        />
                      )
                    })
                  }
                </section>
              )
              : (
                <Text css={{
                  fontWeight: 400,
                  margin: '0 0 0 10px',
                  fontSize: '1.1em'
                }}>
                  Bin is Empty.
                </Text>
              )
          }
        </>
      )
    }

    const pinnedNotes = pinnedNoteIds
      .map((id) => notes.find(({ id: noteId }) => id === noteId) as Note)
      .filter(Boolean)

    const notPinnedNotes = notes.filter(({ id }) => !pinnedNoteIds.includes(id))

    let localNotes = [...pinnedNotes, ...notPinnedNotes]

    if (lowerCaseSearchTerm) localNotes = filterNotes(localNotes, lowerCaseSearchTerm)

    return (
      !!localNotes.length
        ? (localNotes.map((note: Note) => (<NotePreview
          activeNote={activeNote}
          initiateMoveToBin={initiateMoveToBin}
          isBin={false}
          note={note}
          onClick={() => changeActiveNoteTo(note)}
          returnFormattedDateString={returnFormattedDateString}
          setNoteTitle={setNoteTitle}
          key={note.id}
          togglePin={togglePin}
          isPinned={pinnedNoteIds.includes(note.id)}
        />)))
        : (
          <Text css={{
            fontWeight: 400,
            margin: '1rem 0 0 10px',
            fontSize: '1.1em'
          }}>
            No notes here, <Link onClick={createNewNoteAndSetItAsActiveNote}> Create a note + </Link>
          </Text>
        )
    )
  }

  return (
    <aside className={`sidebar ${sidebarActive ? 'active' : ''}`}>
      <section className='sidebar-top flex' aria-label='sidebar-top'>
        <Input
          fullWidth={true}
          placeholder='Search in all notes...'
          type="search"
          bordered
          value={globalSearchTerm}
          onInput={e => setGlobalSearchTerm((e.target as HTMLInputElement).value)}
        />
      </section>

      <section className='sidebar-notes-list' aria-label='sidebar-notes-list-section'>
        {GimmeNotesToShow()}
      </section>

      <article className='bin-button' aria-label='bin-button-section'>
        <Tooltip content={isBinActive ? 'Go Back' : 'Go to Recycle Bin'} placement='right'>
          <Button size='sm' auto ghost icon={isBinActive ? <RiArrowLeftSLine /> : <RiDeleteBin2Line />} onClick={() => setIsBinActive(!isBinActive)} />
        </Tooltip>
      </article>
    </aside>
  )
}

export default Sidebar

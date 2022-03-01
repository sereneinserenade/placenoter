import React, { useCallback, useState } from 'react';
import { Button, Container, Input, Link, Row, Text, Tooltip } from '@nextui-org/react';
import { useRecoilState, useRecoilValue } from 'recoil';
import { format } from 'date-fns'
import { v4 as uuidv4 } from 'uuid'

import { sidebarActiveState, activeNoteState, notesState, editorSearchState, binNotesState } from '../Store'
import { Note } from '../types';

import './Sidebar.scss'
import { FiTrash2 } from 'react-icons/fi';
import { RiArrowLeftSLine, RiDeleteBin2Line, RiRecycleLine } from 'react-icons/ri';
// import { toast } from 'react-toastify';

const { storage } = chrome

const Sidebar = () => {
  const sidebarActive = useRecoilValue(sidebarActiveState)

  const [activeNote, setActiveNote] = useRecoilState(activeNoteState)

  const [globalSearchTerm, setGlobalSearchTerm] = useRecoilState(editorSearchState)

  const [notes, setNotes] = useRecoilState(notesState)

  const [binNotes, setBinNotes] = useRecoilState(binNotesState)

  const [isBinActive, setIsBinActive] = useState(false)

  const returnFormattedDateString = (timestamp: Date) => {
    return format(new Date(timestamp), 'PPpp')
  }

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

  const changeActiveNoteTo = (note: Note) => {
    if (activeNote?.id === note.id) return

    setActiveNote(undefined)

    setTimeout(() => setActiveNote(note))

    storage.local.set({ lastActiveNoteId: note?.id })
  }

  const setNoteTitle = (note: Note, newTitle: string) => {
    const { id } = note

    const localNotes: Note[] = JSON.parse(JSON.stringify(notes))

    const index = localNotes.findIndex(n => n.id === id)

    const newNote = { ...note, title: newTitle }

    localNotes[index] = JSON.parse(JSON.stringify(newNote))

    setNotes(localNotes)

    if (note.id === activeNote?.id) setActiveNote(JSON.parse(JSON.stringify(newNote)))
  }

  const GetNoteTitle = (note: Note) => (<input
    placeholder='Add Title...'
    className='title-editor-input'
    onClick={e => e.stopPropagation()}
    value={note.title}
    onInput={e => setNoteTitle(note, (e as any).target.value)}
  />)


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

  const initiateDelete = (e: any, note: Note) => {
    if (e) {
      (e as MouseEvent).stopPropagation();
      (e as MouseEvent).preventDefault()
    }

    deleteNote(note.id)
  }

  const moveNoteToBin = (note: Note) => {
    const { id } = note

    // Adding note to `binNotes`
    setBinNotes(JSON.parse(JSON.stringify([note, ...binNotes])))

    // Removing note from `notes`
    setNotes(JSON.parse(JSON.stringify(notes.filter(n => n.id !== id))))
  }

  const initiateMoveToBin = (e: any, note: Note) => {
    if (e) {
      (e as MouseEvent).stopPropagation();
      (e as MouseEvent).preventDefault()
    }

    moveNoteToBin(note)
  }

  const recycleNote = (note: Note) => {
    setNotes(JSON.parse(JSON.stringify([note, ...notes])))

    setBinNotes(JSON.parse(JSON.stringify(binNotes.filter(n => n.id !== note.id))))
  }

  const initiateRecycleNote = (e: any, note: Note) => {
    if (e) {
      (e as MouseEvent).stopPropagation();
      (e as MouseEvent).preventDefault()
    }

    recycleNote(note)
  }

  const initiateDeletePermanently = (e: any, note: Note) => {
    if (e) {
      (e as MouseEvent).stopPropagation();
      (e as MouseEvent).preventDefault()
    }

    deleteNote(note.id, 'bin')
  }

  const filterNotes = useCallback((notes: Note[], searchTerm: string) => {
    return notes
      .filter(({ textContent, title }) => {
        return title.toLowerCase().includes(searchTerm) || textContent.replaceAll('\n\n', ' ').toLowerCase().includes(searchTerm)
      })
  }, [])

  const GimmeNotesToShow = () => {
    let lowerCaseSearchTerm = globalSearchTerm.toLowerCase().trim()

    if (isBinActive) {
      let localBinNotes: Note[] = binNotes

      if (lowerCaseSearchTerm) localBinNotes = filterNotes(localBinNotes, lowerCaseSearchTerm)

      return (
        <>
          <section className='bin-top-section flex justify-between'>
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
                <section className='bin-section'>
                  {
                    localBinNotes.map((note: Note) => {
                      return (
                        <article
                          onClick={() => changeActiveNoteTo(note)}
                          key={note.id}
                          className={`sidebar-note ${note.id === activeNote?.id ? 'active' : ''}`}
                        >
                          <section className='title-and-action-center flex'>
                            {GetNoteTitle(note)}
                            <Tooltip
                              placement='top'
                              content={'Recycle'}
                            >
                              <Button
                                color="primary"
                                auto
                                ghost
                                size='sm'
                                onClick={(e) => initiateRecycleNote(e, note)}
                                icon={<RiRecycleLine />}
                              />
                            </Tooltip>
                            <Tooltip
                              placement='right'
                              content={'Delete Permanently'}
                            >
                              <Button
                                color="error"
                                auto
                                ghost
                                size='sm'
                                onClick={(e) => initiateDeletePermanently(e, note)}
                                icon={<FiTrash2 />}
                              />
                            </Tooltip>
                          </section>
                          {
                            note.textContent.trim().length
                              ? <Text> {note.textContent.length >= 40 ? note.textContent.substring(0, 40).trim() + '...' : note.textContent} </Text>
                              : <Text color="gray"> {'No content...'} </Text>
                          }
                          <Text size={12}> {returnFormattedDateString(new Date(note.timestamp))} </Text>
                        </article>
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

    let localNotes: Note[] = notes

    if (lowerCaseSearchTerm) localNotes = filterNotes(localNotes, lowerCaseSearchTerm)

    return (
      !!localNotes.length
        ? (localNotes.map((note: Note) => (<article
          onClick={() => changeActiveNoteTo(note)}
          key={note.id}
          className={`sidebar-note ${note.id === activeNote?.id ? 'active' : ''}`}
        >
          <section className='title-and-action-center flex'>
            {GetNoteTitle(note)}
            <Tooltip
              placement='right'
              content={'Move to Bin'}
            >
              <Button
                color="error"
                auto
                ghost
                size='sm'
                onClick={(e) => initiateMoveToBin(e, note)}
                icon={<FiTrash2 />}
              />
            </Tooltip>
          </section>
          {
            note.textContent.trim().length
              ? <Text> {note.textContent.length >= 40 ? note.textContent.substring(0, 40).trim() + '...' : note.textContent} </Text>
              : <Text color="gray"> {'No content...'} </Text>
          }
          <Text size={12}> {returnFormattedDateString(new Date(note.timestamp))} </Text>
        </article>
        )))
        : (
          <Text css={{
            fontWeight: 400,
            margin: '1rem 0 0 10px',
            fontSize: '1.1em'
          }}>
            No notes here, <Link onClick={createNewNoteAndSetItAsActiveNote}> Create one + </Link>
          </Text>
        )
    )
  }

  return (
    <aside className={`sidebar ${sidebarActive ? 'active' : ''}`}>
      <section className='sidebar-top flex'>
        <Input
          underlined
          fullWidth={true}
          placeholder='Search notes...'
          type="search"
          value={globalSearchTerm}
          onInput={e => setGlobalSearchTerm((e.target as HTMLInputElement).value)}
        />
      </section>

      <section className='sidebar-notes-list'>
        {GimmeNotesToShow()}
      </section>

      <article className='bin-button'>
        <Tooltip content={isBinActive ? 'Go Back' : 'Go to Recycle Bin'} placement='right'>
          <Button size='sm' auto ghost icon={isBinActive ? <RiArrowLeftSLine /> : <RiDeleteBin2Line />} onClick={() => setIsBinActive(!isBinActive)} />
        </Tooltip>
      </article>
    </aside>
  )
}

export default Sidebar
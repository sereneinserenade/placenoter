import React, { useState } from 'react';
import { Button, Input, Text, Tooltip } from '@nextui-org/react';
import { useRecoilState, useRecoilValue } from 'recoil';
import { format } from 'date-fns'

import { sidebarActiveState, activeNoteState, notesState } from '../Store'
import { Note } from '../types';

import './Sidebar.scss'
import { FiTrash2 } from 'react-icons/fi';

const { storage } = chrome

const Sidebar = () => {
  const sidebarActive = useRecoilValue(sidebarActiveState)

  const [activeNote, setActiveNote] = useRecoilState(activeNoteState)

  const [notes, setNotes] = useRecoilState(notesState)

  const [searchTerm, setSearchTerm] = useState<string>("")

  const returnFormattedDateString = (timestamp: Date) => {
    return format(new Date(timestamp), 'PPpp')
  }

  const changeActiveNoteTo = (note: Note) => {
    if (activeNote?.id === note.id) return

    setActiveNote(undefined)

    setTimeout(() => setActiveNote(note))

    storage.sync.set({ lastActiveNoteId: note?.id })
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

  const getNoteTitle = (note: Note) => {
    return <input placeholder='Add Title...' className='title-editor-input' onClick={e => e.stopPropagation()} value={note.title} onInput={e => setNoteTitle(note, (e as any).target.value)} />
  }

  const deleteNote = (e: any, id: string) => {
    if (e) {
      (e as MouseEvent).stopPropagation();
      (e as MouseEvent).preventDefault()
    }

    const localNotes: Note[] = JSON.parse(JSON.stringify(notes))

    const index = localNotes.findIndex((n) => n.id === id)

    localNotes.splice(index, 1)

    setNotes(JSON.parse(JSON.stringify(localNotes)))

    if (activeNote?.id === id) setActiveNote(undefined)
  }

  const gimmeNotesToShow = () => {
    let localNotes: Note[] = notes

    if (searchTerm) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase().trim()

      localNotes = localNotes
        .filter(({ textContent, title }) => {
          return title.toLowerCase().includes(lowerCaseSearchTerm) || textContent.replaceAll('\n\n', ' ').toLowerCase().includes(lowerCaseSearchTerm)
        })
    }

    return (
      !!localNotes.length && localNotes.map((note: Note) => {
        return (
          <article
            onClick={() => changeActiveNoteTo(note)}
            key={note.id}
            className={`sidebar-note ${note.id === activeNote?.id ? 'active' : ''}`}
          >
            <section className='title-and-action-center flex'>
              {getNoteTitle(note)}
              <Tooltip
                placement='bottomStart'
                content={'Delete Note'}
              >
                <Button
                  color="error"
                  auto
                  ghost
                  size='sm'
                  onClick={(e) => deleteNote(e, note.id)} icon={<FiTrash2 />}
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
          value={searchTerm}
          onInput={e => setSearchTerm((e.target as HTMLInputElement).value)}
        />
      </section>

      <section>
        {gimmeNotesToShow()}
      </section>
    </aside>
  )
}

export default Sidebar
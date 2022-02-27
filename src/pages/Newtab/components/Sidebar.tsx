import React, { useCallback, useEffect, useState } from 'react';
import { Button, Container, getDocumentTheme, Input, Row, Text, Tooltip, useTheme } from '@nextui-org/react';
import { useRecoilState, useRecoilValue } from 'recoil';
import { format } from 'date-fns'

import { sidebarActiveState, activeNoteState, notesState, editorSearchState } from '../Store'
import { Note } from '../types';

import './Sidebar.scss'
import { FiTrash2 } from 'react-icons/fi';
import { toast } from 'react-toastify';

const { storage } = chrome

const Sidebar = () => {
  const sidebarActive = useRecoilValue(sidebarActiveState)

  const [activeNote, setActiveNote] = useRecoilState(activeNoteState)

  const [globalSearchTerm, setGlobalSearchTerm] = useRecoilState(editorSearchState)

  const [notes, setNotes] = useRecoilState(notesState)

  const [notesToBeDeleted, setNotesToBeDeleted] = useState<string[]>([])

  interface UndoProps {
    onUndo: () => any,
    closeToast?: () => any
  }

  const Undo = ({ onUndo, closeToast }: UndoProps) => {
    const handleClick = () => {
      onUndo();
      closeToast?.();
    };

    return (
      <section className='flex undo-notification-container'>
        <Text>
          Note will be deleted.
        </Text>

        <Button auto size='sm' color="warning" onClick={handleClick}>
          UNDO
        </Button>
      </section>
    );
  };

  const warnBeforeDeletion = useCallback((noteId: string) => {
    let newTheme = getDocumentTheme(document?.documentElement);

    const timeout = setTimeout(() => {
      deleteNote(noteId)
      setNotesToBeDeleted(notesToBeDeleted.filter((id) => id !== noteId))
    }, 6000)

    toast.warn(
      <Undo onUndo={() => clearTimeout(timeout)} />,
      {
        theme: newTheme === 'dark-theme' ? 'dark' : 'light',
        onClose: () => setNotesToBeDeleted(notesToBeDeleted.filter((id) => id !== noteId)),
        autoClose: 5000,
        pauseOnHover: false,
        closeButton: false,
      }
    )
  }, [])

  const returnFormattedDateString = (timestamp: Date) => {
    return format(new Date(timestamp), 'PPpp')
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

  const getNoteTitle = (note: Note) => {
    return <input placeholder='Add Title...' className='title-editor-input' onClick={e => e.stopPropagation()} value={note.title} onInput={e => setNoteTitle(note, (e as any).target.value)} />
  }

  const deleteNote = (id: string) => {
    const localNotes: Note[] = JSON.parse(JSON.stringify(notes))

    const index = localNotes.findIndex((n) => n.id === id)

    localNotes.splice(index, 1)

    setNotes(JSON.parse(JSON.stringify(localNotes)))

    if (activeNote?.id === id) setActiveNote(undefined)
  }

  const initiateDelete = (e: any, id: string) => {
    if (e) {
      (e as MouseEvent).stopPropagation();
      (e as MouseEvent).preventDefault()
    }

    setNotesToBeDeleted([...notesToBeDeleted, id])

    warnBeforeDeletion(id)
  }

  const gimmeNotesToShow = () => {
    let localNotes: Note[] = notes

    if (globalSearchTerm) {
      const lowerCaseSearchTerm = globalSearchTerm.toLowerCase().trim()

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
                  onClick={(e) => initiateDelete(e, note.id)}
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
        {gimmeNotesToShow()}
      </section>
    </aside>
  )
}

export default Sidebar
import React from 'react';
import { Input, Text } from '@nextui-org/react';
import { useSetRecoilState, useRecoilValue } from 'recoil';
import { format } from 'date-fns'

import { sidebarActiveState, activeNoteState, notesState } from '../Store'
import { Note } from '../types';

import './Sidebar.scss'

const Sidebar = () => {
  const sidebarActive = useRecoilValue(sidebarActiveState)

  const setActiveNote = useSetRecoilState(activeNoteState)

  const notes = useRecoilValue(notesState)

  const returnFormattedDateString = (timestamp: Date) => {
    return format(new Date(timestamp), 'PPpp')
  }

  const changeActiveNoteTo = (note: Note) => {
    setActiveNote(undefined)

    setTimeout(() => setActiveNote(note))
  }

  return (
    <aside className={`sidebar ${sidebarActive ? 'active' : ''}`}>
      <section className='sidebar-top flex'>
        <Input underlined fullWidth={true} placeholder='Search notes...' type="search" />
      </section>

      <section>
        {
          !!notes.length && notes.map((note: Note) => {
            return (
              <article onClick={() => changeActiveNoteTo(note)} key={note.id} className='sidebar-note'>
                <Text size={'1.25em'} > {note.title || 'No Title'} </Text>
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
    </aside>
  )
}

export default Sidebar
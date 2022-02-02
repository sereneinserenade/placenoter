import React, { useContext, useEffect, useState } from 'react';
import { Input, Text, Container, Divider, Spacer } from '@nextui-org/react';
import { useSetRecoilState, useRecoilValue } from 'recoil';

import { sidebarActiveState, activeNoteState, notesState } from '../Store'
import { Note } from '../types';

import './Sidebar.scss'

const Sidebar = () => {
  // const { sidebarActive, notes, setActiveNoteId } = useContext(Context) as ContextInterface

  const sidebarActive = useRecoilValue(sidebarActiveState)
  const setActiveNote = useSetRecoilState(activeNoteState)
  const notes = useRecoilValue(notesState)

  return (
    <aside className={`sidebar ${sidebarActive ? 'active' : ''}`}>
      <section className='sidebar-top flex'>
        <Input underlined fullWidth={true} placeholder='Search notes...' type="search" />
      </section>

      <section>
        {
          notes && notes.map((note: Note) => {
            return (
              <article onClick={() => setActiveNote(note)} key={note.id} className='sidebar-note'>
                <Text size={'1.25em'} > {note.title || 'No Title'} </Text>
                <Text> {note.textContent.length >= 40 ? note.textContent.substring(0, 40) + '...' : note.textContent} </Text>
                <Text size={12}> {JSON.stringify(note.timestamp)} </Text>
              </article>
            )
          })
        }
      </section>
    </aside>
  )
}

export default Sidebar
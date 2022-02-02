import React, { useContext, useState } from 'react';
import { Input, Text, Container, Divider, Spacer } from '@nextui-org/react';
import { Context, ContextInterface } from '../Context'


import './Sidebar.scss'
import { Note } from '../types';

const Sidebar = () => {
  const { sidebarActive, notes, setActiveNote } = useContext(Context) as ContextInterface

  return (
    <aside className={`sidebar ${sidebarActive ? 'active' : ''}`}>
      <section className='sidebar-top flex'>
        <Input underlined fullWidth={true} placeholder='Search notes...' type="search" />
      </section>

      <section>
        {
          notes && notes.map((note: Note) => {
            return (
              <article onClick={() => setActiveNote(JSON.parse(JSON.stringify(note)))} key={note.id} className='sidebar-note'>
                <Text size={'1.25em'} > {note.title || 'No Title'} </Text>
                <Text> {note.textContent.length >= 40 ? note.textContent.substring(0, 40) + '...' : note.textContent} </Text>
                <Text size={12}> {note.timestamp.toString()} </Text>
              </article>
            )
          })
        }
      </section>
    </aside>
  )
}

export default Sidebar
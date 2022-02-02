import React, { useContext, useState } from 'react';
import { Input } from '@nextui-org/react';
import { Context, ContextInterface } from '../Context'


import './Sidebar.scss'

const Sidebar = () => {
  const { sidebarActive, notes } = useContext(Context) as ContextInterface

  return (
    <aside className={`sidebar ${sidebarActive ? 'active' : ''}`}>
      <section className='sidebar-top flex'>
        <Input underlined fullWidth={true} placeholder='Search notes...' type="search" />
      </section>

      <section>
        {
          // JSON.stringify(notes)
          notes && notes.map((note) => {
            return (
              <article key={note.id} className='sidebar-note'>
                <h3>{note.id}</h3>
                <div dangerouslySetInnerHTML={{ __html: note.content }} />
                {/* {JSON.stringify(notes)} */}
              </article>
            )
          })
        }
      </section>
    </aside>
  )
}

export default Sidebar
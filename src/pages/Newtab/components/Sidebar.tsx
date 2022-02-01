import React, { useContext, useState } from 'react';
import { Input } from '@nextui-org/react';
import { Context, ContextInterface } from '../Context'


import './Sidebar.scss'

const Sidebar = () => {
  const { sidebarActive } = useContext(Context) as ContextInterface

  return (
    <aside className={`sidebar ${sidebarActive ? 'active' : ''}`}>
      <section className='sidebar-top flex'>
        <Input underlined fullWidth={true} placeholder='Search notes...' type="search" />
      </section>

      <section>
      </section>
    </aside>
  )
}

export default Sidebar
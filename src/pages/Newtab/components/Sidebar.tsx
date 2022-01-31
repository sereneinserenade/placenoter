import React, { useState } from 'react';
import { Input } from '@nextui-org/react';


import './Sidebar.scss'

type SidebarProps = {
  sidebarActive: boolean,
}

const Sidebar = ({ sidebarActive }: SidebarProps) => {

  return (
    <aside className={`sidebar ${sidebarActive ? 'active' : ''}`}>
      <section className='sidebar-top flex'>
        <Input underlined fullWidth={true} placeholder='Search notes...' type="search" />
      </section>
    </aside>
  )
}

export default Sidebar
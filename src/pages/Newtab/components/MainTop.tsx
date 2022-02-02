import React, { useContext, useEffect, useState } from 'react'
import { Button, Tooltip, Input, FormElement } from '@nextui-org/react'
import { RiArrowLeftLine } from 'react-icons/ri'
import { v4 as uuidv4 } from 'uuid'

import './MainTop.scss'
import { activeNoteState, notesState, sidebarActiveState } from '../Store'
import { Note } from '../types'
import { useRecoilState } from 'recoil'

const { storage } = chrome

const MainTop = () => {
  const [activeNote, setActiveNote] = useRecoilState(activeNoteState)
  const [sidebarActive, setSidebarActive] = useRecoilState(sidebarActiveState)
  const [notes, setNotes] = useRecoilState(notesState)

  const createNewNoteAndSetItAsActiveNote = () => {
    const newNote: Note = {
      id: uuidv4(),
      content: '',
      timestamp: new Date(),
      title: '',
      textContent: ''
    }

    setActiveNote(JSON.parse(JSON.stringify(newNote)))

    setNotes([newNote, ...notes])
  }

  const onSidebarControlButtonClicked = (): void => setSidebarActive(!sidebarActive)

  const changeTitle = (e: React.FormEvent<FormElement>) => {
    const obj: Partial<Note> = { title: (e.target as any).value }

    setActiveNote({ ...activeNote, ...obj } as Note)
  }

  return (
    <section className='main-top flex'>
      <section className='left-controls flex' aria-label='left-controls'>
        <Tooltip placement='bottomStart' content={sidebarActive ? 'Close Sidebar' : 'Open Sidebar'}>
          <Button color="primary" auto ghost size='sm' onClick={onSidebarControlButtonClicked} className={`sidebar-control-button flex ${sidebarActive ? '' : 'flip'}`} icon={<RiArrowLeftLine />} />
        </Tooltip>
      </section>

      <section className='right-controls'>
        Some
      </section>
    </section>
  )
}

export default MainTop


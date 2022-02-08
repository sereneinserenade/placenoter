import React, { useContext, useEffect, useState } from 'react'
import { Button, Tooltip, Input, FormElement, Text } from '@nextui-org/react'
import { RiArrowLeftLine, RiMenuFoldFill, RiMenuFoldLine, RiMenuUnfoldFill, RiMenuUnfoldLine } from 'react-icons/ri'
import { FiFeather } from 'react-icons/fi'
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

  const onSidebarControlButtonClicked = (): void => setSidebarActive(!sidebarActive)

  const changeTitle = (e: React.FormEvent<FormElement>) => {
    const obj: Partial<Note> = { title: (e.target as any).value }

    setActiveNote({ ...activeNote, ...obj } as Note)
  }

  return (
    <section className='main-top flex'>
      <section className='left-controls flex' aria-label='left-controls'>
        <Tooltip placement='bottomStart' content={sidebarActive ? 'Close Sidebar' : 'Open Sidebar'}>
          <Button color="primary" auto ghost size='sm' onClick={onSidebarControlButtonClicked} className={`sidebar-control-button flex`} icon={sidebarActive ? <RiMenuFoldFill /> : <RiMenuUnfoldFill />} />
        </Tooltip>
        <Tooltip placement='bottomStart' content={'Create new note'}>
          <Button color="primary" auto ghost size='sm' onClick={createNewNoteAndSetItAsActiveNote} className="sidebar-control-button flex" icon={< FiFeather />} />
        </Tooltip>
      </section>

      <section className='middle-controls'>
        <Text
          size={20}
          css={{ textGradient: '45deg, $purple500 -20%, $pink500 100%' }}
          weight="bold"
        >
          PlaceNoter
        </Text>
      </section>

      <section>
        <Text >
          Right
        </Text>
      </section>
    </section>
  )
}

export default MainTop


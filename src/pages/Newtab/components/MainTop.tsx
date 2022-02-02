import React, { useContext } from 'react'
import { Button, Tooltip, Input, FormElement } from '@nextui-org/react'
import { RiArrowLeftLine } from 'react-icons/ri'
import { v4 as uuidv4 } from 'uuid'

import './MainTop.scss'
import { Context, ContextInterface } from '../Context'
import { Note } from '../types'

const { storage } = chrome

type MainTopProps = {
  updateActiveNoteTitle: Function
}

const MainTop = ({ updateActiveNoteTitle }: MainTopProps) => {
  const { sidebarActive, setSidebarActive, activeNote, setActiveNote, notes, setNotes } = useContext(Context) as ContextInterface

  const createNewNoteAndSetItAsActiveNote = () => {
    const newNote: Note = {
      id: uuidv4(),
      content: '',
      timestamp: new Date(),
      title: '',
      textContent: ''
    }

    setActiveNote(JSON.parse(JSON.stringify(newNote)))

    setNotes([...notes, newNote])

    new Promise((r) => setTimeout(r, 500))

    storage.sync.set({ dbnotes: notes }, () => {
      storage.sync.get('dbnotes', (res) => console.log(res.dbnotes))
    })
  }


  const onSidebarControlButtonClicked = (): void => setSidebarActive(!sidebarActive)

  const printDbNotesInConsole = () => {
    storage.sync.get(['dbnotes'], (res) => {
      console.log(res)
    })
  }

  const changeTitle = (e: React.FormEvent<FormElement>) => {
    updateActiveNoteTitle((e.target as any).value)
  }

  return (
    <section className='main-top flex'>
      <section className='left-controls flex' aria-label='left-controls'>
        <Tooltip placement='bottomStart' content={sidebarActive ? 'Close Sidebar' : 'Open Sidebar'}>
          <Button color="primary" auto ghost size='sm' onClick={onSidebarControlButtonClicked} className={`sidebar-control-button flex ${sidebarActive ? '' : 'flip'}`} icon={<RiArrowLeftLine />} />
        </Tooltip>
      </section>

      <section>
        {
          activeNote?.id && <Input
            underlined
            labelLeft="Title"
            placeholder="New note..."
            onInput={(e) => changeTitle(e)}
            initialValue={activeNote.title}
          />
        }
      </section>

      <section className='right-controls'>
        Some
      </section>
    </section>
  )
}

export default MainTop


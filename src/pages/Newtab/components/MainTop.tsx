import React from 'react'
import { Button, Tooltip, FormElement, Input, useTheme, changeTheme, Switch } from '@nextui-org/react'
import { RiAddLine, RiMenuFoldFill, RiMenuUnfoldFill, RiMoonFill, RiPrinterLine, RiSunFill } from 'react-icons/ri'
import { FiHome } from 'react-icons/fi'
import { v4 as uuidv4 } from 'uuid'

import './MainTop.scss'
import { activeNoteState, notesState, sidebarActiveState } from '../Store'
import { Note } from '../types'
import { useRecoilState, useRecoilValue } from 'recoil'

const { storage } = chrome

const MainTop = () => {
  const [activeNote, setActiveNote] = useRecoilState(activeNoteState)
  const [sidebarActive, setSidebarActive] = useRecoilState(sidebarActiveState)
  const [notes, setNotes] = useRecoilState(notesState)

  const { type, isDark } = useTheme();

  const checkIfAnEmptyNoteExists = (): Note | undefined => {
    return notes.find((n) => n.title.trim() === "" && n.textContent.trim() === "")
  }

  const createNewNoteAndSetItAsActiveNote = () => {
    const emptyNoteInNotesList = checkIfAnEmptyNoteExists()
    if (emptyNoteInNotesList) {
      setActiveNote(undefined)
      setTimeout(() => setActiveNote(emptyNoteInNotesList))

      return
    }

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

  const deleteActiveNote = () => {
    const localNotes: Note[] = JSON.parse(JSON.stringify(notes))

    if (!activeNote) return

    const { id } = activeNote

    const index = localNotes.findIndex((n) => n.id === id)

    localNotes.splice(index, 1)

    setNotes(JSON.parse(JSON.stringify(localNotes)))

    setActiveNote(undefined)
  }

  const updateTitle = (e: React.FormEvent<FormElement>) => (activeNote) && setActiveNote({ ...activeNote, title: `${(e.target as any).value}` })

  const goHome = () => {
    setActiveNote(undefined)

    storage.local.set({ lastActiveNoteId: undefined })
  }

  const onThemeChange = () => {
    const nextTheme = isDark ? 'light-theme' : 'dark-theme';

    changeTheme(nextTheme);

    window.localStorage.setItem('data-theme', nextTheme); // I think local storage is good enough for this
  }

  const refreshNote = () => {
    const note = JSON.parse(JSON.stringify(activeNote))

    setActiveNote(undefined)

    setTimeout(() => setActiveNote(note))
  }

  const printEditorContent = () => {
    const printContents = document.querySelector(".editor-content")?.innerHTML;

    if (!printContents) {
      console.warn('Empty Editor Content could not be printed.')
      return
    }

    document.body.innerHTML = printContents;
    window.print();
    document.location.href = document.location.href
  }

  return (
    <section className={`main-top flex`}>
      <section className='left-controls flex' aria-label='left-controls'>
        <Tooltip placement='bottomStart' content={sidebarActive ? 'Close Sidebar' : 'Open Sidebar'}>
          <Button color="primary" auto ghost size='sm' onClick={onSidebarControlButtonClicked} className={`sidebar-control-button flex`} icon={sidebarActive ? <RiMenuFoldFill /> : <RiMenuUnfoldFill />} />
        </Tooltip>
        <Tooltip placement='bottomStart' content={'Create new note'}>
          <Button color="primary" auto ghost size='sm' onClick={createNewNoteAndSetItAsActiveNote} className="sidebar-control-button flex" icon={< RiAddLine />} />
        </Tooltip>
        <Tooltip placement='bottomStart' content={'Home'}>
          <Button color="primary" auto ghost size='sm' onClick={() => goHome()} className="sidebar-control-button flex" icon={< FiHome />} />
        </Tooltip>
      </section>

      <section className='middle-controls'>
        {
          activeNote &&
          <Input
            underlined
            placeholder="Title..."
            onInput={(e) => updateTitle(e)}
            value={`${activeNote?.title}`}
            className="title-input"
            onBlur={refreshNote} // TODO: make this logic better
          />
        }
      </section>

      <section className='right-controls flex'>
        {
          // TODO: Give option to share in cloud storage
          activeNote?.id && <Tooltip placement='bottomEnd' content={'Print Document'}>
            <Button color="primary" auto ghost size='sm' onClick={() => printEditorContent()} className="sidebar-control-button flex" icon={< RiPrinterLine />} />
          </Tooltip>
        }

        <Tooltip placement='bottomEnd' content={isDark ? 'Light mode' : 'Dark mode'}>
          <Switch
            checked={isDark}
            onChange={onThemeChange}
            iconOff={<RiSunFill />}
            iconOn={<RiMoonFill />}
          />
        </Tooltip>
      </section>
    </section>
  )
}

export default MainTop


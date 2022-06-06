import React, { useCallback, useState } from 'react'
import { Button, Tooltip, FormElement, Input, useTheme, changeTheme, Switch } from '@nextui-org/react'
import { RiAddLine, RiMenuFoldFill, RiMenuUnfoldFill, RiMoonFill, RiPrinterLine, RiSunFill } from 'react-icons/ri'
import { FiHome } from 'react-icons/fi'
import { BiImport, BiExport } from 'react-icons/bi'
import { v4 as uuidv4 } from 'uuid'
import { saveAs } from 'file-saver';

import './css/MainTop.scss'
import { ImportDataModal } from './data'
import { activeNoteState, binNotesState, notesState, sidebarActiveState } from '../Store'
import { Note, QuickLink } from '../types'
import { useRecoilState, useRecoilValue } from 'recoil'

const { storage } = chrome

const MainTop = () => {
  const [activeNote, setActiveNote] = useRecoilState(activeNoteState)

  const [sidebarActive, setSidebarActive] = useRecoilState(sidebarActiveState)

  const [notes, setNotes] = useRecoilState(notesState)

  const [showImportDataModal, setShowImportDataModal] = useState(false)

  const binNotes = useRecoilValue(binNotesState)

  const { isDark } = useTheme();

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
      setNotes([newNote, ...notes])
      setActiveNote(newNote)
    })
  }

  const onSidebarControlButtonClicked = (): void => setSidebarActive(!sidebarActive)

  const goHome = () => {
    setActiveNote(undefined)
  }

  const onThemeChange = () => {
    const nextTheme = isDark ? 'light-theme' : 'dark-theme';

    changeTheme(nextTheme);

    window.localStorage.setItem('data-theme', nextTheme); // I think local storage is good enough for this
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

  const exportData = useCallback((notes: Note[], binNotes: Note[]) => {
    interface Data {
      dbnotes: Note[]
      binNotes: Note[]
      quicklinks: QuickLink[]
      quicklinksorder: string[]
    }

    const data: Data = {
      dbnotes: notes,
      binNotes,
      quicklinks: [],
      quicklinksorder: []
    }

    storage.local.get(['quicklinks', 'quicklinksorder'], ({ quicklinks, quicklinksorder }) => {
      data.quicklinks = quicklinks || []
      data.quicklinksorder = quicklinksorder || []

      const fileToSave = new Blob([JSON.stringify(data)], { type: 'application/json' })

      saveAs(fileToSave, `PlaceNoter - ${new Date().toLocaleString()}.json`);
    })
  }, [])

  return (
    <section className={`main-top flex`} aria-label="main-top-section">
      <section className='left-controls flex' aria-label='left-controls-section'>
        <Tooltip placement='bottomStart' content={sidebarActive ? 'Close Sidebar' : 'Open Sidebar'}>
          <Button color="primary" auto ghost size='sm' onClick={onSidebarControlButtonClicked} className={`sidebar-control-button flex`} icon={sidebarActive ? <RiMenuFoldFill /> : <RiMenuUnfoldFill />} />
        </Tooltip>
        <Tooltip placement='bottomStart' content={'Home'}>
          <Button color="primary" auto ghost size='sm' onClick={() => goHome()} className="sidebar-control-button flex" icon={< FiHome />} />
        </Tooltip>
        <Tooltip placement='bottomStart' content={'Create new note'}>
          <Button
            color="gradient"
            auto
            size='sm'
            onClick={createNewNoteAndSetItAsActiveNote}
            className="sidebar-control-button flex"
            icon={< RiAddLine />}
          />
        </Tooltip>
      </section>

      <section className='right-controls flex' aria-label='right-controls-section'>
        {
          // TODO: Give option to share in cloud storage
          activeNote?.id && <Tooltip placement='bottomEnd' content={'Print Document'}>
            <Button color="primary" auto ghost size='sm' onClick={() => printEditorContent()} className="sidebar-control-button flex" icon={< RiPrinterLine />} />
          </Tooltip>
        }
        {
          !activeNote?.id &&
          (<>
            <Tooltip placement='bottomEnd' content={'Import Data from a file.'}>
              <Button color="primary" auto ghost size='sm' onClick={() => setShowImportDataModal(true)} className="sidebar-control-button flex" icon={< BiImport />} />
            </Tooltip>

            <Tooltip placement='bottomStart' content={'Export Data to a file.'}>
              <Button color="primary" auto ghost size='sm' onClick={() => exportData(notes, binNotes)} className="sidebar-control-button flex" icon={< BiExport />} />
            </Tooltip>

            <ImportDataModal onClose={() => setShowImportDataModal(false)} isImportDataModelOpen={showImportDataModal} />
          </>)
        }

        <span className='theme-button flex' onClick={onThemeChange} title={isDark ? 'Light Theme' : 'Dark Theme'}>
          {isDark ? <RiSunFill /> : <RiMoonFill />}
        </span>
      </section>
    </section>
  )
}

export default MainTop


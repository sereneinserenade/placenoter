import { useCallback, useEffect, useState } from 'react'

import { Button, Dropdown, Tooltip, useTheme } from '@nextui-org/react'
import { saveAs } from 'file-saver'
import { BiExport, BiImport } from 'react-icons/bi'
import { FiHome } from 'react-icons/fi'
import { RiAddLine, RiComputerLine, RiMenuFoldFill, RiMenuUnfoldFill, RiMoonFill, RiPrinterLine, RiSunFill } from 'react-icons/ri'
import { useRecoilState, useRecoilValue } from 'recoil'
import { v4 as uuidv4 } from 'uuid'

import { activeNoteState, binNotesState, notesState, sidebarActiveState, themeState } from '../Store'
import { Note, QuickLink } from '../types'
import { ImportDataModal } from './data'

import './css/MainTop.scss'

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
      pinnedNoteIds: string[]
    }

    const data: Data = {
      dbnotes: notes,
      binNotes,
      quicklinks: [],
      quicklinksorder: [],
      pinnedNoteIds: [],
    }

    storage.local.get(['quicklinks', 'quicklinksorder', 'pinnedNoteIds'], ({ quicklinks, quicklinksorder, pinnedNoteIds }) => {
      data.quicklinks = quicklinks || []
      data.quicklinksorder = quicklinksorder || []
      data.pinnedNoteIds = pinnedNoteIds

      const fileToSave = new Blob([JSON.stringify(data)], { type: 'application/json' })

      saveAs(fileToSave, `PlaceNoter - ${new Date().toLocaleString()}.json`);
    })
  }, [])

  const [themeSelection, setThemeSelection] = useState<string>('system-theme')

  const onThemeChange = (theme: string) => {
    setTheme(theme)
  }

  const onDropdownThemeChange = (keys: any) => {
    let theme = [...keys][0]

    setThemeSelection(theme)
    onThemeChange(theme)
  }

  const [theme, setTheme] = useRecoilState(themeState)

  useEffect(() => {
    setThemeSelection(theme)
  }, [theme])

  return (
    <section className={`main-top flex`} aria-label="main-top-section">
      <section className='left-controls flex' aria-label='left-controls-section'>
        <Tooltip placement='bottomStart' content={sidebarActive ? 'Close Sidebar' : 'Open Sidebar'}>
          <Button color="primary" auto ghost size='sm' onClick={onSidebarControlButtonClicked} className={`sidebar-control-button flex`} icon={sidebarActive ? <RiMenuFoldFill /> : <RiMenuUnfoldFill />} />
        </Tooltip>
        <Tooltip placement='bottomStart' content={'Home'}>
          <Button color="primary" auto ghost size='sm' onClick={goHome} className="sidebar-control-button flex" icon={< FiHome />} />
        </Tooltip>
        <Tooltip placement='bottomStart' content={'Create new note'}>
          <Button
            color="gradient"
            auto
            shadow
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

        <Dropdown>
          <Dropdown.Button
            size='sm'
            auto
            flat
            rounded
            icon={isDark ? <RiSunFill /> : <RiMoonFill />}
          />

          <Dropdown.Menu
            aria-label='Theme Selection Dropdown'
            color="primary"
            disallowEmptySelection
            selectionMode='single'
            selectedKeys={[themeSelection]}
            onSelectionChange={onDropdownThemeChange}
          >
            <Dropdown.Item key={'system-theme'} icon={<RiComputerLine />}>
              System
            </Dropdown.Item>
            <Dropdown.Item key={'light-theme'} icon={<RiSunFill />}>
              Light
            </Dropdown.Item>
            <Dropdown.Item key={'dark-theme'} icon={<RiMoonFill />}>
              Dark
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </section>
    </section>
  )
}

export default MainTop


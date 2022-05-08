import React, { useEffect, useState } from 'react';

import { Modal, Text, Input, Button } from '@nextui-org/react';
import { Note } from '../../types';
import { useRecoilState, useSetRecoilState } from 'recoil';
import { binNotesState, notesState, sidebarActiveState } from '../../Store';

interface ImportDataModalProps {
  isImportDataModelOpen: boolean
  onClose: () => void
}

interface Data {
  notes: Note[]
  binNotes: Note[]
}

const { storage } = chrome

export const ImportDataModal: React.FC<ImportDataModalProps> = ({ isImportDataModelOpen, onClose }) => {
  const [jsonDataString, setJsonDataString] = useState("")

  const [isJsonValid, setIsJsonValid] = useState(false)

  const setSidebarActive = useSetRecoilState(sidebarActiveState)

  const [notes, setNotes] = useRecoilState(notesState)

  const [binNotes, setBinNotes] = useRecoilState(binNotesState)

  useEffect(() => {
    if (!jsonDataString) {
      setIsJsonValid(true)
      return
    }

    try {
      const json: Data = JSON.parse(jsonDataString)
      const { notes, binNotes } = json

      debugger
      const [isNotesValid, isBinNotesValid] = [Array.isArray(notes), Array.isArray(binNotes)]

      if (!isNotesValid || !isBinNotesValid) {
        console.error(`${!isNotesValid ? 'notes and ' : ''}${!isBinNotesValid ? 'binNotes' : ''} not valid.`)
        setIsJsonValid(false)
        return
      }

      setIsJsonValid(true)
    } catch {
      setIsJsonValid(false)
    }
  }, [jsonDataString])

  const importData = () => {
    const jsonData: Data = JSON.parse(jsonDataString)

    storage.local.set({ dbnotes: jsonData.notes, binNotes: jsonData.binNotes })

    if (jsonData.notes.length) setSidebarActive(true)

    onClose()

    setNotes(JSON.parse(JSON.stringify(jsonData.notes)))

    setBinNotes(JSON.parse(JSON.stringify(jsonData.binNotes)))
  }

  return (
    <Modal
      closeButton
      aria-labelledby="modal-title"
      open={isImportDataModelOpen}
      onClose={onClose}
    >
      <Modal.Header>
        <Text id="modal-title" size={18}>
          Import Data
        </Text>
      </Modal.Header>
      <Modal.Body>
        <section className='flex flex-col'>
          {
            (binNotes.length || notes.length) ? <Text color="warning" css={{ mb: '2rem' }}>
              There are {notes.length} Active Notes, and {binNotes.length} Notes in recycle bin. If you import data, all that data will be overridden with new data.
            </Text> : <></>
          }
          <Input
            clearable
            bordered
            fullWidth
            size="lg"
            labelPlaceholder="Enter the data in text form"
            onInput={(e) => setJsonDataString((e.target as HTMLInputElement).value)}
            autoFocus
            onKeyPress={e => e.code === 'Enter' && importData()}
          />
        </section>
      </Modal.Body>
      <Modal.Footer>
        {
          !isJsonValid && <Text color="error" css={{ mr: '$4' }}>
            Enter valid Json.
          </Text>
        }
        <Button auto flat color="error" onClick={onClose}>
          Close
        </Button>
        <Button auto onClick={importData} disabled={!isJsonValid || jsonDataString === ''}>
          Import
        </Button>
      </Modal.Footer>
    </Modal>

  )
}

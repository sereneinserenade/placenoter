import React, { useEffect, useRef, useState } from 'react';

import { Modal, Text, Button, Loading } from '@nextui-org/react';
import { useRecoilValue } from 'recoil';
import { isPlainObject } from 'lodash';

import { Note, QuickLink } from '../../types';
import { binNotesState, notesState } from '../../Store';
import './css/ImportDataModel.scss'

interface ImportDataModalProps {
  isImportDataModelOpen: boolean
  onClose: () => void
}

interface Data {
  dbnotes: Note[]
  binNotes: Note[]
  quicklinks: QuickLink[]
  quicklinksorder: string[]
}

const { storage } = chrome

export const ImportDataModal: React.FC<ImportDataModalProps> = ({ isImportDataModelOpen, onClose }) => {
  const [jsonDataString, setJsonDataString] = useState("")

  const [isJsonValid, setIsJsonValid] = useState(false)

  const [loading, setLoading] = useState(false)

  const [fileName, setFileName] = useState("")

  const notes = useRecoilValue(notesState)

  const binNotes = useRecoilValue(binNotesState)

  useEffect(() => {
    if (!jsonDataString) {
      setIsJsonValid(true)
      return
    }

    try {
      const json: Data = JSON.parse(jsonDataString)
      const { dbnotes, binNotes, quicklinks, quicklinksorder } = json

      const [isNotesValid, isBinNotesValid, isQuicklinksValid, isQuicklinksOrderValid] = [Array.isArray(dbnotes), Array.isArray(binNotes), isPlainObject(quicklinks), Array.isArray(quicklinksorder)]

      if (!isNotesValid || !isBinNotesValid || !isQuicklinksOrderValid || !isQuicklinksValid) {
        const err = `${!isNotesValid ? 'notes, ' : ""}${!isBinNotesValid ? 'binNotes, ' : ""}${!isQuicklinksValid ? 'quicklinks, ' : ""}${!isQuicklinksOrderValid ? 'quicklinksorder' : ""} not valid.`
        console.error(err)
        setIsJsonValid(false)
        return
      }

      setIsJsonValid(true)
    } catch {
      setIsJsonValid(false)
    }
  }, [jsonDataString])

  const importData = () => {
    setLoading(true)

    const jsonData: Data = JSON.parse(jsonDataString)

    storage.local.set(jsonData, () => {
      setLoading(false)

      window.location.reload()
    })
  }

  const readFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()

    const reader = new FileReader()

    reader.onload = async (e) => {
      const text = (e.target?.result)

      if (text) setJsonDataString(text as string)
    };

    const file = e.target.files && e.target.files[0]

    if (file) {
      reader.readAsText(file)
      setFileName(file.name)
    }
  }

  const inputLabelRef = useRef(null)

  const getTruncatedFileName = (fileName: string) => {
    let [name, ext] = fileName.split('.')

    if (name.length > 20) name = name.substring(0, 20) + '...'

    return `${name}${!name.endsWith('.') ? "." : ''}${ext}`
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
      <Modal.Body className='flex flex-col' aria-label='modal-body-section'>
        {
          (binNotes.length || notes.length) ? <Text color="warning" css={{ mb: '1rem' }}>
            There are {notes.length} Active Notes, and {binNotes.length} Notes in recycle bin. If you import data, all that data will be overridden with new data.
          </Text> : <></>
        }

        <Button auto onClick={() => (inputLabelRef.current as unknown as HTMLInputElement)?.click()}>
          {fileName ? `From '${getTruncatedFileName(fileName)}'` : 'Choose file to import data'}
          <input ref={inputLabelRef} id="file-upload" className='file-uploader-input' accept='application/json' type="file" onChange={(e) => readFile(e)} />
        </Button>
      </Modal.Body>
      <Modal.Footer>
        {
          !isJsonValid && <Text color="error" css={{ mr: '$4' }}>
            Enter valid Json.
          </Text>
        }
        <Button auto flat color="error" onClick={onClose}> Close </Button>

        <Button auto onClick={importData} disabled={loading || !isJsonValid || jsonDataString === ''}>
          {
            loading
              ? <Loading type='points' size='sm' />
              : 'Import'
          }
        </Button>
      </Modal.Footer>
    </Modal>

  )
}

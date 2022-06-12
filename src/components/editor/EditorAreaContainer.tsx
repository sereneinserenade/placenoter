import React, { useEffect, useState } from 'react'
import { useRecoilState, useRecoilValue } from 'recoil'
import { Container } from '@nextui-org/react'

import { activeNoteState, binNotesState } from '../../Store'
import { Note } from '../../types'
import Tiptap from './Tiptap'

import './EditorAreaContainer.scss'
import { useTitle } from 'react-use'

const EditorAreaContainer = () => {
  const [activeNote, setActiveNote] = useRecoilState(activeNoteState)

  const binNotes = useRecoilValue(binNotesState)

  const [isActiveNoteInBin, setIsActiveNoteInBin] = useState<boolean>(false)

  useEffect(() => {
    setIsActiveNoteInBin(binNotes.findIndex(n => n.id === activeNote?.id) >= 0)
  }, [activeNote, binNotes])

  useTitle(activeNote?.title || "PlaceNoter")

  const setNoteContent = (content: string, textContent: string) => {
    if (typeof content === 'string') content = content.trim()
    if (typeof textContent === 'string') textContent = textContent.trim()

    setActiveNote({ ...activeNote, content, textContent } as Note)
  }

  return (
    <Container sm>
      <Tiptap
        content={`${activeNote?.content}` || ''}
        onUpdate={setNoteContent}
        isNoteInBin={isActiveNoteInBin}
      />
    </Container>
  )
}

export default EditorAreaContainer
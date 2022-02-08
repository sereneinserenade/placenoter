import React, { useEffect, useState } from 'react'
import { useRecoilState } from 'recoil'
import { Container, FormElement, Input } from '@nextui-org/react'

import { activeNoteState } from '../../Store'
import { Note } from '../../types'
import Tiptap from './Tiptap'

import './EditorAreaContainer.scss'

const EditorAreaContainer = () => {
  const [activeNote, setActiveNote] = useRecoilState(activeNoteState)

  const [title, setTitle] = useState<string>(activeNote?.title || '')

  useEffect(() => {
    setActiveNote({ ...activeNote, title } as Note)
  }, [title])

  const setNoteContent = (content: string, textContent: string) => {
    if (typeof content === 'string') content = content.trim()

    setActiveNote({ ...activeNote, content, textContent } as Note)
  }

  const updateTitle = (e: React.FormEvent<FormElement>) => setTitle((e.target as any).value)


  return (
    <Container sm>
      <Tiptap content={activeNote?.content || ''} onUpdate={setNoteContent} />
    </Container>
  )
}

export default EditorAreaContainer
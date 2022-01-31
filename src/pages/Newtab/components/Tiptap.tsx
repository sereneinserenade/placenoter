// src/Tiptap.jsx
import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import './Tiptap.scss'

interface TiptapProps {
  onUpdate: Function
}

const Tiptap = ({ onUpdate }: TiptapProps) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
    ],
    content: '<p>Hello World!</p>',
    onUpdate: ({ editor }) => onUpdate(editor.getHTML())
  })

  return (
    <EditorContent editor={editor} />
  )
}

export default Tiptap

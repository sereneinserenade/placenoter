// src/Tiptap.jsx
import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import './Tiptap.scss'
import Placeholder from '@tiptap/extension-placeholder';

interface TiptapProps {
  onUpdate: Function
}

const Tiptap = ({ onUpdate }: TiptapProps) => {
  const editor = useEditor({
    extensions: [
      StarterKit, Placeholder.configure({
        placeholder: 'Type here...'
      })
    ],
    content: '<p>Hello World!</p>',
    onUpdate: ({ editor }) => onUpdate(editor.getHTML())
  })

  return (
    <EditorContent editor={editor} />
  )
}

export default Tiptap

// src/Tiptap.jsx
import React from 'react';
import { useEditor, EditorContent, Content } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import './Tiptap.scss'
import Placeholder from '@tiptap/extension-placeholder';

interface TiptapProps {
  onUpdate: Function
  content: Content
}

const Tiptap = ({ onUpdate, content }: TiptapProps) => {
  const editor = useEditor({
    extensions: [
      StarterKit, Placeholder.configure({
        placeholder: 'Type here...'
      })
    ],
    content: content,
    onUpdate: ({ editor }) => onUpdate(editor.getHTML())
  })

  return (
    <EditorContent editor={editor} />
  )
}

export default Tiptap

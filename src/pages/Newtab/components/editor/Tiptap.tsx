// src/Tiptap.jsx
import React from 'react';
import { useEditor, EditorContent, Content } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder';

import './Tiptap.scss'
import Menubar from './Menubar'
import Underline from '@tiptap/extension-underline';
import TaskItem from '@tiptap/extension-task-item';
import TaskList from '@tiptap/extension-task-list';

interface TiptapProps {
  onUpdate: Function
  content: Content
}

const Tiptap = ({ onUpdate, content }: TiptapProps) => {

  const editor = useEditor({
    extensions: [
      StarterKit, Placeholder.configure({
        placeholder: 'Type here...'
      }),
      Underline,
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
    ],
    content: content,
    onUpdate: ({ editor }) => onUpdate(editor.getHTML(), editor.getText()),
    autofocus: 'start'
  })

  return (
    <>
      {editor && <Menubar editor={editor} />}

      <EditorContent editor={editor} />
    </>
  )
}

export default Tiptap

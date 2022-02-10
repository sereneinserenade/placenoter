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
import CharacterCount from '@tiptap/extension-character-count';
import TextAlign from '@tiptap/extension-text-align';
import Link from '@tiptap/extension-link';
import { Container } from '@nextui-org/react';

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
      TaskItem.configure({ nested: true }),
      CharacterCount,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Link,
    ],
    content: content,
    onUpdate: ({ editor }) => onUpdate(editor.getHTML(), editor.getText()),
    autofocus: 'start'
  })

  return (
    <>
      {editor && <Menubar editor={editor} />}

      <EditorContent editor={editor} />

      <section className='word-and-character-count-section flex'>
        <span>
          {editor?.storage.characterCount.characters()} Characters
        </span>
        {'&'}
        <span>
          {editor?.storage.characterCount.words()} Words
        </span>
      </section>
    </>
  )
}

export default Tiptap

// src/Tiptap.jsx
import React from 'react';
import { useEditor, EditorContent, Content } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import TaskItem from '@tiptap/extension-task-item';
import TaskList from '@tiptap/extension-task-list';
import CharacterCount from '@tiptap/extension-character-count';
import TextAlign from '@tiptap/extension-text-align';
import Link from '@tiptap/extension-link';
import { Plugin, PluginKey, TextSelection } from 'prosemirror-state';

import './Tiptap.scss'
import Menubar from './Menubar'
import { SearchNReplace } from './extensions'
import { EditorView } from 'prosemirror-view';

interface TiptapProps {
  onUpdate: Function
  content: Content
}

const MyLink = Link.extend({
  addProseMirrorPlugins() {
    let theView: EditorView;

    let done: boolean = false

    const updaterPlugin = new Plugin({
      key: new PluginKey('updaterPlugin'),
      view: (view) => {
        return {
          update(view) {
            theView = view
          }
        }
      },
      props: {
        handleClick(view, pos) {
          const { doc, tr } = view.state;

          const [$start, $end] = [doc.resolve(view.state.selection.from + 1), doc.resolve(view.state.selection.to + 1)];

          view.dispatch(tr.setSelection(new TextSelection($start, $end)));

          const [$newStart, $newEnd] = [doc.resolve(view.state.selection.from - 1), doc.resolve(view.state.selection.to - 1)];

          view.dispatch(tr.setSelection(new TextSelection($newStart, $newEnd)));

          return true
        }
      }
    })

    return [updaterPlugin]
  }
})

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
      MyLink.configure({
        openOnClick: false,
        linkOnPaste: true,
        autolink: true,
      }),
      SearchNReplace,
    ],
    content: content,
    onUpdate: ({ editor }) => onUpdate(editor.getHTML(), editor.getText()),
    autofocus: 'start'
  })

  return (
    <>
      {editor && <Menubar editor={editor} />}

      <EditorContent className='editor-content' editor={editor} />

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

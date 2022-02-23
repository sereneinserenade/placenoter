import React, { useRef, useState } from 'react';

import { useEditor, EditorContent, Content } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import TaskItem from '@tiptap/extension-task-item';
import TaskList from '@tiptap/extension-task-list';
import CharacterCount from '@tiptap/extension-character-count';
import TextAlign from '@tiptap/extension-text-align';
import Link from '@tiptap/extension-link';

import './Tiptap.scss'
import Menubar from './Menubar'
import { SearchNReplace, CustomPurposeExtension } from './extensions'
import Table from '@tiptap/extension-table';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import TableRow from '@tiptap/extension-table-row';
import { CodeBlockLowLight } from './extensions/CodeBlockLowLight';
import { Text } from '@nextui-org/react';
import { useSetRecoilState } from 'recoil';
import { linkModalState } from '../../Store';

interface TiptapProps {
  onUpdate: Function
  content: Content
}

const Tiptap = ({ onUpdate, content }: TiptapProps) => {
  const setGlobalLinkModalVisibleState = useSetRecoilState(linkModalState)

  const [isLocalSearchVisible, setIsLocalSearchVisible] = useState<boolean>(false)

  const focusSearchInput = async (): Promise<void> => {
    await new Promise((r) => setTimeout(r, 300))

    const searchInputEl = document.querySelector('#search-input') as HTMLInputElement

    if (searchInputEl) searchInputEl.focus()
  }

  const onModFPressed = (e: KeyboardEvent) => {
    const isModF = e.code === 'KeyF' && e.metaKey

    if (!isModF) return

    e.stopPropagation()
    e.preventDefault()

    setIsLocalSearchVisible(true)

    focusSearchInput()
  }

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ codeBlock: false, }),
      Placeholder.configure({ placeholder: 'Type here...' }),
      Underline,
      TaskList,
      TaskItem.configure({ nested: true }),
      CharacterCount,
      TextAlign.configure({ types: ['heading', 'paragraph'], }),
      Link.configure({
        openOnClick: false,
        linkOnPaste: true,
        autolink: true,
      }),
      SearchNReplace,
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      CodeBlockLowLight,

      CustomPurposeExtension.configure({ onLinkShortcutEntered: () => setGlobalLinkModalVisibleState(true) }),
    ],
    content: content,
    onUpdate: ({ editor }) => {
      onUpdate(editor.getHTML(), editor.getText())
    },
    onCreate: ({ editor }) => {
      // const editorArea = document.querySelector('.editor-area');

      // if (!editorArea) return

      // (editorArea as HTMLDivElement).addEventListener('click', () => editor?.commands.focus());

      const prosemirror = document.querySelector('.ProseMirror') as HTMLDivElement

      prosemirror.addEventListener('keydown', onModFPressed);
    },
    onDestroy: () => {
      // const editorArea = document.querySelector('.editor-area');

      // if (!editorArea) return

      // (editorArea as HTMLDivElement).removeEventListener('click', () => editor?.commands.focus());

      const prosemirror = document.querySelector('.ProseMirror') as HTMLDivElement

      prosemirror.addEventListener('keydown', onModFPressed);
    },
    autofocus: false,
    editorProps: {
      attributes: {
        spellcheck: 'false'
      }
    }
  })

  return (
    <>
      {
        editor && (
          <Menubar
            editor={editor}
            isLocalSearchVisible={isLocalSearchVisible}
            onSearchTooltipClose={() => setIsLocalSearchVisible(false)}
          />
        )
      }

      <EditorContent className='editor-content' editor={editor} />

      <Text className='word-and-character-count-section flex'>
        <span>
          {editor?.storage.characterCount.characters()} Characters
        </span>
        {'&'}
        <span>
          {editor?.storage.characterCount.words()} Words
        </span>
      </Text>
    </>
  )
}

export default Tiptap

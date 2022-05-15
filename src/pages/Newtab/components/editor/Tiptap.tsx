import React, { useEffect, useRef, useState } from 'react';

import { useEditor, EditorContent, Content } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import TaskItem from '@tiptap/extension-task-item';
import TaskList from '@tiptap/extension-task-list';
import CharacterCount from '@tiptap/extension-character-count';
import TextAlign from '@tiptap/extension-text-align';
import Link from '@tiptap/extension-link';
import Typography from '@tiptap/extension-typography';

import './Tiptap.scss'
import Menubar from './Menubar'
import { SearchAndReplace, SmilieReplacer } from './extensions'
import Table from '@tiptap/extension-table';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import TableRow from '@tiptap/extension-table-row';
import { CodeBlockLowLight } from './extensions/CodeBlockLowLight';
import { Text } from '@nextui-org/react';
import { useSetRecoilState } from 'recoil';
import { currentLinkUrlState, linkModalState } from '../../Store';

interface TiptapProps {
  onUpdate: Function
  content: Content
  isNoteInBin: boolean
}

const Tiptap = ({ onUpdate, content, isNoteInBin }: TiptapProps) => {
  const setGlobalLinkModalVisibleState = useSetRecoilState(linkModalState)

  const setCurrentLinkUrl = useSetRecoilState(currentLinkUrlState)

  const [isLocalSearchVisible, setIsLocalSearchVisible] = useState<boolean>(false)

  const focusSearchInput = async (): Promise<void> => {
    await new Promise((r) => setTimeout(r, 300))

    const searchInputEl = document.querySelector('#search-input') as HTMLInputElement

    if (searchInputEl) searchInputEl.focus()
  }

  const onModFPressed = () => {
    setIsLocalSearchVisible(true)

    focusSearchInput()

    return true
  }

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ codeBlock: false }),
      Placeholder.configure({ placeholder: 'Type here...' }),
      Underline,
      TaskList,
      TaskItem.configure({ nested: true }),
      CharacterCount,
      TextAlign.configure({ types: ['heading', 'paragraph'], }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      Typography,

      // Custom/Extended extensions
      CodeBlockLowLight,
      SearchAndReplace.extend({
        addKeyboardShortcuts() {
          return {
            'Mod-f': onModFPressed
          }
        }
      }),
      Link.extend({
        addKeyboardShortcuts() {
          return {
            'Mod-k': ({ editor: { state: { selection: { from, to } } } }) => {
              if (from !== to) {
                setGlobalLinkModalVisibleState(true)
                return true
              }

              return false
            },
          }
        }
      }).configure({
        openOnClick: false,
        linkOnPaste: true,
        autolink: true,
      }),
      SmilieReplacer
    ],
    content: content,
    onUpdate: ({ editor }) => onUpdate(editor.getHTML(), editor.getText()),
    onSelectionUpdate: ({ editor }) => {
      setTimeout(() => { setCurrentLinkUrl(editor.getAttributes('link')?.href || "") })
    },
    autofocus: false,
    editorProps: {
      attributes: {
        spellcheck: 'true'
      }
    },
  })

  useEffect(() => { editor?.setEditable(!isNoteInBin) }, [isNoteInBin])

  return (
    <>
      {
        editor && !isNoteInBin && (
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

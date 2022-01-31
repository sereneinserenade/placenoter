import React, { useEffect, useState } from 'react';

import { Editor } from '@tiptap/core';
import { RiBold, RiItalic, RiStrikethrough, RiCodeSSlashLine, RiH1, RiH2, RiH3, RiH4, RiH5, RiH6, RiListUnordered, RiListOrdered, RiCodeBoxLine, RiDoubleQuotesL, RiSeparator, RiTextWrap, RiArrowGoBackLine, RiArrowGoForwardLine } from 'react-icons/ri'
import { IconType } from 'react-icons'
import { Tooltip } from '@nextui-org/react';
import { debounce } from 'lodash';

import './Menubar.scss'

type MenubarProps = {
  editor: Editor
}

interface Button {
  name: string
  label: string
  action: (editor: Editor) => boolean
  isActive?: (editor: Editor) => boolean
  icon: IconType
}

const Menubar = ({ editor }: MenubarProps) => {
  if (!editor) return null

  const [isActiveStates, setIsActiveStates] = useState<Record<string, boolean>>({})

  const buttons: Button[] = [
    {
      name: 'bold',
      label: 'Bold',
      action: (editor: Editor) => editor.chain().focus().toggleBold().run(),
      isActive: (editor: Editor) => editor.isActive('bold'),
      icon: RiBold,
    },
    {
      name: 'italic',
      label: 'Italic',
      action: (editor: Editor) => editor.chain().focus().toggleItalic().run(),
      isActive: (editor: Editor) => editor.isActive('italic'),
      icon: RiItalic,
    },
    {
      name: 'strike',
      label: 'Strike',
      action: (editor: Editor) => editor.chain().focus().toggleStrike().run(),
      isActive: (editor: Editor) => editor.isActive('strike'),
      icon: RiStrikethrough,
    },
    {
      name: 'code',
      label: 'Code',
      action: (editor: Editor) => editor.chain().focus().toggleCode().run(),
      isActive: (editor: Editor) => editor.isActive('code'),
      icon: RiCodeSSlashLine,
    },
    {
      name: 'h1',
      label: 'H1',
      action: (editor: Editor) => editor.chain().focus().toggleHeading({ level: 1 }).run(),
      isActive: (editor: Editor) => editor.isActive('heading', { level: 1 }),
      icon: RiH1,
    },
    {
      name: 'h2',
      label: 'H2',
      action: (editor: Editor) => editor.chain().focus().toggleHeading({ level: 2 }).run(),
      isActive: (editor: Editor) => editor.isActive('heading', { level: 2 }),
      icon: RiH2,
    },
    {
      name: 'h3',
      label: 'H3',
      action: (editor: Editor) => editor.chain().focus().toggleHeading({ level: 3 }).run(),
      isActive: (editor: Editor) => editor.isActive('heading', { level: 3 }),
      icon: RiH3,
    },
    {
      name: 'h4',
      label: 'H4',
      action: (editor: Editor) => editor.chain().focus().toggleHeading({ level: 4 }).run(),
      isActive: (editor: Editor) => editor.isActive('heading', { level: 4 }),
      icon: RiH4
    },
    {
      name: 'h5',
      label: 'H5',
      action: (editor: Editor) => editor.chain().focus().toggleHeading({ level: 5 }).run(),
      isActive: (editor: Editor) => editor.isActive('heading', { level: 5 }),
      icon: RiH5,
    },
    {
      name: 'h6',
      label: 'H6',
      action: (editor: Editor) => editor.chain().focus().toggleHeading({ level: 6 }).run(),
      isActive: (editor: Editor) => editor.isActive('heading', { level: 6 }),
      icon: RiH6,
    },
    {
      name: 'bulletList',
      label: 'Bullet List',
      action: (editor: Editor) => editor.chain().focus().toggleBulletList().run(),
      isActive: (editor: Editor) => editor.isActive('bulletList'),
      icon: RiListUnordered,
    },
    {
      name: 'orderedList',
      label: 'Ordered List',
      action: (editor: Editor) => editor.chain().focus().toggleOrderedList().run(),
      isActive: (editor: Editor) => editor.isActive('orderedList'),
      icon: RiListOrdered,
    },
    {
      name: 'codeBlock',
      label: 'Code Block',
      action: (editor: Editor) => editor.chain().focus().toggleCodeBlock().run(),
      isActive: (editor: Editor) => editor.isActive('codeBlock'),
      icon: RiCodeBoxLine,
    },
    {
      name: 'blockquote',
      label: 'Blockquote',
      action: (editor: Editor) => editor.chain().focus().toggleBlockquote().run(),
      isActive: (editor: Editor) => editor.isActive('blockquote'),
      icon: RiDoubleQuotesL,
    },
    {
      name: 'horizontalRule',
      label: 'Horizontal Rule',
      action: (editor: Editor) => editor.chain().focus().setHorizontalRule().run(),
      icon: RiSeparator,
    },
    {
      name: 'hardBreak',
      label: 'Hard Break',
      action: (editor: Editor) => editor.chain().focus().setHardBreak().run(),
      icon: RiTextWrap,
    },
    {
      name: 'undo',
      label: 'Undo',
      action: (editor: Editor) => editor.chain().focus().undo().run(),
      icon: RiArrowGoBackLine,
    },
    {
      name: 'redo',
      label: 'Redo',
      action: (editor: Editor) => editor.chain().focus().redo().run(),
      icon: RiArrowGoForwardLine,
    }
  ]

  const calculateIsActiveStates = (editor: Editor) => {
    const states: Record<string, boolean> = {}

    buttons.forEach((btn) => btn.isActive ? states[btn.name] = btn.isActive(editor) : null)

    setIsActiveStates({ ...states })
  }

  const debouncedCalculateIsActiveStates = debounce(calculateIsActiveStates, 500)

  let count = 0;
  const onMounted = () => {
    count += 1;
    if (count > 5) return

    if (!editor) {
      setTimeout(onMounted, 200)
      return
    }

    editor.on('update', ({ editor }) => debouncedCalculateIsActiveStates(editor))

    calculateIsActiveStates(editor)
  }

  useEffect(() => { onMounted() }, [])

  return (
    <section className='menubar flex'>
      {editor && buttons.map((btn) => {
        return (
          <Tooltip key={btn.name} content={btn.label}>
            <button className={`menubar-button flex ${isActiveStates[btn.name] ? 'active' : ''}`} onClick={() => btn.action(editor) && calculateIsActiveStates(editor)}>
              <btn.icon />
            </button>
          </Tooltip>
        )
      })
      }
    </section>
  )
}

export default Menubar
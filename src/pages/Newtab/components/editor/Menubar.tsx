import React, { useEffect, useState } from 'react';

import { Editor } from '@tiptap/core';
import { BubbleMenu } from '@tiptap/react'
import { RiBold, RiItalic, RiStrikethrough, RiCodeSSlashLine, RiH1, RiH2, RiH3, RiListUnordered, RiListOrdered, RiCodeBoxLine, RiDoubleQuotesL, RiSeparator, RiTextWrap, RiArrowGoBackLine, RiArrowGoForwardLine, RiUnderline, RiListCheck2, RiAlignLeft, RiAlignRight, RiAlignCenter, RiAlignJustify, RiLink, RiSearch2Line, RiTableLine } from 'react-icons/ri'
import { IconType } from 'react-icons'
import { Button, Input, Tooltip, Text } from '@nextui-org/react';
import { useRecoilState, useRecoilValue } from 'recoil'
import { debounce } from 'lodash';

import { activeNoteState, editorSearchState } from '../../Store';
import LinkModal from './LinkModal'
import './Menubar.scss'
import LinkBubbleMenu from './LinkBubbleMenu';

type MenubarProps = {
  editor: Editor
}

type ActionType = (editor: Editor) => boolean

interface Button {
  name: string
  label?: string
  action?: ActionType | Function
  isActive?: (editor: Editor) => boolean
  icon?: IconType
}

const Menubar = ({ editor }: MenubarProps) => {
  if (!editor) return null

  const activeNote = useRecoilValue(activeNoteState)

  const [globalSearchTerm, setGlobalSearchTerm] = useRecoilState(editorSearchState)

  const [isActiveStates, setIsActiveStates] = useState<Record<string, boolean>>({})

  const [linkModalVisible, setLinkModalVisible] = useState<boolean>(false)

  const [currentUrl, setCurrentUrl] = useState<string>("")

  const [localSearchTerm, setLocalSearchTerm] = useState<string>("")

  const [replaceTerm, setReplaceTerm] = useState<string>("")

  const [tableGridWidth, setTableGridWidth] = useState<number>(4)

  const [tableGridHeight, setTableGridHeight] = useState<number>(4)

  const [activeCell, setActiveCell] = useState<{ x: number, y: number }>({ x: 3, y: 3 })

  const setGridDimensions = ({ x, y }: { x: number, y: number }) => {
    if (x < 5 && y < 5) {
      setTableGridWidth(5)
      setTableGridHeight(5)
      return
    }

    if (x < 5) setTableGridWidth(5)
    if (x >= 5 && x <= 9) setTableGridWidth(x + 1)

    if (y < 5) setTableGridHeight(5)
    if (y >= 5 && x <= 9) setTableGridHeight(y + 1)
  }

  const insertTable = () => {
    const [rows, cols] = [tableGridWidth, tableGridHeight]

    editor.chain().focus().insertTable({ rows, cols, withHeaderRow: true }).run()
  }

  useEffect(() => { setGridDimensions(activeCell) }, [activeCell])

  useEffect(() => {
    editor.commands.setSearchTerm(localSearchTerm);
    editor.commands.setReplaceTerm(replaceTerm);
  }, [localSearchTerm, replaceTerm])

  useEffect(() => { setLocalSearchTerm(globalSearchTerm) }, [globalSearchTerm])

  const openLinkModal = () => setLinkModalVisible(true)

  const closeLinkModal = (url?: string) => {
    setLinkModalVisible(false)

    if (url === null || !editor) return

    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()

      return
    }

    url && editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }

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
      name: 'underline',
      label: 'Underline',
      action: (editor: Editor) => editor.chain().focus().toggleUnderline().run(),
      isActive: (editor: Editor) => editor.isActive('underline'),
      icon: RiUnderline,
    },
    {
      name: 'strike',
      label: 'Strike',
      action: (editor: Editor) => editor.chain().focus().toggleStrike().run(),
      isActive: (editor: Editor) => editor.isActive('strike'),
      icon: RiStrikethrough,
    },
    {
      name: 'divider',
    },
    {
      name: 'link',
      label: 'Link',
      action: openLinkModal,
      isActive: (editor: Editor) => editor.isActive('link'),
      icon: RiLink,
    },
    {
      name: 'code',
      label: 'Code',
      action: (editor: Editor) => editor.chain().focus().toggleCode().run(),
      isActive: (editor: Editor) => editor.isActive('code'),
      icon: RiCodeSSlashLine,
    },
    {
      name: 'divider',
    },
    {
      name: 'alignLeft',
      label: 'Align Left',
      action: (editor: Editor) => editor.chain().focus().setTextAlign('left').run(),
      isActive: (editor: Editor) => editor.isActive({ textAlign: 'left' }),
      icon: RiAlignLeft,
    },
    {
      name: 'alignCenter',
      label: 'Align Center',
      action: (editor: Editor) => editor.chain().focus().setTextAlign('center').run(),
      isActive: (editor: Editor) => editor.isActive({ textAlign: 'center' }),
      icon: RiAlignCenter,
    },
    {
      name: 'alignRight',
      label: 'Align Right',
      action: (editor: Editor) => editor.chain().focus().setTextAlign('right').run(),
      isActive: (editor: Editor) => editor.isActive({ textAlign: 'right' }),
      icon: RiAlignRight,
    },
    {
      name: 'alignJustify',
      label: 'Align Justify',
      action: (editor: Editor) => editor.chain().focus().setTextAlign('justify').run(),
      isActive: (editor: Editor) => editor.isActive({ textAlign: 'justify' }),
      icon: RiAlignJustify,
    },
    {
      name: 'divider',
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
      name: 'divider',
    },
    // {
    //   name: 'h4',
    //   label: 'H4',
    //   action: (editor: Editor) => editor.chain().focus().toggleHeading({ level: 4 }).run(),
    //   isActive: (editor: Editor) => editor.isActive('heading', { level: 4 }),
    //   icon: RiH4
    // },
    // {
    //   name: 'h5',
    //   label: 'H5',
    //   action: (editor: Editor) => editor.chain().focus().toggleHeading({ level: 5 }).run(),
    //   isActive: (editor: Editor) => editor.isActive('heading', { level: 5 }),
    //   icon: RiH5,
    // },
    // {
    //   name: 'h6',
    //   label: 'H6',
    //   action: (editor: Editor) => editor.chain().focus().toggleHeading({ level: 6 }).run(),
    //   isActive: (editor: Editor) => editor.isActive('heading', { level: 6 }),
    //   icon: RiH6,
    // },
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
      name: 'taskList',
      label: 'Task List',
      action: (editor: Editor) => editor.chain().focus().toggleTaskList().run(),
      isActive: (editor: Editor) => editor.isActive('taskList'),
      icon: RiListCheck2,
    },
    {
      name: 'divider',
    },
    {
      name: 'table',
      label: 'Table',
      action: () => insertTable(),
      isActive: (editor: Editor) => editor.can().deleteTable(),
      icon: RiTableLine,
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
      name: 'divider',
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
      name: 'divider',
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

  const debouncedCalculateIsActiveStates = debounce(calculateIsActiveStates, 200)

  let count = 0;
  const onMounted = () => {
    count += 1;
    if (count > 5) return

    if (!editor) {
      setTimeout(onMounted, 200)
      return
    }

    editor.on('transaction', ({ editor }) => debouncedCalculateIsActiveStates(editor))

    editor.on('selectionUpdate', ({ editor }) => setCurrentUrl(editor.getAttributes('link').href))

    calculateIsActiveStates(editor)
  }

  useEffect(() => { onMounted() }, [])

  const stopPrevent = <T extends unknown>(e: T) => {
    (e as Event).stopPropagation();
    (e as Event).preventDefault()

    return e
  }

  const SearchSection = () => (
    <section className='search-and-replace-section flex'>
      <section className='inputs-section flex'>
        <Input
          placeholder='Search for...'
          size="sm"
          value={localSearchTerm}
          onInput={e => stopPrevent(e) && setLocalSearchTerm((e.target as HTMLInputElement).value)}
        />
        <Input
          placeholder='Replace with...'
          size="sm"
          value={replaceTerm}
          onInput={e => stopPrevent(e) && setReplaceTerm((e.target as HTMLInputElement).value)}
          onKeyPress={e => e.key === 'Enter' && editor.commands.replace()}
        />
      </section>

      <section className='buttons-section flex'>
        <Button bordered size='sm' onClick={() => editor.commands.replace()}>
          Replace
        </Button>

        <Button bordered ghost color='gradient' size='sm' onClick={() => editor.commands.replaceAll()}>
          Replace All
        </Button>
      </section>
    </section>
  )

  const GimmeBubbleMenu = ({ editor }: { editor: Editor }) => {
    const nameOfButtons = ['bold', 'italic', 'underline', 'strike', 'link', 'alignLeft', 'alignCenter', 'alignRight', 'alignJustify', 'code']

    return (
      editor && activeNote?.id &&
      <BubbleMenu editor={editor} className="bubble-menu menubar flex" tippyOptions={{ placement: 'top' }} >
        {
          buttons
            .filter(b => nameOfButtons.some(n => b.name === n))
            .map((btn, index) => {
              return (
                <Tooltip key={btn.name} content={btn.label}>
                  <button
                    className={`menubar-button flex ${isActiveStates[btn.name] ? 'active' : ''}`}
                    onClick={() => btn.action && btn.action(editor) && debouncedCalculateIsActiveStates(editor)}
                  >
                    {btn.icon && <btn.icon />}
                  </button>
                </Tooltip>
              )
            })
        }
      </BubbleMenu>
    )
  }

  const TableControlButtons = () => {
    return (
      <></>
    )
  }

  return (
    <section className='menubar flex' aria-label='menubar-section'>
      {
        activeNote?.id && editor && buttons.map((btn, index) => {
          if (btn.name === 'divider') return (<div key={(index + 1) + 'th-divider'} className='divider' />)

          if (btn.name === 'table') {
            return (
              <>
                <Tooltip key={btn.name} content={btn.label}>
                  <button
                    className={`menubar-button flex ${isActiveStates[btn.name] ? 'active' : ''}`}
                    onClick={() => btn.action && btn.action(editor) && debouncedCalculateIsActiveStates(editor)}
                  >
                    {btn.icon && <btn.icon />}
                  </button>
                </Tooltip>
                <Tooltip key={'table-controls-button'} content={TableControlButtons()}>
                  <button
                    className={`menubar-button flex ${isActiveStates[btn.name] ? 'active' : ''}`}
                    onClick={() => btn.action && btn.action(editor) && debouncedCalculateIsActiveStates(editor)}
                  >
                    {btn.icon && <btn.icon />}
                  </button>
                </Tooltip>
              </>
            )
          }

          return (
            <Tooltip key={btn.name} content={btn.label}>
              <button
                className={`menubar-button flex ${isActiveStates[btn.name] ? 'active' : ''}`}
                onClick={() => btn.action && btn.action(editor) && debouncedCalculateIsActiveStates(editor)}
              >
                {btn.icon && <btn.icon />}
              </button>
            </Tooltip>
          )
        })
      }

      {
        activeNote?.id && editor && (
          // Using `SearchSection()` instead of `<SearchSection />` cause the input
          // elements were getting unfocused because of rerender when something was typed
          <Tooltip visible={!!globalSearchTerm.length} trigger='click' placement='bottomEnd' content={SearchSection()}>
            <button className="menubar-button flex" >
              <RiSearch2Line />
            </button>
          </Tooltip>
        )
      }

      <LinkModal visible={linkModalVisible} onClose={closeLinkModal} url={currentUrl} />

      {editor && GimmeBubbleMenu({ editor })}

      {editor && <LinkBubbleMenu editor={editor} currentUrl={currentUrl} closeLinkModal={closeLinkModal} />}
    </section>
  )
}

export default Menubar
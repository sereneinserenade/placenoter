import React, { useEffect, useMemo, useState } from 'react';

import { Editor } from '@tiptap/core';
import { BubbleMenu } from '@tiptap/react'
import { RiBold, RiItalic, RiStrikethrough, RiCodeSSlashLine, RiH1, RiH2, RiH3, RiListUnordered, RiListOrdered, RiCodeBoxLine, RiDoubleQuotesL, RiSeparator, RiTextWrap, RiArrowGoBackLine, RiArrowGoForwardLine, RiUnderline, RiListCheck2, RiAlignLeft, RiAlignRight, RiAlignCenter, RiAlignJustify, RiLink, RiSearch2Line, RiTableLine, RiArrowDownSLine } from 'react-icons/ri'
import { IconType } from 'react-icons'
import { Button, Input, Tooltip, Text } from '@nextui-org/react';
import { useRecoilState, useRecoilValue } from 'recoil'
import { debounce } from 'lodash';

import { activeNoteState, editorSearchState, linkModalState } from '../../Store';
import LinkModal from './LinkModal'
import './Menubar.scss'
import LinkBubbleMenu from './LinkBubbleMenu';
import MenubarTableButtons from './MenubarTableButtons';
import { lowlight } from 'lowlight/lib/common.js';
import { gimmeReverseLangAlias } from './extensions/CodeBlockLowLight';

type MenubarProps = {
  editor: Editor,
  isLocalSearchVisible: boolean,
  onSearchTooltipClose: () => any
}

type ActionType = (editor: Editor) => boolean

interface Button {
  name: string
  label?: string
  action?: ActionType | Function
  isActive?: (editor: Editor) => boolean
  icon?: IconType
}

const Menubar = ({ editor, isLocalSearchVisible, onSearchTooltipClose }: MenubarProps) => {
  if (!editor) return null

  const activeNote = useRecoilValue(activeNoteState)

  const [globalSearchTerm, setGlobalSearchTerm] = useRecoilState(editorSearchState)

  const [isActiveStates, setIsActiveStates] = useState<Record<string, boolean>>({})

  const [linkModalVisible, setLinkModalVisible] = useState<boolean>(false)

  const [currentUrl, setCurrentUrl] = useState<string>("")

  const [currentLang, setCurrentLang] = useState<string>("")

  const [localSearchTerm, setLocalSearchTerm] = useState<string>("")

  const [replaceTerm, setReplaceTerm] = useState<string>("")

  const [tableGridWidth, setTableGridWidth] = useState<number>(6)

  const [tableGridHeight, setTableGridHeight] = useState<number>(6)

  const [activeCell, setActiveCell] = useState<{ x: number, y: number }>({ x: 3, y: 3 })

  const [globalLinkModalVisibleState, setGlobalLinkModalVisibleState] = useRecoilState(linkModalState)

  useEffect(() => { if (globalLinkModalVisibleState) setLinkModalVisible(true) }, [globalLinkModalVisibleState])

  const setGridDimensions = ({ x, y }: { x: number, y: number }) => {
    if (x >= 4 && x <= 9) {
      const newWidth = x + 1

      if (newWidth > tableGridWidth) setTableGridWidth(x + 1)
    }

    if (y >= 4 && y <= 9) {
      const newHeight = y + 1

      if (newHeight > tableGridHeight) setTableGridHeight(y + 1)
    }
  }

  const insertTable = ({ rows, cols, e }: { rows: number, cols: number, e?: Event }) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }

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
    setGlobalLinkModalVisibleState(false)

    editor?.commands.focus()

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
      name: 'orderedList',
      label: 'Ordered List',
      action: (editor: Editor) => editor.chain().focus().toggleOrderedList().run(),
      isActive: (editor: Editor) => editor.isActive('orderedList'),
      icon: RiListOrdered,
    },
    {
      name: 'bulletList',
      label: 'Bullet List',
      action: (editor: Editor) => editor.chain().focus().toggleBulletList().run(),
      isActive: (editor: Editor) => editor.isActive('bulletList'),
      icon: RiListUnordered,
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
      action: () => null,
      isActive: (editor: Editor) => editor.can().deleteTable(),
      icon: RiTableLine,
    },
    {
      name: 'blockquote',
      label: 'Blockquote',
      action: (editor: Editor) => editor.chain().focus().toggleBlockquote().run(),
      isActive: (editor: Editor) => editor.isActive('blockquote'),
      icon: RiDoubleQuotesL,
    },
    {
      name: 'codeBlock',
      label: 'Code Block',
      action: (editor: Editor) => editor.chain().focus().toggleCodeBlock().run(),
      isActive: (editor: Editor) => editor.isActive('codeBlock'),
      icon: RiCodeBoxLine,
    },
    {
      name: 'divider',
    },
    // {
    //   name: 'horizontalRule',
    //   label: 'Horizontal Rule',
    //   action: (editor: Editor) => editor.chain().focus().setHorizontalRule().run(),
    //   icon: RiSeparator,
    // },
    // {
    //   name: 'hardBreak',
    //   label: 'Hard Break',
    //   action: (editor: Editor) => editor.chain().focus().setHardBreak().run(),
    //   icon: RiTextWrap,
    // },
    // {
    //   name: 'divider',
    // },
    // {
    //   name: 'undo',
    //   label: 'Undo',
    //   action: (editor: Editor) => editor.chain().focus().undo().run(),
    //   icon: RiArrowGoBackLine,
    // },
    // {
    //   name: 'redo',
    //   label: 'Redo',
    //   action: (editor: Editor) => editor.chain().focus().redo().run(),
    //   icon: RiArrowGoForwardLine,
    // }
  ]

  const isMac = useMemo<boolean>(() => navigator.userAgent.toLowerCase().includes('mac'), [])

  const buttonKeys = useMemo<Record<string, string>>(() => ({
    bold: isMac ? "⌘+B" : "ctrl+B",
    italic: isMac ? "⌘+I" : "ctrl+I",
    underline: isMac ? "⌘+U" : "ctrl+U",
    strike: isMac ? "⌘+shift+X" : "ctrl+shift+X",
    link: isMac ? "⌘+K" : "ctrl+k",
    code: isMac ? "⌘+E" : "ctrl+E",
    alignLeft: isMac ? "⌘+shift+L" : "ctrl+shift+L",
    alignCenter: isMac ? "⌘+shift+E" : "ctrl+shift+E",
    alignRight: isMac ? "⌘+shift+R" : "ctrl+shift+R",
    alignJustify: isMac ? "⌘+shift+J" : "ctrl+shift+J",
    h1: isMac ? "⌘+⌥+1" : "ctrl+alt+1",
    h2: isMac ? "⌘+⌥+2" : "ctrl+alt+2",
    h3: isMac ? "⌘+⌥+3" : "ctrl+alt+3",
    orderedList: isMac ? "⌘+shift+7" : "ctrl+shift+7",
    bulletList: isMac ? "⌘+shift+8" : "ctrl+shift+8",
    taskList: isMac ? "⌘+shift+9" : "ctrl+shift+9",
    //table:isMac?"":"",
    blockquote: isMac ? "⌘+shift+B" : "ctrl+shift+B",
    codeBlock: isMac ? "⌘+⌥+C" : "ctrl+alt+C",
    //horizontalRule:isMac?"":"",
    //hardBreak:isMac?"":"",
    undo: isMac ? "⌘+Z" : "ctrl+Z",
    redo: isMac ? "⌘+shift+Z" : "ctrl+shift+z",
  }), [isMac])

  const GimmeTooltip = (tooltip: string, name: string) => {
    if (buttonKeys[name]) return <Text> {tooltip} <kbd>({buttonKeys[name]})</kbd></Text>

    return <Text> {tooltip} </Text>
  }

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

    editor.on('selectionUpdate', ({ editor }) => {
      setCurrentUrl(editor.getAttributes('link').href)
      setCurrentLang(editor.getAttributes('codeBlock').language)
    })

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
          id="search-input"
          animated={false}
          shadow={false}
        />
        <Input
          placeholder='Replace with...'
          size="sm"
          value={replaceTerm}
          onInput={e => stopPrevent(e) && setReplaceTerm((e.target as HTMLInputElement).value)}
          onKeyPress={e => e.key === 'Enter' && editor.commands.replace()}
          animated={false}
          shadow={false}
        />
      </section>

      <section className='buttons-section flex'>
        <Button bordered size='sm' onClick={() => editor.commands.replace()}>
          Replace
        </Button>

        <Button
          bordered
          ghost
          color='gradient'
          size='sm'
          onClick={() => editor.commands.replaceAll() && editor.commands.focus()}
        >
          Replace All
        </Button>
      </section>
    </section>
  )


  const GimmeBubbleMenu = ({ editor }: { editor: Editor }) => {
    const nameOfButtons = ['bold', 'italic', 'underline', 'strike', 'link', 'alignLeft', 'alignCenter', 'alignRight', 'alignJustify', 'code']

    return BubbleMenu({
      editor,
      className: `bubble-menu menubar flex ${isActiveStates['codeBlock'] && 'hide'}`,
      tippyOptions: { placement: 'top' },
      children: (
        <>
          {
            buttons.filter(b => nameOfButtons.some(n => b.name === n))
              .map((btn) => {
                return (
                  <Tooltip key={btn.name} content={btn.label ? GimmeTooltip(btn.label, btn.name) : btn.label}>
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
        </>
      )
    })
  }

  type TableGridProps = {
    tableGridHeight: number,
    tableGridWidth: number
  }

  const TableGrid = ({ tableGridHeight, tableGridWidth }: TableGridProps) => {
    return (
      <section key={'table-grid'} className='table-grid'>
        {
          new Array(tableGridHeight).fill(0).map((h, i) => {
            return (
              <section key={`${i + 1}th_row`} className={`table-grid-row ${i === 0 ? 'first-row' : ''}`}>
                {
                  new Array(tableGridWidth)
                    .fill(0)
                    .map((w, j) => (
                      <article
                        key={`${j + 1}_${i + 1}_th_cell`}
                        onMouseEnter={() => setActiveCell({ x: j + 1, y: i + 1 })}
                      >
                        <button
                          className={`grid-box ${j + 1 <= activeCell.x && i + 1 <= activeCell.y && 'active'}`}
                          onClick={(e: any) => insertTable({ rows: i + 1, cols: j + 1, e })}
                        />
                      </article>
                    ))
                }
              </section>
            )
          })
        }
        {
          <section className='flex justify-center'>
            <Text>
              {activeCell.y} Rows x {activeCell.x} Cols
            </Text>
          </section>
        }
      </section>
    )
  }

  type CodeBlockLanguageSelectorProps = {
    editor: Editor,
    currentLang: string
  }

  const CodeBlockLanguageSelector = ({ editor, currentLang }: CodeBlockLanguageSelectorProps) => {
    const reverseLangAlias = useMemo(gimmeReverseLangAlias, [])

    const langs = lowlight.listLanguages() || []

    langs.unshift('')

    const [val, setVal] = useState<string>('')

    useEffect(() => { setVal(reverseLangAlias[currentLang] || currentLang) }, [currentLang])


    const updateVal = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const { value } = e.target

      editor.chain().updateAttributes('codeBlock', { language: value }).focus().run()

      setTimeout(() => setCurrentLang(editor.getAttributes('codeBlock').language));
    }

    return (
      <section className='code-block-language-selector-section'>
        {
          langs.length && editor.isActive('codeBlock')
            ? (
              <>
                <Text weight={'medium'} size={'1.2em'} margin={'0 0 8px 0'}>Select Language: </Text>

                <select value={val} name="language-selector" id="language-selector" onChange={(e) => updateVal(e)}>
                  {langs.map((v: string) => (<option key={`${v}_option`} value={v}> {v.split("").map((a, i) => !i ? a.toUpperCase() : a).join("") || 'Choose Language'} </option>))}
                </select>
              </>
            )
            : (<Text color={'info'} small> Not inside a code block. </Text>)
        }
      </section>
    )
  }

  return (
    <section className='menubar flex' aria-label='menubar-section'>
      {
        activeNote?.id && editor &&

        <>
          {
            buttons.map((btn, index) => {
              if (btn.name === 'divider') return (<div key={(index + 1) + 'th-divider'} className='divider' />)

              if (btn.name === 'table') {
                return (
                  <section key={'table-key-prop'} className='table-menu-section flex'>
                    <Tooltip
                      key={btn.name}
                      placement="bottomStart"
                      content={TableGrid({ tableGridHeight, tableGridWidth })}
                      trigger="click"
                      onVisibleChange={(val) => !val && setTimeout(() => `${setTableGridHeight(6)} ${setTableGridWidth(6)}`, 500)}
                    >
                      <Tooltip placement='top' content={btn.label}>
                        <button className={`menubar-button add-table-button flex ${isActiveStates[btn.name] ? 'active' : ''}`} >
                          {btn.icon && <btn.icon />}
                        </button>
                      </Tooltip>
                    </Tooltip>
                    <Tooltip key={'table-controls-button'} content={MenubarTableButtons({ editor })} trigger="click" placement='bottom'>
                      <Tooltip placement='top' content={'Table Options'}>
                        <button className={`menubar-button table-controls-button flex ${isActiveStates[btn.name] ? 'active' : ''}`} >
                          {<RiArrowDownSLine />}
                        </button>
                      </Tooltip>
                    </Tooltip>
                  </section>
                )
              }

              if (btn.name === 'codeBlock') {
                return (
                  <Tooltip trigger='hover' key={btn.name} placement='top' content={btn.label ? GimmeTooltip(btn.label, btn.name) : btn.label}>
                    <Tooltip trigger='hover' content={CodeBlockLanguageSelector({ editor, currentLang })} placement={'bottom'}>
                      <button
                        className={`menubar-button flex ${isActiveStates[btn.name] ? 'active' : ''}`}
                        onClick={() => btn.action && btn.action(editor) && debouncedCalculateIsActiveStates(editor)}
                      >
                        {btn.icon && <btn.icon />}
                      </button>
                    </Tooltip>
                  </Tooltip>
                )
              }

              return (
                <Tooltip key={btn.name} content={btn.label ? GimmeTooltip(btn.label, btn.name) : btn.label}>
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

          {/* Using `SearchSection()` instead of `<SearchSection />` cause the input
            elements were getting unfocused because of rerender when something was typed */}

          <Tooltip
            visible={!!globalSearchTerm.length || isLocalSearchVisible}
            trigger='click'
            placement='bottom'
            content={SearchSection()}
            onVisibleChange={(val) => val ? null : onSearchTooltipClose()}
          >
            <button className="menubar-button flex" >
              <RiSearch2Line />
            </button>
          </Tooltip>

          <LinkModal visible={linkModalVisible} onClose={closeLinkModal} url={currentUrl} />

          {GimmeBubbleMenu({ editor })}

          {LinkBubbleMenu({ editor, closeLinkModal, currentUrl })}
        </>
      }
    </section>
  )
}

export default Menubar
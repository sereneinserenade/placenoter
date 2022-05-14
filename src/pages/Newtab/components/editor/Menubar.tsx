import React, { useEffect, useMemo, useState } from 'react';

import { Editor } from '@tiptap/core';
import { BubbleMenu as TiptapBubbleMenu } from '@tiptap/react'
import { Button, Input, Tooltip, Text } from '@nextui-org/react';
import { useRecoilState, useRecoilValue } from 'recoil'
import { debounce } from 'lodash';
import { RiSearch2Line, RiArrowDownSLine } from 'react-icons/ri'

import { buttons } from './meta'
import { activeNoteState, editorSearchState, linkModalState } from '../../Store';
import LinkModal from './LinkModal'
import './Menubar.scss'
import LinkBubbleMenu from './LinkBubbleMenu';
import MenubarTableButtons from './MenubarTableButtons';
import { lowlight } from 'lowlight/lib/common.js';
import { getReverseLangAlias } from './extensions/CodeBlockLowLight';

type MenubarProps = {
  editor: Editor,
  isLocalSearchVisible: boolean,
  onSearchTooltipClose: () => any
}


const stopPrevent = <T extends unknown>(e: T) => {
  (e as Event).stopPropagation();
  (e as Event).preventDefault()

  return e
}

const isMac = navigator.userAgent.toLowerCase().includes('mac')

interface SearchSectionProps {
  editor: Editor,
  localSearchTerm: string,
  replaceTerm: string,
  setLocalSearchTerm: (val: string) => void
  setReplaceTerm: (val: string) => void
}

const SearchSection = ({ editor, localSearchTerm, setLocalSearchTerm, replaceTerm, setReplaceTerm }: SearchSectionProps) => (
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


const linuxButtonKeys: Record<string, string> = {
  bold: "ctrl+B",
  italic: "ctrl+I",
  underline: "ctrl+U",
  strike: "ctrl+shift+X",
  link: "ctrl+k",
  code: "ctrl+E",
  alignLeft: "ctrl+shift+L",
  alignCenter: "ctrl+shift+E",
  alignRight: "ctrl+shift+R",
  alignJustify: "ctrl+shift+J",
  h1: "ctrl+alt+1",
  h2: "ctrl+alt+2",
  h3: "ctrl+alt+3",
  orderedList: "ctrl+shift+7",
  bulletList: "ctrl+shift+8",
  taskList: "ctrl+shift+9",
  //table: isMac?"":"",
  blockquote: "ctrl+shift+B",
  codeBlock: "ctrl+alt+C",
  //horizontalRule: isMac?"":"",
  //hardBreak: isMac?"":"",
  undo: "ctrl+Z",
  redo: "ctrl+shift+z",
}

const macButtonKeys: Record<string, string> = {
  bold: "⌘+B",
  italic: "⌘+I",
  underline: "⌘+U",
  strike: "⌘+shift+X",
  link: "⌘+K",
  code: "⌘+E",
  alignLeft: "⌘+shift+L",
  alignCenter: "⌘+shift+E",
  alignRight: "⌘+shift+R",
  alignJustify: "⌘+shift+J",
  h1: "⌘+⌥+1",
  h2: "⌘+⌥+2",
  h3: "⌘+⌥+3",
  orderedList: "⌘+shift+7",
  bulletList: "⌘+shift+8",
  taskList: "⌘+shift+9",
  //table:isMac?"":"",
  blockquote: "⌘+shift+B",
  codeBlock: "⌘+⌥+C",
  //horizontalRule:isMac?"":"",
  //hardBreak:isMac?"":"",
  undo: "⌘+Z",
  redo: "⌘+shift+Z",
}

const buttonKeys = isMac ? macButtonKeys : linuxButtonKeys

const GetTooltip = (tooltip: string, name: string) => {
  if (buttonKeys[name]) return <Text> {tooltip} <kbd>({buttonKeys[name]})</kbd></Text>

  return <Text> {tooltip} </Text>
}


interface BubbleMenuProps {
  editor: Editor,
  isActiveStates: Record<string, boolean>,
  debouncedCalculateIsActiveStates: (editor: Editor) => void,
  openLinkModal: () => void
}

const BubbleMenu = ({ editor, isActiveStates, debouncedCalculateIsActiveStates, openLinkModal }: BubbleMenuProps) => {
  const nameOfButtons = ['bold', 'italic', 'underline', 'strike', 'link', 'alignLeft', 'alignCenter', 'alignRight', 'alignJustify', 'code']

  return TiptapBubbleMenu({
    editor,
    className: `bubble-menu menubar flex ${isActiveStates['codeBlock'] && 'hide'}`,
    tippyOptions: { placement: 'top' },
    children: (
      <>
        {
          buttons.filter(b => nameOfButtons.some(n => b.name === n))
            .map((btn) => {
              return (
                <Tooltip key={btn.name} content={btn.label ? GetTooltip(btn.label, btn.name) : btn.label}>
                  <button
                    className={`menubar-button flex ${isActiveStates[btn.name] ? 'active' : ''}`}
                    onClick={() => btn.action && btn.name === 'link' ? btn.action(openLinkModal) : btn.action(editor) && debouncedCalculateIsActiveStates(editor)}
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



type CodeBlockLanguageSelectorProps = {
  editor: Editor,
  currentLang: string,
  setCurrentLang: (val: string) => void
}

const CodeBlockLanguageSelector = ({ editor, currentLang, setCurrentLang }: CodeBlockLanguageSelectorProps) => {
  const reverseLangAlias = useMemo(getReverseLangAlias, [])

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


type TableGridProps = {
  tableGridHeight: number,
  tableGridWidth: number,
  setActiveCell: ({ x, y }: { x: number, y: number }) => void,
  insertTable: ({ rows, cols, e }: { rows: number, cols: number, e: Event }) => void,
  activeCell: { x: number, y: number }
}

const TableGrid = ({ tableGridHeight, tableGridWidth, setActiveCell, insertTable, activeCell }: TableGridProps) => {
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
                      content={TableGrid({ tableGridHeight, tableGridWidth, activeCell, insertTable, setActiveCell })}
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
                  <Tooltip trigger='hover' key={btn.name} placement='top' content={btn.label ? GetTooltip(btn.label, btn.name) : btn.label}>
                    <Tooltip
                      trigger='hover'
                      content={CodeBlockLanguageSelector({ editor, currentLang, setCurrentLang })}
                      placement={'bottom'}
                    >
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
                <Tooltip key={btn.name} content={btn.label ? GetTooltip(btn.label, btn.name) : btn.label}>
                  <button
                    className={`menubar-button flex ${isActiveStates[btn.name] ? 'active' : ''}`}
                    onClick={() => btn.action && btn.name === 'link' ? btn.action(openLinkModal) : btn.action(editor) && debouncedCalculateIsActiveStates(editor)}
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
            content={SearchSection({ editor, localSearchTerm, replaceTerm, setLocalSearchTerm, setReplaceTerm })}
            onVisibleChange={(val) => val ? null : onSearchTooltipClose()}
          >
            <button className="menubar-button flex" >
              <RiSearch2Line />
            </button>
          </Tooltip>

          <LinkModal visible={linkModalVisible} onClose={closeLinkModal} url={currentUrl} />

          {BubbleMenu({ editor, debouncedCalculateIsActiveStates, isActiveStates, openLinkModal })}

          {LinkBubbleMenu({ editor, closeLinkModal, currentUrl })}
        </>
      }
    </section>
  )
}

export default Menubar

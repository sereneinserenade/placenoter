import React, { useEffect, useState } from 'react';

import { Editor } from '@tiptap/core';
import { BubbleMenu as TiptapBubbleMenu } from '@tiptap/react'
import { Button, Input, Tooltip, Text } from '@nextui-org/react';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil'
import { debounce } from 'lodash';
import { RiSearch2Line, RiArrowDownSLine } from 'react-icons/ri'
import { MdEdit, MdPreview, MdSpellcheck } from 'react-icons/md'
import { useLocalStorage } from 'react-use';

import { stopPrevent } from '../../utils'
import { activeNoteState, editorSearchState, linkModalState, spellCheckState } from '../../Store';

import LinkModal from './LinkModal'
import LinkBubbleMenu from './LinkBubbleMenu';
import MenubarTableButtons from './MenubarTableButtons';
import { buttons, getButtonKeys } from './meta'

import './Menubar.scss'

interface SearchSectionProps {
  editor: Editor,
  localSearchTerm: string,
  replaceTerm: string,
  setLocalSearchTerm: (val: string) => void
  setReplaceTerm: (val: string) => void
}

const SearchSection = ({ editor, localSearchTerm, setLocalSearchTerm, replaceTerm, setReplaceTerm, }: SearchSectionProps) => (
  <section className='search-and-replace-section flex'>
    <section className='inputs-section flex'>
      <Input
        placeholder='Search for...'
        size="sm"
        value={localSearchTerm}
        onInput={e => stopPrevent(e) && setLocalSearchTerm((e.target as HTMLInputElement).value)}
        onKeyDown={e => e.code === 'Escape' && editor.commands.focus()}
        id="search-input"
        animated={false}
        shadow={false}
      />
      <Input
        placeholder='Replace with...'
        size="sm"
        value={replaceTerm}
        onInput={e => stopPrevent(e) && setReplaceTerm((e.target as HTMLInputElement).value)}
        onKeyDown={e => (e.key === 'Enter' && editor.commands.replace()) || (e.code === 'Escape' && editor.commands.focus())}
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

const buttonKeys = getButtonKeys()

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
    tippyOptions: { placement: 'top', duration: 250, animation: 'shift-toward-subtle' },
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

type TableGridProps = {
  tableGridHeight: number,
  tableGridWidth: number,
  setActiveCell: ({ x, y }: { x: number, y: number }) => void,
  insertTable: ({ rows, cols, e }: { rows: number, cols: number, e: React.MouseEvent<HTMLButtonElement, MouseEvent> }) => void,
  activeCell: { x: number, y: number }
}

const TableGrid = ({ tableGridHeight, tableGridWidth, setActiveCell, insertTable, activeCell }: TableGridProps) => {
  return (
    <section key='table-grid' className='table-grid'>
      {
        new Array(tableGridHeight).fill(0).map((h, i) => {
          return (
            <section key={`${i + 1}th_row`} className={`table-grid-row ${i === 0 ? 'first-row' : ''}`}>
              {
                new Array(tableGridWidth)
                  .fill(true) // filling with `false` because boolean uses less RAM than other dataTypes
                  .map((_, j) => (
                    <article
                      key={`${j + 1}_${i + 1}_th_cell`}
                      onMouseEnter={() => setActiveCell({ x: j + 1, y: i + 1 })}
                    >
                      <button
                        className={`grid-box ${j + 1 <= activeCell.x && i + 1 <= activeCell.y && 'active'}`}
                        onClick={(e) => insertTable({ rows: i + 1, cols: j + 1, e })}
                      />
                    </article>
                  ))
              }
            </section>
          )
        })
      }
      <section className='flex justify-center'>
        <Text> {activeCell.y} Rows x {activeCell.x} Cols </Text>
      </section>
    </section>
  )
}

type MenubarProps = {
  editor: Editor,
  isLocalSearchVisible: boolean,
  onSearchTooltipClose: () => any
  isPreview: boolean,
  toggleIsPreview: () => any
}

const Menubar = ({
  editor,
  isLocalSearchVisible,
  onSearchTooltipClose,
  isPreview,
  toggleIsPreview,
}: MenubarProps) => {
  if (!editor) return null

  const activeNote = useRecoilValue(activeNoteState)

  const [globalSearchTerm, setGlobalSearchTerm] = useRecoilState(editorSearchState)

  const [isActiveStates, setIsActiveStates] = useState<Record<string, boolean>>({})

  const [linkModalVisible, setLinkModalVisible] = useState<boolean>(false)

  const [localSearchTerm, setLocalSearchTerm] = useState<string>("")

  const [replaceTerm, setReplaceTerm] = useState<string>("")

  const [tableGridWidth, setTableGridWidth] = useState<number>(6)

  const [tableGridHeight, setTableGridHeight] = useState<number>(6)

  const [activeCell, setActiveCell] = useState<{ x: number, y: number }>({ x: 3, y: 3 })

  const [globalLinkModalVisibleState, setGlobalLinkModalVisibleState] = useRecoilState(linkModalState)

  const setSpellcheckRecoilState = useSetRecoilState(spellCheckState)

  const [isSpellcheckActive, setIsSpellcheckActive] = useLocalStorage<boolean>('spellcheck-active', false, {
    raw: false,
    serializer: (val) => `${val}`,
    deserializer: (val) => val === 'true',
  });

  useEffect(() => { setSpellcheckRecoilState(!!isSpellcheckActive) }, [isSpellcheckActive])

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

  const insertTable = ({ rows, cols, e }: { rows: number, cols: number, e?: React.MouseEvent<HTMLButtonElement, MouseEvent> }) => {
    if (e) stopPrevent(e)

    editor.chain().focus().insertTable({ rows, cols, withHeaderRow: true }).run()
  }

  useEffect(() => { setGridDimensions(activeCell) }, [activeCell])

  useEffect(() => {
    editor.commands.setSearchTerm(localSearchTerm);
    editor.commands.setReplaceTerm(replaceTerm);
  }, [localSearchTerm, replaceTerm])

  useEffect(() => { setLocalSearchTerm(globalSearchTerm) }, [globalSearchTerm])

  const openLinkModal = () => setLinkModalVisible(true)

  const closeLinkModalAndUpdateLink = (url?: string) => {
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
                  <section key={'table-key-prop'} className='table-menu-section flex' aria-label='table-key-prop'>
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
                    <button
                      className={`menubar-button flex ${isActiveStates[btn.name] ? 'active' : ''}`}
                      onClick={() => btn.action?.(editor) && debouncedCalculateIsActiveStates(editor)}
                    >
                      {btn.icon && <btn.icon />}
                    </button>
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
          <Tooltip placement='top' content={GetTooltip('Search And Replace', 'search')}>
            <Tooltip
              visible={!!globalSearchTerm.length || isLocalSearchVisible}
              trigger='click'
              placement='bottom'
              content={SearchSection({ editor, localSearchTerm, replaceTerm, setLocalSearchTerm, setReplaceTerm })}
              onVisibleChange={(val) => !val && onSearchTooltipClose()}
            >
              <button className="menubar-button flex">
                <RiSearch2Line />
              </button>
            </Tooltip>
          </Tooltip>

          <Tooltip
            placement='top'
            content={'Spellcheck - Turn off for better performance'}
          >
            <button
              className={`menubar-button flex ${isSpellcheckActive ? 'active' : ''}`}
              onClick={() => setIsSpellcheckActive(!isSpellcheckActive)}
            >
              <MdSpellcheck />
            </button>
          </Tooltip>

          <Tooltip
            placement='top'
            content={isPreview ? 'Edit' : 'Preview'}
          >
            <button
              className={`menubar-button flex ${isPreview ? 'active' : ''}`}
              onClick={toggleIsPreview}
            >
              {
                isPreview
                  ? <MdEdit />
                  : <MdPreview />
              }
            </button>
          </Tooltip>

          {LinkModal({ visible: linkModalVisible, onClose: closeLinkModalAndUpdateLink })}

          {BubbleMenu({ editor, debouncedCalculateIsActiveStates, isActiveStates, openLinkModal })}

          {LinkBubbleMenu({ editor, closeLinkModalAndUpdateLink })}
        </>
      }
    </section>
  )
}

export default Menubar

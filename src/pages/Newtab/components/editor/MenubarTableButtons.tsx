import React, { useEffect, useState } from 'react'

import { Editor } from '@tiptap/core'
import { RiBringForward, RiDeleteBin2Line, RiDeleteColumn, RiDeleteRow, RiInsertColumnLeft, RiInsertColumnRight, RiInsertRowBottom, RiInsertRowTop, RiLayoutColumnFill, RiLayoutRowFill, RiMergeCellsHorizontal, RiSendBackward, RiSplitCellsHorizontal } from "react-icons/ri"
import { Tooltip } from '@nextui-org/react'
import { debounce } from 'lodash'


type MenubarTableButtonsProps = {
  editor: Editor
}

const buttons = [
  {
    name: 'deleteTable',
    label: 'Delete Table',
    action: (editor: Editor) => editor.chain().focus().deleteTable().run(),
    isActive: (editor: Editor) => editor.can().deleteTable(),
    icon: RiDeleteBin2Line,
  },
  {
    name: 'addColumnBefore',
    label: 'Add Column Before',
    action: (editor: Editor) => editor.chain().focus().addColumnBefore().run(),
    isActive: (editor: Editor) => editor.can().addColumnBefore(),
    icon: RiInsertColumnLeft,
  },
  {
    name: 'addColumnAfter',
    label: 'Add Column After',
    action: (editor: Editor) => editor.chain().focus().addColumnAfter().run(),
    isActive: (editor: Editor) => editor.can().addColumnAfter(),
    icon: RiInsertColumnRight,
  },
  {
    name: 'deleteColumn',
    label: 'Delete Column',
    action: (editor: Editor) => editor.chain().focus().deleteColumn().run(),
    isActive: (editor: Editor) => editor.can().addColumnAfter(),
    icon: RiDeleteColumn,
  },
  {
    name: 'addRowBefore',
    label: 'Add Row Before',
    action: (editor: Editor) => editor.chain().focus().addRowBefore().run(),
    isActive: (editor: Editor) => editor.can().addRowBefore(),
    icon: RiInsertRowTop,
  },
  {
    name: 'addRowAfter',
    label: 'Add Row After',
    action: (editor: Editor) => editor.chain().focus().addRowAfter().run(),
    isActive: (editor: Editor) => editor.can().addRowAfter(),
    icon: RiInsertRowBottom,
  },
  {
    name: 'deleteRow',
    label: 'Delete Row',
    action: (editor: Editor) => editor.chain().focus().deleteRow().run(),
    isActive: (editor: Editor) => editor.can().deleteRow(),
    icon: RiDeleteRow,
  },
  {
    name: 'mergeCells',
    label: 'Merge Cells',
    action: (editor: Editor) => editor.chain().focus().mergeCells().run(),
    isActive: (editor: Editor) => editor.can().mergeCells(),
    icon: RiMergeCellsHorizontal,
  },
  {
    name: 'splitCell',
    label: 'Split Cell',
    action: (editor: Editor) => editor.chain().focus().splitCell().run(),
    isActive: (editor: Editor) => editor.can().splitCell(),
    icon: RiSplitCellsHorizontal,
  },
  {
    name: 'toggleHeaderColumn',
    label: 'Toggle Header Column',
    action: (editor: Editor) => editor.chain().focus().toggleHeaderColumn().run(),
    isActive: (editor: Editor) => editor.can().toggleHeaderColumn(),
    icon: RiLayoutColumnFill,
  },
  {
    name: 'toggleHeaderRow',
    label: 'Toggle Header Row',
    action: (editor: Editor) => editor.chain().focus().toggleHeaderRow().run(),
    isActive: (editor: Editor) => editor.can().toggleHeaderRow(),
    icon: RiLayoutRowFill,
  },
  {
    name: 'toggleHeaderCell',
    label: 'Toggle Header Cell',
    action: (editor: Editor) => editor.chain().focus().toggleHeaderCell().run(),
    isActive: (editor: Editor) => editor.can().toggleHeaderCell(),
    icon: RiBringForward,
  },
]

const MenubarTableButtons = ({ editor }: MenubarTableButtonsProps) => {
  const [isActiveStates, setIsActiveStates] = useState<Record<string, boolean>>({})

  const calculateIsActiveStates = (editor: Editor) => {
    const newState: Record<string, boolean> = {}

    buttons.forEach(btn => newState[btn.name] = btn.isActive(editor))

    setIsActiveStates(JSON.parse(JSON.stringify(newState)))
  }

  const debouncedCalculateIsActiveStates = debounce(calculateIsActiveStates, 400)

  useEffect(() => { editor.on('selectionUpdate', ({ editor }) => debouncedCalculateIsActiveStates(editor)) }, [])

  return (
    <section className='table-controls-buttons-section flex'>
      {
        buttons.map((btn) => {
          return (
            <Tooltip key={btn.name} content={btn.label + `${isActiveStates[btn.name] ? '' : ' (disabled)'}`}>
              <button
                className={`menubar-button flex ${isActiveStates[btn.name] ? '' : 'disabled'}`}
                onClick={() => isActiveStates[btn.name] && btn.action && btn.action(editor) && debouncedCalculateIsActiveStates(editor)}
              >
                {btn.icon && <btn.icon />}
              </button>
            </Tooltip>
          )
        })
      }
    </section>
  )
}

export default MenubarTableButtons
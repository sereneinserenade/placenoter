// @ts-nocheck
import tippy from 'tippy.js'
import { ReactRenderer } from '@tiptap/react'
import { RiDoubleQuotesL, RiH1, RiH2, RiH3, RiBold, RiItalic, RiUnderline, RiStrikethrough, RiCodeBoxLine, RiCodeSSlashLine, RiListOrdered, RiListUnordered, RiListCheck2 } from 'react-icons/ri'
import fuzzysort from 'fuzzysort'

import { CommandList } from './CommandList'
import { stopPrevent } from '../../../../utils'

const SlashMenuItems = [
  {
    title: 'Heading 1',
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .setNode('heading', { level: 1 })
        .run()
    },
    icon: RiH1,
    shortcut: '#'
  },
  {
    title: 'Heading 2',
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .setNode('heading', { level: 2 })
        .run()
    },
    icon: RiH2,
    shortcut: '##'
  },
  {
    title: 'Heading 3',
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .setNode('heading', { level: 3 })
        .run()
    },
    icon: RiH3,
    shortcut: '###'
  },
  {
    title: 'Ordered List',
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .toggleOrderedList()
        .run()
    },
    icon: RiListOrdered,
    shortcut: '1. L'
  },
  {
    title: 'Bullet List',
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .toggleBulletList()
        .run()
    },
    icon: RiListUnordered,
    shortcut: '- L'
  },
  {
    title: 'Task List',
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .toggleTaskList()
        .run()
    },
    icon: RiListCheck2,
  },
  {
    title: 'Bold',
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .setMark('bold')
        .run()
    },
    icon: RiBold,
    shortcut: '**b**'
  },
  {
    title: 'Italic',
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .setMark('italic')
        .run()
    },
    icon: RiItalic,
    shortcut: '_i_'
  },
  {
    title: 'Underline',
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .setMark('underline')
        .run()
    },
    icon: RiUnderline,
  },
  {
    title: 'Strike',
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .setMark('strike')
        .run()
    },
    icon: RiStrikethrough,
    shortcut: '~~s~~'
  },
  {
    title: 'Code',
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .setMark('code')
        .run()
    },
    icon: RiCodeSSlashLine,
    shortcut: '`i`'
  },
  {
    title: 'Code Block',
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .setCodeBlock({ language: 'auto' })
        .run()
    },
    icon: RiCodeBoxLine,
    shortcut: '```'
  },
  {
    title: 'Blockquote',
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .setBlockquote()
        .run()
    },
    icon: RiDoubleQuotesL,
    shortcut: '>'
  },
]

export const suggestions = {
  items: ({ query }: { query: string }) => {
    query = query.toLowerCase().trim()

    if (!query) return SlashMenuItems

    const fuzzyResults = fuzzysort
      .go(query, SlashMenuItems, { key: 'title' })
      .map((item) => ({
        ...item,
        highlightedTitle: fuzzysort.highlight(item, "<b>", "</b>")
      }))

    return fuzzyResults.map(({ obj, highlightedTitle }) => ({ ...obj, highlightedTitle }))
  },

  render: () => {
    let component
    let popup
    let localProps

    return {
      onStart: props => {
        localProps = { ...props, event: '' }

        component = new ReactRenderer(CommandList, {
          props: localProps,
          editor: localProps.editor,
        })

        popup = tippy('body', {
          getReferenceClientRect: localProps.clientRect,
          appendTo: () => document.body,
          content: component.element,
          showOnCreate: true,
          interactive: true,
          trigger: 'manual',
          placement: 'bottom-start',
        })
      },

      onUpdate(props) {
        localProps = { ...props, event: '' }

        component.updateProps(localProps)

        popup[0].setProps({ getReferenceClientRect: localProps.clientRect })
      },

      onKeyDown(props) {
        component.updateProps({ ...localProps, event: props.event })

        if (props.event.key === 'Escape') {
          popup[0].hide()

          return true
        }

        if (props.event.key === 'Enter') {
          stopPrevent(props.event);

          return true
        }
      },

      onExit() {
        if (popup && popup[0]) popup[0]?.destroy()
        if (component) component.destroy()
      },
    }
  },
}

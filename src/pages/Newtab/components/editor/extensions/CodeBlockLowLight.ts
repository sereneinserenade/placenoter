import { Plugin, PluginKey, TextSelection } from 'prosemirror-state'
import { Decoration, DecorationSet } from 'prosemirror-view'
import { Node as ProsemirrorNode } from 'prosemirror-model'
import { findChildren } from '@tiptap/core'

import { lowlight } from 'lowlight/lib/common.js'

import { Node, textblockTypeInputRule, mergeAttributes } from '@tiptap/core'

const langAliases: Record<string, string | string[]> = {
  arduino: "ard",
  cpp: "c++",
  csharp: "c#",
  javascript: 'js',
  kotlin: "kot",
  makefile: ['make', 'mk'],
  markdown: ['md'],
  objectivec: "objc",
  python: 'py',
  typescript: "ts",
}

const reverseLangAliases: Record<string, string> = {}

for (const [lang, alias] of Object.entries(langAliases)) {
  if (Array.isArray(alias)) { alias.forEach(a => reverseLangAliases[a] = lang) }
  else reverseLangAliases[alias] = lang
}

function parseNodes(nodes: any[], className: string[] = []): { text: string, classes: string[] }[] {
  return nodes
    .map(node => {
      const classes = [
        ...className,
        ...node.properties
          ? node.properties.className
          : [],
      ]

      if (node.children) {
        return parseNodes(node.children, classes)
      }

      return {
        text: node.value,
        classes,
      }
    })
    .flat()
}

function getHighlightNodes(result: any) {
  // `.value` for lowlight v1, `.children` for lowlight v2
  return result.children
}

function getDecorations({
  doc,
  name,
  defaultLanguage,
}: { doc: ProsemirrorNode, name: string, defaultLanguage: string | null | undefined }) {
  const decorations: Decoration[] = []

  findChildren(doc, node => node.type.name === name)
    .forEach(block => {
      let from = block.pos + 1
      const language = block.node.attrs.language || defaultLanguage
      const languages = lowlight.listLanguages()

      const mainLang = reverseLangAliases[language]

      debugger

      const nodes = (language && languages.includes(language)) || mainLang
        ? getHighlightNodes(lowlight.highlight(mainLang || language, block.node.textContent))
        : getHighlightNodes(lowlight.highlightAuto(block.node.textContent))

      parseNodes(nodes).forEach(node => {
        const to = from + node.text.length

        if (node.classes.length) {
          const decoration = Decoration.inline(from, to, { class: node.classes.join(' ') })

          decorations.push(decoration)
        }

        from = to
      })
    })

  return DecorationSet.create(doc, decorations)
}

export function LowlightPlugin({ name, defaultLanguage }: { name: string, defaultLanguage: string | null | undefined }) {
  return new Plugin({
    key: new PluginKey('lowlight'),

    state: {
      init: (_, { doc }) => getDecorations({
        doc,
        name,
        defaultLanguage,
      }),
      apply: (transaction, decorationSet, oldState, newState) => {
        const oldNodeName = oldState.selection.$head.parent.type.name
        const newNodeName = newState.selection.$head.parent.type.name
        const oldNodes = findChildren(oldState.doc, node => node.type.name === name)
        const newNodes = findChildren(newState.doc, node => node.type.name === name)

        if (
          transaction.docChanged
          // Apply decorations if:
          && (
            // selection includes named node,
            [oldNodeName, newNodeName].includes(name)
            // OR transaction adds/removes named node,
            || newNodes.length !== oldNodes.length
            // OR transaction has changes that completely encapsulte a node
            // (for example, a transaction that affects the entire document).
            // Such transactions can happen during collab syncing via y-prosemirror, for example.
            || transaction.steps.some(step => {
              // @ts-ignore
              return step.from !== undefined
                // @ts-ignore
                && step.to !== undefined
                && oldNodes.some(node => {
                  // @ts-ignore
                  return node.pos >= step.from
                    // @ts-ignore
                    && node.pos + node.node.nodeSize <= step.to
                })
            })
          )
        ) {
          return getDecorations({
            doc: transaction.doc,
            name,
            defaultLanguage,
          })
        }

        return decorationSet.map(transaction.mapping, transaction.doc)
      },
    },

    props: {
      decorations(state) {
        return this.getState(state)
      },
    },
  })
}

export interface CodeBlockOptions {
  /**
   * Adds a prefix to language classes that are applied to code tags.
   * Defaults to `'language-'`.
   */
  languageClassPrefix: string,
  /**
   * Define whether the node should be exited on triple enter.
   * Defaults to `true`.
   */
  exitOnTripleEnter: boolean,
  /**
   * Define whether the node should be exited on arrow down if there is no node after it.
   * Defaults to `true`.
   */
  exitOnArrowDown: boolean,
  /**
   * Custom HTML attributes that should be added to the rendered HTML tag.
   */
  HTMLAttributes: Record<string, any>,
  defaultLanguage: string | null | undefined,
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    codeBlock: {
      /**
       * Set a code block
       */
      setCodeBlock: (attributes?: { language: string }) => ReturnType,
      /**
       * Toggle a code block
       */
      toggleCodeBlock: (attributes?: { language: string }) => ReturnType,
    }
  }
}

export const backtickInputRegex = /^```([a-z]+)?[\s\n]$/
export const tildeInputRegex = /^~~~([a-z]+)?[\s\n]$/

export const CodeBlockLowLight = Node.create<CodeBlockOptions>({
  name: 'codeBlock',

  addOptions() {
    return {
      languageClassPrefix: 'language-',
      exitOnTripleEnter: true,
      exitOnArrowDown: true,
      HTMLAttributes: {},
      defaultLanguage: null,
    }
  },

  content: 'text*',

  marks: '',

  group: 'block',

  code: true,

  defining: true,

  addAttributes() {
    return {
      language: {
        default: null,
        parseHTML: element => {
          const { languageClassPrefix } = this.options
          const classNames = [...element.firstElementChild?.classList || []]
          const languages = classNames
            .filter(className => className.startsWith(languageClassPrefix))
            .map(className => className.replace(languageClassPrefix, ''))
          const language = languages[0]

          if (!language) {
            return null
          }

          return language
        },
        rendered: false,
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'pre',
        preserveWhitespace: 'full',
      },
    ]
  },

  renderHTML({ node, HTMLAttributes }) {
    const mainLang = reverseLangAliases[node.attrs.language]

    const langToShow = node.attrs.language ? node.attrs.language + `${mainLang ? " - " +  mainLang : ""}`.trim() : 'auto'

    return [
      'pre',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes),
      [
        'code',
        {
          class: node.attrs.language
            ? this.options.languageClassPrefix + node.attrs.language
            : null,
          'data-language': langToShow
        },
        0,
      ],
    ]
  },

  addCommands() {
    return {
      setCodeBlock: attributes => ({ commands }) => {
        return commands.setNode(this.name, attributes)
      },
      toggleCodeBlock: attributes => ({ commands }) => {
        return commands.toggleNode(this.name, 'paragraph', attributes)
      },
    }
  },

  addKeyboardShortcuts() {
    return {
      'Mod-Alt-c': () => this.editor.commands.toggleCodeBlock(),

      // remove code block when at start of document or code block is empty
      Backspace: () => {
        const { empty, $anchor } = this.editor.state.selection
        const isAtStart = $anchor.pos === 1

        if (!empty || $anchor.parent.type.name !== this.name) {
          return false
        }

        if (isAtStart || !$anchor.parent.textContent.length) {
          return this.editor.commands.clearNodes()
        }

        return false
      },

      // exit node on triple enter
      Enter: ({ editor }) => {
        if (!this.options.exitOnTripleEnter) {
          return false
        }

        const { state } = editor
        const { selection } = state
        const { $from, empty } = selection

        if (!empty || $from.parent.type !== this.type) {
          return false
        }

        const isAtEnd = $from.parentOffset === $from.parent.nodeSize - 2
        const endsWithDoubleNewline = $from.parent.textContent.endsWith('\n\n')

        if (!isAtEnd || !endsWithDoubleNewline) {
          return false
        }

        return editor
          .chain()
          .command(({ tr }) => {
            tr.delete($from.pos - 2, $from.pos)

            return true
          })
          .exitCode()
          .run()
      },

      // exit node on arrow down
      ArrowDown: ({ editor }) => {
        if (!this.options.exitOnArrowDown) {
          return false
        }

        const { state } = editor
        const { selection, doc } = state
        const { $from, empty } = selection

        if (!empty || $from.parent.type !== this.type) {
          return false
        }

        const isAtEnd = $from.parentOffset === $from.parent.nodeSize - 2

        if (!isAtEnd) {
          return false
        }

        const after = $from.after()

        if (after === undefined) {
          return false
        }

        const nodeAfter = doc.nodeAt(after)

        if (nodeAfter) {
          return false
        }

        return editor.commands.exitCode()
      },

      Tab: ({ editor }) => {
        if (editor.isActive('codeBlock')) {
          editor.view.dispatch(editor.state.tr.insertText("  "))
          return true
        }

        return false
      },
    }
  },

  addInputRules() {
    return [
      textblockTypeInputRule({
        find: backtickInputRegex,
        type: this.type,
        getAttributes: match => ({
          language: match[1],
        }),
      }),
      textblockTypeInputRule({
        find: tildeInputRegex,
        type: this.type,
        getAttributes: match => ({
          language: match[1],
        }),
      }),
    ]
  },

  addProseMirrorPlugins() {
    return [
      // this plugin creates a code block for pasted content from VS Code
      // we can also detect the copied code language
      new Plugin({
        key: new PluginKey('codeBlockVSCodeHandler'),
        props: {
          handlePaste: (view, event) => {
            if (!event.clipboardData) {
              return false
            }

            // don’t create a new code block within code blocks
            if (this.editor.isActive(this.type.name)) {
              return false
            }

            const text = event.clipboardData.getData('text/plain')
            const vscode = event.clipboardData.getData('vscode-editor-data')
            const vscodeData = vscode
              ? JSON.parse(vscode)
              : undefined
            const language = vscodeData?.mode

            if (!text || !language) {
              return false
            }

            const { tr } = view.state

            // create an empty code block
            tr.replaceSelectionWith(this.type.create({ language }))

            // put cursor inside the newly created code block
            tr.setSelection(TextSelection.near(tr.doc.resolve(Math.max(0, tr.selection.from - 2))))

            // add text to code block
            // strip carriage return chars from text pasted as code
            // see: https://github.com/ProseMirror/prosemirror-view/commit/a50a6bcceb4ce52ac8fcc6162488d8875613aacd
            tr.insertText(text.replace(/\r\n?/g, '\n'))

            // store meta information
            // this is useful for other plugins that depends on the paste event
            // like the paste rule plugin
            tr.setMeta('paste', true)

            view.dispatch(tr)

            return true
          },
        },
      }),
      LowlightPlugin({
        name: this.name,
        defaultLanguage: this.options.defaultLanguage,
      }),
    ]
  },
})

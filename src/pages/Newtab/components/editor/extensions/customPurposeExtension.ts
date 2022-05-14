import { Extension } from '@tiptap/react'
import { Plugin, PluginKey, TextSelection } from 'prosemirror-state';

interface CustomPurposeExtensionOptions {
  onLinkShortcutPressed: Function,
  onLinkClicked: (url: string) => {},
}

export const CustomPurposeExtension = Extension.create<CustomPurposeExtensionOptions>({
  name: 'customPurposeExtension',

  addOptions() {
    return {
      onLinkShortcutPressed: () => {},
      onLinkClicked: (url: string): any => {},
    }
  },

  onSelectionUpdate() {
    const editor = this.editor
    const options = this.options

    setTimeout(() => {
      if (editor.isActive('link')) {
        const url = editor.getAttributes('link')

        options.onLinkClicked(url.href)
      } else {
        options.onLinkClicked("")
      }
    })
  },

  addKeyboardShortcuts() {
    return {
      'Mod-k': ({ editor: { state: { selection: { from, to } } } }) => from !== to && this.options.onLinkShortcutPressed()
    }
  },
})

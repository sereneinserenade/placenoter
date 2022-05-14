import { Extension } from '@tiptap/react'
import { Plugin, PluginKey, TextSelection } from 'prosemirror-state';

interface CustomPurposeExtensionOptions {
  onLinkShortcutPressed: Function,
}

export const CustomPurposeExtension = Extension.create<CustomPurposeExtensionOptions>({
  name: 'customPurposeExtension',
  addOptions() {
    return {
      onLinkShortcutPressed: () => {},
    }
  },
  addProseMirrorPlugins() {
    const editor = this.editor

    const linkFocusSolver = new Plugin({
      key: new PluginKey('linkFocusSolver'),
      props: {
        handleClick({ state: { doc, tr, selection }, dispatch }) {
          setTimeout(() => {
            if (editor.isActive('link')) return

            const [$start, $end] = [doc.resolve(selection.from + 1), doc.resolve(selection.to + 1)];

            if ($start.pos !== $end.pos) return

            dispatch(tr.setSelection(new TextSelection($start, $end)));

            const [$newStart, $newEnd] = [doc.resolve(selection.from - 1), doc.resolve(selection.to - 1)];

            dispatch(tr.setSelection(new TextSelection($newStart, $newEnd)));
          })

          // Keep this `false` otherwise there's weird behavior when a click to content doesn't take cursor to clicked position
          return false
        },
      }
    })

    return [linkFocusSolver]
  },

  addKeyboardShortcuts() {
    return {
      'Mod-k': ({ editor: { state: { selection: { from, to } } } }) => from !== to && this.options.onLinkShortcutPressed()
    }
  },
})

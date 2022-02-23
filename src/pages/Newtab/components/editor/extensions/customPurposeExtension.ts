import { Extension } from '@tiptap/react'
import { EditorView } from 'prosemirror-view';
import { Plugin, PluginKey, TextSelection } from 'prosemirror-state';

interface CustomPurposeExtensionOptions {
  onLinkShortcutEntered: Function,
}

export const CustomPurposeExtension = Extension.create<CustomPurposeExtensionOptions>({
  name: 'customPurposeExtension',
  addOptions() {
    return {
      onLinkShortcutEntered: () => {},
    }
  },
  addProseMirrorPlugins() {
    let theView: EditorView;

    let done: boolean = false

    const { editor } = this

    const updaterPlugin = new Plugin({
      key: new PluginKey('linkFocusSolverPlugin'),
      view: (view) => {
        return {
          update(view) {
            theView = view
          }
        }
      },
      props: {
        handleClick(view, pos) {
          setTimeout(() => {
            if (!editor.isActive('link')) return

            const { doc, tr } = view.state;

            const [$start, $end] = [doc.resolve(view.state.selection.from + 1), doc.resolve(view.state.selection.to + 1)];

            if ($start.pos !== $end.pos) return true

            view.dispatch(tr.setSelection(new TextSelection($start, $end)));

            const [$newStart, $newEnd] = [doc.resolve(view.state.selection.from - 1), doc.resolve(view.state.selection.to - 1)];

            view.dispatch(tr.setSelection(new TextSelection($newStart, $newEnd)));

          })

          return true
        },
      }
    })

    return [updaterPlugin]
  },

  addKeyboardShortcuts() {
    return {
      'Mod-k': () => this.options.onLinkShortcutEntered(),
    }
  },
})

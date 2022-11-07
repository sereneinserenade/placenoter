import { Extension } from '@tiptap/core'
import { Node, NodeType } from 'prosemirror-model'
import { Fragment, Slice, ResolvedPos } from 'prosemirror-model'
import { ReplaceStep } from 'prosemirror-transform'
import { Selection } from 'prosemirror-state'

export const equalNodeType = (nodeType: NodeType, node: Node) => {
  return (Array.isArray(nodeType) && nodeType.indexOf(node.type) > -1) || node.type === nodeType
}

export const findParentNodeClosestToPos = ($pos: ResolvedPos, predicate: (node: Node) => any) => {
  for (let i = $pos.depth; i > 0; i--) {
    const node = $pos.node(i)
    if (predicate(node)) {
      return {
        pos: i > 0 ? $pos.before(i) : 0,
        start: $pos.start(i),
        depth: i,
        node,
      }
    }
  }
}

export const findParentNode =
  (predicate: (node: Node) => any) =>
    ({ $from }: { $from: ResolvedPos }) =>
      findParentNodeClosestToPos($from, predicate)

export const findParentNodeOfType = (nodeType: NodeType) => (selection: Selection) => {
  return findParentNode((node) => equalNodeType(nodeType, node))(selection)
}

function mapChildren(node: Node, callback: (...args: any[]) => any) {
  const array = []
  for (let i = 0; i < node.childCount; i++) {
    array.push(callback(node.child(i), i, node instanceof Fragment ? node : node.content))
  }

  return array
}

interface MoveNodeOptions {
  types: string[];
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    move: {
      moveNode: (direction: 'up' | 'down') => ReturnType;
    };
  }
}

function isListNode(node: Node): boolean {
  return ['listItem', 'taskItem'].includes(node.type.name)
}

export const NodeMover = Extension.create<MoveNodeOptions>({
  name: 'nodeMover',

  addOptions() {
    return {
      types: ['dBlock'],
    }
  },

  addCommands() {
    return {
      moveNode: (direction: 'up' | 'down') =>
        ({ tr, state, dispatch }) => {
          const { doc, selection } = tr
          if (!doc || !selection) return false

          const { from, to } = selection

          doc.nodesBetween(from, to, (node) => {
            const nodeType = node.type

            if (!this.options.types.includes(nodeType.name)) return false

            const isDown = direction === 'down'

            if (!state.selection.empty) return false

            const { $from } = state.selection

            const currentResolved = findParentNodeOfType(nodeType)(state.selection)

            if (!currentResolved) return false

            const { node: currentNode } = currentResolved
            const parentDepth = currentResolved.depth - 1
            const parent = $from.node(parentDepth)

            if (isListNode(parent)) return false

            const parentPos = $from.start(parentDepth)

            if (currentNode.type !== nodeType) return false

            const arr = mapChildren(parent, (node) => node)

            const index = arr.indexOf(currentNode)

            const swapWith = isDown ? index + 1 : index - 1

            if (swapWith >= arr.length || swapWith < 0) return false

            const swapWithNodeSize = arr[swapWith]!.nodeSize

            const temp = arr[index]
            arr[index] = arr[swapWith]
            arr[swapWith] = temp

            let tr = state.tr
            const replaceStart = parentPos
            const replaceEnd = $from.end(parentDepth)

            const slice = new Slice(Fragment.fromArray(arr), 0, 0)

            tr = tr.step(new ReplaceStep(replaceStart, replaceEnd, slice, false))

            const resolvedPos = tr.doc.resolve(
              isDown
                ? $from.pos + swapWithNodeSize
                : $from.pos - swapWithNodeSize
            )

            tr = tr.setSelection(Selection.near(resolvedPos))

            if (dispatch) dispatch(tr.scrollIntoView())

            return true
          })

          return false
        },
    }
  },

  addKeyboardShortcuts() {
    return {
      'Alt-ArrowUp': () => this.editor.commands.moveNode('up'),
      'Alt-ArrowDown': () => this.editor.commands.moveNode('down'),
    }
  },
})

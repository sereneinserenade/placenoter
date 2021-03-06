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
  search: "ctrl+F"
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
  search: "⌘+F"
}

export const getButtonKeys = () => {
  const isMac = navigator.userAgent.toLowerCase().includes('mac')
  return isMac ? macButtonKeys : linuxButtonKeys
}

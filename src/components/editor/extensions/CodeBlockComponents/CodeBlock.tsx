import React, { useEffect, useMemo, useState } from 'react'
import { NodeViewWrapper, NodeViewContent, NodeViewProps } from '@tiptap/react'
import { Dropdown } from '@nextui-org/react'
import {
  SiArduino,
  SiGnubash,
  SiC,
  SiCplusplus,
  SiCsharp,
  SiCss3,
  SiGo,
  SiJava,
  SiJavascript,
  SiJson,
  SiKotlin,
  SiLess,
  SiLua,
  SiMarkdown,
  SiPerl,
  SiPhp,
  SiPython,
  SiR,
  SiRuby,
  SiRust,
  SiSass,
  SiShell,
  SiSqlite,
  SiSwift,
  SiTypescript,
} from 'react-icons/si'
import { BiCodeAlt } from 'react-icons/bi'
import { BsFileText } from 'react-icons/bs'
import { VscDiff } from 'react-icons/vsc'

import { getReverseLangAlias } from '../CodeBlockLowLight';

import './styles/CodeBlock.scss'

const langsIconsMap = {
  "arduino": SiArduino,
  "bash": SiGnubash,
  "c": SiC,
  "cpp": SiCplusplus,
  "csharp": SiCsharp,
  "css": SiCss3,
  "diff": VscDiff,
  "go": SiGo,
  "ini": null,
  "java": SiJava,
  "javascript": SiJavascript,
  "json": SiJson,
  "kotlin": SiKotlin,
  "less": SiLess,
  "lua": SiLua,
  "makefile": null,
  "markdown": SiMarkdown,
  "objectivec": SiC,
  "perl": SiPerl,
  "php": SiPhp,
  "php-template": SiPhp,
  "plaintext": BsFileText,
  "python": SiPython,
  "python-repl": SiPython,
  "r": SiR,
  "ruby": SiRuby,
  "rust": SiRust,
  "scss": SiSass,
  "shell": SiShell,
  "sql": SiSqlite,
  "swift": SiSwift,
  "typescript": SiTypescript,
  "vbnet": null,
  "xml": null,
  "yaml": null
}

const CodeBlock: React.FC<NodeViewProps> = ({ node: { attrs: { language } }, updateAttributes, editor }) => {
  const reverseLangAlias = useMemo(getReverseLangAlias, [])

  const [val, setVal] = useState<string>('')

  useEffect(() => { setVal(reverseLangAlias[language] || language) }, [language])

  return (
    <NodeViewWrapper className="code-block">
      <pre>
        <Dropdown >
          <Dropdown.Button size='xs' className='dropdown' flat color='primary' css={{ textTransform: 'capitalize' }}>
            {val || 'Select Language'}
          </Dropdown.Button>

          <Dropdown.Menu
            color="primary"
            aria-label="Actions"
            selectionMode="single"
            selectedKeys={[val]}
            onSelectionChange={(keys) => updateAttributes({ language: [...keys][0] || '' })}
          >
            {
              Object.entries(langsIconsMap)
                .map(([lang, icon]) => (
                  <Dropdown.Item
                    key={lang}
                    icon={icon && icon({ size: 22, fill: 'var(--nextui-colors-primary)' }) || BiCodeAlt({ size: 22, fill: 'var(--nextui-colors-primary)' })}
                  >
                    {lang}
                  </Dropdown.Item>
                ))
            }
          </Dropdown.Menu>
        </Dropdown>
        <NodeViewContent as="code" />
      </pre>
    </NodeViewWrapper>
  )
}

export default CodeBlock

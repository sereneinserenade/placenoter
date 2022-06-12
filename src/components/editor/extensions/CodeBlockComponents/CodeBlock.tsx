import React, { useEffect, useMemo, useState } from 'react'
import { NodeViewWrapper, NodeViewContent, NodeViewProps } from '@tiptap/react'

import { lowlight } from 'lowlight/lib/common.js';
import { getReverseLangAlias } from '../CodeBlockLowLight';

import './styles/CodeBlock.scss'

const CodeBlock: React.FC<NodeViewProps> = ({ node: { attrs: { language } }, updateAttributes, editor }) => {
  const reverseLangAlias = useMemo(getReverseLangAlias, [])

  const langs = useMemo(() => lowlight.listLanguages() || [], [])

  const [val, setVal] = useState<string>('')

  useEffect(() => { setVal(reverseLangAlias[language] || language) }, [language])

  return (
    <NodeViewWrapper className="code-block">

      <pre>
        <select contentEditable={false} value={val} onChange={event => updateAttributes({ language: event.target.value })}>
          <option value="null">
            auto
          </option>

          <option disabled>
            —
          </option>

          {langs.map((lang, index) => (<option key={index} value={lang}> {lang} </option>))}
        </select>
        <NodeViewContent as="code" />
      </pre>
    </NodeViewWrapper>
  )
}

export default CodeBlock

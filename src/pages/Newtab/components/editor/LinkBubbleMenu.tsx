import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Editor } from '@tiptap/core'
import { Button, Input, Text, Tooltip } from '@nextui-org/react';
import { BubbleMenu } from '@tiptap/react';
import { RiExternalLinkFill } from 'react-icons/ri';
import { test } from 'linkifyjs'

import { openUrlInNewTab } from '../../utils';

import './LinkBubbleMenu.scss'
import { useRecoilState } from 'recoil';
import { currentLinkUrlState } from '../../Store';

type LinkBubbleMenuProps = {
  editor: Editor,
  closeLinkModalAndUpdateLink: (url?: string | undefined) => void
}

const LinkBubbleMenu = ({ editor, closeLinkModalAndUpdateLink }: LinkBubbleMenuProps) => {
  const [url, setUrl] = useRecoilState(currentLinkUrlState)

  const [isUrlValid, setIsUrlValid] = useState<boolean>(false)

  const urlPatternValidation = (url: string): boolean => test(url);

  useEffect(() => { setIsUrlValid(urlPatternValidation(url)) }, [url])

  const onApply = () => isUrlValid && closeLinkModalAndUpdateLink(url)

  return (
    <BubbleMenu
      shouldShow={() => editor.isActive('link')}
      editor={editor}
      className="bubble-menu link-bubble-menu flex"
      tippyOptions={{ placement: 'bottom', duration: 250, animation: 'shift-toward-subtle' }}
    >
      {
        editor.isActive('link') &&
        (
          <>
            <Tooltip content="Visit URL in new tab" placement='left'>
              <Button css={{ margin: '8px 0 8px 8px' }} size='sm' auto flat icon={<RiExternalLinkFill />} onClick={() => openUrlInNewTab(url)} />
            </Tooltip>

            <Tooltip
              visible={!isUrlValid}
              content={isUrlValid ? '' : 'URL not valid.'}
              color='error'
              placement='right'
              initialVisible={false}
            >
              <Input
                size="sm"
                placeholder="https://xyz.abc"
                value={url}
                onInput={(e) => setUrl((e.target as HTMLInputElement).value.trim())}
                onKeyPress={(e) => e.key === 'Enter' && onApply()}
                animated={false}
                css={{ margin: '8px 8px 8px 0' }}
              />
            </Tooltip>
          </>
        )
      }
    </BubbleMenu>
  )
}

export default LinkBubbleMenu

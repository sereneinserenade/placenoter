import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Editor } from '@tiptap/core'
import { Button, Input, Row, Text, Tooltip } from '@nextui-org/react';
import { BubbleMenu } from '@tiptap/react';
import { RiExternalLinkFill } from 'react-icons/ri';
import { test } from 'linkifyjs'

import './LinkBubbleMenu.scss'

type LinkBubbleMenuProps = {
  editor: Editor,
  currentUrl: string,
  closeLinkModal: (url?: string | undefined) => void
}

const LinkBubbleMenu = ({ editor, currentUrl, closeLinkModal }: LinkBubbleMenuProps) => {
  const [url, setUrl] = useState<string>("")

  const [isUrlValid, setIsUrlValid] = useState<boolean>(true)

  const showLinkMenu = useRef<boolean>(false)

  const setShowLinkMenu = (val: boolean) => showLinkMenu.current = val

  useEffect(() => {
    if (currentUrl) setUrl(currentUrl)
    else setUrl("")
  }, [currentUrl])

  const urlPatternValidation = (url: string): boolean => test(url);

  useEffect(() => {
    setIsUrlValid(urlPatternValidation(url))

    setTimeout(() => setShowLinkMenu(!!url));
  }, [url])

  const onApply = () => isUrlValid && closeLinkModal(url)

  const shouldShowLinkMenu = useCallback(() => showLinkMenu.current, [])

  function newTab(url: string) {
    window.open(url, "_blank");
  }

  return (
    <BubbleMenu shouldShow={shouldShowLinkMenu} editor={editor} className="bubble-menu link-bubble-menu" tippyOptions={{ placement: 'bottom' }}>
      {currentUrl && <section className='flex link-bubble-inner-section'>
        <section className='flex input-button-section'>
          <Tooltip content="Visit link in new tab">
            <Button size='sm' auto ghost icon={<RiExternalLinkFill />} onClick={() => newTab(currentUrl)} />
          </Tooltip>

          <section>
            <Input
              // bordered
              size="sm"
              placeholder="https://xyz.abc"
              value={url}
              onInput={(e) => setUrl((e.target as HTMLInputElement).value.trim())}
              onKeyPress={(e) => e.key === 'Enter' && onApply()}
              animated={false}
            />
            {
              !isUrlValid &&
              <section>
                <Text color="error" size={12}>
                  Please enter a valid URL.
                </Text>
              </section>
            }
          </section>
        </section>
      </section>
      }
    </BubbleMenu>
  )
}

export default LinkBubbleMenu
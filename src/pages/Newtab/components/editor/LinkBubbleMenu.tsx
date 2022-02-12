import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Editor } from '@tiptap/core'
import { Button, Input, Row, Text } from '@nextui-org/react';
import { BubbleMenu } from '@tiptap/react';
import { RiExternalLinkFill } from 'react-icons/ri';

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

  const urlPatternValidation = (url: string): boolean => {
    const regex = new RegExp('(https?://)?([\\da-z.-]+)\\.([a-z.]{2,6})[/\\w .-]*/?');
    return regex.test(url);
  };

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
          <Input
            bordered
            size="sm"
            placeholder="https://xyz.abc"
            value={url}
            onInput={(e) => setUrl((e.target as HTMLInputElement).value.trim())}
            onKeyPress={(e) => e.key === 'Enter' && onApply()}
            animated={false}
          />

          <Button size='sm' auto ghost icon={<RiExternalLinkFill />} onClick={() => newTab(currentUrl)} />
        </section>
        {
          !isUrlValid &&
          <section>
            <Text color="error" size={12}>
              Please enter a valid URL.
            </Text>
          </section>
        }
      </section>
      }
    </BubbleMenu>
  )
}

export default LinkBubbleMenu
import React, { useState, useEffect } from 'react';
import { Editor } from '@tiptap/core'
import { Input, Text } from '@nextui-org/react';
import { BubbleMenu } from '@tiptap/react';

type LinkBubbleMenuProps = {
  editor: Editor,
  currentUrl: string,
  closeLinkModal: (url?: string | undefined) => void
}

const LinkBubbleMenu = ({ editor, currentUrl, closeLinkModal }: LinkBubbleMenuProps) => {
  const [url, setUrl] = useState<string>("")

  const [isUrlValid, setIsUrlValid] = useState<boolean>(true)


  useEffect(() => {
    setTimeout(() => {
      if (currentUrl) setUrl(currentUrl)
      else setUrl("")

    });
  }, [currentUrl])

  const urlPatternValidation = (url: string): boolean => {
    const regex = new RegExp('(https?://)?([\\da-z.-]+)\\.([a-z.]{2,6})[/\\w .-]*/?');
    return regex.test(url);
  };

  useEffect(() => {
    debugger
    setIsUrlValid(urlPatternValidation(url))
    setShowLinkMenu(!!url)
  }, [url])

  const onApply = () => isUrlValid && closeLinkModal(url)

  const [showLinkMenu, setShowLinkMenu] = useState<boolean>(false)

  return (
    <BubbleMenu shouldShow={() => showLinkMenu} editor={editor} className="bubble-menu link-bubble-menu" tippyOptions={{ placement: 'bottom' }}>
      <Input
        bordered
        // fullWidth
        color="primary"
        size="sm"
        placeholder="https://google.com"
        // contentLeft={<RiLink />}
        value={url}
        onInput={(e) => setUrl((e.target as HTMLInputElement).value.trim())}
        onKeyPress={(e) => e.key === 'Enter' && onApply()}
        autoFocus
        animated={false}
      />
      {
        !isUrlValid && <Text color="error">
          Please enter a valid URL.
        </Text>
      }
    </BubbleMenu>
  )
}

export default LinkBubbleMenu
import React, { useEffect, useState } from 'react'

import { Button, Input, Modal, Text } from '@nextui-org/react'
import { RiLink } from 'react-icons/ri'
import { test } from 'linkifyjs'
import { useRecoilState } from 'recoil'

import { currentLinkUrlState } from '../../Store'

type LinkModalProps = {
  visible: boolean,
  onClose: (url?: string) => void,
}

const LinkModal = ({ visible, onClose }: LinkModalProps) => {
  const [url, setUrl] = useRecoilState(currentLinkUrlState)

  const [isLinkValid, setIsLinkValid] = useState<boolean>(true)

  const onApply = () => isLinkValid && onClose(url)

  useEffect(() => { url ? setIsLinkValid(urlPatternValidation(url)) : setIsLinkValid(true) }, [url])

  const urlPatternValidation = (url: string): boolean => test(url);

  return (
    <Modal closeButton open={visible} onClose={onClose} >
      <Modal.Header>
        <Text id="modal-title" b size={18}>
          Enter URL:
        </Text>
      </Modal.Header>

      <Modal.Body>
        <Input
          bordered
          fullWidth
          color="primary"
          size="lg"
          placeholder="https://google.com"
          contentLeft={<RiLink />}
          value={url}
          onInput={(e) => setUrl((e.target as HTMLInputElement).value.trim())}
          onKeyPress={(e) => e.key === 'Enter' && onApply()}
          autoFocus
        />
        {
          !isLinkValid && <Text color="error">
            Please enter a valid URL.
          </Text>
        }
      </Modal.Body>

      <Modal.Footer>
        <Button auto flat color="error" onClick={() => onClose()}>
          Cancel
        </Button>
        <Button disabled={!isLinkValid} auto onClick={onApply}>
          Apply
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

export default LinkModal

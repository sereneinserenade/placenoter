import React, { useEffect, useState } from 'react';

import { Button, Input, Modal, Text } from '@nextui-org/react';

import { FiPlusCircle, FiLink } from 'react-icons/fi'
import { test } from 'linkifyjs'

import './css/QuickLinks.scss'
import { QuickLink } from '../types';

const urlPatternValidation = (url: string): boolean => test(url);

const domainRegex = /:\/\/(.[^/]+)/

const { storage } = chrome

interface QuickLinksProps {

}

const QuickLinks: React.FC<QuickLinksProps> = () => {
  const [localQuickLinks, setLocalQuickLinks] = useState<QuickLink[]>([])

  const [isAddQuickLinkModalOpen, setIsAddQuickLinkModalOpen] = useState<boolean>(false)

  const [name, setName] = useState<string>("")

  const [link, setLink] = useState<string>("")

  const [isLinkValid, setIsLinkValid] = useState<boolean>(true)

  useEffect(() => { link ? setIsLinkValid(urlPatternValidation(link)) : setIsLinkValid(true) }, [link])

  useEffect(() => {
    storage.local.get('quicklinks', ({ quicklinks }) => {
      if (quicklinks) setLocalQuickLinks(quicklinks)
      else storage.local.set({ quicklinks: [] })
    })
  }, [])

  useEffect(() => { storage.local.set({ quicklinks: localQuickLinks }) }, [localQuickLinks])

  const openAddQuickLinkModal = () => setIsAddQuickLinkModalOpen(true)

  const onAddQuickLinkModalClose = () => {
    setIsAddQuickLinkModalOpen(false)
  }

  const addQuickLink = () => {
    const domainMatch = link.match(domainRegex)
    const domain = domainMatch && domainMatch[1]

    const quickLink: QuickLink = {
      name,
      url: link,
      iconUrl: 'https://icon.horse/icon/google.com'
    }

    if (domain) quickLink.iconUrl = `https://icon.horse/icon/${domain}`

    setLocalQuickLinks([...localQuickLinks, quickLink])

    onAddQuickLinkModalClose()
  }

  return (
    <section
      className='quick-links-section flex'
      aria-label='quick-links'
    >

      {
        localQuickLinks.map(({ name, iconUrl, url }, i) => {
          return (
            <a key={url} href={url} className='quick-link-item'>
              <img className='icon' src={iconUrl} alt={`Icon for ${name}`} />

              <span> {name} </span>
            </a>
          )
        })
      }

      <a onClick={() => openAddQuickLinkModal()} className='quick-link-item flex'>
        <FiPlusCircle className='icon plus-icon' />

        <span> Add Link </span>
      </a>

      <Modal
        closeButton
        aria-labelledby="modal-title"
        open={isAddQuickLinkModalOpen}
        onClose={onAddQuickLinkModalClose}
      >
        <Modal.Header>
          <Text id="modal-title" size={18}>
            Add Shortcut
          </Text>
        </Modal.Header>
        <Modal.Body>
          <Input
            clearable
            bordered
            fullWidth
            size="lg"
            color={isLinkValid ? 'default' : 'error'}
            placeholder="URL"
            initialValue={link}
            onInput={(e) => setLink((e.target as HTMLInputElement).value)}
            contentLeft={<FiLink />}
            autoFocus
            onKeyPress={e => e.code === 'Enter' && addQuickLink()}
          />
          <Input
            clearable
            bordered
            fullWidth
            size="lg"
            placeholder="Name"
            initialValue={name}
            onInput={(e) => setName((e.target as HTMLInputElement).value)}
            onKeyPress={e => e.code === 'Enter' && addQuickLink()}
          />
          {/* {
            !isLinkValid && <Text color="error">
              Please enter a valid URL.
            </Text>
          } */}
        </Modal.Body>
        <Modal.Footer>
          <Button auto flat color="error" onClick={onAddQuickLinkModalClose}>
            Close
          </Button>
          <Button auto onClick={addQuickLink} disabled={!link || !isLinkValid}>
            Add
          </Button>
        </Modal.Footer>
      </Modal>
    </section>
  )
}


export default QuickLinks

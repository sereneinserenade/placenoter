import React, { useCallback, useEffect, useState } from 'react';

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  MouseSensor,
  DragStartEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  rectSortingStrategy,
  useSortable,
  SortableContext
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { v4 as uuidv4 } from 'uuid'


import { Button, Input, Modal, Text, Tooltip } from '@nextui-org/react';

import { FiPlusCircle, FiLink } from 'react-icons/fi'
import { test } from 'linkifyjs'

import './css/QuickLinks.scss'
import { QuickLink } from '../types';

const urlPatternValidation = (url: string): boolean => test(url);

const domainRegex = /:\/\/(.[^/]+)/

const { storage } = chrome

interface SortableItemProps {
  id: string
}

const SortableItem: React.FC<SortableItemProps> = ({ id, children }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {children}
    </div>
  );
}


interface QuickLinksProps {

}

const QuickLinks: React.FC<QuickLinksProps> = () => {
  const [localQuickLinksOrder, setLocalQuickLinksOrder] = useState<string[]>([])

  const [localQuickLinks, setLocalQuickLinks] = useState<Record<string, QuickLink>>({})

  const [isAddQuickLinkModalOpen, setIsAddQuickLinkModalOpen] = useState<boolean>(false)

  const [name, setName] = useState<string>("")

  const [link, setLink] = useState<string>("")

  const [isLinkValid, setIsLinkValid] = useState<boolean>(true)

  const [linkAlreadyExists, setLinkAlreadyExists] = useState<boolean>(false)

  const [isItemBeingDragged, setIsItemBeingDragged] = useState<boolean>(false)

  const [itemBeingDragged, setItemBeingDragged] = useState<string>('')

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5
      }
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  useEffect(() => {
    link ? setIsLinkValid(urlPatternValidation(link)) : setIsLinkValid(true)

    for (const [, quickLink] of Object.entries(localQuickLinks)) {
      if (quickLink.url === link) {
        setLinkAlreadyExists(true)
        return
      }
    }

    setLinkAlreadyExists(false)

    console.log(linkAlreadyExists)
  }, [link])

  useEffect(() => {
    storage.local.get('quicklinks', ({ quicklinks }) => {
      if (quicklinks) setLocalQuickLinks(quicklinks)
      else storage.local.set({ quicklinks: {} })

      processQuickLinksOrder()
    })
  }, [])

  const processQuickLinksOrder = useCallback(() => {
    storage.local.get('quicklinksorder', ({ quicklinksorder }) => {
      const keys = Object.keys(localQuickLinks)

      if (quicklinksorder.length) {
        setLocalQuickLinksOrder(quicklinksorder)
      } else {
        if (keys.length) {
          storage.local.set({ quicklinksorder: keys })
          setLocalQuickLinksOrder(keys)

          return
        }

        storage.local.set({ quicklinksorder: [] })
        setLocalQuickLinksOrder([])
      }
    })
  }, [setLocalQuickLinksOrder, localQuickLinks])

  useEffect(() => {
    const quicklinksorder = localQuickLinksOrder

    if (quicklinksorder.length) {
      storage.local.set({ quicklinksorder })
    }
  }, [localQuickLinksOrder])

  useEffect(() => {
    storage.local.set({ quicklinks: localQuickLinks })

    processQuickLinksOrder()
  }, [localQuickLinks])

  const openAddQuickLinkModal = useCallback(() => setIsAddQuickLinkModalOpen(true), [setIsAddQuickLinkModalOpen])

  const onAddQuickLinkModalClose = useCallback(() => {
    setIsAddQuickLinkModalOpen(false)
  }, [setIsAddQuickLinkModalOpen])

  const addQuickLink = () => {
    const domainMatch = link.match(domainRegex)
    const domain = domainMatch && domainMatch[1]

    const id = uuidv4()

    const quickLink: QuickLink = {
      name,
      url: link,
      iconUrl: 'https://icon.horse/icon/google.com',
      id
    }

    if (domain) quickLink.iconUrl = `https://icon.horse/icon/${domain}`

    setLocalQuickLinks({ ...localQuickLinks, [id]: quickLink })

    setLocalQuickLinksOrder([...localQuickLinksOrder, id])

    onAddQuickLinkModalClose()
  }

  const handleDragStart = ({ active }: DragStartEvent) => {
    setIsItemBeingDragged(true)
    setItemBeingDragged(active.id)
  }

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      setLocalQuickLinksOrder((items) => {
        const oldIndex = items.indexOf(active.id);
        const newIndex = items.indexOf(over.id);

        return arrayMove(items, oldIndex, newIndex);
      });
    }

    setTimeout(() => setIsItemBeingDragged(false), 500)
    setItemBeingDragged('')
  }

  const handleRemove = (id: string) => {
    setLocalQuickLinksOrder((ids) => ids.filter((item) => item !== id))

    const newQuickLinks = JSON.parse(JSON.stringify(localQuickLinks))
    delete newQuickLinks[id]

    setLocalQuickLinks(newQuickLinks)
  }

  const handleLinkClicked = (e: React.MouseEvent<HTMLElement, MouseEvent>, url: string) => {
    e.stopPropagation()
    e.preventDefault()

    debugger

    if (isItemBeingDragged) return

    window.location.href = url
  }

  const handleDragCancel = () => {
    setTimeout(() => setIsItemBeingDragged(false), 500)
    setItemBeingDragged('')
  }

  return (
    <section
      className='quick-links-section flex'
      aria-label='quick-links'
    >
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <SortableContext
          items={localQuickLinksOrder}
          strategy={rectSortingStrategy}
        >
          {
            localQuickLinksOrder.map(id => {
              const { url, iconUrl, name } = localQuickLinks[id]
              return (<SortableItem key={id} id={id} >
                <Tooltip placement='bottom' content={`${name || 'No Title'} - ${url}`}>
                  <article
                    onClick={(e) => handleLinkClicked(e, url)}
                    key={url}
                    className={`quick-link-item ${itemBeingDragged === id && 'being-dragged'}`}
                  >
                    <img className='icon' src={iconUrl} alt={`Icon for ${name}`} />

                    <span className='name'> {name.length > 6 ? `${name.substring(0, 6)}...` : name} </span>
                  </article>
                </Tooltip>
              </SortableItem>
              )
            })
          }
        </SortableContext>
      </DndContext>


      {
        // localQuickLinks.map(({ name, iconUrl, url }, i) => {
        //   return (
        // <a key={url} href={url} className='quick-link-item'>
        //   <img className='icon' src={iconUrl} alt={`Icon for ${name}`} />

        //   <span> {name} </span>
        // </a>
        //   )
        // })
      }

      <Tooltip placement='bottom' content={'Add shortcut!'}>
        <a onClick={() => openAddQuickLinkModal()} className='quick-link-item flex'>
          <FiPlusCircle className='icon plus-icon' />

          <span> Add </span>
        </a>
      </Tooltip>

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
          {
            linkAlreadyExists && <Text color="error" css={{ mr: '$4' }}>
              Shortcut already exists.
            </Text>
          }
          <Button auto flat color="error" onClick={onAddQuickLinkModalClose}>
            Close
          </Button>
          <Button auto onClick={addQuickLink} disabled={!link || !isLinkValid || linkAlreadyExists}>
            Add
          </Button>
        </Modal.Footer>
      </Modal>
    </section>
  )
}


export default QuickLinks

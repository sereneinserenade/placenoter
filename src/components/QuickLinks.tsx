import React, { useCallback, useEffect, useState } from 'react';

import {
  closestCenter, DndContext, DragStartEvent, KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors
} from '@dnd-kit/core';
import {
  arrayMove, rectSortingStrategy, SortableContext, sortableKeyboardCoordinates, useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { v4 as uuidv4 } from 'uuid';


import { Button, Input, Loading, Modal, Text, Tooltip } from '@nextui-org/react';

import { test } from 'linkifyjs';
import { FiEdit, FiLink, FiPlusCircle, FiTrash2 } from 'react-icons/fi';

import { quickLinks, quickLinksOrder } from '../Store'
import { QuickLink } from '../types';
import { stopPrevent } from '../utils';
import './css/QuickLinks.scss';
import { useRecoilState } from 'recoil';

const urlPatternValidation = (url: string): boolean => test(url);

const domainRegex = /:\/\/(.[^/]+)/

const { storage } = chrome

interface SortableItemProps {
  id: string,
  children: JSX.Element
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
  const [localQuickLinksOrder, setLocalQuickLinksOrder] = useRecoilState(quickLinksOrder)

  const [localQuickLinks, setLocalQuickLinks] = useRecoilState(quickLinks)

  const [isAddQuickLinkModalOpen, setIsAddQuickLinkModalOpen] = useState<boolean>(false)

  const [name, setName] = useState<string>("")

  const [link, setLink] = useState<string>("")

  const [isLinkValid, setIsLinkValid] = useState<boolean>(true)

  const [linkAlreadyExists, setLinkAlreadyExists] = useState<boolean>(false)

  const [isItemBeingDragged, setIsItemBeingDragged] = useState<boolean>(false)

  const [itemBeingDragged, setItemBeingDragged] = useState<string>('')

  const [quickLinkBeingEdited, setQuickLinkBeingEdited] = useState<string>('')

  const [gotQuickLinksFromDb, setGotQuickLinksFromDb] = useState<boolean>(false)

  const [idOfLinkToBeLoaded, setIdOfLinkToBeLoaded] = useState<string>("")

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

      if (quicklinksorder?.length) {
        setLocalQuickLinksOrder(quicklinksorder)
      } else {
        if (keys.length) {
          storage.local.set({ quicklinksorder: keys })
          setLocalQuickLinksOrder(keys)

          setGotQuickLinksFromDb(true)
          return
        }

        storage.local.set({ quicklinksorder: [] })
        setLocalQuickLinksOrder([])
      }

      setGotQuickLinksFromDb(true)
    })
  }, [setLocalQuickLinksOrder, localQuickLinks])

  useEffect(() => {
    if (!gotQuickLinksFromDb) return

    const quicklinksorder = localQuickLinksOrder

    if (quicklinksorder.length) storage.local.set({ quicklinksorder })
  }, [localQuickLinksOrder])

  useEffect(() => {
    if (!gotQuickLinksFromDb) return

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

    const id = quickLinkBeingEdited || uuidv4()

    const quickLink: QuickLink = {
      name,
      url: link,
      iconUrl: 'https://icon.horse/icon/google.com',
      id
    }

    if (domain) quickLink.iconUrl = `https://icon.horse/icon/${domain}`

    setLocalQuickLinks({ ...localQuickLinks, [id]: quickLink })

    if (!quickLinkBeingEdited) setLocalQuickLinksOrder([...localQuickLinksOrder, id])

    onAddQuickLinkModalClose()

    setQuickLinkBeingEdited('')

    setName("")
    setLink("")
  }

  const handleDragStart = ({ active }: DragStartEvent) => {
    setIsItemBeingDragged(true)
    setItemBeingDragged(`${active.id}`)
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

  const handleRemove = (e: React.MouseEvent<HTMLSpanElement, MouseEvent>, id: string) => {
    if (e) stopPrevent(e)

    setLocalQuickLinksOrder((ids) => ids.filter((item) => item !== id))

    const newQuickLinks = JSON.parse(JSON.stringify(localQuickLinks))
    delete newQuickLinks[id]

    setLocalQuickLinks(newQuickLinks)
  }

  const handleEdit = (e: React.MouseEvent<HTMLSpanElement, MouseEvent>, id: string) => {
    if (e) stopPrevent(e)

    const quickLinkToEdit = localQuickLinks[id]

    if (!quickLinkToEdit) return

    setQuickLinkBeingEdited(id)

    const { name, url } = quickLinkToEdit

    setName(name)
    setLink(url)

    openAddQuickLinkModal()
  }

  const handleLinkClicked = (e: React.MouseEvent<HTMLElement, MouseEvent>, { id, url }: { id: string, url: string }) => {
    if (e) stopPrevent(e)

    if (isItemBeingDragged) return

    setIdOfLinkToBeLoaded(id)

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
              if (!localQuickLinks[id]) return

              const { url, iconUrl, name } = localQuickLinks[id]

              return (<SortableItem key={id} id={id}>
                <Tooltip placement='bottom' content={`${name || 'No Title'} - ${url}`}>
                  <article
                    onClick={(e) => handleLinkClicked(e, { url, id })}
                    key={url}
                    className={`quick-link-item ${itemBeingDragged === id && 'being-dragged'}`}
                  >
                    {
                      id === idOfLinkToBeLoaded
                        ? <Loading size='lg' />
                        : <img className='icon' src={iconUrl} alt={`Icon for ${name}`} />
                    }

                    <span className='name'> {name.length > 6 ? `${name.substring(0, 6).trim()}…` : `${name || '-'}`} </span>

                    <span className='remove-icon' onClick={(e) => handleRemove(e, id)} title="Remove Shortcut">
                      <FiTrash2 />
                    </span>

                    <span className='edit-icon' onClick={(e) => handleEdit(e, id)} title="Edit Shortcut">
                      <FiEdit />
                    </span>
                  </article>
                </Tooltip>
              </SortableItem>
              )
            })
          }
        </SortableContext>
      </DndContext>

      <Tooltip placement='bottom' content={'Add shortcut!'}>
        <article onClick={() => {
          setName("")
          setLink("")
          openAddQuickLinkModal()
        }} className='flex flex-col add-button'>
          <span>
            <FiPlusCircle className='icon plus-icon' />
          </span>

          <span> Add </span>
        </article>
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
            linkAlreadyExists && !quickLinkBeingEdited && <Text color="error" css={{ mr: '$4' }}>
              Shortcut already exists.
            </Text>
          }
          <Button auto flat color="error" onClick={onAddQuickLinkModalClose}>
            Close
          </Button>
          <Button auto onClick={addQuickLink} disabled={!link || !isLinkValid || (linkAlreadyExists && !quickLinkBeingEdited)}>
            Add
          </Button>
        </Modal.Footer>
      </Modal>
    </section>
  )
}


export default QuickLinks

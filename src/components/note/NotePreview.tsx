import React, { useCallback, useRef, useState } from 'react';
import { Button, Tooltip, Text } from '@nextui-org/react';

import { Note } from '../../types';

import './styles/NotePreview.scss'
import { FiCheck, FiEdit2, FiTrash2 } from 'react-icons/fi';
import { stopPrevent } from '../../utils';
import { RiPushpin2Fill, RiPushpin2Line, RiRecycleLine } from 'react-icons/ri';

interface NotePreviewProps {
  onClick: Function,
  note: Note,
  activeNote: Note | undefined,
  initiateMoveToBin: Function,
  returnFormattedDateString: Function
  setNoteTitle: Function
  isBin: boolean

  initiateRecycleNote?: Function
  initiateDeletePermanently?: Function

  togglePin?: Function
  isPinned: boolean
}

const GetNoteTitle = (note: Note, isInBin = false, setNoteTitle: Function) => {
  const [isEditable, setIsEditable] = useState(false)

  const [name, setName] = useState(`${note.title}`)

  const inputRef = useRef(null)

  const onInput = useCallback(() => {
    setNoteTitle(note, name)
    setIsEditable(false)
  }, [name, note])

  const onEditStart = useCallback(() => {
    setIsEditable(true);

    setTimeout(() => (inputRef.current as unknown as HTMLInputElement).focus())
  }, [])

  return (
    <span className='title-editor-container flex'>
      {
        !isInBin
        && (
          <span className='control-buttons'>
            {isEditable
              ? <Tooltip placement='topStart' content={<Text> Save Title <kbd>Enter</kbd></Text>}><FiCheck onClick={(e) => stopPrevent(e) && onInput()} /> </Tooltip>
              : <Tooltip placement='topStart' content={'Edit Title'}><FiEdit2 onClick={(e) => stopPrevent(e) && onEditStart()} /> </Tooltip>
            }
          </span>
        )
      }

      <input
        placeholder='Add Title...'
        className='title-editor-input'
        onClick={e => e.stopPropagation()}
        value={name}
        onInput={e => setName((e.target as any).value)}
        disabled={!isEditable}
        onKeyPress={(e) => e.code === 'Enter' && onInput()}
        ref={inputRef}
      />
    </span>
  )
}

export const NotePreview: React.FC<NotePreviewProps> = ({
  onClick,
  note,
  activeNote,
  initiateMoveToBin,
  returnFormattedDateString,
  setNoteTitle,
  isBin,

  initiateRecycleNote,
  initiateDeletePermanently,

  togglePin,
  isPinned
}) => {
  return (
    <article
      onClick={() => onClick(note)}
      key={note.id + 'internal'}
      className={`sidebar-note flex flex-row justify-between align-center ${note.id === activeNote?.id ? 'active' : ''}`}
    >
      <section className='title-and-action-center  flex' aria-label='title-and-action-center'>
        {GetNoteTitle(note, isBin, setNoteTitle)}
        <Text size={12}> {returnFormattedDateString(new Date(note.timestamp))} </Text>
      </section>

      <section className='right-control-buttons flex gap-8px' aria-label='right-control-buttons'>
        {
          isBin
            ? (
              <Tooltip
                placement='top'
                content={'Recycle'}>
                <Button
                  color="primary"
                  auto
                  ghost
                  size='sm'
                  onClick={(e) => initiateRecycleNote?.(e, note)}
                  icon={<RiRecycleLine />}
                />
              </Tooltip>
            ) : <Tooltip
              placement='top'
              content={isPinned ? 'Unpin' : 'Pin'}
            >
              <Button
                auto
                ghost
                size='sm'
                onClick={(e) => stopPrevent(e) && togglePin?.(note)}
                icon={isPinned ? <RiPushpin2Fill /> : <RiPushpin2Line />}
              />
            </Tooltip>
        }


        <Tooltip
          placement='right'
          content={isBin ? 'Delete Permanently' : 'Move to Bin'}
        >
          <Button
            color="error"
            auto
            ghost
            size='sm'
            onClick={(e) => isBin ? initiateDeletePermanently?.(e, note) : initiateMoveToBin(e, note)}
            icon={<FiTrash2 />}
          />
        </Tooltip>
      </section>
    </article>
  )
}

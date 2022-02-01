import { Container, Link } from '@nextui-org/react';
import React, { useContext } from 'react';
import { Maintop, Sidebar, Tiptap } from './components';
import { Context, ContextInterface } from './Context';

const Main = () => {

  const { sidebarActive, activeNote, setActiveNote, createNewNoteAndSetItAsActiveNote } = useContext(Context) as ContextInterface

  const onCreateNewNoteClicked = (e: React.MouseEvent<unknown, MouseEvent>) => {
    e.preventDefault()
    e.stopPropagation()

    createNewNoteAndSetItAsActiveNote()
  }

  const setNoteContent = (content: string) => {
    if (typeof content === 'string') content = content.trim()

    setActiveNote({ ...activeNote, content })
  }

  return (
    <main className="placenoter">
      <Sidebar />

      <section className={`note-content h-full ${!sidebarActive ? 'full' : ''}`}>
        <Maintop />

        {/* Only showing Tiptap Section if a note is active */}
        {
          activeNote?.id && <main className='editor-area'>
            <Container sm>
              <Tiptap content={''} onUpdate={(c: string) => setNoteContent(c)} />
            </Container>
          </main>
        }

        {
          !activeNote?.id && <main className='no-note-selected flex h-full'>
            <h1>
              No Note selected
            </h1>

            <h3 className='flex'>
              Select or <Link onClick={(e) => onCreateNewNoteClicked(e)} > &nbsp; create a new &nbsp; </Link>  note.
            </h3>
          </main>
        }

      </section>
    </main>
  )
}

export default Main
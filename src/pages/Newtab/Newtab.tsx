import React, { useContext, useState } from 'react';
import { NextUIProvider, Container, Row, Col, Button, Spacer } from '@nextui-org/react';

import { Tiptap, Sidebar, Maintop } from './components'

import { Context, ContextInterface, ContextProvider } from './Context'

import './Newtab.scss';

const Newtab = () => {
  const [content, setContent] = useState("")

  const { sidebarActive, setSidebarActive } = useContext(Context) as ContextInterface

  const setNotes = () => {
    console.log('start')
    chrome.storage.sync.set({ content }, (): void => console.log('saved ' + content))
    console.log('end')
  }

  const getFirstNote = () => {
    chrome.storage.sync.get('firstNote', (r) => {
      console.log('Value currently is ' + r.firstNote.content)
    });
  }

  return (
    <ContextProvider>
      <NextUIProvider>
        <main className="placenoter">
          <Sidebar />

          <section className={`note-content h-full ${!sidebarActive ? 'full' : ''}`}>
            <Maintop />

            <main className='editor-area'>
              <Container sm>
                <Tiptap content={''} onUpdate={(c: string) => setContent(c?.trim())} />
              </Container>
            </main>
          </section>
        </main>
      </NextUIProvider>
    </ContextProvider>
  );
};

export default Newtab;

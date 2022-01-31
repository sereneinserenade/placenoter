import React, { useState } from 'react';
import { NextUIProvider, Container, Row, Col, Button, Spacer } from '@nextui-org/react';

import Tiptap from './components/Tiptap'
import './Newtab.css';
import './Newtab.scss';
import Sidebar from './components/Sidebar';

const Newtab = () => {
  const [content, setContent] = useState("")
  const [sidebarActive, setSidebarActive] = useState(true);

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
    <NextUIProvider>
      <main className="placenoter">
        <Sidebar sidebarActive={sidebarActive} />

        <main className='note-content'>

          <Tiptap onUpdate={(c: string) => setContent(c?.trim())} />

          <Row>
            <Button size="sm" onClick={(e) => setNotes()}>
              Save
            </Button>

            <Spacer x={1} />

            <Button size="sm" onClick={(e) => getFirstNote()}>
              Console the saved thing
            </Button>
          </Row>
        </main>
      </main>
    </NextUIProvider>
  );
};

export default Newtab;

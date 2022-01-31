import React, { useState } from 'react';
import { NextUIProvider } from '@nextui-org/react';
import { Container, Row, Col, Button, Spacer } from '@nextui-org/react';

import logo from '../../assets/img/logo.svg';
import Tiptap from './components/Tiptap'
import './Newtab.css';
import './Newtab.scss';


const Newtab = () => {
  const [content, setContent] = useState("")

  const setNotes = () => {
    console.log('start')
    chrome.storage.sync.set({ firstNote: { content } }, (): void => console.log('saved ' + content))
    console.log('end')
  }

  const getFirstNote = () => {
    chrome.storage.sync.get(['firstNote'], (r) => {
      console.log('Value currently is ' + typeof r));
  }

  return (
    <NextUIProvider>
      <main className="placenoter">
        <Container >
          <Tiptap onUpdate={setContent} />

          <Row>
            <Button size="sm" onClick={(e) => setNotes()}>
              Save
            </Button>

            <Spacer x={1} />

            <Button size="sm" onClick={(e) => getFirstNote()}>
              Console the saved thing
            </Button>
          </Row>

        </Container>

      </main>
    </NextUIProvider>
  );
};

export default Newtab;

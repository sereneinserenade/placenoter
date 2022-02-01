import React, { useContext } from 'react';
import { NextUIProvider, Container, Link } from '@nextui-org/react';

import { ContextProvider } from './Context'
import Main from './Main'

import './Newtab.scss';

const Newtab = () => {

  return (
    <ContextProvider>
      <NextUIProvider>
        <Main />
      </NextUIProvider>
    </ContextProvider>
  );
};

export default Newtab;

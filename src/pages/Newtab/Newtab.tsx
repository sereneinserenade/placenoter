import React from 'react';
import { NextUIProvider } from '@nextui-org/react';

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

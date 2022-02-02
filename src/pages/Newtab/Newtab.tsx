import React from 'react';
import { NextUIProvider } from '@nextui-org/react';

import Main from './Main'

import './Newtab.scss';
import { RecoilRoot } from 'recoil';

const Newtab = () => {

  return (
    <NextUIProvider>
      <RecoilRoot>
        <Main />
      </RecoilRoot>
    </NextUIProvider>
  );
};

export default Newtab;

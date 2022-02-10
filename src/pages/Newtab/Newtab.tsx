import React, { useEffect, useState } from 'react';
import { createTheme, NextUIProvider, getDocumentTheme } from '@nextui-org/react';
import { RecoilRoot, useRecoilState } from 'recoil';

import Main from './Main'
// import { darkState } from './Store';

import './Newtab.scss';

const Newtab = () => {
  const [isDark, setIsDark] = useState(false);

  const lightTheme = createTheme({ type: 'light' })

  const darkTheme = createTheme({
    type: 'dark',
    theme: {
      colors: {
        primary: '#3D9CF7'
      }
    }
  })

  useEffect(() => {
    // you can use any storage
    let theme = window.localStorage.getItem('data-theme');
    setIsDark(theme === 'dark-theme');

    const observer = new MutationObserver((mutation) => {
      let newTheme = getDocumentTheme(document?.documentElement);
      setIsDark(newTheme === 'dark-theme');
    });

    // Observe the document theme changes
    observer.observe(document?.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme', 'style']
    });

    return () => observer.disconnect();
  }, []);

  return (
    <NextUIProvider theme={isDark ? darkTheme : lightTheme}>
      <RecoilRoot>
        <Main />
      </RecoilRoot>
    </NextUIProvider>
  );
};

export default Newtab;

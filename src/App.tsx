import { useEffect, useState } from 'react';
import { createTheme, NextUIProvider, getDocumentTheme } from '@nextui-org/react';
import { RecoilRoot } from 'recoil';

import 'tippy.js/animations/shift-toward-subtle.css';

import Main from './Main'

import './Newtab.scss';

const Newtab = () => {
  const [isDark, setIsDark] = useState(false);

  const lightTheme = createTheme({ type: 'light' })

  const darkTheme = createTheme({
    type: 'dark',
    theme: {
      colors: {
        background: '#161b22',
      }
    }
  })

  useEffect(() => {
    // you can use any storage
    let theme = window.localStorage.getItem('data-theme');
    setIsDark(theme === 'dark-theme');

    const observer = new MutationObserver(() => {
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

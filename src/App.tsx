import { useEffect, useMemo, useState } from 'react';
import { createTheme, NextUIProvider, getDocumentTheme } from '@nextui-org/react';
import { useRecoilState } from 'recoil';

import 'tippy.js/animations/shift-toward-subtle.css';

import Main from './Main'

import { themeState } from './Store'

import './Newtab.scss';
import { useThemeDetector } from './hooks';

const Newtab = () => {
  const prefersDarkTheme = useThemeDetector()

  const [theme, setTheme] = useRecoilState(themeState)

  const isDark = useMemo(() => theme === 'dark-theme', [theme])

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
    let theme = window.localStorage.getItem('data-theme');
    setTheme(theme!);
  }, []);

  useEffect(() => {
    window.localStorage.setItem('data-theme', theme);
  }, [theme])

  const calculatedTheme = useMemo(() => {
    if (theme === 'system-theme') return prefersDarkTheme ? darkTheme : lightTheme

    return isDark ? darkTheme : lightTheme
  }, [isDark, prefersDarkTheme, darkTheme, lightTheme, theme])

  return (
    <NextUIProvider theme={calculatedTheme}>
      <Main />
    </NextUIProvider>
  );
};

export default Newtab;

import { css, createGlobalStyle } from 'styled-components'

const commonStyles = css``

export const GlobalStyle =
  process.platform !== 'darwin'
    ? createGlobalStyle`
        ${commonStyles}
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
          background-color: #95959588;
        }
        ::-webkit-scrollbar-thumb {
          background-color: #33333366;
        }
      `
    : createGlobalStyle`${commonStyles}`

// src/styles/GlobalStyles.js
import { createGlobalStyle } from "styled-components";

const GlobalStyle = createGlobalStyle`
  *, *::before, *::after {
    box-sizing: border-box;
  }

  html {
    width: 100%;
    min-height: 100%;
    scroll-behavior: smooth;
    -webkit-text-size-adjust: 100%;
  }

  body {
    width: 100%;
    min-height: 100vh;
    margin: 0;
    font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    background: #F4F7F6;
    color: #132238;
    overflow-x: hidden;
    text-rendering: optimizeLegibility;
    -webkit-font-smoothing: antialiased;
  }

  #root {
    min-height: 100vh;
    width: 100%;
    overflow-x: clip;
  }

  button,
  input,
  select,
  textarea {
    font-family: inherit;
  }

  button {
    -webkit-tap-highlight-color: transparent;
  }

  button:disabled {
    cursor: not-allowed;
  }

  a {
    color: inherit;
    text-decoration: none;
  }

  img,
  svg,
  video,
  canvas {
    max-width: 100%;
  }

  table {
    border-spacing: 0;
  }

  ::selection {
    background: rgba(214, 168, 65, 0.35);
    color: #0E2D4F;
  }

  ::-webkit-scrollbar {
    width: 10px;
    height: 10px;
  }

  ::-webkit-scrollbar-track {
    background: #EAF0EE;
  }

  ::-webkit-scrollbar-thumb {
    background: rgba(14, 45, 79, 0.35);
    border-radius: 999px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: rgba(14, 45, 79, 0.55);
  }

  @media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
      animation-duration: 0.001ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.001ms !important;
      scroll-behavior: auto !important;
    }
  }
`;

export default GlobalStyle;
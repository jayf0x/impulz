import { render } from 'preact'
import { ChakraProvider, ColorModeScript, extendTheme } from '@chakra-ui/react'
import './index.css'
import { App } from './app.jsx'

const theme = extendTheme({
  config: { initialColorMode: 'dark', useSystemColorMode: false },
  fonts: {
    heading: `'Inter', system-ui, sans-serif`,
    body: `'Inter', system-ui, sans-serif`,
    mono: `'JetBrains Mono', monospace`,
  },
})

render(
  <ChakraProvider theme={theme}>
    <ColorModeScript initialColorMode="dark" />
    <App />
  </ChakraProvider>,
  document.getElementById('app')
)

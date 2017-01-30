import React from 'react'
import { render } from 'react-dom'
import Lekplats from './Lekplats'
import Demo from './Demo'

render(
  <Lekplats components={{
    Demo: {
      Component: Demo,
      fixtures: {
        'Swedish citizen': {
          name: {
            first: 'Sven',
            last: 'Svensson'
          },
          rolling: false
        },
        'Rolling Brasilian citizen': {
          name: {
            first: 'João',
            last: 'Silva'
          },
          rolling: true
        }
      }
    }
  }} />,
  document.getElementById('root')
)

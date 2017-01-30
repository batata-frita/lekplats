import React from 'react'
import { render } from 'react-dom'
import Lekplats from './Lekplats'
import Demo from './Demo'

render(
  <Lekplats components={{
    Demo: {
      Component: Demo,
      fixtures: {
        default: {
          name: {
            first: 'Sven',
            last: 'Svensson'
          },
          rolling: false
        }
      }
    }
  }} />,
  document.getElementById('root')
)

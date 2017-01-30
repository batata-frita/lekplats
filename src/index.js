import React from 'react'
import { render } from 'react-dom'
import Lekplats from './Lekplats'

function Demo () {
  return <h2>Demo</h2>
}

render(
  <Lekplats components={{
    Demo: {
      Component: Demo,
      fixtures: {
        default: {}
      }
    }
  }} />,
  document.getElementById('root')
)

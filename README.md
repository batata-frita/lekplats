# <img src='./logo.png' height='128px' title='Lekplats' />

Npm package to render a playground of React components.

## Usage

The biggest difference between existing solutions is that this is just a React component.

```bash
yarn add --dev lekplats
```

Then render it passing a list of components with their fixtures:

```js
import React from 'react'
import { render } from 'react-dom'
import Lekplats from 'lekplats'
import MyComponent from './components/MyComponent'

render(
  <Lekplats components={{
    Demo: {
      Component: MyComponent,
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
```

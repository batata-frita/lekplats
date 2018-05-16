import React from 'react'
import { introspect } from 'patch-react-proptypes-add-introspection'
import lensPath from 'ramda/src/lensPath'
import set from 'ramda/src/set'
import view from 'ramda/src/view'
import styles from './styles.scss'

export default function FixtureEditor ({ Component, fixture, onFixtureChange }) {
  const propTypes = Component.properTypes || introspect(Component.propTypes || {})
  const flattenedPropTypes = flattenPropTypes(propTypes)
  const groupedPropTypes = groupPropTypes(flattenedPropTypes)
  return (
    <div className={styles.fixtureEditor}>
      {renderFixtureEditorGroups(
        groupedPropTypes,
        fixture,
        onFixtureChange
      )}
    </div>
  )
}

function renderFixtureEditorField (props, onFixtureChange) {
  const { type, structure, name, value, key } = props
  const formattedName = formatFixtureFieldName(name)
  const onChange = (value) => {
    onFixtureChange(set(lensPath(name.split('.')), value, {}))
  }
  switch (type) {
    case 'arrayOf':
      if (structure.type === 'string') {
        return (
          <label
            htmlFor={`array-input-${key}`}
            key={key}
            className={styles.fixtureEditorField}>
            <div>{formattedName}</div>
            <textarea
              id={`array-input-${key}`}
              className={styles.fixtureEditorTextarea}
              onChange={(e) => {
                onChange(e.target.value.split('\n\n'))
              }}
              value={(value || []).join('\n\n')}
            />
          </label>
        )
      }
      break
    case 'string': {
      return (
        <div
          className={styles.fixtureEditorField}
          key={key}>
          <input
            type='text'
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={formattedName}
          />
        </div>
      )
    }
    case 'bool': {
      return (
        <label key={key}>
          <input
            type='checkbox'
            checked={value}
            onChange={(e) => {
              onChange(!!e.target.checked)
            }}
            name={name}
          />
          {formattedName}
        </label>
      )
    }
  }
}

function renderFixtureEditorGroups (propTypes, fixture, onFixtureChange) {
  return ['text', 'settings'].map((group, i) => (
    <div className={styles.fixtureEditorGroup} key={i}>
      {Object.keys(propTypes[group]).length > 0 && (
        <h2 className={styles.fixtureEditorGroupTitle}>
          {group.replace(/^./, (s) => s.toUpperCase())}
        </h2>
      )}
      {Object.keys(propTypes[group]).map((key, i) => (
        renderFixtureEditorField({
          name: key,
          value: view(lensPath(key.split('.')), fixture),
          key: i,
          ...propTypes[group][key]
        }, onFixtureChange)
      ))}
    </div>
  ))
}

function formatFixtureFieldName (name) {
  const formattedName = name.split('.').slice(-1)[0]
  // "propWithHTML" => "prop With H T M L"
    .replace(/([A-Z])/g, ' $1')
  // "prop With H T M L" => "prop With HTML"
    .replace(/([A-Z])\s(?=[A-Z])/g, '$1')
  // "prop With HTML" => "prop with HTML"
    .replace(/[A-Z][a-z]/g, (s) => s.toLowerCase())
  // "prop with HTML" => "Prop with HTML"
    .replace(/^./, (s) => s.toUpperCase())
  return formattedName
}

function flattenPropTypes (propTypes, keyPrefix) {
  return Object.keys(propTypes).reduce((acc, key) => {
    const propType = propTypes[key]
    const prefixedKey = keyPrefix ? `${keyPrefix}.${key}` : key
    if (propType.type === 'shape') {
      return {
        ...acc,
        ...flattenPropTypes(
          propType.structure,
          prefixedKey
        )
      }
    }
    return {
      ...acc,
      [prefixedKey]: propType
    }
  }, {})
}

function groupPropTypes (propTypes) {
  return Object.keys(propTypes).reduce((acc, key) => {
    const propType = propTypes[key]
    let group
    if (
      (propType.type === 'string') ||
      (propType.type === 'arrayOf' && propType.structure.type === 'string')
    ) {
      group = 'text'
    } else if (propType.type === 'bool') {
      group = 'settings'
    }
    if (group) {
      return {
        ...acc,
        [group]: {
          ...acc[group],
          [key]: propType
        }
      }
    }
    return acc
  }, {
    text: {},
    settings: {}
  })
}

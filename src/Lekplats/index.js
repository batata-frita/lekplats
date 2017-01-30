import React from 'react'
import Frame from 'react-frame-component'
import HTML2React from 'html2react'
import classNamesBind from 'classnames/bind'
import merge from 'lodash.merge'
import FixtureEditor from './FixtureEditor'
import devices from './devices'
import styles from './styles.scss'

const classNames = classNamesBind.bind(styles)

function getQueryParameters (href) {
  const paramsStr = href ? href.split(/\?(.+)?/)[1] : ''
  return paramsStr.split('&').map((param) => {
    return param.split('=')
  }).reduce((acc, [key, value]) => {
    if (value) {
      if (value === 'true') {
        value = true
      } else if (value === 'false') {
        value = false
      }
      return {
        ...acc,
        [key]: value
      }
    }
    return acc
  }, {})
}

function generateQuery (params = {}) {
  const query = Object.keys(params).reduce((acc, key) => {
    if (params[key] && params[key] != null) {
      acc.push(`${key}=${params[key]}`)
    }
    return acc
  }, []).join('&')
  return query && `?${query}`
}

function renderDropdowns (dropdowns, params, updateParams) {
  return Object.keys(dropdowns).map((key, i, arr) => {
    const { onChange, options } = dropdowns[key]
    return (
      <select
        className={styles.dropdown}
        style={{ zIndex: arr.length - i + 1 }}
        onChange={(e) => {
          updateParams({
            [key]: encodeURIComponent(e.target.value)
          })
          onChange(e.target.value)
        }}
        value={params[key]}
        key={key}>
        {options.map((option = {}, i) => {
          const value = typeof option === 'string' ? option : option.value
          const text = typeof option === 'string' ? option : option.text
          return (
            <option value={value} key={i}>
              {text}
            </option>
          )
        })}
      </select>
    )
  })
}

function renderDeviceDropdown (devices, deviceName, onChange) {
  return (
    <select
      className={styles.dropdown}
      style={{ zIndex: 1 }}
      onChange={onChange}
      value={deviceName || ''}>
      <option value=''>/Select device</option>
      <option value=''>desktop</option>
      {devices.map((device = {}) => (
        <option
          value={encodeURIComponent(device.name)}
          data-w={device.w}
          data-h={device.h}
          key={device.name}>
          {device.name}
        </option>
      ))}
    </select>
  )
}

function renderFixturesList (componentName, fixtures, params, handleLinkClick) {
  return (
    <ul className={styles.fixturesList}>
      {Object.keys(fixtures).map((key, j) => {
        const isSelected = (
          params.component === componentName &&
          params.fixture === key
        )
        const linkClassName = classNames('fixtureLink', {
          'is-selected': isSelected
        })
        const href = generateQuery({
          ...params,
          component: componentName,
          fixture: key
        })
        return (
          <li
            key={`${componentName}-${key}`}
            className={styles.fixturesListItem}>
            <a
              className={linkClassName}
              href={href}
              onClick={handleLinkClick}>
              {key}
            </a>
          </li>
        )
      })}
    </ul>
  )
}

function renderFixtures (fixtures, params, handleLinkClick) {
  return (
    <ul className={styles.componentsList}>
      {Object.keys(fixtures).map((key, i) => {
        return (
          <li key={i} className={styles.componentsListItem}>
            <strong className={styles.componentsListItemHeader}>
              {key}
            </strong>
            {!Object.keys(fixtures[key]).length && (
              <span className={styles.noFixtures}>No fixtures available.</span>
            )}
            {Object.keys(fixtures[key]).length > 0 && (
              renderFixturesList(
                key,
                fixtures[key],
                params,
                handleLinkClick
              )
            )}
          </li>
        )
      })}
    </ul>
  )
}

function renderComponent (deviceWidth, deviceHeight, params, Component, fixture) {
  return (
    <div
      className={styles.component}
      style={{
        width: deviceWidth || '100%',
        height: deviceHeight || '100%'
      }}
      data-device-w={deviceWidth && parseInt(deviceWidth, 10)}
      data-device-h={deviceHeight && parseInt(deviceHeight, 10)}>
      {deviceWidth && (
        <Frame head={HTML2React(document.head.innerHTML)}>
          <div style={{ padding: '20px' }}>
            <Component {...fixture} />
          </div>
        </Frame>
        )}
      {!deviceWidth && (
        <Component {...fixture} />
      )}
    </div>
  )
}

class Lekplats extends React.Component {
  constructor (props) {
    super(props)
    this.handlePopState = this.handlePopState.bind(this)
    this.handleLinkClick = this.handleLinkClick.bind(this)
    this.handleDeviceChange = this.handleDeviceChange.bind(this)
    this.handleFixtureChange = this.handleFixtureChange.bind(this)
    this.toggleFullscreenMode = this.toggleFullscreenMode.bind(this)
    this.toggleEditMode = this.toggleEditMode.bind(this)
    this.state = {
      params: {
        editable: false,
        device: null,
        fullScreen: null,
        component: null,
        fixture: null,
        fixtureMods: null
      },
      deviceWidth: null,
      deviceHeight: null
    }
  }
  componentWillMount () {
    window.addEventListener('popstate', this.handlePopState, false)
  }
  componentWillUnmount () {
    window.removeEventListener('popstate', this.handlePopState)
  }
  componentDidMount () {
    const params = getQueryParameters(window.location.search)
    const device = this.props.devices.find((device) => (
      device.name === decodeURIComponent(params.device)
    )) || {}
    const { w: dw, h: dh } = device

    this.updateDropdownValues(params)

    this.setState({
      deviceWidth: dw,
      deviceHeight: dh,
      params: {
        ...this.state.params,
        ...params
      }
    }, () => {
      this.pushState(true)
    })
  }
  render () {
    const { device, editable, fullScreen, component: componentName, fixture: fixtureName } = this.state.params
    const { deviceWidth, deviceHeight } = this.state
    const rootClasses = classNames('root', {
      'is-fullscreen': fullScreen,
      'is-simulating-device': !!deviceWidth,
      'is-editable': editable
    })
    const fullScreenToggleClasses = classNames('toggle', {
      'is-active': fullScreen
    })
    const editableToggleClasses = classNames('toggle', {
      'is-active': editable
    })
    const components = this.props.components
    const fixtures = Object.keys(components).reduce((acc, key) => {
      let componentFixtures = components[key].fixtures
      if (typeof componentFixtures === 'function') {
        componentFixtures = componentFixtures(this.state.params)
      }
      return {
        ...acc,
        [key]: componentFixtures
      }
    }, {})
    const Component = components[componentName] && components[componentName].Component
    const fixtureMods = JSON.parse(decodeURIComponent(this.state.params.fixtureMods || '{}'))
    const fixture = merge(
      {},
      fixtures[componentName] ? fixtures[componentName][fixtureName] : {},
      fixtureMods
    )
    return (
      <div className={rootClasses}>
        <div className={styles.sidebar}>
          {renderDropdowns(
            this.props.dropdowns,
            this.state.params,
            this.updateParams.bind(this)
          )}
          {renderDeviceDropdown(
            this.props.devices,
            device,
            this.handleDeviceChange
          )}
          {renderFixtures(
            fixtures,
            this.state.params,
            this.handleLinkClick
          )}
        </div>
        {Component && <FixtureEditor
          Component={Component}
          fixture={fixture}
          onFixtureChange={this.handleFixtureChange}
        />}
        <div className={styles.content}>
          {Component && renderComponent(
            deviceWidth,
            deviceHeight,
            this.state.params,
            Component,
            fixture
          )}
        </div>
        <a
          className={fullScreenToggleClasses}
          href='#'
          onClick={this.toggleFullscreenMode}
          title='Fullscreen mode'>
          F
        </a>
        <a
          className={editableToggleClasses}
          href='#'
          onClick={this.toggleEditMode}
          title='Edit mode'>
          E
        </a>
      </div>
    )
  }
  pushState (replace = false) {
    const method = replace ? 'replaceState' : 'pushState'
    const title = `${this.state.params.component} / ${this.state.params.fixture}`
    const href = generateQuery(this.state.params)
    window.history[method](this.state.params, title, href)
  }
  updateDropdownValues (params) {
    const dropdowns = this.props.dropdowns
    Object.keys(params).forEach((key) => {
      if (dropdowns[key]) {
        if (typeof dropdowns[key].onChange === 'function') {
          dropdowns[key].onChange(params[key])
        }
      }
    })
  }
  updateParams (params) {
    this.setState({
      params: {
        ...this.state.params,
        ...params
      }
    }, this.pushState)
  }
  handlePopState ({ state }) {
    this.setState({ params: state }, () => {
      this.updateDropdownValues(this.state.params)
    })
  }
  handleDeviceChange (e) {
    const value = e.target.value
    const selected = e.target.options[e.target.selectedIndex]
    this.setState({
      deviceWidth: selected.getAttribute('data-w'),
      deviceHeight: selected.getAttribute('data-h')
    })
    this.updateParams({
      device: value !== '' ? value : null
    })
  }
  handleFixtureChange (fixture) {
    const fixtureMods = JSON.parse(decodeURIComponent(this.state.params.fixtureMods || '{}'))
    const mergedFixtureMods = merge({}, fixtureMods, fixture)
    this.updateParams({
      fixtureMods: encodeURIComponent(JSON.stringify(mergedFixtureMods))
    })
  }
  handleLinkClick (e) {
    e.preventDefault()
    this.updateParams({
      ...getQueryParameters(e.target.href),
      fixtureMods: null
    })
  }
  toggleFullscreenMode (e) {
    e.preventDefault()
    this.updateParams({
      fullScreen: !this.state.params.fullScreen
    })
  }
  toggleEditMode (e) {
    e.preventDefault()
    const editable = !this.state.params.editable
    this.updateParams({ editable })
  }
}

Lekplats.defaultProps = {
  dropdowns: {},
  devices: devices,
  components: {}
}

export default Lekplats

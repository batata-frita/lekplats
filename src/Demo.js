import React, { PropTypes } from 'react'

export default function Demo ({ name, translations, rolling }) {
  const { first: firstname, last: lastname } = name
  if (rolling) {
    return <h2><marquee>Hey, {firstname} {lastname}!</marquee></h2>
  }
  return <h2>Hey, {firstname} {lastname}!</h2>
}

Demo.propTypes = {
  name: PropTypes.shape({
    first: PropTypes.string,
    last: PropTypes.string
  }),
  rolling: PropTypes.bool
}

Demo.defaultProps = {
  name: {}
}

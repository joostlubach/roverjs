// @flow

import * as React from 'react'
import {jss, colors, fonts, layout} from '../styles'
import {Spinner, SVG} from '../components'

export type Props = {
  loading: boolean,
  error:   ?Error
}

export const defaultProps = {
  error: null
}

export default class SplashScreen extends React.Component<*, Props, *> {

  props: Props
  static defaultProps = defaultProps

  render() {
    const {loading, error} = this.props

    return (
      <div className={$.splashScreen}>
        {loading && this.renderLoading()}
        {!loading && error != null && this.renderError(error)}
      </div>
    )
  }

  renderLoading() {
    return (
      <div className={$.content}>
        <SVG name='logo' style={{fill: colors.green}}/>
        <Spinner size={32} color={colors.fg.inverted}/>
        <div className={$.loadingLabel}>
          Loading...
        </div>
      </div>
    )
  }

  renderError(error: Error) {
    const {response} = error
    const status = response == null ? null : response.status

    let message: string
    if (status === 403) {
      message = "You have exceeded GitHub's API rate limit. Wait a while before trying again."
    } else {
      message = error.message
    }

    return (
      <div className={$.content}>
        <SVG name='robot-lame' style={{fill: colors.purple}}/>
        <div className={$.errorTitle}>
          Error while loading
        </div>
        <div className={$.errorDetail}>
          {message}
        </div>
      </div>
    )
  }

}

const $ = jss({
  splashScreen: {
    ...layout.overlay,
    color: colors.fg.inverted,
  },

  content: {
    ...layout.overlay,
    ...layout.flex.center,

    '& :not(:last-child)': {
      marginBottom: layout.padding.m
    }
  },

  loadingLabel: {
    font:          fonts.normal,
    textTransform: 'uppercase'
  },

  errorTitle: {
    font:       fonts.large,
    fontWeight: 700
  },

  errorDetail: {
    font:    fonts.small,
    opacity: 0.8
  },

})
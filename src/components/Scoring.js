// @flow

import * as React from 'react'
import {jss, layout} from '../styles'
import {ScoreStars, Markdown} from '.'

export interface Props {
  score:   number,
  message: ?string,

  classNames?: React.ClassNamesProp
}

export default class Scoring extends React.Component<Props> {

  props: Props

  render() {
    const {score, message, classNames} = this.props

    return (
      <div classNames={[$.scoring, classNames]}>
        <ScoreStars score={score}/>
        {message && <Markdown classNames={$.message}>{message}</Markdown>}
      </div>
    )
  }

}

const $ = jss({
  scoring: {
    ...layout.flex.column,
    alignItems: 'center'
  },

  message: {
    alignSelf: 'stretch',
    marginTop: layout.padding.s,
    textAlign: 'center'
  }

})
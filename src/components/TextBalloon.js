// @flow

import * as React from 'react'
import {jss, layout, colors, fonts} from '../styles'
import CSSTransitionGroup from 'react-addons-css-transition-group'
import {SVG} from '.'
import {TextBalloon as TextBalloonType} from '../program'

export type Props = {
  balloon:    TextBalloonType,
  className?: ClassNameProp
}

export default class TextBalloon extends React.Component<*, Props, *> {

  props: Props

  render() {
    const {balloon: {text, color, style}, className} = this.props

    return (
      <CSSTransitionGroup component='div' className={[$.balloon, className]} transitionName={$.anim} transitionAppear transitionAppearTimeout={animDuration} transitionEnter={false} transitionLeave={false}>
        <div className={$.content}>
          <div className={$.background}>
            <SVG className={$.balloonLeft} style={{fill: color.string()}} name='balloon-left'/>
            <SVG className={$.balloonRight} style={{fill: color.string()}} name='balloon-right'/>
            <div className={$.balloonCenter} style={{background: color.string()}}/>
          </div>
          <div className={$.text}>
            <span style={{color: colors.contrast(color).string()}} className={style && $[`text_${style}`]}>
              {text}
            </span>
          </div>
        </div>
      </CSSTransitionGroup>
    )
  }

}

const animDuration = 200

const size = {
  width:  57,
  height: 30
}

const $ = jss({
  content: {
    position: 'absolute',
    left:     layout.gridCell.width - layout.padding.xs,
    bottom:   layout.gridCell.height - layout.padding.xs,

    transformOrigin: 'bottom left',
  },

  background: {
    ...layout.overlay,
  },

  balloonLeft: {
    position: 'absolute',
    left:     0,
    width:    30,
    top:      0,
    height:   size.height
  },

  balloonRight: {
    position: 'absolute',
    right:    0,
    width:    27,
    top:      0,
    height:   size.height
  },

  balloonCenter: {
    position: 'absolute',
    left:     30,
    right:    27,
    top:      0,
    bottom:   0
  },

  text: {
    position: 'relative',
    minWidth: size.width,
    height:   size.height,
    ...layout.flex.center,

    padding:     layout.padding.xs,
    paddingLeft: layout.padding.xs + 4,

    font:       fonts.tiny,
    fontWeight: 'bold',
    textAlign:  'center'
  },

  text_monospace: {
    font: fonts.monospaceTiny
  },

  anim: {
    '&-appear': {
      transform: `scale(0.6)`
    },
    '&-appear-active': {
      transform:  `scale(1)`,
      transition: layout.transition(['opacity', 'transform'], animDuration, 'cubic-bezier(0, 2, 1, 2)')
    },
  },
})
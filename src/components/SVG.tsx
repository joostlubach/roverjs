import * as React from 'react'
import images from '../assets/images.svg'
import {omit} from 'lodash'

export interface Size {
  width:  number
  height: number
}

export interface Props extends React.HTMLAttributes<Element> {
  name:  string
  size?: Size
}

const svgNS   = 'http://www.w3.org/2000/svg'
const xlinkNS = 'http://www.w3.org/1999/xlink'

export default class SVG extends React.Component {

  props: Props

  svg: Element | null = null

  componentDidMount() {
    this.appendUse(this.props.name)
  }

  componentWillReceiveProps(props: Props) {
    if (props.name !== this.props.name) {
      this.removeUse()
      this.appendUse(props.name)
    }
  }

  appendUse(name: string) {
    const {svg} = this
    if (name == null || svg == null) { return }

    const useTag = document.createElementNS(svgNS, 'use')
    useTag.setAttributeNS(xlinkNS, 'xlink:href', `${images}#${name}`)
    svg.appendChild(useTag)
  }

  removeUse() {
    const {svg} = this
    if (svg == null) { return }

    while (svg.childNodes.length > 0) {
      svg.removeChild(svg.childNodes[0])
    }
  }

  render() {
    const {size, ...other} = this.props
    const props = {...omit(other, 'name'), ...size}

    return (
      <svg
        ref={el => { this.svg = el }}
        xmlns={svgNS}
        {...props}
      />
    )
  }

}
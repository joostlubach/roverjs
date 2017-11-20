import * as React from 'react'
import * as cn from 'classnames'
import {unstable_renderSubtreeIntoContainer as renderSubtreeIntoContainer, unmountComponentAtNode} from 'react-dom'
import * as CodeMirror from 'codemirror'
import * as PropTypes from 'prop-types'
import {Tappable} from '..'
import {jss, layout} from '../../styles'
import {lineHeight} from './layout'

export interface Props {
  line:   number,
  onTap?: () => any,

  classNames?: React.ClassNamesProp,
  children?:   React.ReactNode
}

interface AllProps extends Props {
  gutter: string
}

export default class GutterMarker extends React.Component<Props> {

  props: Props

  element: HTMLElement | null = null

  static contextTypes = {
    codeMirror: PropTypes.instanceOf(CodeMirror)
  }

  //------
  // Element

  create() {
    const {codeMirror} = this.context
    const {line, gutter} = this.props as AllProps

    this.element = document.createElement('div')
    codeMirror.setGutterMarker(line, gutter, this.element)

    this.rerender()
  }

  destroy() {
    const {codeMirror} = this.context
    const {element} = this
    if (element == null) { return }

    const {line, gutter} = this.props as AllProps
    codeMirror.setGutterMarker(line, gutter, null)
    unmountComponentAtNode(this.element)
  }

  //------
  // Component lifecycle

  componentDidMount() {
    this.create()
  }

  componentWillUnmount() {
    this.destroy()
  }

  componentWillReceiveProps(props: Props) {
    const prevProps = this.props as AllProps
    const nextProps = props as AllProps

    if (prevProps.line !== nextProps.line || prevProps.gutter !== nextProps.gutter) {
      this.destroy()
      this.create()
    } else {
      this.rerender(props)
    }
  }

  shouldComponentUpdate(props: AllProps) {
    if (props.line !== this.props.line) { return true }
    if (props.onTap !== this.props.onTap) { return true }
    if (props.children !== this.props.children) { return true }
    if (cn(props.classNames) !== cn(this.props.classNames)) { return true }

    return false
  }

  rerender(props: Props = this.props) {
    const {element} = this
    if (element == null) { return }

    renderSubtreeIntoContainer(this, this.renderMarker(props), element)
  }

  //------
  // Rendering

  render() {
    return null
  }

  renderMarker(props: Props) {
    const {classNames, onTap, children} = props
    const Component = onTap != null ? Tappable : 'div'
    const tapProps = onTap != null ? {onTap} : {}

    return (
      <div classNames={$.gutterMarkerContainer}>
        <Component classNames={classNames} {...tapProps}>
          {children}
        </Component>
      </div>
    )
  }

}

const $ = jss({
  gutterMarkerContainer: {
    height: lineHeight,
    ...layout.flex.center
  }
})
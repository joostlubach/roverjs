import * as React from 'react'
import * as PropTypes from 'prop-types'
import * as CodeMirror from 'codemirror'
import * as cn from 'classnames'
import {isEqual} from 'lodash'

export interface Props {
  from:            CodeMirror.Position,
  to:              CodeMirror.Position,
  classNames?:     React.ClassNamesProp,
  startClassName?: React.ClassNamesProp,
  endClassName?:   React.ClassNamesProp,
  options?:        CodeMirror.TextMarkerOptions
}

export default class Marker extends React.Component<Props> {

  static contextTypes = {
    codeMirror: PropTypes.instanceOf(CodeMirror),
  }

  marker: CodeMirror.TextMarker | null = null

  addMarker(props: Props = this.props) {
    const {from, to, classNames, startClassName, endClassName, options} = props
    const {codeMirror} = this.context

    this.marker = codeMirror.markText(from, to, {
      classNames: cn(classNames),
      startStyle: startClassName == null ? null : cn(startClassName),
      endStyle:   endClassName == null ? null : cn(endClassName),
      ...options
    })
  }

  clearMarker() {
    if (this.marker == null) { return }
    this.marker.clear()
  }

  componentDidMount() {
    this.addMarker()
  }

  componentWillUnmount() {
    this.clearMarker()
  }

  componentWillReceiveProps(props: Props) {
    this.clearMarker()
    this.addMarker(props)
  }

  shouldComponentUpdate(props: Props) {
    if (props.from.line !== this.props.from.line) { return true }
    if (props.from.ch !== this.props.from.ch) { return true }
    if (props.to.line !== this.props.to.line) { return true }
    if (props.to.ch !== this.props.to.ch) { return true }
    if (cn(props.classNames) !== cn(this.props.classNames)) { return true }
    if (!isEqual(props.options, this.props.options)) { return true }

    return false
  }

  render() {
    return null
  }

}
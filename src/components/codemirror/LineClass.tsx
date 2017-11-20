import * as React from 'react'
import * as PropTypes from 'prop-types'
import * as CodeMirror from 'codemirror'
import * as cn from 'classnames'

export interface Props {
  line:        number,
  where?:      'text' | 'background' | 'gutter' | 'wrap',
  classNames?: React.ClassNamesProp
}

export default class LineClass extends React.Component<Props> {

  props: Props

  static contextTypes = {
    codeMirror: PropTypes.instanceOf(CodeMirror),
  }

  addLineClass(props: Props = this.props) {
    const {line, where, classNames} = props
    const {codeMirror} = this.context

    codeMirror.addLineClass(line, where, cn(classNames))
  }

  removeLineClass(props: Props = this.props) {
    const {line, where, classNames} = props
    const {codeMirror} = this.context

    codeMirror.removeLineClass(line, where, cn(classNames))
  }

  componentDidMount() {
    this.addLineClass()
  }

  componentWillUnmount() {
    this.removeLineClass()
  }

  componentWillReceiveProps(props: Props) {
    this.removeLineClass()
    this.addLineClass(props)
  }

  shouldComponentUpdate(props: Props) {
    if (props.line !== this.props.line) { return true }
    if (props.where !== this.props.where) { return true }
    if (cn(props.classNames) !== cn(this.props.classNames)) { return true }

    return false
  }

  render() {
    return null
  }

}
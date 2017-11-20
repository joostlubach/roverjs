import * as React from 'react'
import * as PropTypes from 'prop-types'
import * as CodeMirrorClass from 'codemirror'
import {EditorFromTextArea as CMEditor, EditorChange, Doc as CMDoc} from 'codemirror'
import Gutter from './Gutter'
import {jss} from '../../styles'
import {lineHeight} from './layout'
import {withDefaults} from '../../hoc'

import 'codemirror/lib/codemirror.css'
import 'codemirror/theme/monokai.css'
import 'codemirror/theme/zenburn.css'

export interface Props {
  mode:       string,
  theme:      string,
  options:    Object,
  autoFocus:  boolean,

  value:      string,
  onChange:   (value: string, change: EditorChange, document: CMDoc) => any,

  onCodeMirrorSetUp?: (codeMirror: CMEditor) => any,
  onValueSet?:        (value: string, document: CMDoc) => any,

  children?:   React.ReactNode,
  classNames?: React.ClassNamesProp
}

export const defaultProps = {
  theme:     'monokai',
  autoFocus: true,
  value:     '',

  onChange:  () => undefined
}

export const defaultOptions = {
  lineNumbers: true
}

interface State {
  codeMirror: CMEditor | null
}

class CodeMirror extends React.Component<Props, State> {

  //------
  // Properties

  props: Props

  currentValue: string = ''

  state: State = {
    codeMirror: null
  }

  textArea: HTMLTextAreaElement | null = null

  static childContextTypes = {
    codeMirror: PropTypes.instanceOf(CodeMirrorClass)
  }

  getCodeMirror() {
    return this.state.codeMirror
  }

  getChildContext() {
    return {
      codeMirror: this.state.codeMirror
    }
  }

  get options(): Object {
    const {options, theme} = this.props

    return {
      ...defaultOptions,
      ...options,
      theme,
      gutters: this.gutters
    }
  }

  get gutters(): string[] {
    const gutters: string[] = []
    React.Children.forEach(this.props.children, child => {
      if (!React.isValidElement(child)) { return }
      if (child.type !== Gutter) { return }

      const gutterProps = child.props as Gutter['props']
      gutters.push(gutterProps.name)
    })
    return gutters
  }

  //------
  // Loading

  load(value: string) {
    const {codeMirror} = this.state
    if (codeMirror == null) { return }

    codeMirror.setValue(value)
  }

  //------
  // Set up & destroy

  setupCodeMirror() {
    if (this.textArea == null) {
      throw new Error('setupCodeMirror called before mount')
    }

    const codeMirror = CodeMirrorClass.fromTextArea(this.textArea, this.options)
    codeMirror.on('change', this.onChange)
    this.setState({codeMirror: codeMirror})

    if (this.props.onCodeMirrorSetUp) {
      this.props.onCodeMirrorSetUp(codeMirror)
    }
    return codeMirror
  }

  destroyCodeMirror() {
    if (this.state.codeMirror == null) { return }

    this.state.codeMirror.toTextArea()
  }

  updateValue(value: string) {
    if (value === this.currentValue) { return }
    this.setValue(value)
  }

  setValue(value: string, codeMirror: CMEditor | null = this.state.codeMirror) {
    if (codeMirror == null) { return }

    codeMirror.setValue(value)
    this.currentValue = value

    if (this.props.onValueSet) {
      this.props.onValueSet(value, codeMirror.getDoc())
    }
  }

  //------
  // Component lifecycle

  componentDidMount() {
    const codeMirror = this.setupCodeMirror()
    this.setValue(this.props.value, codeMirror)
  }

  componentWillUnmount() {
    this.destroyCodeMirror()
  }

  componentWillReceiveProps(props: Props) {
    this.updateValue(props.value)
  }

  //------
  // Rendering

  render() {
    const {classNames, children} = this.props
    const {codeMirror} = this.state

    return (
      <div classNames={[$.editor, classNames]}>
        <textarea ref={el => { this.textArea = el }}/>
        {codeMirror != null && children}
      </div>
    )
  }

  //------
  // Events

  onChange = (editor: CMEditor, change: EditorChange) => {
    if (change.origin === 'setValue') { return }

    const document = editor.getDoc()
    this.currentValue = document.getValue()
    this.props.onChange(this.currentValue, change, document)
  }

}

export default withDefaults(defaultProps)(CodeMirror)

const $ = jss({
  editor: {
    '& .CodeMirror': {
      flex:       [1, 0, 0],
      fontSize:   '16px',
      lineHeight: `${lineHeight}px`
    }
  }
})
import * as React from 'react'
import {observer} from 'mobx-react'
import {CodeMirror, Marker, Gutter, GutterMarker, LineWidget, LineClass} from '../components/codemirror'
import {jss, jssKeyframes, colors, layout, fonts} from '../styles'
import {programStore, simulatorStore} from '../stores'
import {CodeError} from '../program'
import {Position} from 'estree'
import {Editor as CMEditor, EditorChange, Doc as CMDoc, Position as CMPosition} from 'codemirror'

import 'codemirror/mode/javascript/javascript'

export interface Props {
  classNames?: React.ClassNamesProp
}

interface State {
  focusedErrorLine: number | null,
  readOnlyRanges:   Array<{fromLine: number, toLine: number}>,
  hiddenRanges:     Array<Range>,
  codeMirror:       CMEditor | null,
}

type Range = {
  from: {line: number, ch: number},
  to:   {line: number, ch: number}
}

@observer
export default class CodeEditor extends React.Component<Props, State> {

  state: State = {
    focusedErrorLine: null,
    readOnlyRanges:   [],
    hiddenRanges:     [],
    codeMirror:       null
  }

  //------
  // Methods

  toggleFocusedErrorLine(line: number) {
    if (this.state.focusedErrorLine === line) {
      this.setState({focusedErrorLine: null})
    } else {
      this.setState({focusedErrorLine: line})
    }
  }

  //------
  // Read only

  updateReadOnlyRanges(code: string, document: CMDoc) {
    this.setState({readOnlyRanges: this.calculateReadOnlyRanges(code, document)})
  }

  calculateReadOnlyRanges(code: string, document: CMDoc): Array<{fromLine: number, toLine: number}> {
    const ranges = []

    let start = 0
    while ((start = code.indexOf('----', start)) !== -1) {
      let end = code.indexOf('++++', start)
      if (end === -1) { end = code.length }

      const fromLine = document.posFromIndex(start).line
      const toLine   = document.posFromIndex(end).line
      ranges.push({fromLine, toLine})

      start = end + 1
    }

    return ranges
  }

  get readOnlyLines(): number[] {
    const lines = new Set()
    for (const {fromLine, toLine} of this.state.readOnlyRanges) {
      for (let line = fromLine; line <= toLine; line++) {
        lines.add(line)
      }
    }
    return Array.from(lines)
  }

  //------
  // Read only

  updateHiddenRanges(code: string, document: CMDoc) {
    this.setState({hiddenRanges: this.calculateHiddenRanges(code, document)})
  }

  calculateHiddenRanges(code: string, document: CMDoc): Array<Range> {
    const ranges = []

    let start = 0
    while ((start = code.indexOf('/*<*/', start)) !== -1) {
      let end = code.indexOf('/*>*/', start)
      if (end === -1) { end = code.length }

      ranges.push({
        from: document.posFromIndex(start),
        to:   document.posFromIndex(end + 5)
      })

      start = end + 1
    }

    return ranges
  }

  //------
  // Rendering

  render() {
    const {classNames} = this.props
    const hasErrors = programStore.errors.length > 0

    return (
      <CodeMirror
        classNames={[$.codeEditor, hasErrors && $.withErrors, classNames]}
        mode='javascript'
        value={programStore.code}
        onChange={this.onEditorChange}

        onCodeMirrorSetUp={cm => { this.setState({codeMirror: cm}) }}
        onValueSet={this.onValueSet}

        options={{
          cursorScrollMargin: 50
        }}
      >
        {this.renderCurrentStepMarker()}
        {this.renderErrorMarkers()}
        {this.renderFocusedErrorLineWidgets()}
        {this.renderHiddenMarkers()}
        {this.renderReadOnlyMarkers()}
        {this.renderReadOnlyLineClasses()}

        <Gutter name='errors'>
          {this.renderErrorGutterMarkers()}
        </Gutter>
      </CodeMirror>
    )
  }

  //------
  // Current line

  renderCurrentStepMarker() {
    const {currentStep, done} = simulatorStore
    if (currentStep == null || done) { return null }

    const {codeLocation, endState: {stepFailed}} = currentStep
    if (codeLocation == null) { return null }

    return (
      <Marker
        from={positionToCodeMirrorLocation(codeLocation.start)}
        to={positionToCodeMirrorLocation(codeLocation.end)}
        classNames={stepFailed ? $.currentStepFailure : $.currentStepSuccess}
      />
    )
  }

  //------
  // Read only

  renderReadOnlyMarkers() {
    return this.state.readOnlyRanges.map(({fromLine, toLine}, index) => (
      <Marker
        key={`readonly-${index}`}
        from={{line: fromLine, ch: 0}}
        to={{line: toLine + 1, ch: 0}}
        options={{readOnly: true}}
      />
    ))
  }

  renderReadOnlyLineClasses() {
    const classes = []
    classes.push(...this.readOnlyLines.map(line => (
      <LineClass
        key={`readonly-${line}`}
        line={line}
        classNames={$.readOnlyLine}
      />
    )))
    classes.push(...this.readOnlyLines.map(line => (
      <LineClass
        key={`readonly-gutter-${line}`}
        line={line}
        where='gutter'
        classNames={$.readOnlyLine}
      />
    )))
    return classes
  }

  //------
  // Hidden

  renderHiddenMarkers() {
    return this.state.hiddenRanges.map(({from, to}, index) => (
      <Marker
        key={`hidden-${index}`}
        from={from}
        to={to}
        options={{replacedWith: createHiddenEl()}}
      />
    ))
  }

  //------
  // Errors

  renderErrorMarkers() {
    return programStore.errors.map((error, index) => {
      return this.renderErrorMarker(error, index)
    })
  }

  renderErrorMarker(error: CodeError, index: number) {
    const loc = getErrorLocation(error)
    if (loc == null) { return null }

    return (
      <Marker
        key={index}
        from={loc.from}
        to={loc.to}
        classNames={[$.errorMarker, loc.empty && $.emptyErrorMarker]}
      />
    )
  }

  renderErrorGutterMarkers() {
    const lines = new Set()
    for (const error of programStore.errors) {
      const loc = getErrorLocation(error)
      if (loc == null) { continue }

      for (let ln = loc.from.line; ln <= loc.to.line; ln++) {
        lines.add(ln)
      }
    }

    return Array.from(lines).map(line => {
      return (
        <GutterMarker
          key={line}
          line={line}
          classNames={$.errorGutterMarker}
          onTap={this.onErrorGutterMarkerTap.bind(this, line)}
        />
      )
    })
  }

  renderFocusedErrorLineWidgets() {
    const {focusedErrorLine: line} = this.state
    if (line == null) { return null }

    const errors = programStore.errors.filter(err => {
      const loc = getErrorLocation(err)
      if (loc == null) { return false }

      return loc.from.line <= line && loc.to.line >= line
    })
    return errors.map((error, index) => {
      return (
        <LineWidget key={`${line}-${index}`} line={line} classNames={$.errorLineWidget}>
          <div>{error.message}</div>
        </LineWidget>
      )
    })
  }

  //------
  // Events

  onEditorChange = (value: string, change: EditorChange, doc: CMDoc) => {
    programStore.code = value
    programStore.errors = []

    this.updateReadOnlyRanges(value, doc)
    this.updateHiddenRanges(value, doc)

    simulatorStore.reset()
  }

  onValueSet = (value: string, document: CMDoc) => {
    this.updateReadOnlyRanges(value, document)
    this.updateHiddenRanges(value, document)
  }

  onErrorGutterMarkerTap = (line: number) => {
    this.toggleFocusedErrorLine(line)
  }

}

function positionToCodeMirrorLocation(position: Position) {
  return {line: position.line - 1, ch: position.column}
}

function getErrorLocation(error: CodeError): {from: CMPosition, to: CMPosition, empty: boolean} | null {
  const {loc} = error
  if (loc == null) { return null }

  const {start, end} = loc
  const empty = start.line === end.line && start.column === end.column

  const from = {line: start.line - 1, ch: start.column}
  const to = {line: end.line - 1, ch: empty ? end.column + 1 : end.column}

  return {from, to, empty}
}

const errorAnim = jssKeyframes('error', {
  '0%':   {animationTimingFunction: 'ease-out'},
  '50%':  {backgroundColor: colors.error.alpha(0.05).string(), animationTimingFunction: 'ease-in'},
  '100%': {},
})

function createHiddenEl() {
  const div = document.createElement('div')
  div.classList.add($.hidden)
  div.innerHTML = '(...)'
  return div
}

const $ = jss({
  codeEditor: {
    ...layout.flex.column,

    '& .CodeMirror-gutter.errors': {
      width: 12
    },
  },

  withErrors: {
    '& .CodeMirror': {
      animation: `${errorAnim} 1s linear infinite`
    }
  },

  currentStepSuccess: {
    background: colors.positive
  },

  currentStepFailure: {
    background: colors.negative
  },

  readOnlyLine: {
    backgroundColor: colors.blue.alpha(0.2)
  },

  hidden: {
    display: 'inline-block',
    font:    fonts.monospaceTiny,
    opacity: 0.6,

    border:  [1, 'solid', colors.fg.normal],
    borderRadius: layout.radius.s,
  },

  errorGutterMarker: {
    width:        10,
    height:       10,
    borderRadius: 5,

    border:      [1, 'solid', 'white'],
    background:  colors.error,

    cursor: 'pointer'
  },

  errorMarker: {
    background:   colors.error.alpha(0.1),
    borderBottom: [1, 'dashed', colors.error]
  },

  emptyErrorMarker: {
    position:     'relative',
    background:   'none',
    borderBottom: 'none',

    // Make a small triangle.
    '&::after': {
      position: 'absolute',
      display:  'block',
      content:  '""',

      left:     -4,
      bottom:   -1,
      width:    0,
      height:   0,

      border:            [4, 'solid', colors.transparent],
      borderBottomColor: colors.error
    }
  },

  errorLineWidget: {
    border:      [1, 'solid', colors.error],
    borderWidth: `1px 0`,
    background:  colors.error.alpha(0.6),
    color:       colors.contrast(colors.error),
    font:        fonts.normal,
    padding:     [2, layout.padding.s]
  }
})
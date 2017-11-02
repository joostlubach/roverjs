// @flow

import React from 'react'
import {observer} from 'mobx-react'
import {CodeMirror, Marker, Gutter, GutterMarker, LineWidget, LineClass} from './codemirror'
import {jss, jssKeyframes, colors, layout, fonts} from '../styles'
import {programStore, simulatorStore} from '../stores'
import type {ASTNodeLocation} from '../program'
import type CodeMirrorEl from 'codemirror'

import 'codemirror/mode/javascript/javascript'

export type Props = {
	className?: ClassNameProp
}

type State = {
	focusedErrorLine: ?number,
	readOnlyRanges:   Array<{fromLine: number, toLine: number}>,
	hiddenRanges:     Array<Range>,
	codeMirror:       ?CodeMirrorEl,
}

type Range = {
	from: {line: number, ch: number},
	to:   {line: number, ch: number}
}

@observer
export default class CodeEditor extends React.Component<*, Props, *> {

	props: Props

	state: State = {
		focusedErrorLine: null,
		readOnlyRanges:   [],
		hiddenRanges:     [],
		codeMirror:       null
	}

	editor: ?Editor

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

	updateReadOnlyRanges(code: string, codeMirror: CodeMirrorEl) {
		this.setState({readOnlyRanges: this.calculateReadOnlyRanges(code, codeMirror)})
	}

	calculateReadOnlyRanges(code: string, codeMirror: CodeMirrorEl): Array<{start: number, end: number}> {
		const ranges = []

		let start = 0
		while ((start = code.indexOf('----', start)) !== -1) {
			let end = code.indexOf('++++', start)
			if (end === -1) { end = code.length }

			const fromLine = codeMirror.posFromIndex(start).line
			const toLine   = codeMirror.posFromIndex(end).line
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

	updateHiddenRanges(code: string, codeMirror: CodeMirrorEl) {
		this.setState({hiddenRanges: this.calculateHiddenRanges(code, codeMirror)})
	}

	calculateHiddenRanges(code: string, codeMirror: CodeMirrorEl): Array<Range> {
		const ranges = []

		let start = 0
		while ((start = code.indexOf('/*<*/', start)) !== -1) {
			let end = code.indexOf('/*>*/', start)
			if (end === -1) { end = code.length }

			ranges.push({
				from: codeMirror.posFromIndex(start),
				to:   codeMirror.posFromIndex(end + 5)
			})

			start = end + 1
		}

		return ranges
	}

	//------
	// Rendering

	render() {
		const {className} = this.props
		const hasErrors = programStore.errors.length > 0

		return (
			<CodeMirror
				ref={el => { this.editor = el }}
				className={[$.codeEditor, hasErrors && $.withErrors, className]}
				mode='javascript'
				value={programStore.code}
				onChange={this.onEditorChange.bind(this)}

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

		const {codeLocation, failedPosition} = currentStep
		return (
			<Marker
				from={locationToCodeMirrorLocation(codeLocation.start)}
				to={locationToCodeMirrorLocation(codeLocation.end)}
				className={failedPosition == null ? $.currentStepSuccess : $.currentStepFailure}
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
				className={$.readOnlyLine}
			/>
		)))
		classes.push(...this.readOnlyLines.map(line => (
			<LineClass
				key={`readonly-gutter-${line}`}
				line={line}
				where='gutter'
				className={$.readOnlyLine}
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
		const {from, to, empty} = getErrorLocation(error)
		if (from == null) { return null }

		return (
			<Marker
				key={index}
				from={from}
				to={to}
				className={[$.errorMarker, empty && $.emptyErrorMarker]}
			/>
		)
	}

	renderErrorGutterMarkers() {
		const lines = new Set()
		for (const error of programStore.errors) {
			const {from, to} = getErrorLocation(error)
			if (from == null) { continue }

			for (let ln = from.line; ln <= to.line; ln++) {
				lines.add(ln)
			}
		}

		return Array.from(lines).map(line => {
			return (
				<GutterMarker
					key={line}
					line={line}
					className={$.errorGutterMarker}
					onTap={this.onErrorGutterMarkerTap.bind(this, line)}
				/>
			)
		})
	}

	renderFocusedErrorLineWidgets() {
		const {focusedErrorLine: line} = this.state
		if (line == null) { return null }

		const errors = programStore.errors.filter(err => {
			const {from, to} = getErrorLocation(err)
			if (from == null) { return false }

			return from.line <= line && to.line >= line
		})
		return errors.map((error, index) => {
			return (
				<LineWidget key={`${line}-${index}`} line={line} className={$.errorLineWidget}>
					<div>{error.message}</div>
				</LineWidget>
			)
		})
	}

	//------
	// Events

	onEditorChange = (value: string) => {
		programStore.code = value
		programStore.errors = []

		if (this.state.codeMirror != null) {
			this.updateReadOnlyRanges(value, this.state.codeMirror)
			this.updateHiddenRanges(value, this.state.codeMirror)
		}

		simulatorStore.reset()
	}

	onValueSet = (value: string, codeMirror: ?CodeMirrorEl) => {
		this.updateReadOnlyRanges(value, codeMirror)
		this.updateHiddenRanges(value, codeMirror)
	}

	onErrorGutterMarkerTap = (line: number) => {
		this.toggleFocusedErrorLine(line)
	}

}

function locationToCodeMirrorLocation(location: ASTNodeLocation) {
	return {line: location.line - 1, ch: location.column}
}

function getErrorLocation(error: CodeError): {from: ASTNodeLocation, to: ASTNodeLocation, empty: boolean} {
	const {loc} = error
	if (loc == null) { return {start: null, end: null} }

	let start: ASTNodeLocation
	let end: ASTNodeLocation
	if (loc.start != null) {
		start = loc.start
		end   = loc.end
	} else {
		start = loc
		end   = loc
	}

	const empty = start.line === end.line && start.column === end.column

	const from = {line: start.line - 1, column: start.column}
	const to = {line: end.line - 1, column: empty ? end.column : end.column + 1}

	return {from, to, empty}
}

const errorAnim = jssKeyframes('error', {
	'0%':   {animationTimingFunction: 'ease-out'},
	'50%':  {backgroundColor: colors.red.alpha(0.05).string(), animationTimingFunction: 'ease-in'},
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
		background: colors.green
	},

	currentStepFailure: {
		background: colors.red
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
		background:  colors.red,

		cursor: 'pointer'
	},

	errorMarker: {
		background:   colors.red.alpha(0.1),
		borderBottom: [1, 'dashed', colors.red]
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
			borderBottomColor: colors.red
		}
	},

	errorLineWidget: {
		border:      [1, 'solid', colors.red],
		borderWidth: `1px 0`,
		background:  colors.red.alpha(0.6),
		color:       colors.contrast(colors.red),
		font:        fonts.normal,
		padding:     [2, layout.padding.s]
	}
})
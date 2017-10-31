// @flow

import React from 'react'
import {observer} from 'mobx-react'
import {CodeMirror, Marker, Gutter, GutterMarker, LineWidget, LineClass} from './codemirror'
import {jss, colors, layout, fonts} from '../styles'
import {programStore, simulatorStore} from '../stores'
import type {ASTNodeLocation} from '../program'

import 'codemirror/mode/javascript/javascript'

export type Props = {
	className?: ClassNameProp
}

type State = {
	focusedErrorLine: ?number
}

@observer
export default class CodeEditor extends React.Component<*, Props, *> {

	props: Props

	state: State = {
		focusedErrorLine: null
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
	// Rendering

	render() {
		const {className} = this.props

		return (
			<CodeMirror
				ref={el => { this.editor = el }}
				className={[$.codeEditor, className]}
				mode='javascript'
				value={programStore.code}
				onChange={this.onEditorChange.bind(this)}

				options={{
					cursorScrollMargin: 50
				}}
			>
				{this.renderCurrentLineClass()}
				{this.renderErrorMarkers()}
				{this.renderFocusedErrorLineWidgets()}

				<Gutter name='errors'>
					{this.renderErrorGutterMarkers()}
				</Gutter>
			</CodeMirror>
		)
	}

	//------
	// Current line

	renderCurrentLineClass() {
		const {currentLine, stepSucceeded} = simulatorStore
		if (currentLine == null) { return null }

		return (
			<LineClass
				line={currentLine}
				className={stepSucceeded ? $.currentLineSuccess : $.currentLineFailure}
			/>
		)
	}

	//------
	// Errors

	renderErrorMarkers() {
		return programStore.errors.map((error, index) => {
			return this.renderErrorMarker(error, index)
		})
	}

	renderErrorMarker(error: CodeError, index: number) {
		const {start, end, empty} = getErrorLocation(error)
		if (start == null) { return null }

		return (
			<Marker
				key={index}
				from={{line: start.line, ch: start.column}}
				to={{line: end.line, ch: empty ? end.column + 1 : end.column}}
				className={[$.errorMarker, empty && $.emptyErrorMarker]}
			/>
		)
	}

	renderErrorGutterMarkers() {
		const lines = new Set()
		for (const error of programStore.errors) {
			const {start, end} = getErrorLocation(error)
			if (start == null) { continue }

			for (let ln = start.line; ln <= end.line; ln++) {
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
			const {start, end} = getErrorLocation(err)
			if (start == null) { return false }

			return start.line <= line && end.line >= line
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
	}

	onErrorGutterMarkerTap = (line: number) => {
		this.toggleFocusedErrorLine(line)
	}

}

function getErrorLocation(error: CodeError): {start: ASTNodeLocation, end: ASTNodeLocation} {
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

	start = {line: start.line - 1, column: start.column}
	end = {line: end.line - 1, column: end.column}

	return {start, end, empty}
}

const $ = jss({
	codeEditor: {
		...layout.flex.column,

		'& .CodeMirror-gutter.errors': {
			width: 12
		},
	},

	currentLineSuccess: {
		background: colors.green
	},

	currentLineFailure: {
		background: colors.red
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
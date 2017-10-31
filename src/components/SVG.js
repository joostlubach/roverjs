// @flow

import React from 'react'
import config from '../config'

export type Size = {width: number, height: number}
export type HTMLAttributes = {[name: string]: string}

export type Props = {
	name: string,
	size?: Size
} & HTMLAttributes

const svgNS   = 'http://www.w3.org/2000/svg'
const xlinkNS = 'http://www.w3.org/1999/xlink'

export default class SVG extends React.Component<void, Props, void> {

	svg: ?HTMLElement = null

	componentDidMount() {
		this.appendUse(this.props.name)
	}

	componentWillReceiveProps(props: Props) {
		if (props.name !== this.props.name) {
			this.removeUse()
			this.appendUse(props.name)
		}
	}

	appendUse(name: ?string) {
		const {svg} = this
		if (name == null || svg == null) { return }

		const useTag = document.createElementNS(svgNS, 'use')
		useTag.setAttributeNS(xlinkNS, 'xlink:href', `${config.svg.path}#${name}`)
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
		// eslint-disable-next-line no-unused-vars
		const {name, size, ...other} = this.props
		const props = {...other, ...size}

		return (
			<svg
				ref={el => { this.svg = el }}
				xmlns={svgNS}
				{...props}
			/>
		)
	}

}
// @flow

import React from 'react'

export type Props = {
	name:      string,
	children?: any
}

export default class Gutter extends React.Component<*, Props, *> {

	get markers() {
		return React.Children.map(this.props.children, child => {
			if (child == null) { return null }

			return React.cloneElement(child, {
				gutter: this.props.name
			})
		})
	}

	render() {
		const {markers} = this
		return markers.length === 0 ? null : <div>{markers}</div>
	}

}
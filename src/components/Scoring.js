// @flow

import React from 'react'
import {jss, layout} from '../styles'
import {ScoreStars, Markdown} from '.'

export type Props = {
	score:   number,
	message: ?string,

	className?: ClassNameProp
}

export default class Scoring extends React.Component<*, Props, *> {

	props: Props

	render() {
		const {score, message, className} = this.props

		return (
			<div className={[$.scoring, className]}>
				<ScoreStars score={score}/>
				{message && <Markdown className={$.message}>{message}</Markdown>}
			</div>
		)
	}

}

const $ = jss({
	scoring: {
		...layout.flex.column,
		alignItems: 'center'
	},

	message: {
		alignSelf: 'stretch',
		marginTop: layout.padding.s,
		textAlign: 'center'
	}

})
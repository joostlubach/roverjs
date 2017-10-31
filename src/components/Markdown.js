import React from 'react'
import SimpleMarkdown from 'simple-markdown'
import {jss, layout, markdown} from '../styles'

export default function Markdown({className, children, ...props}) {
	const content = React.Children.toArray(children).join('\n\n')
	const syntaxTree = parser(`${content}\n\n`)

	return (
		<div className={[$.container, className]} {...props}>
			{output(syntaxTree)}
		</div>
	)
}

const rules = {
	...SimpleMarkdown.defaultRules,
}

const $ = jss({
	container: {
		...markdown.base
	},

	image: {
		...layout.fitImage
	},

	icon: {
		display:       'inline-block',
		verticalAlign: 'middle'
	}
})

const parser = SimpleMarkdown.parserFor(rules)
const output = SimpleMarkdown.reactFor(SimpleMarkdown.ruleOutput(rules, 'react'))
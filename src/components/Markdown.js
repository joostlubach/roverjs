import * as React from 'react'
import SimpleMarkdown from 'simple-markdown'
import {jss, layout, markdown} from '../styles'

export default function Markdown({classNames, children, ...props}) {
  const content = React.Children.toArray(children).join('\n\n')
  const syntaxTree = parser(`${content}\n\n`)

  return (
    <div classNames={[$.container, classNames]} {...props}>
      {output(syntaxTree)}
    </div>
  )
}

let linkID = 0

const rules = {
  ...SimpleMarkdown.defaultRules,

  link: {
    ...SimpleMarkdown.defaultRules.link,

    react(node, output, state) {
      const content = output(node.content)
      const href    = node.target
      const target  = /^https?:\/\//.test(href) ? '_blank' : null

      return <a key={linkID++} href={href} target={target}>{content}</a>
    },
  }
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
  },
})

const parser = SimpleMarkdown.parserFor(rules)
const output = SimpleMarkdown.reactFor(SimpleMarkdown.ruleOutput(rules, 'react'))
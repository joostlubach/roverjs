import * as React from 'react'
import * as MarkdownIt from 'markdown-it'
import * as externalLinks from '../vendor/markdown-it-external-links'
import {jss, layout} from '../styles'
import * as highlightJS from 'highlight.js'
import markdownStyles from '../styles/markdown'

import 'highlight.js/lib/languages/javascript'
import 'highlight.js/styles/monokai.css'

export interface Props extends React.HTMLAttributes<HTMLDivElement> {
  classNames?: React.ClassNamesProp,
  options?:    any,
  children:    string
}

export const defaultOptions = {
  html:    true,
  linkify: true,

  highlight(text: string, lang: string) {
    try {
      return highlightJS.highlight(lang, text).value
    } catch {
      return text
    }
  }
}

export default function Markdown(props: Props) {
  const {
    classNames = [],
    options    = {},
    children,
    ...attributes
  } = props

  Object.assign(options, defaultOptions, options)

  const markdown = new MarkdownIt(options)
  markdown.use(externalLinks)

  const source = React.Children.toArray(children).join('\n\n')
  const html = markdown.render(source)

  return (
    <div
      classNames={[$.container, classNames]}
      {...attributes}
      dangerouslySetInnerHTML={{__html: html}}
    />
  )
}

const $ = jss({
  container: {
    ...markdownStyles
  },

  image: {
    ...layout.fitImage
  },

  icon: {
    display:       'inline-block',
    verticalAlign: 'middle'
  },
})
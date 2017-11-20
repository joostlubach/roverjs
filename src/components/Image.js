// @flow

import * as React from 'react' // eslint-disable-line

export interface Props {
  source: string,
  sizes:  string[],
  alt?:   string
}

export const defaultProps = {
  sizes: ['2x']
}

export default function Image(props: Props) {
  const {source, sizes, alt} = props

  const [, basename, ext] = source.match(/^(.*)(?:\.(.*?))?$/)
  const srcSet = sizes.map(size => `${basename}${size}${ext} ${size}`).join(' ')

  return <img src={source} srcset={srcSet} alt={alt || ''}/>
}

Image.defaultProps = defaultProps
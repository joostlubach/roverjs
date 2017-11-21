import * as fonts from './fonts'
import * as colors from './colors'
import * as layout from './layout'

export const base = {
  lineHeight: '1.4em',

  '& > :not(:last-child)': {
    marginBottom: '1.2em'
  },

  '& h1': {
    color: colors.primary,
    font:  fonts.large,

    '&:not(:first-child)': {
      paddingTop: '1.2em'
    }
  },
  '& h2': {
    color: colors.primary,
    font:  fonts.normal,

    '&:not(:first-child)': {
      paddingTop: '0.6em'
    }
  },
  '& h3': {
    fontWeight: '500',

    '&:not(:first-child)': {
      paddingTop: '0.3em'
    }
  },

  '& em': {
    fontStyle: 'italic'
  },
  '& strong': {
    fontWeight: 600
  },
  '& ul, & ol': {
    paddingLeft: '1.6em',
    margin:      0
  },
  '& li': {
    listStyle:  'disc',
  },
  '& a[href]': {
    color: colors.link
  },

  '& blockquote': {
    ...layout.flex.column,
    alignItems: 'center',

    '& > div': {
      background: colors.black.alpha(0.2),
      fontWeight:  500,
      color:      colors.blue,
      font:       fonts.large,
      textAlign:  'center',
      padding:    layout.padding.m
    }
  }
}

export const page = {
  '& > *': {
    padding: [0, layout.padding.m]
  },
  '& h1, & h2, & h3': {
    padding: 0
  },
  '& .paragraph figure': {
    display: 'block',
    margin:  [0, -layout.padding.m]
  }
}
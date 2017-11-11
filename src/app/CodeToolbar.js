// @flow

import * as React from 'react'
import {observer} from 'mobx-react'
import {jss, layout, colors, fonts, shadows} from '../styles'
import {SVG, Markdown, ToolbarButton, Button, MessageBox, LevelButton} from '../components'
import {levelStore, programStore} from '../stores'

export type Props = {}

@observer
export default class CodeToolbar extends React.Component<*, Props, *> {

  props: Props

  async confirmAndReset() {
    const confirmed = await MessageBox.show({
      title:   "Reset level",
      message: "Are you sure you want to reset to the original level code?",
      buttons: [
        {label: "Yes, I'm sure", result: true},
        {label: "No, keep this", result: false}
      ]
    })

    if (confirmed) {
      programStore.resetCode()
    }
  }

  render() {
    return (
      <div className={$.toolbar}>
        <div className={$.left}>
          <SVG name='logo' className={$.logo}/>
          <Button
            className={$.aboutButton}
            label="about"
            tiny
            onTap={this.onAboutTap}
          />
        </div>
        <div className={$.main}>
          {this.renderLevelName()}
          {this.renderLevelSelector()}
        </div>
        <div className={$.buttons}>
          {this.renderResetButton()}
          {this.renderChaptersButton()}
        </div>
      </div>
    )
  }

  renderLevelName() {
    const {currentChapter} = levelStore
    if (currentChapter == null) { return null }

    return (
      <div className={$.chapterName}>
        {currentChapter.name}
      </div>
    )
  }

  renderLevelSelector() {
    return (
      <div className={$.levelSelector}>
        {levelStore.levels.map((level, i) =>
          <LevelButton
            key={level.id}
            level={level}
            number={i + 1}
            small
          />
        )}
      </div>
    )
  }

  renderResetButton() {
    return (
      <ToolbarButton
        className={$.resetButton}
        icon='reset'
        label="RESET"
        onTap={this.onResetTap}
      />
    )
  }

  renderChaptersButton() {
    return (
      <ToolbarButton
        className={$.chaptersButton}
        icon='book'
        label="CHAPTERS"
        onTap={this.onChaptersTap}
      />
    )
  }

  renderAboutBody() {
    return (
      <Markdown className={$.about}>{about}</Markdown>
    )
  }

  onResetTap = () => {
    this.confirmAndReset()
  }

  onChaptersTap = () => {
    levelStore.selectChapter()
  }

  onAboutTap = () => {
    MessageBox.show({
      title:   "Rover the Robot",
      body:    this.renderAboutBody(),
      buttons: [{
        label: "Whatever"
      }]
    })
  }

}

const about = `Rover the Robot was created by [Joost Lubach](https://github.com/joostlubach) as a learning
tool for JavaScript.

Thanks to [Simon Child](https://thenounproject.com/Simon%20Child/) for the Robot icon, and
to [Freepik](https://www.flaticon.com/authors/freepik) for the tree icon. All the ugly
ones I have made myself 🙌.

This project is open source. You can find the source here:
[joostlubach/roverjs](https://github.com/joostlubach/roverjs).`

const $ = jss({
  toolbar: {
    position:  'relative',
    minHeight: 96,

    ...layout.flex.row,
    alignItems:     'center',
    justifyContent: 'space-between',
    padding:        layout.padding.s,

    borderBottom: [1, 'solid', colors.white.alpha(0.2)],
    boxShadow:    shadows.toolbar,

    background: colors.bg.toolbar,
    color:      colors.fg.inverted
  },

  left: {
    alignSelf:  'flex-start',
    alignItems: 'stretch',
    ...layout.flex.column,
  },

  about: {
    textAlign: 'center'
  },

  logo: {
    width:  64,
    height: 64,
    fill:   colors.green
  },

  main: {
    flex:  [1, 0, 0],

    ...layout.flex.column,
    justifyContent: 'space-between',
    marginLeft:     layout.padding.m
  },

  chapterName: {
    font:          fonts.digitalLarge,
    textTransform: 'uppercase',
  },

  levelSelector: {
    ...layout.row(layout.padding.xs),
    flexWrap: 'wrap',

    paddingTop:   layout.padding.xs,
    marginBottom: layout.padding.xs - layout.padding.s,

    '& > *': {
      marginBottom: layout.padding.xs
    }
  },

  buttons: {
    ...layout.row()
  }
})
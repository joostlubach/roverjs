// @flow

import * as React from 'react'
import {observer} from 'mobx-react'
import {jss, layout, colors, fonts, shadows} from '../styles'
import {ToolbarButton, Switch, Slider, SpinningRover, MessageBox, Markdown, SVG} from '../components'
import {programStore, simulatorStore} from '../stores'

export type Props = {}

@observer
export default class SimulatorToolbar extends React.Component<*, Props, *> {

  props: Props

  render() {
    const {running, active} = simulatorStore

    return (
      <div className={$.toolbar}>
        <div className={$.buttons}>
          {!running && this.renderPlayButton()}
          {running && this.renderPauseButton()}
          {!simulatorStore.done && this.renderBackwardButton()}
          {!simulatorStore.done && this.renderForwardButton()}
          {!running && active && this.renderRestartButton()}
        </div>
        {this.renderControls()}
      </div>
    )
  }

  renderPlayButton() {
    return (
      <ToolbarButton
        icon='play'
        label="PLAY"
        onTap={this.onPlayTap}
      />
    )
  }

  renderBackwardButton() {
    return (
      <ToolbarButton
        icon='backward'
        label="BACK"
        disabled={!simulatorStore.active || simulatorStore.running || simulatorStore.atStart}
        onTap={this.onBackwardTap}
      />
    )
  }

  renderForwardButton() {
    return (
      <ToolbarButton
        icon='forward'
        label="FWD"
        disabled={simulatorStore.running || simulatorStore.atEnd}
        onTap={this.onForwardTap}
      />
    )
  }

  renderPauseButton() {
    return (
      <ToolbarButton
        icon='pause'
        label="PAUSE"
        onTap={this.onPauseTap}
      />
    )
  }

  renderRestartButton() {
    return (
      <ToolbarButton
        icon='restart'
        label="RESTART"
        onTap={this.onRestartTap}
      />
    )
  }

  renderControls() {
    return (
      <div className={$.controls}>
        {this.renderFPSSlider()}
        {this.renderVerboseSwitch()}
      </div>
    )
  }

  renderFPSSlider() {
    return (
      <div className={$.fpsSliderContainer}>
        <Slider
          className={$.fpsSlider}
          values={[1, 2, 3, 5, 8, 13]}
          value={simulatorStore.fps}
          onChange={value => { simulatorStore.fps = value }}
          showValues={false}
        />
        <div>Speed</div>
      </div>
    )
  }

  renderVerboseSwitch() {
    return (
      <div className={$.verboseSwitchContainer}>
        <Switch
          className={$.verboseSwitch}
          isOn={simulatorStore.verbose}
          onChange={on => { simulatorStore.verbose = on }}
        />
        <div>Verbose</div>
      </div>
    )
  }

  runAndSimulate(firstStepOnly: boolean) {
    programStore.runAndSimulate(firstStepOnly)

    if (programStore.errors.length === 0 && programStore.program.isEmpty) {
      MessageBox.show({
        title:   "Program empty",
        message: "Your program did not perform any action.",
        body:    <SVG name='robot-lame' width={64} height={64} className={$.roverLame}/>,
        buttons: [{label: "Oops!"}]
      })
    }

    if (programStore.hasInfiniteLoop) {
      MessageBox.show({
        title:   "Infinite loop",
        message: "Your program probably contains an infinite loop.",

        body: (
          <div className={$.infiniteLoop}>
            <SpinningRover/>,
            <Markdown>{infiniteLoopExplanation}</Markdown>
          </div>
        ),
        buttons: [{label: "Oops!"}]
      })
    }
  }

  //------
  // Event handlers

  onPlayTap = () => {
    if (!simulatorStore.done && simulatorStore.active) {
      simulatorStore.resume()
    } else if (simulatorStore.done) {
      // Reset everything, and wait a while to run, to allow everything to reset
      // without animation.
      simulatorStore.reset()
      setTimeout(() => { this.runAndSimulate() }, 200)
    } else {
      // Run immediately.
      this.runAndSimulate()
    }
  }

  onForwardTap = () => {
    if (!simulatorStore.done && simulatorStore.active) {
      simulatorStore.forward()
    } else if (simulatorStore.done) {
      // Reset everything, and wait a while to run, to allow everything to reset
      // without animation.
      simulatorStore.reset()
      setTimeout(() => { this.runAndSimulate(true) }, 200)
    } else {
      // Run immediately.
      this.runAndSimulate(true)
    }
  }

  onBackwardTap = () => {
    simulatorStore.backward()
  }

  onPauseTap = () => {
    simulatorStore.pause()
  }

  onRestartTap = () => {
    simulatorStore.reset()
  }

}

const infiniteLoopExplanation = `An infinite loop is a situation where your program keeps running
indefinitely.

This often happens when using a \`for\` or \`while\` loop. If you're using a loop, make sure that your
loop has a *stopping* condition, meaning that the \`condition\` in \`while (condition) {...}\` or
\`for (...; condition; ...) {...}\` should at some point become \`false\`.

Another possibility is that you call some function which calls itself.`

const $ = jss({
  toolbar: {
    position: 'relative',
    height:   96,

    ...layout.row(),
    justifyContent: 'space-between',
    padding:        layout.padding.s,

    borderBottom: [1, 'solid', colors.white.alpha(0.2)],
    boxShadow:    shadows.toolbar,

    background: colors.bg.toolbar,
    color:      colors.fg.inverted,
    '& svg':    {fill: colors.fg.inverted}
  },

  buttons: {
    ...layout.row()
  },

  controls: {
    ...layout.row()
  },

  fpsSliderContainer: {
    ...layout.flex.column,
    alignItems: 'center',

    font:           fonts.tiny,
    textTransform: 'uppercase'
  },

  fpsSlider: {
    marginBottom: layout.padding.xs,
    width:        120
  },

  verboseSwitchContainer: {
    ...layout.flex.column,
    alignItems: 'center',

    font:           fonts.tiny,
    textTransform: 'uppercase'
  },

  verboseSwitch: {
    marginBottom: layout.padding.xs
  },

  infiniteLoop: {
    ...layout.flex.center,
    textAlign: 'center'
  },

  roverLame: {
    fill: colors.purple
  }
})
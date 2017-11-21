// @flow

import * as React from 'react'
import {observer} from 'mobx-react'
import {jss, layout, presets} from '../styles'
import {CodeMirror} from '../components/codemirror'
import {ProgramState} from '../program'

export interface Props {
  state: ProgramState
}

@observer
export default class StateInspector extends React.Component<Props> {

  props: Props

  render() {
    return (
      <div classNames={$.stateInspector}>
        {this.renderHeader()}
        {this.renderCodeMirror()}
      </div>
    )
  }

  renderHeader() {
    return (
      <div classNames={$.header}>
        State
      </div>
    )
  }

  renderCodeMirror() {
    const out = {}
    for (const key in this.props.state) {
      if (ProgramState.visibleProperties[key]) {
        out[key] = this.props.state[key]
      }
    }

    return (
      <CodeMirror
        classNames={$.codeMirror}
        mode={{name: 'javascript', json: true}}
        value={JSON.stringify(out, null, 2)}
        theme='zenburn'
        options={{lineNumbers: false, readOnly: true}}
      />
    )
  }

}

const $ = jss({
  stateInspector: {
    ...layout.overlay,
    ...layout.flex.column
  },

  header: {
    ...presets.panelHeader,
    position:     'relative',
    marginTop:    -4,
  },

  codeMirror: {
    flex: [1, 0, 0],
    ...layout.flex.column
  }
})
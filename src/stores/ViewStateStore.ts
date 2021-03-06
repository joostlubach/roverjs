// @flow

import {observable, autorun} from 'mobx'
import {Sizes as PanelSizes} from '../components/Panels'
import {Lock} from '../program'

export {PanelSizes}

export default class ViewStateStore {

  constructor() {
    this.load()
    autorun(() => this.save())
  }

  @observable
  panelSizes: PanelSizes = {
    left:   640,
    bottom: 320
  }

  @observable
  instructionsCollapsed: boolean = false

  @observable
  selectedLock: Lock | null = null

  load() {
    const json = window.localStorage.viewState || '{}'
    Object.assign(this, JSON.parse(json))
  }

  save() {
    const config = {
      panelSizes:            this.panelSizes,
      instructionsCollapsed: this.instructionsCollapsed
    }
    window.localStorage.viewState = JSON.stringify(config)
  }

}
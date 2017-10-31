// @flow

import {observable, autorun} from 'mobx'
import type {Sizes as PanelSizes} from '../components/Panels'

export type {PanelSizes}

export default class ViewStateStore {

	constructor() {
		this.load()
		autorun(() => this.save())
	}

	@observable
	panelSizes: PanelSizes = {
		left: 620
	}

	load() {
		const json = window.localStorage.viewState || '{}'
		Object.assign(this, JSON.parse(json))
	}

	save() {
		const config = {
			panelSizes: this.panelSizes
		}
		window.localStorage.viewState = JSON.stringify(config)
	}

}
// @flow

import {default as ProgramStore} from './ProgramStore'
import {default as SimulatorStore} from './SimulatorStore'
import {default as ViewStateStore} from './ViewStateStore'

export {default as ProgramStore} from './ProgramStore'
export {default as SimulatorStore} from './SimulatorStore'
export {default as ViewStateStore} from './ViewStateStore'
export * from './ProgramStore'
export * from './ViewStateStore'

export const programStore = new ProgramStore()
export const simulatorStore = new SimulatorStore()
export const viewStateStore = new ViewStateStore()
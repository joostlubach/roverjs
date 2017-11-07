// @flow

import {default as LevelStore} from './GitHubLevelStore'
import {default as ProgramStore} from './GitHubProgramStore'
import {default as SimulatorStore} from './SimulatorStore'
import {default as ViewStateStore} from './ViewStateStore'

export {default as LevelStore} from './GitHubLevelStore'
export {default as ProgramStore} from './GitHubProgramStore'
export {default as SimulatorStore} from './SimulatorStore'
export {default as ViewStateStore} from './ViewStateStore'
export * from './GitHubProgramStore'
export * from './ViewStateStore'

export const levelStore = new LevelStore()
export const programStore = new ProgramStore()
export const simulatorStore = new SimulatorStore()
export const viewStateStore = new ViewStateStore()

window.levelStore = levelStore
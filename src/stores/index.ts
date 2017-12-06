import {default as LevelStore} from './LevelStore'
import {default as ProgramStore} from './ProgramStore'
import {default as SimulatorStore} from './SimulatorStore'
import {default as ViewStateStore} from './ViewStateStore'
import {default as UserStore} from './UserStore'

export {default as LevelStore} from './LevelStore'
export {default as ProgramStore} from './ProgramStore'
export {default as SimulatorStore} from './SimulatorStore'
export {default as ViewStateStore} from './ViewStateStore'
export {default as UserStore} from './UserStore'
export * from './ProgramStore'
export * from './ViewStateStore'

export const levelStore = new LevelStore()
export const programStore = new ProgramStore()
export const simulatorStore = new SimulatorStore()
export const viewStateStore = new ViewStateStore()
export const userStore = new UserStore()

if (process.env.NODE_ENV === 'development') {
  (window as any).levelStore = levelStore
}
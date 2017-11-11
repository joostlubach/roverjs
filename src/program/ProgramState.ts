import {cloneDeep} from 'lodash'
import {Program, Level, Item, KeyColor, ItemValue} from '.'
import * as Color from 'color'

export interface Position {
  x: number
  y: number
}
export enum Direction {
  up    = 'up',
  down  = 'down',
  left  = 'left',
  right = 'right'
}

export interface TextBalloon {
  text:   string
  color?: Color
  style?: 'monospace'
}
export interface PositionedTextBalloon extends TextBalloon {
  position: Position
}

export default class ProgramState {

  constructor(program: Program, initialValues: Object = {}) {
    Object.defineProperty(this, 'program', {
      value:        program,
      writable:     false,
      enumerable:   false,
      configurable: false
    })
    Object.defineProperty(this, 'level', {
      value:        program.level,
      writable:     false,
      enumerable:   false,
      configurable: false
    })

    Object.assign(this, initialValues)
  }

  static default(program: Program, keyValues?: {[color in KeyColor]?: ItemValue}) {
    return new ProgramState(program, {
      position:  program.level.startPosition,
      direction: program.level.startDirection,
      apples:    0,
      keys:      {},

      stepFailed:     false,
      failedPosition: null,
      roverBalloon:   null,
      itemBalloons:   [],
      items:          [...program.level.items],
      keyValues:      keyValues || program.level.generateKeyValuesSample()
    })
  }

  program: Program
  level:   Level

  static visibleProperties: {[key: string]: boolean} = {}

  //------
  // Visible state

  @visible()
  position: Position = {x: 0, y: 0}

  @visible()
  direction: Direction = Direction.up

  @visible()
  apples: number = 0

  @visible()
  keys: {[color in KeyColor]?: ItemValue} = {}

  //------
  // Invisible state (not shown in StateInspector)

  stepFailed:     boolean = false
  roverBalloon:   TextBalloon | null = null
  itemBalloons:   PositionedTextBalloon[] = []
  failedPosition: Position | null = null
  items:          Item[] = []
  keyValues:      {[color in KeyColor]?: ItemValue} = {}

  clone(): ProgramState {
    const values = cloneDeep(this)
    return new ProgramState(this.program, values)
  }

  prepare() {
    this.stepFailed = false
    this.failedPosition = null
    this.roverBalloon = null
    this.itemBalloons = []
  }

  //------
  // Rover

  roverAt(x: number, y: number): boolean {
    return this.position.x === x && this.position.y === y
  }

  facing(direction: Direction) {
    return this.direction === direction
  }

  get facingPosition(): Position {
    let {x, y} = this.position

    switch (this.direction) {
    case Direction.up:    y -= 1; break
    case Direction.down:  y += 1; break
    case Direction.left:  x -= 1; break
    case Direction.right: x += 1; break
    }

    return {x, y}
  }

  //------
  // Items

  itemAt(x: number, y: number): Item | null {
    return this.items.find(({position}) => {
      return position.x === x && position.y === y
    }) || null
  }

  canMoveTo(x: number, y: number) {
    if (x < 0 || x >= this.level.columns) { return false }
    if (y < 0 || y >= this.level.rows) { return false }

    const item = this.itemAt(x, y)
    return item == null || !item.blocking
  }

  //------
  // Finished

  @enumerable()
  @visible()
  get isFinished(): boolean {
    return this.isAtGoal && this.hasEnoughApples !== false
  }

  @enumerable()
  @visible()
  get isAtGoal(): boolean {
    const {goalPosition} = this.level
    if (goalPosition == null) { return false }

    return this.position.x === goalPosition.x && this.position.y === goalPosition.y
  }

  @enumerable()
  @visible()
  get hasEnoughApples(): boolean | undefined {
    if (!this.level.hasApples) { return undefined }
    if (this.level.goalApples == null) { return true }
    return this.apples >= this.level.goalApples
  }

}

function enumerable(value: boolean = true) {
  return function (target: ProgramState, propertyKey: string, descriptor: PropertyDescriptor) {
    descriptor.enumerable = value
  }
}

function visible(visible: boolean = true) {
  return function (target: ProgramState, key: string) {
    if (visible) {
      ProgramState.visibleProperties[key] = true
    } else {
      ProgramState.visibleProperties[key] = false
    }
  }
}
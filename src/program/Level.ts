// tslint:disable no-any

import {Program, Position, Direction, Chapter} from '.'
import {Item, Apple, Key, KeyColor, ItemValue} from './items'
import {cartesian} from '../util'
import {sample, pick} from 'lodash'

const serializableProps = [
  'id',
  'name',
  'instructions',
  'style',
  'stateInspector',
  'rows',
  'columns',
  'coordinates',
  'goalApples',
  'dark',
  'initialCode'
]

export interface Scoring {
  score:     number
  message:   string | null
  condition: (program: Program) => boolean
}

export interface Serialized {
  name:          string
  instructions?: string
  start:         [number, number, Direction]
  goal?:         [number, number]
  goalApples?:   number
  items:         [number, number, string, any],
  scoring?:      SerializedScoring<any>
}

interface SerializedScoring<K extends string> {
  tests:  {[key in K]: SerializedScoringTest},
  scores: SerializedScoringScore<K>[]
}

interface SerializedScoringTest {
  regexp?:   string
  maxLines?: number
  minLines?: number
}

interface BaseSerializedScoringScore {
  score:       number
  message:     string | null
}

type SerializedScoringScore<K extends string> = BaseSerializedScoringScore & {
  [test in K]: boolean
}

export type LevelStyle = 'basic' | 'callback'

export default class Level {

  constructor(
    readonly chapter: Chapter,
    readonly serialized: Serialized
  ) {
    this.deserialize()
  }

  deserialize() {
    Object.assign(this, pick(this.serialized, ...serializableProps))

    this.startPosition  = {x: this.serialized.start[0], y: this.serialized.start[1]}
    this.startDirection = this.serialized.start[2]

    if (this.serialized.goal != null) {
      this.goalPosition = {x: this.serialized.goal[0], y: this.serialized.goal[1]}
    }

    if (this.serialized.items != null) {
      this.items = this.serialized.items.map(([x, y, type, props]) => {
        const position = ({x, y} as Position)
        return Item.create(type, position, props)
      })
    }

    if (this.serialized.scoring != null) {
      this.scoring = parseScoring(this.serialized.scoring)
    }
  }

  id:      string

  name:           string
  instructions:   string | null
  style:          LevelStyle = 'basic'
  stateInspector: boolean

  rows:        number
  columns:     number
  coordinates: boolean

  startPosition:  Position
  startDirection: Direction

  goalPosition: Position | null = null
  goalApples:   number | null = null

  dark:  boolean
  items: Item[] = []

  initialCode:    string    = ''
  scoring:        Scoring[] = []

  get hasApples(): boolean {
    return this.items.filter(item => item instanceof Apple).length > 0
  }

  //------
  // Keys

  /**
   * Gets all keys present in this leve..
   */
  get keys(): Key[] {
    // TODO: Why does filter with instanceof not work automatically?
    return this.items.filter(item => item instanceof Key)	as Key[]
  }

  get hasKeys(): boolean {
    return this.keys.length > 0
  }

  /**
   * Finds the key in this level with the given color.
   * 
   * @param keyColor The color of the key to find.
   */
  findKey(keyColor: KeyColor) {
    return this.keys.find(key => key.color === keyColor)
  }

  /**
   * Gets the key colors present in this level.
   */
  get keyColors(): KeyColor[] {
    return this.keys.map(item => item.color)
  }

  /**
   * Generates a sample set of key values for thevgiven keys.
   * 
   * @param keyColors
   *   The colors of the keys to generate a sample for. If omitted, all keys in this
   *   level are used.
   * @returns
   *   A sample set of values for the given keys.
   */
  generateKeyValuesSample(keyColors: KeyColor[] = this.keyColors): {[color in KeyColor]?: ItemValue} {
    const values = {}
    for (const color of keyColors) {
      const key = this.findKey(color)
      if (key == null) { continue }

      values[color] = sample(key.possibleValues)
    }
    return values
  }

  /**
   * Generates the cartesian product of all possible key values for the given keys.
   * 
   * @param keyColors
   *   The colors of the keys to generate values for. If omitted, all keys in this
   *   level are used.
   * @returns
   *   A list of all set of values for the given keys.
   */
  allKeyValues(keyColors: KeyColor[] = this.keyColors): Array<{[color in KeyColor]?: ItemValue}> {
    let values: Array<{[color in KeyColor]?: ItemValue}> = []
    for (const color of keyColors) {
      const key = this.findKey(color)
      if (key == null) { continue }

      values = cartesian(values, color, key.possibleValues)
    }

    return values
  }

}

function parseScoring(raw: SerializedScoring<any>): Scoring[] {
  const tests = parseScoringTests(raw.tests)

  return raw.scores.map(({score, message = null, ...conditions}) => ({
    score,
    message,
    condition: buildScoringCondition(conditions, tests)
  }))
}

function parseScoringTests(raw: Object) {
  const tests = {}
  for (const key of Object.keys(raw)) {
    tests[key] = parseScoringTest(raw[key])
  }
  return tests
}

function parseScoringTest(test: SerializedScoringTest): (program: Program) => boolean {
  const {regexp, maxLines, minLines} = test

  if (regexp != null) {
    return program => new RegExp(regexp).test(program.meaningfulCode)
  } else if (maxLines != null) {
    return program => program.linesOfCode <= maxLines
  } else if (minLines != null) {
    return program => program.linesOfCode >= minLines
  } else {
    return () => false
  }
}

function buildScoringCondition(conditions: Object, tests: Object) {
  return (program: Program) => {
    for (const key of Object.keys(conditions)) {
      const test = tests[key] || (() => false)
      if (test(program) !== conditions[key]) { return false }
    }

    return true
  }
}
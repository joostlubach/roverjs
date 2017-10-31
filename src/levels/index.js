// @flow

import {Level} from '../program'

// @index(\.yml$): import ${variable} from ${relpathwithext}

import level1 from './level1.yml'
import level2 from './level2.yml'
import level3 from './level3.yml'

// /index

export default [
	Level.deserialize(1, level1),
	Level.deserialize(2, level2),
	Level.deserialize(3, level3),
]
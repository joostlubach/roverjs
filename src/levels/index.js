// @flow

import {Level} from '../program'

// @index(\.yml$): import ${variable} from ${relpathwithext}

import level1 from './level1.yml'
import level2 from './level2.yml'
import level3 from './level3.yml'
import level4 from './level4.yml'
import level5 from './level5.yml'
import level6 from './level6.yml'

// /index

export default [
	Level.deserialize(1, level1),
	Level.deserialize(2, level2),
	Level.deserialize(3, level3),
	Level.deserialize(4, level4),
	Level.deserialize(5, level5),
	Level.deserialize(6, level6),
]
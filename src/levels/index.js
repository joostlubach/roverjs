// @flow

import {Level} from '../program'

// @index(\.yml$): import ${variable} from ${relpathwithext}

import level1 from './level1.yml'
import level10 from './level10.yml'
import level11 from './level11.yml'
import level12 from './level12.yml'
import level2 from './level2.yml'
import level3 from './level3.yml'
import level4 from './level4.yml'
import level5 from './level5.yml'
import level6 from './level6.yml'
import level7 from './level7.yml'
import level8 from './level8.yml'
import level9 from './level9.yml'

// /index

export default [
	Level.deserialize(1, level1),
	Level.deserialize(2, level2),
	Level.deserialize(3, level3),
	Level.deserialize(4, level4),
	Level.deserialize(5, level5),
	Level.deserialize(6, level6),
	Level.deserialize(7, level7),
	Level.deserialize(8, level8),
	Level.deserialize(9, level9),
	Level.deserialize(10, level10),
	Level.deserialize(11, level11),
	Level.deserialize(12, level12),
]
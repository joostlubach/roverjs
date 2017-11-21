require('babel-polyfill')
if (global.Promise == null) {
  global.Promise = require('promise-polyfill')
}

require('./jss')
require('./classNames')
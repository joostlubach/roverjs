const Gulp = require('gulp')
const svg = require('./svg')

Gulp.task('svg', svg)

Gulp.task('build', ['svg'])
Gulp.task('watch', ['svg'], () => {
	svg.watch()
})

Gulp.task('default', ['watch'])
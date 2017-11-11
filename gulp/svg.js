const Gulp = require('gulp')
const sketch = require('gulp-sketch')
const cheerio = require('gulp-cheerio')
const svgStore = require('gulp-svgstore')
const rename = require('gulp-rename')
const config = require('./config')

function stripFill($) {
	$('[fill]:not([id^="!"])').each(function () {
		if ($(this).closest('[id^="!"]').length === 0) {
			$(this).removeAttr('fill')
		}
	})
	$('[id^="!"]').each(function () {
		const id = $(this).attr('id')
		$(this).attr('id', id.replace(/^![-\s]+/, ''))
	})
}

function svg(_, modifyStream) {
	let stream = Gulp
		.src(config.svg.sketch)
		.pipe(sketch({
			export:  'artboards',
			formats: 'svg'
		}))
		.pipe(cheerio({
			run:           stripFill,
			parserOptions: { xmlMode: true }
		}))
		.pipe(svgStore())
		.pipe(rename(config.svg.filename))
		.pipe(Gulp.dest(config.svg.destination))

	if (modifyStream != null) {
		stream = modifyStream(stream)
	}

	return stream
}

function watch(modifyStream) {
	Gulp.watch(config.svg.sketch, svg.bind(null, null, modifyStream))
}

module.exports = svg
svg.watch = watch
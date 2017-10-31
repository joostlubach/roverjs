import Gulp from 'gulp'
import sketch from 'gulp-sketch'
import cheerio from 'gulp-cheerio'
import svgStore from 'gulp-svgstore'
import rename from 'gulp-rename'
import config from './config'

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

export default function svg(_, modifyStream) {
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
		.pipe(Gulp.dest(`${config.buildDir}/${config.svg.destination}`))

	if (modifyStream != null) {
		stream = modifyStream(stream)
	}

	return stream
}

export function watch(modifyStream) {
	Gulp.watch(config.svg.sketch, svg.bind(null, null, modifyStream))
}

svg.watch = watch
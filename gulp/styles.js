import Gulp from 'gulp'
import GulpNotify from 'gulp-notify'

import rubySass from 'gulp-ruby-sass'
import autoprefixer from 'gulp-autoprefixer'
import cssMinify from 'gulp-cssmin'
import config from './config'

export default function styles(_, modifyStream) {
	const source = `${config.styles.sourceDir}/${config.styles.main}`
	const options = {
		...config.styles.sass,
		loadPath: [config.styles.sourceDir],
		emitCompileError: true
	}

	let stream = rubySass(source, options)
		.on('error', GulpNotify.onError({title: 'Syntax error (SASS)'}))
		.pipe(autoprefixer(config.styles.prefixer))
		.pipe(cssMinify())
		.pipe(Gulp.dest(`${config.buildDir}/${config.styles.destination}`))

	if (modifyStream != null) {
		stream = modifyStream(stream)
	}

	return stream
}

export function watch(modifyStream) {
	return Gulp.watch(config.styles.watch, styles.bind(null, null, modifyStream))
}
styles.watch = watch
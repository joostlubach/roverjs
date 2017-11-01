import Gulp from 'gulp'
import filter from 'gulp-filter'
import rename from 'gulp-rename'
import config from './config'

export default function statics(_, modifyStream) {
	const filterRegexp = config.production ? /\.dev\..*$/ : /\.prod\..*$/
	const renamer = path => {
		path.basename = path.basename.replace(/(\.prod|\.dev)$/, '')
	}

	let stream = Gulp
		.src(config.statics.source)
		.pipe(filter(file => !filterRegexp.test(file.path)))
		.pipe(rename(renamer))
		.pipe(Gulp.dest(`${config.buildDir}`))

	if (modifyStream != null) {
		stream = modifyStream(stream)
	}

	return stream
}

export function watch(modifyStream) {
	Gulp.watch(config.statics.source, statics.bind(null, null, modifyStream))
}
statics.watch = watch
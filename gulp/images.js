import Gulp from 'gulp'
import imageMinify from 'gulp-imagemin'
import config from './config'

export default function images(_, modifyStream) {
	let stream = Gulp
		.src(config.images.source)
		.pipe(imageMinify(config.images.minify))
		.pipe(Gulp.dest(`${config.buildDir}/${config.images.destination}`))

	if (modifyStream != null) {
		stream = modifyStream(stream)
	}

	return stream
}

export function watch(modifyStream) {
	Gulp.watch(config.images.source, images.bind(null, null, modifyStream))
}
images.watch = watch
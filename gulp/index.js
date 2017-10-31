import Gulp from 'gulp'
import 'colors'

import scripts from './scripts'
import styles from './styles'
import svg from './svg'
import images from './images'
import statics from './statics'
import serve, {browserSync} from './serve'

Gulp.task('scripts', scripts)
Gulp.task('styles', styles)
Gulp.task('svg', svg)
Gulp.task('images', images)
Gulp.task('statics', statics)
Gulp.task('serve', serve)

Gulp.task('build', ['scripts', 'styles', 'svg', 'images', 'statics'])
Gulp.task('watch', ['styles', 'svg', 'images', 'statics'], () => {
	const stream = scripts.bundleAndWatch(stream => stream.pipe(browserSync.stream({once: true})))

	styles.watch(stream => stream.pipe(browserSync.stream()))
	svg.watch(stream => stream.pipe(browserSync.stream()))
	images.watch(stream => stream.pipe(browserSync.stream()))
	statics.watch(stream => stream.pipe(browserSync.stream()))

	return stream
})

Gulp.task('development', ['watch'], () => {
	serve()
})
Gulp.task('default', ['development'])
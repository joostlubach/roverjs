import Gulp from 'gulp'
import FS from 'fs'
import GulpNotify from 'gulp-notify'
import Colors from 'colors'

import source from 'vinyl-source-stream'
import browserify from 'browserify'
import watchify from 'watchify'
import gulpIf from 'gulp-if'
import uglify from 'gulp-uglify'
import streamify from 'gulp-streamify'
import merge from 'merge-stream'
import gutil from 'gulp-util'
import config from './config'

// Use package.json to determine our vendor dependencies.

const vendorModules = new Set()
if (config.scripts.vendorExternal) {
	const packageJSON = JSON.parse(FS.readFileSync('package.json'))
	vendorModules.add(...Object.keys(packageJSON.dependencies || {}))
}

function getMTime(path) {
	try {
		const stats = FS.statSync(path)
		return stats.mtime
	} catch (error) {
		if (error.code === 'ENOENT') {
			return null
		} else {
			throw error
		}
	}
}

function needsVendorBundle() {
	const mtimes = Array.from(vendorModules).map(mod => getMTime(`node_modules/${mod}`)).filter(mtime => mtime != null)
	if (mtimes.length === 0) { return false }

	const vendorMTime = getMTime(`${config.buildDir}/${config.scripts.destination}/${config.scripts.vendorFilename}`)
	if (vendorMTime == null) { return true }

	const maxMtime = new Date(Math.max(...mtimes))
	return vendorMTime <= maxMtime
}

function createBundle(bundler, filename, modifyStream, callback) {
	let stream = bundler
		.bundle()
		.on('end', callback)
		.on('error', GulpNotify.onError({title: 'Syntax error'}))
		.pipe(source(filename))
		.pipe(Gulp.dest(`${config.buildDir}/${config.scripts.destination}`))

	if (modifyStream != null) {
		stream = modifyStream(stream)
	}

	return stream
}

function createBundler(watch, modifyStream) {
	const appEntries = [
		config.scripts.preamble,
		config.scripts.source
	]

	const transforms = []
	transforms.push('babelify', 'yamlify')
	if (config.scripts.uglify) {
		transforms.push('uglifyify')
	}

	const appBundler = browserify({
		entries:   appEntries,
		transform: transforms,
		paths:     config.scripts.paths,
		debug:     !config.production,

		// These are required for watchify.
		cache:        {},
		packageCache: {},
		fullPaths:    !config.production
	})

	const vendorBundler = browserify({
		require: Array.from(vendorModules),
		debug: !config.production
	})

	if (config.scripts.vendorExternal) {
		Array.from(vendorModules).forEach(dep => { appBundler.external(dep) })
	}

	function bundleApp() {
		const start = new Date()

		gutil.log(`Running '${Colors.cyan('scripts')}': bundling ${'app'.green}`)
		return createBundle(appBundler, config.scripts.appFilename, modifyStream, () => {
			const time = (new Date() - start) / 1000
			gutil.log(`Running '${Colors.cyan('scripts')}': finished bundling ${'app'.green} ${`(${time.toFixed(1)}s)`.magenta}`)
		})
	}
	function bundleVendor() {
		const start = new Date()

		gutil.log(`Running '${Colors.cyan('scripts')}': bundling ${'vendor'.yellow}`)
		return createBundle(vendorBundler, config.scripts.vendorFilename, modifyStream, () => {
			const time = (new Date() - start) / 1000
			gutil.log(`Running '${Colors.cyan('scripts')}': finished bundling ${'vendor'.yellow} ${`(${time.toFixed(1)}s)`.magenta}`)
		})
	}

	const streams = []

	streams.push(bundleApp())

	if (config.scripts.vendorExternal && needsVendorBundle()) {
		streams.push(bundleVendor())
	}

	if (watch) {
		watchify(appBundler).on('update', bundleApp)
	}

	return merge(...streams)
}

export default function scripts(_, modifyStream) {
	return createBundler(false, modifyStream)
}

export function bundleAndWatch(modifyStream) {
	return createBundler(true, modifyStream)
}
scripts.bundleAndWatch = bundleAndWatch
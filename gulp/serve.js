import BrowserSync from 'browser-sync'
import URL from 'url'
import FS from 'fs'
import config from './config'

const browserSync = BrowserSync.create()

function redirectToRoot(request, response, next) {
	const url = URL.parse(request.url)
	const path = url.pathname.replace(/\/+$/, '')

	if (!FS.existsSync(`${config.buildDir}/${path}`)) {
		request.url = `/${url.search || ''}`
	}

	next()
}

export default function serve() {
	browserSync.init({
		port:      config.serve.port,
		open:      false,
		ghostMode: false,

		server: {
			baseDir:    config.buildDir,
			middleware: redirectToRoot
		},

		ui: {
			port: config.serve.port + 1
		}
	})
}
export {browserSync}
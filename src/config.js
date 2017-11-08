// @flow

import URL from 'url'

function environment() {
	const url = URL.parse(document.location.href)

	switch (url.hostname) {
	case 'roverjs.com':      return 'live'
	case 'test.roverjs.com': return 'test'
	default:                 return 'dev'
	}
}

function is(env: string) {
	return env === environment()
}

export default {

	environment: environment(),

	svg: {
		path:       '/images.svg',
		iconPrefix: 'icon-'
	},

	levels: {
		repository: 'https://github.com/HackYourFuture/rover-levels',
		branch:     is('live') ? 'live' : 'test'
	}

}
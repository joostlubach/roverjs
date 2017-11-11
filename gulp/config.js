const production = process.env.NODE_ENV === 'production'

module.exports = {

	environment: production ? 'production' : 'development',
	production,

	svg: {
		sketch:      'res/images.sketch',
		filename:    'images.svg',
		destination: 'src/assets'
	}

}
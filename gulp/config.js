const production = process.env.NODE_ENV === 'production'

export default {

	buildDir:    process.env.BUILD_DIR || (production ? 'dist' : 'build'),
	environment: production ? 'production' : 'development',
	production,

	serve: {
		port: 3010
	},

	scripts: {
		source:      'src/index.js',
		paths:       ['./pkg'],
		preamble:    production ? 'src/init/prod.js' : 'src/init/dev.js',
		watch:       ['src/**/*.js', 'pkg/**/*.js', 'locales/**'],
		destination: '/',
		uglify:      false,

		appFilename:    'main.js',
		vendorFilename: 'vendor.js',
		vendorExternal: false
	},

	styles: {
		sourceDir:   'styles',
		main:        'main.scss',
		watch:       'styles/**/*.scss',
		destination: '/',

		sass: {
			style:     'expanded',
			require:   ['sass-globbing'],
			precision: 10
		},

		prefixer: {
			browsers: ['last 2 versions'],
			cascade:  false
		}
	},

	svg: {
		sketch:      'res/images.sketch',
		filename:    'images.svg',
		destination: '/'
	},

	images: {
		source:      'res/images/**/*',
		destination: 'images',

		minify: {
			optimizationLevel: 3,
			progressive:       true,
			interlaced:        true
		}
	},

	fonts: {
		source:      'res/fonts/**/*',
		destination: 'fonts'
	},

	statics: {
		source: 'statics/**/*'
	}

}
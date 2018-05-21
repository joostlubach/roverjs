const Path = require('path')
const FS = require('fs-extra')
const {spawn} = require('child-process-promise')
const minimist = require('minimist')
const stripAnsi = require('strip-ansi')
const {cyan, yellow, green, red, blue, dim, underline} = require('chalk')
const isFunction = require('lodash/isFunction')

function relativePath(path) {
	return `./${Path.relative(process.cwd(), path)}`
}

const rootDir     = Path.resolve(__dirname, '..')
const distDir     = relativePath(Path.join(rootDir, 'dist'))
const buildScript = relativePath(Path.join(__dirname, 'build'))
const node        = 'node'

const options = minimist(process.argv.slice(2))
const verbose = options.v || options.verbose

deploy()

async function deploy() {
	try {
		console.log(cyan('==== Building ===='))
		await FS.emptyDir(distDir)

		await bumpBuild()
		await buildApplication()

		console.log(cyan('==== Rsync ===='))
		await rsyncDistribution()
	} catch (error) {
		console.error(error.stack)
		process.exit(1)
	}
}

//------
// Version

async function bumpBuild() {
	const packageInfo = await readPackageJSON(rootDir)
	if (packageInfo == null) { return }

	let [version, build] = (packageInfo.version || '1.0.0').split('+')
	if (build == null) {
		build = '1'
	} else {
		build = `${parseInt(build, 10) + 1}`
	}

	const newVersion = [version, build].join('+')
	await task(`-> Bumping build to ${newVersion}`,
		exec('yarn', ['version', '--new-version', newVersion])
	)
}

//------
// Source

async function buildApplication() {
	process.stdout.write("-> Building application\n")

	await gulpBuild()
}

async function gulpBuild() {
	await task(`   Running ${yellow(`node ${buildScript}`)}`, async () => {
		await exec(node, [buildScript], {
			env: {
				...process.env,
				NODE_ENV: 'production'
			}
		})
	})
}

//------
// Rsync

async function rsyncDistribution() {
	const destination = `rover@lab:apps/client`
	await task(`-> Rsyncing distribution to ${blue(destination)}`,
		exec('rsync', ['-uvaz', `${distDir}/`, destination, '--exclude', 'node_modules'])
	)
}

//------
// Generic commands

async function readPackageJSON(dir) {
  const file = Path.join(dir, 'package.json')

	try {
		const packageJSON = await FS.readFile(file, 'utf-8')
		return JSON.parse(packageJSON)
	} catch (error) {
		if (error.code === 'ENOENT') { return null }
		throw error
	}
}

//------
// Execution

let errorCommand = null
let errorExitCode = null
let errorStdout = null
let errorStderr = null

function exec(cmd, args, options = {}) {
	const promise = spawn(cmd, args, {
		...options,
		capture: ['stderr']
	})

	let writtenCommand = false
	function writeCommand() {
		if (writtenCommand) { return }
		process.stdout.write(dim(`$ ${cmd} ${args.join(' ')}`) + '\n')
		writtenCommand = true
	}

	if (verbose) {
		promise.childProcess.stdout.on('data', data => {
			writeCommand()
			process.stdout.write(dim(data))
		})
	}

	promise.then(() => {
		if (verbose) {
			writeCommand()
		}
	}, error => {
		if (error.name === 'ChildProcessError') {
			errorCommand = `${cmd} ${args.join(' ')}`
			errorExitCode = error.code
			errorStdout = error.stdout === '' ? null : error.stdout
			errorStderr = error.stderr === '' ? null : error.stderr
		} else {

		}
	})

	return promise
}

function task(log, promiseOrFunction) {
	const pad = verbose ? '\n' : Array(Math.max(0, 60 - stripAnsi(log).length) + 1).join(' ')
	process.stdout.write(log + pad)

	const promise = isFunction(promiseOrFunction) ? promiseOrFunction() : promiseOrFunction

	return promise.then(
		() => { process.stdout.write(green('[   OK   ]') + '\n') },
		error => {
			process.stdout.write(red('[ Error ]') + '\n')
			if (errorCommand == null) {
				process.stderr.write(`Error occurred: ${error.message}\n`)
			} else {
				process.stderr.write(`Failed with exit code ${errorExitCode}: ${underline(errorCommand)}\n`)
				if (errorStdout != null) {
					process.stderr.write("---- Output (stdout) ----\n")
					process.stderr.write(dim(errorStdout))
				}
				if (errorStderr != null) {
					process.stderr.write("---- Output (stderr) ----\n")
					process.stderr.write(red(errorStderr))
				}
			}

			process.exit(1)
		}
	)
}
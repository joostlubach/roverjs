// @flow

import axios from 'axios'
import isArray from 'lodash/isArray'
import isPlainObject from 'lodash/isPlainObject'

const baseURL = 'https://api.github.com/repos'

export type Options = {
	branch?:  string,

	// All other options are HTTP options.
	[key: string]: mixed
}

export const defaultOptions = {
	headers: {
		Accept: 'application/vnd.github.v3+json'
	},
	timeout: 10000
}

type CacheEntry = {
	type: string,
	sha:  string,
	data: any
}

export default class GitHub {

	constructor(repository: string, options: Options = {}) {
		this.repository = repository

		const {branch = 'master', ...httpOptions} = options
		this.branch = branch

		this.httpOptions = {
			...httpOptions,
			headers: {...defaultOptions.headers, ...httpOptions.headers},
		}

		this.loadCache()
	}

	repository:  string
	httpOptions: Object
	headers:     Object
	timeout:     number

	branch: string

	rootDirectory: ?Array<Object> = null
	cache:  Map<string, any> = new Map()

	get ref(): string {
		return `heads/${this.branch}`
	}

	nodeURL(path: string): string {
		if (!/^\//.test(path)) {
			path = `/${path}`
		}
		return `${baseURL}/${this.repository}/contents${path}?ref=${this.ref}`
	}

	async fetchDirectory(path: string): Object[] {
		const cached = await this.fetchFromCache(path)
		if (cached != null && cached.type === 'directory') { return cached.data }

		const list = await this.fetch(path)
		if (!isArray(list)) {
			throw new TypeError(`Node at "${path}" is not a directory`)
		}

		this.storeInCache(path, 'directory', list)
		return list
	}

	async fetchFile(path: string): ?Object {
		const cached = await this.fetchFromCache(path)
		if (cached != null && cached.type === 'file') { return cached.data }

		const file = await this.fetch(path)
		if (!isPlainObject(file)) {
			throw new TypeError(`Node at "${path}" is not a file`)
		}

		this.storeInCache(path, 'file', file)
		return file
	}

	async fetch(path: string): any {
		const url = this.nodeURL(path)
		const response = await axios.get(url, this.httpOptions)
		return response.data
	}

	//------
	// Cache retrieval

	async fetchFromCache(path: string): CacheEntry {
		const parts = path.split('/').filter(p => p.length > 0)
		if (parts.length === 0) {
			return this.rootDirectory == null ? null : {type: 'directory', data: this.rootDirectory}
		}

		const cached = this.cache.get(path)
		if (cached == null) { return null }

		// We have a cached entry, we need to make sure it's up to date by comparing the sha's.
		// Obtain the SHA for this path. This may incur more loads, if the entire tree has changed.
		const sha = await this.shaForPath(path)
		if (cached.sha === sha) {
			return cached
		} else {
			// The SHA is different than our cached SHA, so invalidate this cache entry.
			this.cache.delete(path)
			return null
		}
	}

	async storeInCache(path: string, type: string, data: any) {
		const parts = path.split('/').filter(p => p.length > 0)
		if (parts.length === 0) {
			this.rootDirectory = data
			return
		}

		const entry = {
			type,
			sha: await this.shaForPath(path),
			data
		}

		this.cache.set(path, entry)
		this.saveCache()
	}

	async shaForPath(path: string): ?string {
		const parts = path.split('/').filter(p => p.length > 0)
		if (parts.length === 0) { return null }

		const name = parts.pop()
		const parentPath = parts.join('/')

		const entries = await this.fetchDirectory(parentPath)
		const entry = entries.find(entry => entry.name === name)
		return entry == null ? null : entry.sha
	}

	//------
	// Cache storage

	get cacheKey(): string {
		return `github:${this.repository}:${this.branch}`
	}

	loadCache() {
		this.cache = new Map()

		const serialized = JSON.parse(localStorage[this.cacheKey] || '{}')
		for (const path in serialized) {
			this.cache.set(path, serialized[path])
		}
	}

	saveCache() {
		const serialized = {}
		for (const [path, entry] of this.cache) {
			serialized[path] = entry
		}
		localStorage[this.cacheKey] = JSON.stringify(serialized)
	}

}

// const createFetchError = error => {
// 	if (error.response) {
// 		return new Error(`GitHub response: ${error.response.data.message}`)
// 	}
// 	if (error.request) {
// 		return new Error('GitHub did not respond')
// 	}
// 	return new Error(error.message)
// }

// export const fetchDirectory = path => {
// 	const url = path ? `${REPO_URL}/${path}` : REPO_URL
// 	const cachedLevels = fileListCache.get(url)
// 	if (cachedLevels) {
// 		return Promise.resolve(cachedLevels)
// 	}
// 	return axios.get(url, config)
// 		.then(res => {
// 			const files = res.data
// 				.filter(item => item.name.endsWith('.yml'))
// 				.reduce((prev, item) => {
// 					const { name, sha, download_url: url } = item
// 					prev[name.slice(0, -4)] = { url, sha }
// 					return prev
// 				}, {})
// 			fileListCache.set(url, files)
// 			return files
// 		})
// 		.catch(error => {
// 			throw createFetchError(error)
// 		})
// }

// export const fetchLevel = url => {
// 	return axios.get(url, config)
// 		.then(res => res.data)
// 		.catch(error => {
// 			throw createFetchError(error)
// 		})
// }
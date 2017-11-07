import axios from 'axios'

const REPO_URL = `https://api.github.com/repos/remarcmij/rover-levels/contents/levels`

const config = {
	headers: {
		Accept: 'application/vnd.github.v3+json'
	},
	timeout: 10000
}

const fileListCache = new Map()

const createFetchError = error => {
	if (error.response) {
		return new Error(`GitHub response: ${error.response.data.message}`)
	}
	if (error.request) {
		return new Error('GitHub did not respond')
	}
	return new Error(error.message)
}

export const fetchFileList = path => {
	const url = path ? `${REPO_URL}/${path}` : REPO_URL
	const cachedLevels = fileListCache.get(url)
	if (cachedLevels) {
		return Promise.resolve(cachedLevels)
	}
	return axios.get(url, config)
		.then(res => {
			const files = res.data
				.filter(item => item.name.endsWith('.yml'))
				.reduce((prev, item) => {
					const { name, sha, download_url: url } = item
					prev[name.slice(0, -4)] = { url, sha }
					return prev
				}, {})
			fileListCache.set(url, files)
			return files
		})
		.catch(error => {
			throw createFetchError(error)
		})
}

export const fetchLevel = url => {
	return axios.get(url, config)
		.then(res => res.data)
		.catch(error => {
			throw createFetchError(error)
		})
}
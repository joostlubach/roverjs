import axios, {AxiosRequestConfig} from 'axios'
import {isArray, isPlainObject} from 'lodash'

const baseURL = 'https://api.github.com/repos'

export interface Options extends AxiosRequestConfig {
  branch?: string
}

export const defaultOptions = {
  headers: {
    Accept: 'application/vnd.github.v3+json'
  },
  timeout: 10000
}

export type Entry = FileEntry | DirectoryEntry
export type DirectoryEntry = FileEntry[]

export interface FileEntry {
  name: string
  sha:  string
}

export interface FileEntryWithContent extends FileEntry {
  content: string
}

export type CacheEntry = FileCacheEntry | DirectoryCacheEntry | RootDirectoryCacheEntry

export interface FileCacheEntry {
  type: 'file'
  sha:  string | null
  data: FileEntryWithContent
}

export interface DirectoryCacheEntry {
  type: 'directory'
  sha:  string
  data: DirectoryEntry
}

export interface RootDirectoryCacheEntry {
  type: 'directory'
  sha:  null
  data: DirectoryEntry
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
  httpOptions: AxiosRequestConfig
  headers:     {[key: string]: string}
  timeout:     number

  branch: string

  rootDirectory: DirectoryEntry | null = null
  cache:         Map<string, CacheEntry> = new Map()

  get ref(): string {
    return `heads/${this.branch}`
  }

  nodeURL(path: string): string {
    if (!/^\//.test(path)) {
      path = `/${path}`
    }
    return `${baseURL}/${this.repository}/contents${path}?ref=${this.ref}`
  }

  async fetchDirectory(path: string): Promise<DirectoryEntry> {
    const cached = await this.fetchFromCache(path)
    if (cached != null && cached.type === 'directory') { return cached.data }

    const directory = await this.fetch(path) as DirectoryEntry
    if (!isArray(directory)) {
      throw new TypeError(`Node at "${path}" is not a directory`)
    }

    this.storeInCache(path, 'directory', directory)
    return directory
  }

  async fetchFile(path: string): Promise<FileEntryWithContent> {
    const cached = await this.fetchFromCache(path)
    if (cached != null && cached.type === 'file') { return cached.data }

    const file = await this.fetch(path) as FileEntryWithContent
    if (!isPlainObject(file)) {
      throw new TypeError(`Node at "${path}" is not a file`)
    }

    this.storeInCache(path, 'file', file)
    return file
  }

  async fetch(path: string): Promise<Entry> {
    const url = this.nodeURL(path)
    const response = await axios.get(url, this.httpOptions)
    return response.data
  }

  //------
  // Cache retrieval

  async fetchFromCache(path: string): Promise<CacheEntry | null> {
    const parts = path.split('/').filter(p => p.length > 0)
    if (parts.length === 0) {
      return this.rootDirectory == null
        ? null
        : {type: 'directory', sha: null, data: this.rootDirectory}
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

  async storeInCache(path: string, type: 'directory' | 'file', data: Entry) {
    const parts = path.split('/').filter(p => p.length > 0)
    if (parts.length === 0) {
      this.rootDirectory = data as DirectoryEntry
      return
    }

    const entry = {
      type,
      sha: await this.shaForPath(path),
      data
    } as CacheEntry

    this.cache.set(path, entry)
    this.saveCache()
  }

  async shaForPath(path: string): Promise<string | null> {
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
    for (const path of Object.keys(serialized)) {
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
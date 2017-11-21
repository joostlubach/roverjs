import YAMLLevelFetcher, {FileEntry} from './YAMLLevelFetcher'
import * as YAML from 'js-yaml'

export default class HTTPLevelFetcher extends YAMLLevelFetcher {

  constructor(readonly baseURL: string) {
    super()
    this.baseURL = baseURL.replace(/\/+$/, '')
  }

  urlForPath(path: string) {
    path = path.replace(/^\/+/, '')
    return `${this.baseURL}/${path}`
  }

  async fetchDirectory(path: string): Promise<FileEntry[]> {
    const url = this.urlForPath(path)
    const response = await fetch(url)
    const raw = await response.text()

    return YAML.safeLoad(raw)
  }

  async fetchYAML(path: string): Promise<any> {
    const url = this.urlForPath(path)
    const response = await fetch(url)
    const raw = await response.text()

    return YAML.safeLoad(raw)
  }

}
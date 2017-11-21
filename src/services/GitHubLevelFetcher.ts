import YAMLLevelFetcher, {FileEntry} from './YAMLLevelFetcher'
import * as YAML from 'js-yaml'
import GitHub from './GitHub'

type YAML = any // tslint:disable-line no-any

export default class GitHubLevelFetcher extends YAMLLevelFetcher {

  constructor(repository: string, branch: string) {
    super()
    this.gitHub = new GitHub(repository, {branch})
  }

  gitHub: GitHub

  fetchDirectory(path: string): Promise<FileEntry[]> {
    return this.gitHub.fetchDirectory(path)
  }

  async fetchYAML(path: string): Promise<YAML> {
    const file = await this.gitHub.fetchFile(path)
    const content = atob(file.content)
    return YAML.safeLoad(content)
  }

}
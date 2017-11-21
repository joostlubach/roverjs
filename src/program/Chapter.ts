import {Level} from '.'

export default interface Chapter {
  id:          string
  number:      number
  name:        string
  description: string
  levels:      Level[]
}
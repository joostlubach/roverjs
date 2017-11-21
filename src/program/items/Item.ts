import {Position, ProgramState} from '..'
import {v4 as uuid} from 'uuid'

export type ItemValue = any // tslint:disable-line no-any

export default abstract class Item {

  constructor(readonly position: Position) {
    this.id = uuid()
  }

  static create(type: string, position: Position, props: Object) {
    const ItemClass = itemClasses.find(C => new C({x: 0, y: 0}).type === type)
    if (ItemClass == null) {
      throw new TypeError(`Item type \`${type}\` unknown`)
    }

    const item = new ItemClass(position)
    Object.assign(item, props)
    item.init()
    return item
  }

  readonly id: string

  type:     string
  blocking: boolean

  init() {
    // To be optionally implemented by specific item classes.
  }
  pickUp(state: ProgramState): ItemValue {
    // To be optionally implemented by specific item classes.
  }

}

type ItemClass = {new(position: Position): Item, prototype: Item}
const itemClasses: ItemClass[] = []

export function item(target: ItemClass) {
  itemClasses.push(target)
}
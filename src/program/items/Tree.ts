import Item, {item} from './Item'

@item
export default class Tree extends Item {
  type     = 'tree'
  blocking = true
}
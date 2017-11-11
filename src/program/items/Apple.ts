import Item, {item} from './Item'

@item
export default class Apple extends Item {
  type     = 'apple'
  blocking = false
}